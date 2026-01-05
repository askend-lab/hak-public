import type { SQSClient } from '@aws-sdk/client-sqs';

import { receiveMessage, deleteMessage, parseMessage } from '../src/sqs';

const mockSqsClient = {
  send: jest.fn(),
} as unknown as SQSClient & { send: jest.Mock };

describe('SQS Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('receiveMessage', () => {
    it('should receive message from queue', async () => {
      const mockMessage = {
        MessageId: 'msg-123',
        Body: JSON.stringify({ text: 'tere', hash: 'abc123' }),
        ReceiptHandle: 'receipt-123',
      };
      
      mockSqsClient.send.mockResolvedValue({
        Messages: [mockMessage],
      });

      const result = await receiveMessage(mockSqsClient, 'https://queue-url');
      
      expect(result).toStrictEqual(mockMessage);
      expect(mockSqsClient.send).toHaveBeenCalledTimes(1);
    });

    it('should return null when queue is empty', async () => {
      mockSqsClient.send.mockResolvedValue({
        Messages: [],
      });

      const result = await receiveMessage(mockSqsClient, 'https://queue-url');
      
      expect(result).toBeNull();
    });

    it('should return null when Messages is undefined', async () => {
      mockSqsClient.send.mockResolvedValue({});

      const result = await receiveMessage(mockSqsClient, 'https://queue-url');
      
      expect(result).toBeNull();
    });
  });

  describe('parseMessage', () => {
    it('should parse message body with text and hash', () => {
      const message = {
        Body: JSON.stringify({ text: 'tere päevast', hash: 'abc123def456' }),
      };

      const result = parseMessage(message);
      
      expect(result).toStrictEqual({
        text: 'tere päevast',
        hash: 'abc123def456',
      });
    });

    it('should throw error for invalid JSON', () => {
      const message = {
        Body: 'invalid json',
      };

      expect(() => parseMessage(message as { Body: string })).toThrow();
    });

    it('should throw error for empty message body', () => {
      const message = {
        Body: '',
      };

      expect(() => parseMessage(message as { Body: string })).toThrow('Message body is empty');
    });

    it('should throw error for undefined message body', () => {
      const message = {};

      expect(() => parseMessage(message as { Body: string })).toThrow('Message body is empty');
    });

    it('should throw error for missing text field', () => {
      const message = {
        Body: JSON.stringify({ hash: 'abc123' }),
      };

      expect(() => parseMessage(message as { Body: string })).toThrow('Missing text field');
    });

    it('should throw error for missing hash field', () => {
      const message = {
        Body: JSON.stringify({ text: 'tere' }),
      };

      expect(() => parseMessage(message as { Body: string })).toThrow('Missing hash field');
    });
  });

  describe('deleteMessage', () => {
    it('should delete message from queue', async () => {
      mockSqsClient.send.mockResolvedValue({});

      await deleteMessage(mockSqsClient, 'https://queue-url', 'receipt-123');
      
      expect(mockSqsClient.send).toHaveBeenCalledTimes(1);
    });
  });
});
