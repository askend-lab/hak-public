import { synthesize } from '../src/merlin';
import { uploadAudio } from '../src/s3';
import { receiveMessage, parseMessage, deleteMessage } from '../src/sqs';
import { processMessage } from '../src/worker';

jest.mock('../src/sqs', () => ({
  receiveMessage: jest.fn(),
  parseMessage: jest.fn(),
  deleteMessage: jest.fn(),
}));

jest.mock('../src/merlin', () => ({
  synthesize: jest.fn(),
}));

jest.mock('../src/s3', () => ({
  uploadAudio: jest.fn(),
}));

const mockSqsClient = { send: jest.fn() } as any;
const mockS3Client = { send: jest.fn() } as any;
const config = {
  queueUrl: 'https://queue-url',
  bucketName: 'test-bucket',
  merlinUrl: 'https://merlin-url/synthesize',
};

describe('Worker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  describe('processMessage', () => {
    it('should return false when no message in queue', async () => {
      (receiveMessage as jest.Mock).mockResolvedValue(null);

      const result = await processMessage(mockSqsClient, mockS3Client, config);

      expect(result).toBe(false);
      expect(synthesize).not.toHaveBeenCalled();
    });

    it('should process message end-to-end', async () => {
      const mockMessage = {
        MessageId: 'msg-123',
        Body: JSON.stringify({ text: 'tere', hash: 'abc123' }),
        ReceiptHandle: 'receipt-123',
      };
      const mockAudioBuffer = Buffer.from('fake audio');

      (receiveMessage as jest.Mock).mockResolvedValue(mockMessage);
      (parseMessage as jest.Mock).mockReturnValue({ text: 'tere', hash: 'abc123' });
      (synthesize as jest.Mock).mockResolvedValue(mockAudioBuffer);
      (uploadAudio as jest.Mock).mockResolvedValue(undefined);
      (deleteMessage as jest.Mock).mockResolvedValue(undefined);

      const result = await processMessage(mockSqsClient, mockS3Client, config);

      expect(result).toBe(true);
      expect(parseMessage).toHaveBeenCalledWith(mockMessage);
      expect(synthesize).toHaveBeenCalledWith('tere', config.merlinUrl);
      expect(uploadAudio).toHaveBeenCalledWith(
        mockS3Client,
        config.bucketName,
        'abc123',
        mockAudioBuffer
      );
      expect(deleteMessage).toHaveBeenCalledWith(
        mockSqsClient,
        config.queueUrl,
        'receipt-123'
      );
    });

    it('should throw error when synthesis fails', async () => {
      const mockMessage = {
        MessageId: 'msg-123',
        Body: JSON.stringify({ text: 'tere', hash: 'abc123' }),
        ReceiptHandle: 'receipt-123',
      };

      (receiveMessage as jest.Mock).mockResolvedValue(mockMessage);
      (parseMessage as jest.Mock).mockReturnValue({ text: 'tere', hash: 'abc123' });
      (synthesize as jest.Mock).mockRejectedValue(new Error('TTS failed'));

      await expect(processMessage(mockSqsClient, mockS3Client, config))
        .rejects.toThrow('TTS failed');
    });
  });
});
