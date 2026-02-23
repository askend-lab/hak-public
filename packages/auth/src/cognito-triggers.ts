/* eslint-disable no-param-reassign -- Cognito triggers must mutate event.response per AWS SDK design */

import {
  DefineAuthChallengeTriggerEvent,
  CreateAuthChallengeTriggerEvent,
  VerifyAuthChallengeResponseTriggerEvent,
} from 'aws-lambda';
import { logger } from '@hak/shared';
import { TARA_VERIFIED, CUSTOM_CHALLENGE, TARA_AUTH_METADATA } from './types';

export async function handleDefineAuthChallenge(
  event: DefineAuthChallengeTriggerEvent
): Promise<DefineAuthChallengeTriggerEvent> {
  const session = event.request.session;

  if (session.length === 0) {
    // First attempt - issue CUSTOM_CHALLENGE
    event.response.challengeName = CUSTOM_CHALLENGE;
    event.response.issueTokens = false;
    event.response.failAuthentication = false;
    logger.debug('DefineAuthChallenge: issuing first challenge');
  } else {
    const lastChallenge = session[session.length - 1];
    
    if (lastChallenge.challengeName === CUSTOM_CHALLENGE && lastChallenge.challengeResult) {
      // Challenge passed - issue tokens
      event.response.issueTokens = true;
      event.response.failAuthentication = false;
      logger.debug('DefineAuthChallenge: challenge passed, issuing tokens');
    } else {
      // Challenge failed
      event.response.issueTokens = false;
      event.response.failAuthentication = true;
      logger.warn('DefineAuthChallenge: challenge failed');
    }
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
