// Tests for Secrets Manager integration in tara-client

import { createTaraClient, _resetSecretsCache, DEFAULT_CALLBACK_URL } from '../src/tara-client';

const mockSend = jest.fn();

jest.mock('@aws-sdk/client-secrets-manager', () => ({
  SecretsManagerClient: jest.fn().mockImplementation(() => ({ send: mockSend })),
  GetSecretValueCommand: jest.fn().mockImplementation((params: unknown) => params),
}));

jest.mock('jose', () => ({
  createRemoteJWKSet: jest.fn().mockReturnValue('mock-jwks'),
  jwtVerify: jest.fn(),
}));

const originalEnv = process.env;

describe('Secrets Manager integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    _resetSecretsCache();
    process.env = { ...originalEnv };
    process.env.TARA_ISSUER = 'https://tara-test.ria.ee';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should load secrets from Secrets Manager when TARA_SECRETS_ARN is set', async () => {
    mockSend.mockResolvedValue({
      SecretString: JSON.stringify({
        TARA_CLIENT_ID: 'sm-client-id',
        TARA_CLIENT_SECRET: 'sm-secret',
        TARA_CALLBACK_URL: 'https://sm-callback.example.com/cb',
      }),
    });

    process.env.TARA_SECRETS_ARN = 'arn:aws:secretsmanager:eu-west-1:123:secret:hak/dev/tara';
    delete process.env.TARA_CLIENT_ID;
    delete process.env.TARA_CLIENT_SECRET;
    delete process.env.TARA_CALLBACK_URL;

    const client = await createTaraClient();
    const url = client.buildAuthorizationUrl('s', 'n');
    expect(url).toContain('client_id=sm-client-id');
    expect(url).toContain('sm-callback.example.com');
    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it('should use default callback when Secrets Manager value is empty', async () => {
    mockSend.mockResolvedValue({
      SecretString: JSON.stringify({ TARA_CLIENT_ID: 'id', TARA_CLIENT_SECRET: 'sec' }),
    });

    process.env.TARA_SECRETS_ARN = 'arn:aws:secretsmanager:eu-west-1:123:secret:hak/dev/tara';
    delete process.env.TARA_CALLBACK_URL;

    const client = await createTaraClient();
    const url = client.buildAuthorizationUrl('s', 'n');
    expect(url).toContain('auth.askend-lab.com');
  });

  it('should handle empty SecretString gracefully', async () => {
    mockSend.mockResolvedValue({ SecretString: '' });

    process.env.TARA_SECRETS_ARN = 'arn:aws:secretsmanager:eu-west-1:123:secret:hak/dev/tara';

    const client = await createTaraClient();
    const url = client.buildAuthorizationUrl('s', 'n');
    expect(url).toContain('client_id=');
    expect(url).toContain(encodeURIComponent(DEFAULT_CALLBACK_URL));
  });

  it('should cache secrets across multiple createTaraClient calls', async () => {
    mockSend.mockResolvedValue({
      SecretString: JSON.stringify({ TARA_CLIENT_ID: 'cached-id', TARA_CLIENT_SECRET: 's' }),
    });

    process.env.TARA_SECRETS_ARN = 'arn:aws:secretsmanager:eu-west-1:123:secret:hak/dev/tara';

    await createTaraClient();
    await createTaraClient();
    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it('should throw when TARA_SECRETS_ARN is not set in non-dev', async () => {
    delete process.env.TARA_SECRETS_ARN;
    process.env.STAGE = 'prod';

    await expect(createTaraClient()).rejects.toThrow('TARA_SECRETS_ARN must be set in non-dev environments');
  });

  it('should fall back to env vars when TARA_SECRETS_ARN is not set (dev)', async () => {
    delete process.env.TARA_SECRETS_ARN;
    process.env.STAGE = 'dev';
    process.env.TARA_CLIENT_ID = 'env-client-id';
    process.env.TARA_CLIENT_SECRET = 'env-secret';

    const client = await createTaraClient();
    const url = client.buildAuthorizationUrl('s', 'n');
    expect(url).toContain('client_id=env-client-id');
    expect(mockSend).not.toHaveBeenCalled();
  });
});
