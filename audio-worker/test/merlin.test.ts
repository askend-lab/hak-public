import { synthesize } from '../src/merlin';

global.fetch = jest.fn();

describe('Merlin TTS', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('synthesize', () => {
    it('should call Merlin API with text and return audio buffer', async () => {
      const mockAudioBase64 = Buffer.from('fake audio data').toString('base64');
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          audio: mockAudioBase64,
          format: 'wav',
        }),
      });

      const result = await synthesize('tere päevast', 'https://merlin-url/synthesize');
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://merlin-url/synthesize',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: 'tere päevast',
            voice: 'efm_s',
            returnBase64: true,
          }),
        })
      );
      expect(result).toBeInstanceOf(Buffer);
    });

    it('should throw error when API returns error', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(synthesize('tere', 'https://merlin-url/synthesize'))
        .rejects.toThrow('Merlin API error: 500');
    });

    it('should throw error when fetch fails', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(synthesize('tere', 'https://merlin-url/synthesize'))
        .rejects.toThrow('Network error');
    });
  });
});
