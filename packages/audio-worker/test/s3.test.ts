import { uploadAudio } from '../src/s3';
import { S3Client } from '@aws-sdk/client-s3';

const mockS3Client = {
  send: jest.fn(),
} as any;

describe('S3 Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadAudio', () => {
    it('should upload audio buffer to S3 with correct key', async () => {
      mockS3Client.send.mockResolvedValue({});
      const audioBuffer = Buffer.from('fake audio data');

      await uploadAudio(
        mockS3Client,
        'hak-audio-dev',
        'abc123def456',
        audioBuffer
      );

      expect(mockS3Client.send).toHaveBeenCalledTimes(1);
    });

    it('should use cache/{hash}.mp3 as key format', async () => {
      mockS3Client.send.mockResolvedValue({});
      const audioBuffer = Buffer.from('fake audio data');

      await uploadAudio(
        mockS3Client,
        'hak-audio-dev',
        'myhash123',
        audioBuffer
      );

      const call = mockS3Client.send.mock.calls[0][0];
      expect(call.input.Key).toBe('cache/myhash123.mp3');
    });

    it('should set correct content type', async () => {
      mockS3Client.send.mockResolvedValue({});
      const audioBuffer = Buffer.from('fake audio data');

      await uploadAudio(
        mockS3Client,
        'hak-audio-dev',
        'hash123',
        audioBuffer
      );

      const call = mockS3Client.send.mock.calls[0][0];
      expect(call.input.ContentType).toBe('audio/mpeg');
    });

    it('should throw error on upload failure', async () => {
      mockS3Client.send.mockRejectedValue(new Error('Upload failed'));
      const audioBuffer = Buffer.from('fake audio data');

      await expect(
        uploadAudio(mockS3Client, 'bucket', 'hash', audioBuffer)
      ).rejects.toThrow('Upload failed');
    });
  });
});
