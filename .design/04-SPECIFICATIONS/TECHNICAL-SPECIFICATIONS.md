# Technical Specifications - From Prototype

**Source:** EKI2 Prototype Implementation  
**Date:** 2025-11-15  
**Status:** Documented from Working Code

---

## Overview

This document captures technical implementation details discovered in the EKI2 prototype. These specifications should guide production development and ensure consistency with proven patterns.

---

## 1. Technology Stack

### Frontend Framework
```json
{
  "next": "15.x",
  "react": "19.x",
  "typescript": "5.x"
}
```

**Key Features Used:**
- Next.js App Router (app/)
- React Server Components
- Client Components ('use client')
- TypeScript strict mode

### Styling
```json
{
  "sass": "^1.x",
  "tailwindcss": "^3.x"
}
```

**Approach:**
- SCSS modules for component styles
- EKI Design System tokens
- Tailwind for utilities (secondary)
- CSS variables for theming

### State Management
- **No Redux** - React Context API only
- `AuthContext` - Authentication state
- `NotificationContext` - Toast notifications
- Component local state with hooks

### Drag and Drop
```json
{
  "@dnd-kit/core": "^6.1.0",
  "@dnd-kit/sortable": "^8.0.0",
  "@dnd-kit/utilities": "^3.2.2"
}
```

**Features:**
- Sortable lists (playlist, task entries)
- Keyboard navigation
- Touch support
- Custom drag overlays

### Testing
```json
{
  "vitest": "^2.x",
  "@testing-library/react": "^15.x"
}
```

**Coverage:**
- 30 tests passing
- Component tests
- API integration tests
- Phonetic marker tests

### Development Tools
```json
{
  "storybook": "^8.x",
  "eslint": "^9.x"
}
```

---

## 2. Project Structure

```
eki2/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Main page (synthesis)
│   └── api/                 # API routes
│       ├── analyze/
│       └── synthesize/
│
├── components/              # React components (22 total)
│   ├── TextInput.tsx
│   ├── AudioPlayer.tsx
│   ├── StressedTextDisplay.tsx
│   ├── Playlist.tsx
│   ├── PlaylistItem.tsx
│   ├── PronunciationVariants.tsx
│   ├── TaskManager.tsx
│   ├── TaskDetailView.tsx
│   ├── TaskCreationModal.tsx
│   ├── TaskEditModal.tsx
│   ├── ShareTaskModal.tsx
│   ├── AddEntryModal.tsx
│   ├── LoginModal.tsx
│   ├── UserProfile.tsx
│   ├── FeedbackModal.tsx
│   ├── PhoneticGuideModal.tsx
│   ├── ConfirmDialog.tsx
│   ├── ConfirmationModal.tsx
│   ├── Notification.tsx
│   ├── NotificationContainer.tsx
│   └── Footer.tsx
│
├── contexts/               # React Contexts
│   ├── AuthContext.tsx
│   └── NotificationContext.tsx
│
├── services/               # Business logic
│   └── dataService.ts      # Task CRUD operations
│
├── types/                  # TypeScript definitions
│   └── task.ts
│
├── utils/                  # Utility functions
│   ├── phoneticMarkers.ts
│   └── isikukood.ts
│
├── styles/                 # SCSS files (29 files)
│   ├── globals.scss
│   ├── variables.scss
│   └── components/
│
├── public/                 # Static assets
│   ├── examples/           # Sample audio files
│   └── mock-tasks.json     # Baseline tasks
│
└── __tests__/              # Test files
```

---

## 3. Data Models

### Core Types

```typescript
// types/task.ts

export interface Task {
  id: string;
  userId: string;
  name: string;
  description?: string;
  speechSequences: string[];        // Original texts
  entries: TaskEntry[];
  createdAt: Date;
  updatedAt: Date;
  shareToken: string;
}

export interface TaskEntry {
  id: string;
  taskId: string;
  text: string;                     // Original text
  stressedText: string;             // Phonetic form
  audioUrl: string | null;          // Cached audio blob URL
  audioBlob: Blob | null;           // Audio data
  order: number;                    // Display order (drag-drop)
  createdAt: Date;
}

export interface TaskSummary {
  id: string;
  name: string;
  description?: string;
  entryCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskRequest {
  name: string;
  description?: string;
  speechSequences?: string[];
  speechEntries?: Array<{
    text: string;
    stressedText: string;
  }>;
}

export interface UpdateTaskRequest {
  name?: string;
  description?: string;
}
```

### Component State

```typescript
// app/page.tsx

type SentenceState = {
  id: string;
  text: string;                    // Full sentence text
  tags: string[];                  // Words for display
  isPlaying: boolean;
  isLoading: boolean;
  currentInput: string;            // Current word being typed
  phoneticText?: string;           // Cached phonetic from Vabamorf
  audioUrl?: string;               // Cached audio blob URL
  stressedTags?: string[];         // Phonetic forms (parallel to tags)
};
```

---

## 4. API Integration

### Next.js API Routes

**POST /api/analyze**
```typescript
// Calls Vabamorf service
Request: { text: string }
Response: { 
  originalText: string,
  stressedText: string  // With Vabamorf markers
}
```

**POST /api/synthesize**
```typescript
// Calls Merlin TTS service
Request: {
  text: string,              // Phonetic text
  voice: 'efm_s' | 'efm_l',
  speed?: number,
  pitch?: number
}
Response: audio/wav blob
Headers: {
  'X-Phonetic-Text': string  // Echo back phonetic form
}
```

### Backend Services

**Vabamorf (Port 8001)**
```
Input: Estonian text
Output: Text with stress markers (<, ?, ], _, etc.)
```

**Merlin TTS (Port 8002)**
```
Input: Phonetic text + voice model
Output: WAV audio file
```

### Voice Model Selection

```typescript
function getVoiceModel(text: string): 'efm_s' | 'efm_l' {
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  return words.length === 1 ? 'efm_s' : 'efm_l';
}

// efm_s: Short model for single words
// efm_l: Long model for sentences
```

---

## 5. State Management Patterns

### React Context Architecture

**AuthContext**
```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
  login: (isikukood: string) => Promise<void>;
  logout: () => void;
}

// Usage
const { user, isAuthenticated, login, logout } = useAuth();
```

**NotificationContext**
```typescript
interface NotificationContextType {
  showNotification: (
    type: 'success' | 'error' | 'info' | 'warning',
    message: string,
    duration?: number
  ) => void;
}

// Usage
const { showNotification } = useNotification();
showNotification('success', 'Ülesanne loodud!');
```

### Local State Patterns

**Component State with Hooks**
```typescript
// View management
const [currentView, setCurrentView] = useState<'synthesis' | 'tasks'>('synthesis');

// Modal states
const [showTaskCreationModal, setShowTaskCreationModal] = useState(false);

// Data states
const [sentences, setSentences] = useState<SentenceState[]>([]);

// UI states
const [isPlayingAll, setIsPlayingAll] = useState(false);
```

---

## 6. Data Persistence

### localStorage Schema

```typescript
// Authentication
'eki_user'                          // Current user object (JSON)

// Tasks
'eki_user_tasks_{userId}'           // User-created tasks (JSON array)
'eki_deleted_tasks_{userId}'        // Deleted baseline task IDs (JSON array)
'eki_baseline_additions_{userId}'   // Extra entries for baseline tasks (JSON object)

// Playlist
'eki_playlist_entries'              // Temporary playlist from copy (JSON array)

// Editing
'eki_edit_entry'                    // Entry being edited (JSON object)

// Login flow
'eki_pending_action'                // Action to execute after login (string)
'eki_pending_playlist'              // Playlist to restore after login (JSON array)
```

### DataService API

```typescript
class DataService {
  // Singleton pattern
  private static instance: DataService;
  static getInstance(): DataService;
  
  // Task CRUD
  async createTask(userId: string, taskData: CreateTaskRequest): Promise<Task>;
  async getTasksForUser(userId: string): Promise<TaskSummary[]>;
  async getTask(taskId: string, userId: string): Promise<Task | null>;
  async updateTask(userId: string, taskId: string, updates: UpdateTaskRequest): Promise<void>;
  async deleteTask(userId: string, taskId: string): Promise<void>;
  
  // Entries
  async addEntryToTask(userId: string, taskId: string, entry: Omit<TaskEntry, 'id' | 'taskId' | 'createdAt'>): Promise<void>;
  async updateTaskEntries(userId: string, taskId: string, entries: TaskEntry[]): Promise<void>;
  
  // Sharing
  async shareUserTask(userId: string, taskId: string): Promise<string>;
  async getSharedTask(shareToken: string): Promise<Task | null>;
}
```

---

## 7. Performance Optimizations

### Audio Caching

**Cache Key:** `audioUrl` + `phoneticText`

```typescript
// Check cache before synthesis
if (sentence.audioUrl && sentence.phoneticText && sentence.text === text) {
  // Use cached audio
  const audio = new Audio(sentence.audioUrl);
  await audio.play();
} else {
  // Synthesize and cache
  const audioBlob = await synthesize(text);
  const audioUrl = URL.createObjectURL(audioBlob);
  
  setSentences(prev =>
    prev.map(s => s.id === id 
      ? { ...s, audioUrl, phoneticText }
      : s
    )
  );
}
```

**Cache Invalidation:**
- Text changes
- Phonetic markers edited
- Playback error (retry once)

**Memory Management:**
```typescript
// Cleanup on unmount or delete
useEffect(() => {
  return () => {
    sentence.audioUrl && URL.revokeObjectURL(sentence.audioUrl);
  };
}, []);
```

### Component Optimization

**React.memo for Expensive Components:**
```typescript
// PlaylistItem with drag handlers
export default React.memo(PlaylistItem);
```

**useMemo for Computed Values:**
```typescript
const sortedTasks = useMemo(() => {
  return tasks.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}, [tasks]);
```

---

## 8. Error Handling

### API Error Handling

```typescript
try {
  const response = await fetch('/api/synthesize', { ... });
  
  if (!response.ok) {
    throw new Error(`Synthesis failed: ${response.status}`);
  }
  
  const audioBlob = await response.blob();
  // ... process audio
  
} catch (error) {
  console.error('Synthesis error:', error);
  showNotification('error', 'Sünteesimine ebaõnnestus');
  
  // Cleanup state
  setSentences(prev =>
    prev.map(s => s.id === id 
      ? { ...s, isLoading: false, isPlaying: false }
      : s
    )
  );
}
```

### Audio Playback Error Handling

```typescript
audio.onerror = () => {
  if (retryCount === 0 && sentence.audioUrl) {
    // Retry once with cache invalidation
    console.log('Audio error, retrying...');
    setSentences(prev =>
      prev.map(s => s.id === id 
        ? { ...s, audioUrl: undefined, phoneticText: undefined }
        : s
      )
    );
    setTimeout(() => playSingleSentence(id, abortSignal, 1), 100);
  } else {
    // Give up and show error
    console.error('Audio playback failed after retry');
    showNotification('error', 'Heli esitamine ebaõnnestus');
  }
};
```

### localStorage Error Handling

```typescript
try {
  const storedData = localStorage.getItem(key);
  if (storedData) {
    return JSON.parse(storedData);
  }
} catch (error) {
  console.error('localStorage read error:', error);
  // Clear corrupted data
  localStorage.removeItem(key);
  return defaultValue;
}
```

---

## 9. Accessibility

### Keyboard Navigation

```typescript
// Synthesis with Ctrl+Enter
const handleKeyPress = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter' && e.ctrlKey && !isLoading) {
    onSubmit();
  }
};

// Close modal with Escape
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      onClose();
    }
  };
  
  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, [isOpen, onClose]);
```

### ARIA Labels

```typescript
<button
  onClick={onPlay}
  aria-label={isPlaying ? 'Peata heli' : 'Kuula heli'}
  aria-pressed={isPlaying}
>
  {isPlaying ? <PauseIcon /> : <PlayIcon />}
</button>
```

### Focus Management

```typescript
// Auto-focus input on modal open
useEffect(() => {
  if (isOpen && inputRef.current) {
    inputRef.current.focus();
  }
}, [isOpen]);
```

---

## 10. Security Considerations

### Authentication

**Isikukood Validation:**
```typescript
// utils/isikukood.ts
export function validateIsikukood(code: string): boolean {
  if (!/^\d{11}$/.test(code)) return false;
  
  // Checksum validation
  const weights = [1, 2, 3, 4, 5, 6, 7, 8, 9, 1];
  let sum = 0;
  
  for (let i = 0; i < 10; i++) {
    sum += parseInt(code[i]) * weights[i];
  }
  
  const checksum = sum % 11;
  const lastDigit = parseInt(code[10]);
  
  return checksum === lastDigit;
}
```

### XSS Prevention

**React automatically escapes text:**
```typescript
// Safe - React escapes by default
<div>{userInput}</div>

// Dangerous - avoid dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

### localStorage Security

**No sensitive data in localStorage:**
- User ID stored (isikukood)
- Task data stored (user-owned)
- No passwords or tokens
- Clear on logout option available

---

## 11. Testing Strategy

### Component Tests

```typescript
// __tests__/components/AudioPlayer.test.tsx
describe('AudioPlayer', () => {
  it('renders play button', () => {
    render(<AudioPlayer audioUrl="test.wav" />);
    expect(screen.getByLabelText('Kuula heli')).toBeInTheDocument();
  });
  
  it('toggles play/pause', async () => {
    render(<AudioPlayer audioUrl="test.wav" />);
    const button = screen.getByRole('button');
    
    await userEvent.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });
});
```

### Integration Tests

```typescript
// __tests__/integration.test.ts
describe('Synthesis workflow', () => {
  it('synthesizes text end-to-end', async () => {
    // Mock API responses
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ // analyze
        ok: true,
        json: async () => ({ stressedText: 'test<' })
      })
      .mockResolvedValueOnce({ // synthesize
        ok: true,
        blob: async () => new Blob()
      });
    
    render(<Home />);
    
    // Enter text
    const input = screen.getByPlaceholderText('Sisesta tekst...');
    await userEvent.type(input, 'tere');
    
    // Click synthesize
    const button = screen.getByText('Kuula');
    await userEvent.click(button);
    
    // Verify API calls
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
```

---

## 12. Deployment

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_VABAMORF_URL=http://localhost:8001
NEXT_PUBLIC_MERLIN_URL=http://localhost:8002

# Production
NEXT_PUBLIC_VABAMORF_URL=https://vabamorf.production.com
NEXT_PUBLIC_MERLIN_URL=https://merlin.production.com
```

### Build Configuration

```typescript
// next.config.ts
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // SCSS support
  sassOptions: {
    includePaths: ['./styles'],
  },
  
  // API proxy (development)
  async rewrites() {
    return [
      {
        source: '/api/analyze',
        destination: 'http://localhost:8001/analyze',
      },
      {
        source: '/api/synthesize',
        destination: 'http://localhost:8002/synthesize',
      },
    ];
  },
};
```

### Docker Services

```yaml
# docker-compose.yml
version: '3.8'

services:
  vabamorf:
    build: ./services/vabamorf
    ports:
      - "8001:8000"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
  
  merlin:
    build: ./services/merlin
    ports:
      - "8002:8000"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

---

## 13. Performance Metrics

### Target Metrics

| Metric | Target | Actual (Prototype) |
|--------|--------|--------------------|
| Initial Load | < 2s | ~1.5s |
| Analysis (Vabamorf) | < 500ms | ~200ms |
| Synthesis (Merlin) | < 5s | 3-10s (text length) |
| Cached Audio Play | < 100ms | ~50ms |
| Playlist Reorder | < 100ms | ~30ms (drag-drop) |
| Task Creation | < 200ms | ~50ms (localStorage) |

### Optimization Opportunities

1. **CDN for Static Assets:** ~40% faster initial load
2. **Service Worker Caching:** Offline support
3. **Audio Compression:** Smaller file sizes
4. **Backend Database:** Faster than localStorage for large datasets
5. **API Response Caching:** Reduce repeated synthesis

---

## 14. Browser Compatibility

### Supported Browsers

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Required Features

- Web Audio API
- Blob URLs
- localStorage
- Drag and Drop API
- Fetch API
- ES2020+ JavaScript

### Polyfills

None required for target browsers.

---

## 15. Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start backend services
docker-compose up -d

# Run tests
npm test

# Run tests with UI
npm run test:ui

# Build for production
npm run build

# Start production server
npm start

# Run Storybook
npm run storybook

# Lint code
npm run lint
```

---

**Document Status:** Complete  
**Last Updated:** 2025-11-15  
**Next Review:** Before production implementation
