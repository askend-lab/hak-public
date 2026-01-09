import { useCallback } from 'react';

import {
  TextInput,
  AudioPlayer,
  StressedText,
  AddToTaskButton,
  TaskSelectModal,
  NotificationContainer,
} from '../components';
import { useSynthesisStore } from '../features';
import { synthesizeWithRetry } from '../services/audio';

export function SynthesisPage() {
  const { text, setResult, setLoading, setError, isLoading, error } = useSynthesisStore();

  const handleSynthesize = useCallback(async () => {
    if (!text.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const result = await synthesizeWithRetry(text);
      setResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Süntees ebaõnnestus');
    } finally {
      setLoading(false);
    }
  }, [text, setResult, setLoading, setError]);

  return (
    <div className="synthesis-page">
      <header className="synthesis-page__header">
        <h1>Eesti keele häälduse õpe</h1>
      </header>

      <main className="synthesis-page__main">
        <section className="synthesis-section">
          <TextInput onSynthesize={() => { void handleSynthesize(); }} />

          {error !== null && error !== '' && (
            <div className="error-message">{error}</div>
          )}

          {!isLoading && (
            <>
              <StressedText />
              <AudioPlayer />
              <AddToTaskButton />
            </>
          )}
        </section>
      </main>

      <TaskSelectModal />
      <NotificationContainer />
    </div>
  );
}
