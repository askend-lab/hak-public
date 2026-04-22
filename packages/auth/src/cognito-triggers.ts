/* eslint-disable no-param-reassign -- Cognito triggers must mutate event.response per AWS SDK design */

import {
  DefineAuthChallengeTriggerEvent,
  CreateAuthChallengeTriggerEvent,
  VerifyAuthChallengeResponseTriggerEvent,
} from 'aws-lambda';
import { logger } from '@hak/shared';
import { TARA_VERIFIED, CUSTOM_CHALLENGE, TARA_AUTH_METADATA } from './types';

function setFirstChallenge(response: DefineAuthChallengeTriggerEvent['response']): void {
  response.challengeName = CUSTOM_CHALLENGE;
  response.issueTokens = false;
  response.failAuthentication = false;
  logger.debug('DefineAuthChallenge: issuing first challenge');
}

function evaluateChallenge(
  response: DefineAuthChallengeTriggerEvent['response'],
  session: DefineAuthChallengeTriggerEvent['request']['session'],
): void {
  const last = session[session.length - 1];
  const passed = last.challengeName === CUSTOM_CHALLENGE && last.challengeResult;
  response.issueTokens = passed;
  response.failAuthentication = !passed;
  logger.debug(`DefineAuthChallenge: challenge ${passed ? 'passed' : 'failed'}`);
}

export async function handleDefineAuthChallenge(
  event: DefineAuthChallengeTriggerEvent
): Promise<DefineAuthChallengeTriggerEvent> {
  if (event.request.session.length === 0) {
    setFirstChallenge(event.response);
  } else {
    evaluateChallenge(event.response, event.request.session);
  }
  return event;
}

export async function handleCreateAuthChallenge(
  event: CreateAuthChallengeTriggerEvent
): Promise<CreateAuthChallengeTriggerEvent> {
  event.response.publicChallengeParameters = {
    type: 'TARA',
  };
  event.response.privateChallengeParameters = {};
  event.response.challengeMetadata = TARA_AUTH_METADATA;

  return event;
}

export async function handleVerifyAuthChallengeResponse(
  event: VerifyAuthChallengeResponseTriggerEvent
): Promise<VerifyAuthChallengeResponseTriggerEvent> {
  // TARA Lambda sends 'TARA_VERIFIED' as challenge answer after successful TARA authentication
  event.response.answerCorrect = event.request.challengeAnswer === TARA_VERIFIED;
  logger.debug('VerifyAuthChallenge: answer correct =', event.response.answerCorrect);

  return event;
}

// Main handler that routes based on triggerSource
export const handler = async (
  event: DefineAuthChallengeTriggerEvent | CreateAuthChallengeTriggerEvent | VerifyAuthChallengeResponseTriggerEvent
): Promise<DefineAuthChallengeTriggerEvent | CreateAuthChallengeTriggerEvent | VerifyAuthChallengeResponseTriggerEvent> => {
  const triggerSource = event.triggerSource;
  
  switch (triggerSource) {
    case 'DefineAuthChallenge_Authentication':
      return handleDefineAuthChallenge(event);
    case 'CreateAuthChallenge_Authentication':
      return handleCreateAuthChallenge(event);
    case 'VerifyAuthChallengeResponse_Authentication':
      return handleVerifyAuthChallengeResponse(event);
    default:
      logger.error('Unknown Cognito trigger source', triggerSource);
      throw new Error(`Unknown trigger source: ${triggerSource}`);
  }
};
/* eslint-enable no-param-reassign -- end Cognito triggers */
