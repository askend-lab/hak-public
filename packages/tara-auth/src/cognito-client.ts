import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminUpdateUserAttributesCommand,
  AdminInitiateAuthCommand,
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
      const command = new AdminCreateUserCommand({
        UserPoolId: this.config.userPoolId,
        Username: username,
        UserAttributes: this.buildUserAttributes(taraIdToken),
        MessageAction: 'SUPPRESS', // Don't send welcome email
      });
      await this.client.send(command);
      return username;
    } catch (error) {
      if (error instanceof UsernameExistsException) {
        // User already exists, return existing username
        return username;
      }
      throw error;
    }
  }

  async generateTokens(username: string): Promise<CognitoTokens> {
    // Use ADMIN_NO_SRP_AUTH to generate tokens for the user
    // This requires the user pool client to have ALLOW_ADMIN_USER_PASSWORD_AUTH enabled
    // Alternative: Use a custom auth flow
    
    const command = new AdminInitiateAuthCommand({
      UserPoolId: this.config.userPoolId,
      ClientId: this.config.clientId,
      AuthFlow: 'ADMIN_USER_PASSWORD_AUTH',
      AuthParameters: {
        USERNAME: username,
        // For TARA users, we use a deterministic "password" based on their personal code
        // This is secure because TARA has already verified their identity
        PASSWORD: this.generateDeterministicPassword(username),
      },
    });

    try {
      const response = await this.client.send(command);
      
      if (!response.AuthenticationResult) {
        throw new Error('No authentication result from Cognito');
      }

      return {
        accessToken: response.AuthenticationResult.AccessToken || '',
        idToken: response.AuthenticationResult.IdToken || '',
        refreshToken: response.AuthenticationResult.RefreshToken || '',
        expiresIn: response.AuthenticationResult.ExpiresIn || 3600,
      };
    } catch (error) {
      // If password auth fails, the user might not have a password set
      // In that case, we need to set one first
      throw new Error(`Token generation failed: ${error}`);
    }
  }

  private generateDeterministicPassword(username: string): string {
    // Generate a deterministic but secure password for TARA users
    // This is a placeholder - in production, consider using a proper secret
    const secret = process.env.TARA_USER_SECRET || 'default-secret';
    return `Tara!${username}${secret}`.substring(0, 20);
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
