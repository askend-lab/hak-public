let warmed = false;

export async function warmAudioWorker(): Promise<void> {
  if (warmed) return;
  if (typeof window === 'undefined' || import.meta.env.MODE === 'test') return;
  
  try {
    const response = await fetch('/api/audio/warm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (response.ok) {
      warmed = true;
      console.log('[Audio] Worker warm-up triggered');
    }
  } catch (error) {
    console.warn('[Audio] Failed to warm up worker:', error);
  }
}
