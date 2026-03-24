import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminUpdateUserAttributesCommand,
  AdminInitiateAuthCommand,
  AdminRespondToAuthChallengeCommand,
  ListUsersCommand,
  UsernameExistsException,
} from '@aws-sdk/client-cognito-identity-provider';
import { logger, extractErrorMessage } from '@hak/shared';
import { CognitoConfig, CognitoTokens, TaraIdToken, TARA_VERIFIED, CUSTOM_CHALLENGE, PERSONAL_CODE_ATTR, DEFAULT_EXPIRES_IN, buildFallbackEmail } from './types';

export const DEFAULT_REGION = 'eu-west-1';

function buildNameAttrs(t: TaraIdToken): Array<{ Name: string; Value: string }> {
  const attrs: Array<{ Name: string; Value: string }> = [];
  if (t.given_name) {attrs.push({ Name: 'given_name', Value: t.given_name });}
  if (t.family_name) {attrs.push({ Name: 'family_name', Value: t.family_name });}
  const name = [t.given_name, t.family_name].filter(Boolean).join(' ');
  if (name) {attrs.push({ Name: 'name', Value: name });}
  return attrs;
}

export class CognitoClient {
  private client: CognitoIdentityProviderClient;
  private config: CognitoConfig;

  constructor(config: CognitoConfig) {
    this.config = config;
    this.client = new CognitoIdentityProviderClient({ region: config.region });
  }

  private validatePersonalCode(code: string): void {
    if (!/^[A-Z]{2}\d{11}$/.test(code)) {
      logger.error('Invalid personal code format');
      throw new Error('Invalid personal code format');
    }
  }

  private async findByEmailAndLink(taraIdToken: TaraIdToken): Promise<string | null> {
    if (!taraIdToken.email) {return null;}
    const username = await this.findUserByEmail(taraIdToken.email);
    if (username) {
      await this.updatePersonalCode(username, taraIdToken.sub);
    }
    return username;
  }

  async findOrCreateUser(taraIdToken: TaraIdToken): Promise<string> {
    this.validatePersonalCode(taraIdToken.sub);
    const byCode = await this.findUserByPersonalCode(taraIdToken.sub);
    if (byCode) {
      await this.syncNameAttributes(byCode, taraIdToken);
      return byCode;
    }
    const byEmail = await this.findByEmailAndLink(taraIdToken);
    if (byEmail) {
      await this.syncNameAttributes(byEmail, taraIdToken);
      return byEmail;
    }
    return this.createUser(taraIdToken);
  }

  private async findUserByPersonalCode(personalCode: string): Promise<string | null> {
    try {
      const command = new ListUsersCommand({
        UserPoolId: this.config.userPoolId,
        Filter: `${PERSONAL_CODE_ATTR} = "${personalCode}"`,
        Limit: 1,
      });
      const response = await this.client.send(command);
      return response.Users?.[0]?.Username || null;
    } catch (error) {
      logger.warn('Cognito findUserByPersonalCode failed', extractErrorMessage(error));
      return null;
    }
  }

  private async findUserByEmail(email: string): Promise<string | null> {
    if (!/^[^\s"\\@]+@[^\s"\\@.]+\.[^\s"\\@]+$/.test(email)) {
      return null;
    }
    try {
      const command = new ListUsersCommand({
        UserPoolId: this.config.userPoolId,
        Filter: `email = "${email}"`,
        Limit: 1,
      });
      const response = await this.client.send(command);
      return response.Users?.[0]?.Username || null;
    } catch (error) {
      logger.warn('Cognito findUserByEmail failed', extractErrorMessage(error));
      return null;
    }
  }

  private async syncNameAttributes(username: string, taraIdToken: TaraIdToken): Promise<void> {
    const attrs = buildNameAttrs(taraIdToken);
    if (attrs.length === 0) {return;}
    try {
      await this.client.send(new AdminUpdateUserAttributesCommand({
        UserPoolId: this.config.userPoolId, Username: username, UserAttributes: attrs,
      }));
    } catch (error) {
      logger.warn('Cognito syncNameAttributes failed', extractErrorMessage(error));
    }
  }

  private async updatePersonalCode(username: string, personalCode: string): Promise<void> {
    await this.client.send(new AdminUpdateUserAttributesCommand({
      UserPoolId: this.config.userPoolId, Username: username,
      UserAttributes: [{ Name: PERSONAL_CODE_ATTR, Value: personalCode }],
    }));
  }

  buildUserAttributes(taraIdToken: TaraIdToken): Array<{ Name: string; Value: string }> {
    const email = taraIdToken.email || buildFallbackEmail(taraIdToken.sub);
    return [
      { Name: 'email', Value: email },
      { Name: 'email_verified', Value: 'true' },
      { Name: PERSONAL_CODE_ATTR, Value: taraIdToken.sub },
      ...buildNameAttrs(taraIdToken),
    ];
  }

  private async createUser(taraIdToken: TaraIdToken): Promise<string> {
    // Cognito requires email as username (UsernameAttributes: ["email"])
    const email = taraIdToken.email || buildFallbackEmail(taraIdToken.sub);
    const username = email;

    try {
      const createCommand = new AdminCreateUserCommand({
        UserPoolId: this.config.userPoolId,
        Username: username,
        UserAttributes: this.buildUserAttributes(taraIdToken),
        MessageAction: 'SUPPRESS', // Don't send welcome email
      });
      await this.client.send(createCommand);
    } catch (error) {
      if (!(error instanceof UsernameExistsException)) {
        logger.error('Cognito createUser failed', extractErrorMessage(error));
        throw error;
      }
      // User already exists, continue
    }

    return username;
  }

  private async initiateCustomAuth(username: string): Promise<string> {
    const response = await this.client.send(new AdminInitiateAuthCommand({
      UserPoolId: this.config.userPoolId,
      ClientId: this.config.clientId,
      AuthFlow: 'CUSTOM_AUTH' as const,
      AuthParameters: { USERNAME: username },
    }));
    if (!response.ChallengeName) {
      throw new Error('Expected CUSTOM_CHALLENGE from Cognito');
    }
    return response.Session as string;
  }

  private async respondToChallenge(username: string, session: string): Promise<CognitoTokens> {
    const response = await this.client.send(new AdminRespondToAuthChallengeCommand({
      UserPoolId: this.config.userPoolId,
      ClientId: this.config.clientId,
      ChallengeName: CUSTOM_CHALLENGE,
      Session: session,
      ChallengeResponses: { USERNAME: username, ANSWER: TARA_VERIFIED },
    }));
    if (!response.AuthenticationResult) {
      throw new Error('No authentication result from Cognito');
    }
    const { AccessToken, IdToken, RefreshToken, ExpiresIn } = response.AuthenticationResult;
    if (!AccessToken || !IdToken || !RefreshToken) {
      throw new Error('Cognito returned incomplete tokens');
    }
    return { accessToken: AccessToken, idToken: IdToken, refreshToken: RefreshToken, expiresIn: ExpiresIn || DEFAULT_EXPIRES_IN };
  }

  async generateTokens(username: string): Promise<CognitoTokens> {
    try {
      const session = await this.initiateCustomAuth(username);
      return await this.respondToChallenge(username, session);
    } catch (error) {
      logger.error('Cognito token generation failed', extractErrorMessage(error));
      const wrapped = new Error(`Token generation failed: ${extractErrorMessage(error)}`);
      (wrapped as unknown as Record<string, unknown>).cause = error;
      throw wrapped;
    }
  }
}

export function createCognitoClient(): CognitoClient {
  const userPoolId = process.env.COGNITO_USER_POOL_ID || '';
  const clientId = process.env.COGNITO_CLIENT_ID || '';
  if (!userPoolId || !clientId) {throw new Error('COGNITO_USER_POOL_ID and COGNITO_CLIENT_ID must be set');}
  return new CognitoClient({ userPoolId, clientId, region: process.env.AWS_REGION || DEFAULT_REGION });
}
