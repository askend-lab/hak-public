import {
  DefineAuthChallengeTriggerEvent,
  CreateAuthChallengeTriggerEvent,
  VerifyAuthChallengeResponseTriggerEvent,
} from 'aws-lambda';

export async function handleDefineAuthChallenge(
  event: DefineAuthChallengeTriggerEvent
): Promise<DefineAuthChallengeTriggerEvent> {
  const session = event.request.session;

  if (session.length === 0) {
    // First attempt - issue CUSTOM_CHALLENGE
    event.response.challengeName = 'CUSTOM_CHALLENGE';
    event.response.issueTokens = false;
    event.response.failAuthentication = false;
  } else {
    const lastChallenge = session[session.length - 1];
    
    if (lastChallenge.challengeName === 'CUSTOM_CHALLENGE' && lastChallenge.challengeResult) {
      // Challenge passed - issue tokens
      event.response.issueTokens = true;
      event.response.failAuthentication = false;
    } else {
      // Challenge failed
      event.response.issueTokens = false;
      event.response.failAuthentication = true;
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
  event.response.challengeMetadata = 'TARA_AUTH';

  return event;
}

export async function handleVerifyAuthChallengeResponse(
  event: VerifyAuthChallengeResponseTriggerEvent
): Promise<VerifyAuthChallengeResponseTriggerEvent> {
  // TARA Lambda sends 'TARA_VERIFIED' as challenge answer after successful TARA authentication
  event.response.answerCorrect = event.request.challengeAnswer === 'TARA_VERIFIED';

  return event;
}

// Main handler that routes based on triggerSource
export const handler = async (
  event: DefineAuthChallengeTriggerEvent | CreateAuthChallengeTriggerEvent | VerifyAuthChallengeResponseTriggerEvent
): Promise<DefineAuthChallengeTriggerEvent | CreateAuthChallengeTriggerEvent | VerifyAuthChallengeResponseTriggerEvent> => {
  const triggerSource = event.triggerSource;
  
  switch (triggerSource) {
    case 'DefineAuthChallenge_Authentication':
      return handleDefineAuthChallenge(event as DefineAuthChallengeTriggerEvent);
    case 'CreateAuthChallenge_Authentication':
      return handleCreateAuthChallenge(event as CreateAuthChallengeTriggerEvent);
    case 'VerifyAuthChallengeResponse_Authentication':
      return handleVerifyAuthChallengeResponse(event as VerifyAuthChallengeResponseTriggerEvent);
    default:
      throw new Error(`Unknown trigger source: ${triggerSource}`);
  }
};
