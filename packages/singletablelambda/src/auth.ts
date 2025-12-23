/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return -- AWS Lambda event types */
import { APIGatewayProxyEvent } from 'aws-lambda';

function getCognitoUserId(event: APIGatewayProxyEvent): string | undefined {
  return event.requestContext?.authorizer?.claims?.sub as string | undefined;
}

function getLocalUserId(event: APIGatewayProxyEvent): string {
  return event.headers?.['X-User-Id'] ?? event.headers?.['x-user-id'] ?? 'test-user';
}

export function getUserIdFromEvent(event: APIGatewayProxyEvent): string | null {
  const cognitoId = getCognitoUserId(event);
  if (cognitoId !== undefined && cognitoId !== '') return cognitoId;
  return (process.env.IS_OFFLINE as string | undefined) === 'true' ? getLocalUserId(event) : null;
}
