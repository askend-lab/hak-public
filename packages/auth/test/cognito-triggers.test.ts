import { DefineAuthChallengeTriggerEvent, CreateAuthChallengeTriggerEvent } from 'aws-lambda';
import { handleDefineAuthChallenge, handleCreateAuthChallenge } from '../src/cognito-triggers';
import { CUSTOM_CHALLENGE, TARA_AUTH_METADATA } from '../src/types';

describe("cognito-triggers.test", () => {
  describe('DefineAuthChallenge', () => {
    it('should issue CUSTOM_CHALLENGE on first auth attempt', async () => {
      const event: DefineAuthChallengeTriggerEvent = {
        version: '1',
        region: 'eu-west-1',
        userPoolId: 'eu-west-1_test',
        userName: 'test-user',
        callerContext: {
          awsSdkVersion: '1.0.0',
          clientId: 'test-client-id',
        },
        triggerSource: 'DefineAuthChallenge_Authentication',
        request: {
          userAttributes: {
            sub: 'test-sub',
            email: 'test@example.com',
          },
          session: [],
        },
        response: {
          challengeName: '',
          issueTokens: false,
          failAuthentication: false,
        },
      };

      const result = await handleDefineAuthChallenge(event);

      expect(result.response.challengeName).toBe(CUSTOM_CHALLENGE);
      expect(result.response.issueTokens).toBe(false);
      expect(result.response.failAuthentication).toBe(false);
    });

    it('should issue tokens after successful CUSTOM_CHALLENGE', async () => {
      const event: DefineAuthChallengeTriggerEvent = {
        version: '1',
        region: 'eu-west-1',
        userPoolId: 'eu-west-1_test',
        userName: 'test-user',
        callerContext: {
          awsSdkVersion: '1.0.0',
          clientId: 'test-client-id',
        },
        triggerSource: 'DefineAuthChallenge_Authentication',
        request: {
          userAttributes: {
            sub: 'test-sub',
            email: 'test@example.com',
          },
          session: [
            {
              challengeName: CUSTOM_CHALLENGE,
              challengeResult: true,
              challengeMetadata: undefined,
            },
          ],
        },
        response: {
          challengeName: '',
          issueTokens: false,
          failAuthentication: false,
        },
      };

      const result = await handleDefineAuthChallenge(event);

      expect(result.response.issueTokens).toBe(true);
      expect(result.response.failAuthentication).toBe(false);
    });

    it('should fail authentication after failed CUSTOM_CHALLENGE', async () => {
      const event: DefineAuthChallengeTriggerEvent = {
        version: '1',
        region: 'eu-west-1',
        userPoolId: 'eu-west-1_test',
        userName: 'test-user',
        callerContext: {
          awsSdkVersion: '1.0.0',
          clientId: 'test-client-id',
        },
        triggerSource: 'DefineAuthChallenge_Authentication',
        request: {
          userAttributes: {
            sub: 'test-sub',
            email: 'test@example.com',
          },
          session: [
            {
              challengeName: CUSTOM_CHALLENGE,
              challengeResult: false,
              challengeMetadata: undefined,
            },
          ],
        },
        response: {
          challengeName: '',
          issueTokens: false,
          failAuthentication: false,
        },
      };

      const result = await handleDefineAuthChallenge(event);

      expect(result.response.issueTokens).toBe(false);
      expect(result.response.failAuthentication).toBe(true);
    });
  });

  describe('CreateAuthChallenge', () => {
    it('should create a challenge with metadata', async () => {
      const event: CreateAuthChallengeTriggerEvent = {
        version: '1',
        region: 'eu-west-1',
        userPoolId: 'eu-west-1_test',
        userName: 'test-user',
        callerContext: {
          awsSdkVersion: '1.0.0',
          clientId: 'test-client-id',
        },
        triggerSource: 'CreateAuthChallenge_Authentication',
        request: {
          userAttributes: {
            sub: 'test-sub',
            email: 'test@example.com',
          },
          challengeName: CUSTOM_CHALLENGE,
          session: [],
        },
        response: {
          publicChallengeParameters: {},
          privateChallengeParameters: {},
          challengeMetadata: '',
        },
      };

      const result = await handleCreateAuthChallenge(event);

      expect(result.response.publicChallengeParameters).toBeDefined();
      expect(result.response.challengeMetadata).toBe(TARA_AUTH_METADATA);
    });
  });

});
