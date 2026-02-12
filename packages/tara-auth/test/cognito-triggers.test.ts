import {
  DefineAuthChallengeTriggerEvent,
  CreateAuthChallengeTriggerEvent,
  VerifyAuthChallengeResponseTriggerEvent,
} from 'aws-lambda';
import {
  handleDefineAuthChallenge,
  handleCreateAuthChallenge,
  handleVerifyAuthChallengeResponse,
  handler,
} from '../src/cognito-triggers';
import { CUSTOM_CHALLENGE, TARA_AUTH_METADATA, TARA_VERIFIED } from '../src/types';

describe('Cognito Custom Auth Triggers', () => {
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

  describe('VerifyAuthChallengeResponse', () => {
    it('should verify TARA challenge answer as valid', async () => {
      const event: VerifyAuthChallengeResponseTriggerEvent = {
        version: '1',
        region: 'eu-west-1',
        userPoolId: 'eu-west-1_test',
        userName: 'test-user',
        callerContext: {
          awsSdkVersion: '1.0.0',
          clientId: 'test-client-id',
        },
        triggerSource: 'VerifyAuthChallengeResponse_Authentication',
        request: {
          userAttributes: {
            sub: 'test-sub',
            email: 'test@example.com',
          },
          privateChallengeParameters: {},
          challengeAnswer: TARA_VERIFIED,
        },
        response: {
          answerCorrect: false,
        },
      };

      const result = await handleVerifyAuthChallengeResponse(event);

      expect(result.response.answerCorrect).toBe(true);
    });

    it('should reject invalid challenge answer', async () => {
      const event: VerifyAuthChallengeResponseTriggerEvent = {
        version: '1',
        region: 'eu-west-1',
        userPoolId: 'eu-west-1_test',
        userName: 'test-user',
        callerContext: {
          awsSdkVersion: '1.0.0',
          clientId: 'test-client-id',
        },
        triggerSource: 'VerifyAuthChallengeResponse_Authentication',
        request: {
          userAttributes: {
            sub: 'test-sub',
            email: 'test@example.com',
          },
          privateChallengeParameters: {},
          challengeAnswer: 'INVALID_ANSWER',
        },
        response: {
          answerCorrect: false,
        },
      };

      const result = await handleVerifyAuthChallengeResponse(event);

      expect(result.response.answerCorrect).toBe(false);
    });
  });

  describe('handler routing', () => {
    const baseEvent = {
      version: '1',
      region: 'eu-west-1',
      userPoolId: 'eu-west-1_test',
      userName: 'test-user',
      callerContext: { awsSdkVersion: '1.0.0', clientId: 'test-client-id' },
    };

    it('should route DefineAuthChallenge_Authentication', async () => {
      const event = {
        ...baseEvent,
        triggerSource: 'DefineAuthChallenge_Authentication' as const,
        request: { userAttributes: { sub: 's', email: 'e' }, session: [] },
        response: { challengeName: '', issueTokens: false, failAuthentication: false },
      } as DefineAuthChallengeTriggerEvent;

      const result = await handler(event);
      expect(result.response).toHaveProperty('challengeName', CUSTOM_CHALLENGE);
    });

    it('should route CreateAuthChallenge_Authentication', async () => {
      const event = {
        ...baseEvent,
        triggerSource: 'CreateAuthChallenge_Authentication' as const,
        request: { userAttributes: { sub: 's', email: 'e' }, challengeName: CUSTOM_CHALLENGE, session: [] },
        response: { publicChallengeParameters: {}, privateChallengeParameters: {}, challengeMetadata: '' },
      } as CreateAuthChallengeTriggerEvent;

      const result = await handler(event);
      expect(result.response).toHaveProperty('challengeMetadata', TARA_AUTH_METADATA);
    });

    it('should route VerifyAuthChallengeResponse_Authentication', async () => {
      const event = {
        ...baseEvent,
        triggerSource: 'VerifyAuthChallengeResponse_Authentication' as const,
        request: { userAttributes: { sub: 's', email: 'e' }, privateChallengeParameters: {}, challengeAnswer: 'TARA_VERIFIED' },
        response: { answerCorrect: false },
      } as VerifyAuthChallengeResponseTriggerEvent;

      const result = await handler(event);
      expect((result.response as { answerCorrect: boolean }).answerCorrect).toBe(true);
    });

    it('should throw for unknown trigger source', async () => {
      const event = {
        ...baseEvent,
        triggerSource: 'UnknownTrigger' as never,
        request: { userAttributes: { sub: 's', email: 'e' }, session: [] },
        response: {},
      };

      await expect(handler(event as never)).rejects.toThrow('Unknown trigger source: UnknownTrigger');
    });
  });
});
