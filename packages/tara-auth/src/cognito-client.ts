import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminUpdateUserAttributesCommand,
  AdminInitiateAuthCommand,
  AdminRespondToAuthChallengeCommand,
  ListUsersCommand,
  UsernameExistsException,
} from '@aws-sdk/client-cognito-identity-provider';
import { CognitoConfig, CognitoTokens, TaraIdToken } from './types';

export class CognitoClient {
  private client: CognitoIdentityProviderClient;
  private config: CognitoConfig;

  constructor(config: CognitoConfig) {
    this.config = config;
    this.client = new CognitoIdentityProviderClient({ region: config.region });
  }

  async findOrCreateUser(taraIdToken: TaraIdToken): Promise<string> {
    const personalCode = taraIdToken.sub;

    // 1. Try to find user by personal_code custom attribute
    let username = await this.findUserByPersonalCode(personalCode);
    if (username) {
      return username;
    }

    // 2. Try to find by email if provided
    if (taraIdToken.email) {
      username = await this.findUserByEmail(taraIdToken.email);
      if (username) {
        // Link TARA to existing account by adding personal_code
        await this.updatePersonalCode(username, personalCode);
        return username;
      }
    }

    // 3. Create new user
    return this.createUser(taraIdToken);
  }

  private async findUserByPersonalCode(personalCode: string): Promise<string | null> {
    try {
      const command = new ListUsersCommand({
        UserPoolId: this.config.userPoolId,
        Filter: `"custom:personal_code" = "${personalCode}"`,
        Limit: 1,
      });
      const response = await this.client.send(command);
      return response.Users?.[0]?.Username || null;
    } catch {
      return null;
    }
  }

  private async findUserByEmail(email: string): Promise<string | null> {
    try {
      const command = new ListUsersCommand({
        UserPoolId: this.config.userPoolId,
        Filter: `email = "${email}"`,
        Limit: 1,
      });
      const response = await this.client.send(command);
      return response.Users?.[0]?.Username || null;
    } catch {
      return null;
    }
  }

  private async updatePersonalCode(username: string, personalCode: string): Promise<void> {
    const command = new AdminUpdateUserAttributesCommand({
      UserPoolId: this.config.userPoolId,
      Username: username,
      UserAttributes: [
        { Name: 'custom:personal_code', Value: personalCode },
      ],
    });
    await this.client.send(command);
  }

  buildUserAttributes(taraIdToken: TaraIdToken): Array<{ Name: string; Value: string }> {
    const email = taraIdToken.email || `${taraIdToken.sub}@tara.ee`;
    
    const attributes: Array<{ Name: string; Value: string }> = [
      { Name: 'email', Value: email },
      { Name: 'email_verified', Value: 'true' },
      { Name: 'custom:personal_code', Value: taraIdToken.sub },
    ];

    // Add optional attributes only if they have values
    if (taraIdToken.given_name) {
      attributes.push({ Name: 'given_name', Value: taraIdToken.given_name });
    }
    if (taraIdToken.family_name) {
      attributes.push({ Name: 'family_name', Value: taraIdToken.family_name });
    }

    return attributes;
  }

  private async createUser(taraIdToken: TaraIdToken): Promise<string> {
    // Cognito requires email as username (UsernameAttributes: ["email"])
    const email = taraIdToken.email || `${taraIdToken.sub}@tara.ee`;
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
        throw error;
      }
      // User already exists, continue
    }

    return username;
  }

  async generateTokens(username: string): Promise<CognitoTokens> {
    // Use CUSTOM_AUTH flow - no passwords needed
    // TARA Lambda has already verified user identity via TARA
    // Cognito triggers will complete the auth flow
    
    const initiateCommand = new AdminInitiateAuthCommand({
      UserPoolId: this.config.userPoolId,
      ClientId: this.config.clientId,
      AuthFlow: 'CUSTOM_AUTH',
      AuthParameters: {
        USERNAME: username,
      },
    });

    try {
      const initiateResponse = await this.client.send(initiateCommand);
      
      if (!initiateResponse.ChallengeName) {
        throw new Error('Expected CUSTOM_CHALLENGE from Cognito');
      }

      // Respond to the custom challenge with TARA_VERIFIED
      // This tells the Cognito trigger that TARA authentication succeeded
      const respondCommand = new AdminRespondToAuthChallengeCommand({
        UserPoolId: this.config.userPoolId,
        ClientId: this.config.clientId,
        ChallengeName: 'CUSTOM_CHALLENGE',
        Session: initiateResponse.Session,
        ChallengeResponses: {
          USERNAME: username,
          ANSWER: 'TARA_VERIFIED',
        },
      });

      const authResponse = await this.client.send(respondCommand);

      if (!authResponse.AuthenticationResult) {
        throw new Error('No authentication result from Cognito');
      }

      return {
        accessToken: authResponse.AuthenticationResult.AccessToken || '',
        idToken: authResponse.AuthenticationResult.IdToken || '',
        refreshToken: authResponse.AuthenticationResult.RefreshToken || '',
        expiresIn: authResponse.AuthenticationResult.ExpiresIn || 3600,
      };
    } catch (error) {
      throw new Error(`Token generation failed: ${error}`);
    }
  }
}

export function createCognitoClient(): CognitoClient {
  const config: CognitoConfig = {
    userPoolId: process.env.COGNITO_USER_POOL_ID || '',
    clientId: process.env.COGNITO_CLIENT_ID || '',
    region: process.env.AWS_REGION || 'eu-west-1',
  };

  if (!config.userPoolId || !config.clientId) {
    throw new Error('COGNITO_USER_POOL_ID and COGNITO_CLIENT_ID must be set');
  }

  return new CognitoClient(config);
}
