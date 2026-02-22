import {
  DefineAuthChallengeTriggerEvent,
  CreateAuthChallengeTriggerEvent,
  VerifyAuthChallengeResponseTriggerEvent,
} from 'aws-lambda';
import {
  handleDefineAuthChallenge,
  handleCreateAuthChallenge,
  handleVerifyAuthChallengeResponse,
} from '../src/cognito-triggers';

/**
 * Mutation-killing tests for cognito-triggers.ts
 * Targets: L20 ConditionalExpression (&&), L37 ObjectLiteral, L38 StringLiteral
 */
describe('cognito-triggers mutation kills', () => {
  const baseEvent = {
    version: '1' as const,
    region: 'eu-west-1',
    userPoolId: 'eu-west-1_test',
    userName: 'test-user',
    callerContext: { awsSdkVersion: '1.0.0', clientId: 'test-client-id' },
  };

  describe('DefineAuthChallenge - L20 && operator', () => {
    it('should issue tokens ONLY when challengeName is CUSTOM_CHALLENGE AND result is true', async () => {
      // Both conditions must be true
      const event: DefineAuthChallengeTriggerEvent = {
        ...baseEvent,
        triggerSource: 'DefineAuthChallenge_Authentication',
        request: {
          userAttributes: { sub: 's', email: 'e' },
          session: [{ challengeName: 'CUSTOM_CHALLENGE', challengeResult: true, challengeMetadata: undefined }],
        },
        response: { challengeName: '', issueTokens: false, failAuthentication: false },
      };
      const result = await handleDefineAuthChallenge(event);
      expect(result.response.issueTokens).toBe(true);
      expect(result.response.failAuthentication).toBe(false);
    });

    it('should fail when challengeName is not CUSTOM_CHALLENGE even if result is true', async () => {
      const event: DefineAuthChallengeTriggerEvent = {
        ...baseEvent,
        triggerSource: 'DefineAuthChallenge_Authentication',
        request: {
          userAttributes: { sub: 's', email: 'e' },
          session: [{ challengeName: 'SRP_A' as 'CUSTOM_CHALLENGE', challengeResult: true, challengeMetadata: undefined }],
        },
        response: { challengeName: '', issueTokens: false, failAuthentication: false },
      };
      const result = await handleDefineAuthChallenge(event);
      expect(result.response.issueTokens).toBe(false);
      expect(result.response.failAuthentication).toBe(true);
    });

    it('should fail when challengeResult is false even if challengeName is correct', async () => {
      const event: DefineAuthChallengeTriggerEvent = {
        ...baseEvent,
        triggerSource: 'DefineAuthChallenge_Authentication',
        request: {
          userAttributes: { sub: 's', email: 'e' },
          session: [{ challengeName: 'CUSTOM_CHALLENGE', challengeResult: false, challengeMetadata: undefined }],
        },
        response: { challengeName: '', issueTokens: false, failAuthentication: false },
      };
      const result = await handleDefineAuthChallenge(event);
      expect(result.response.issueTokens).toBe(false);
      expect(result.response.failAuthentication).toBe(true);
    });
  });

  describe('CreateAuthChallenge - L37 ObjectLiteral, L38 StringLiteral', () => {
    it('should set publicChallengeParameters with type=TARA', async () => {
      const event: CreateAuthChallengeTriggerEvent = {
        ...baseEvent,
        triggerSource: 'CreateAuthChallenge_Authentication',
        request: {
          userAttributes: { sub: 's', email: 'e' },
          challengeName: 'CUSTOM_CHALLENGE',
          session: [],
        },
        response: { publicChallengeParameters: {}, privateChallengeParameters: {}, challengeMetadata: '' },
      };
      const result = await handleCreateAuthChallenge(event);
      expect(result.response.publicChallengeParameters).toStrictEqual({ type: 'TARA' });
    });

    it('should set privateChallengeParameters as empty object', async () => {
      const event: CreateAuthChallengeTriggerEvent = {
        ...baseEvent,
        triggerSource: 'CreateAuthChallenge_Authentication',
        request: {
          userAttributes: { sub: 's', email: 'e' },
          challengeName: 'CUSTOM_CHALLENGE',
          session: [],
        },
        response: { publicChallengeParameters: {}, privateChallengeParameters: {}, challengeMetadata: '' },
      };
      const result = await handleCreateAuthChallenge(event);
      expect(result.response.privateChallengeParameters).toStrictEqual({});
    });

    it('should set challengeMetadata to exactly "TARA_AUTH"', async () => {
      const event: CreateAuthChallengeTriggerEvent = {
        ...baseEvent,
        triggerSource: 'CreateAuthChallenge_Authentication',
        request: {
          userAttributes: { sub: 's', email: 'e' },
          challengeName: 'CUSTOM_CHALLENGE',
          session: [],
        },
        response: { publicChallengeParameters: {}, privateChallengeParameters: {}, challengeMetadata: '' },
      };
      const result = await handleCreateAuthChallenge(event);
      expect(result.response.challengeMetadata).toBe('TARA_AUTH');
    });
  });

  describe('VerifyAuthChallengeResponse - exact answer matching', () => {
    it('should accept exactly "TARA_VERIFIED" as answer', async () => {
      const event: VerifyAuthChallengeResponseTriggerEvent = {
        ...baseEvent,
        triggerSource: 'VerifyAuthChallengeResponse_Authentication',
        request: {
          userAttributes: { sub: 's', email: 'e' },
          privateChallengeParameters: {},
          challengeAnswer: 'TARA_VERIFIED',
        },
        response: { answerCorrect: false },
      };
      const result = await handleVerifyAuthChallengeResponse(event);
      expect(result.response.answerCorrect).toBe(true);
    });

    it('should reject "tara_verified" (wrong case)', async () => {
      const event: VerifyAuthChallengeResponseTriggerEvent = {
        ...baseEvent,
        triggerSource: 'VerifyAuthChallengeResponse_Authentication',
        request: {
          userAttributes: { sub: 's', email: 'e' },
          privateChallengeParameters: {},
          challengeAnswer: 'tara_verified',
        },
        response: { answerCorrect: false },
      };
      const result = await handleVerifyAuthChallengeResponse(event);
      expect(result.response.answerCorrect).toBe(false);
    });
  });
});
