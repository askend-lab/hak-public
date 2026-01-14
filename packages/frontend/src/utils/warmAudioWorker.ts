let warmed = false;
let lastActivity = 0;
const ACTIVITY_THROTTLE = 60000; // 1 min between pings

export async function warmAudioWorker(): Promise<void> {
  if (warmed) return;
  if (typeof window === 'undefined' || import.meta.env?.MODE === 'test') return;
  
  try {
    // Warm up both Audio and Merlin workers
    await Promise.all([
      fetch('/api/audio/warm', { method: 'POST', headers: { 'Content-Type': 'application/json' } }),
      fetch('/api/warmup', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
    ]);
    warmed = true;
    lastActivity = Date.now();
    console.log('[Audio] Workers warm-up triggered');
  } catch (error) {
    console.warn('[Audio] Failed to warm up workers:', error);
  }
}

export function pingMerlinOnActivity(): void {
  if (typeof window === 'undefined' || import.meta.env?.MODE === 'test') return;
  
  const now = Date.now();
  if (now - lastActivity < ACTIVITY_THROTTLE) return;
  lastActivity = now;
  
  fetch('/api/warmup', { method: 'POST' }).catch(() => {});
}

// Auto-ping on user activity (mouse, keyboard, touch)
if (typeof window !== 'undefined') {
  const events = ['mousemove', 'keydown', 'touchstart', 'scroll'];
  events.forEach(event => {
    window.addEventListener(event, () => pingMerlinOnActivity(), { passive: true });
  });
}
