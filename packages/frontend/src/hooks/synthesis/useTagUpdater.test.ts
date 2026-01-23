import { act } from '@testing-library/react';
import { useTagUpdater } from './useTagUpdater';

describe('useTagUpdater', () => {
  it('should update sentence tags using transformer', () => {
    const mockSetSentences = jest.fn();
    const { updateSentenceTags } = useTagUpdater(mockSetSentences);

    act(() => {
      updateSentenceTags('test-1', () => ({ text: 'updated text' }));
    });

    expect(mockSetSentences).toHaveBeenCalledWith(
      expect.any(Function)
    );
  });

  it('should delete tag at specific index', () => {
    const mockSetSentences = jest.fn();
    const { deleteTag } = useTagUpdater(mockSetSentences);

    act(() => {
      deleteTag('test-1', 1);
    });

    expect(mockSetSentences).toHaveBeenCalledWith(
      expect.any(Function)
    );
  });

  it('should replace tag at specific index', () => {
    const mockSetSentences = jest.fn();
    const { replaceTag } = useTagUpdater(mockSetSentences);

    act(() => {
      replaceTag('test-1', 0, ['hi', 'there']);
    });

    expect(mockSetSentences).toHaveBeenCalledWith(
      expect.any(Function)
    );
  });

  it('should update stressed tag', () => {
    const mockSetSentences = jest.fn();
    const { updateStressedTag } = useTagUpdater(mockSetSentences);

    act(() => {
      updateStressedTag('test-1', 0, 'stressed-hello');
    });

    expect(mockSetSentences).toHaveBeenCalledWith(
      expect.any(Function)
    );
  });
});
