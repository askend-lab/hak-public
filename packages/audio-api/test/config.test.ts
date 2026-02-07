import type { Config } from '../src/config';

describe('Config interface', () => {
  it('should define the expected shape', () => {
    const config: Config = {
      bucketName: 'hak-audio-dev',
      queueUrl: 'https://sqs.eu-west-1.amazonaws.com/123/hak-audio-generation-dev',
    };

    expect(config.bucketName).toBe('hak-audio-dev');
    expect(config.queueUrl).toContain('hak-audio-generation-dev');
  });
});
