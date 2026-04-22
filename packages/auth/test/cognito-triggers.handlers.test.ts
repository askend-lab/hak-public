import {
  DefineAuthChallengeTriggerEvent,
  CreateAuthChallengeTriggerEvent,
  VerifyAuthChallengeResponseTriggerEvent,
} from 'aws-lambda';
import { handleVerifyAuthChallengeResponse, handler } from '../src/cognito-triggers';
import { CUSTOM_CHALLENGE, TARA_AUTH_METADATA, TARA_VERIFIED } from '../src/types';

describe("cognito-triggers.test", () => {
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
