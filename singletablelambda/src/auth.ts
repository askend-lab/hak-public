import { APIGatewayProxyEvent } from 'aws-lambda';

function getCognitoUserId(event: APIGatewayProxyEvent): string | undefined {
  return event.requestContext?.authorizer?.claims?.sub as string | undefined;
}

function getLocalUserId(event: APIGatewayProxyEvent): string {
  return event.headers?.['X-User-Id'] ?? event.headers?.['x-user-id'] ?? 'test-user';
}

export function getUserIdFromEvent(event: APIGatewayProxyEvent): string | null {
  const cognitoId = getCognitoUserId(event);
  if (cognitoId) return cognitoId;
  return process.env.IS_OFFLINE === 'true' ? getLocalUserId(event) : null;
}
