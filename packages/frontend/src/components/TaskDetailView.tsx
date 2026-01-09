/* eslint-disable max-lines-per-function, max-lines, complexity, max-depth */
'use client';

import { useState, useEffect } from 'react';
import { Task, TaskEntry } from '@/types/task';
import { DataService } from '@/services/dataService';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import SentenceSynthesisItem from './SentenceSynthesisItem';
import ShareTaskModal from './ShareTaskModal';
import PronunciationVariants from './PronunciationVariants';
import SentencePhoneticPanel from './SentencePhoneticPanel';
import { stripPhoneticMarkers } from '@/utils/phoneticMarkers';
import { synthesizeWithPolling } from '@/utils/synthesize';

/**
 * Determine which voice model to use based on word count
 * Single words use efm_s (short), sentences use efm_l (long)
 */
function getVoiceModel(text: string): 'efm_s' | 'efm_l' {
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  return words.length === 1 ? 'efm_s' : 'efm_l';
}

interface TaskDetailViewProps {
  taskId: string;
  onBack: () => void;
  onEditTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onAddEntryFromInput: (text: string, stressedText: string, audioUrl: string, audioBlob: Blob) => void;
  onAddEntry?: () => void;
}

export default function TaskDetailView({
  taskId,
  onBack,
  onEditTask,
  onDeleteTask,
  onAddEntryFromInput,
  onAddEntry: _onAddEntry
}: TaskDetailViewProps) {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [task, setTask] = useState<Task | null>(null);
  const [entries, setEntries] = useState<TaskEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [currentLoadingId, setCurrentLoadingId] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [isLoadingPlayAll, setIsLoadingPlayAll] = useState(false);
  const [playAllAbortController, setPlayAllAbortController] = useState<AbortController | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  // Pronunciation variants state
  const [variantsWord, setVariantsWord] = useState<string | null>(null);
  const [variantsCustomPhonetic, setVariantsCustomPhonetic] = useState<string | null>(null);
  const [isVariantsPanelOpen, setIsVariantsPanelOpen] = useState<boolean>(false);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [selectedTagIndex, setSelectedTagIndex] = useState<number | null>(null);

  // Sentence phonetic panel states
  const [showPhoneticPanel, setShowPhoneticPanel] = useState(false);
  const [phoneticPanelEntryId, setPhoneticPanelEntryId] = useState<string | null>(null);

  // Header menu state
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);

  // Entry menu state
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Drag and drop state
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', id);
  };

  const handleDragEnd = (_e: React.DragEvent) => {
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (draggedId && draggedId !== id) {
      setDragOverId(id);
    }
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();

    if (!draggedId || draggedId === targetId) {
      return;
    }

    setEntries(prev => {
      const draggedIndex = prev.findIndex(entry => entry.id === draggedId);
      const targetIndex = prev.findIndex(entry => entry.id === targetId);

      if (draggedIndex === -1 || targetIndex === -1) {
        return prev;
      }

      const newEntries = [...prev];
      const [draggedItem] = newEntries.splice(draggedIndex, 1);
      if (draggedItem) newEntries.splice(targetIndex, 0, draggedItem);

      return newEntries;
    });

    setDraggedId(null);
    setDragOverId(null);

    // TODO: Persist the new order to the backend
  };

  // Load task data
  useEffect(() => {
    const loadTask = async () => {
      if (!user) {
        setError('Kasutaja pole sisse logitud');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const dataService = DataService.getInstance();
        const taskData = await dataService.getTask(taskId, user.id);
        
        if (!taskData) {
          setError('Ülesannet ei leitud');
          return;
        }
        
        setTask(taskData);
        setEntries(taskData.entries || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Viga ülesande laadimisel');
      } finally {
        setIsLoading(false);
      }
    };

    loadTask();
  }, [taskId, user]);

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  // Synthesize and play audio on-the-fly
  const synthesizeAndPlay = async (stressedText: string, originalText: string, id: string) => {
    console.log('Starting synthesis for entry:', id, 'Setting loading state...');
    setCurrentLoadingId(id);
    setCurrentPlayingId(null);

    try {
      // Call the synthesis API with polling
      const audioUrl = await synthesizeWithPolling(stressedText, getVoiceModel(originalText));
      const audio = new Audio(audioUrl);
      
      // Switch from loading to playing when audio starts
      audio.onloadeddata = () => {
        setCurrentLoadingId(null);
        setCurrentPlayingId(id);
      };
      
      audio.onended = () => {
        setCurrentPlayingId(null);
        setCurrentLoadingId(null);
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = () => {
        console.error('Audio playback failed');
        setCurrentPlayingId(null);
        setCurrentLoadingId(null);
        URL.revokeObjectURL(audioUrl);
      };
      
      await audio.play();
    } catch (error) {
      console.error('Failed to synthesize and play audio:', error);
      setCurrentPlayingId(null);
      setCurrentLoadingId(null);
    }
  };

  const handlePlayEntry = (id: string) => {
    const entry = entries.find(e => e.id === id);
    if (!entry) return;

    console.log('Playing entry:', id, 'audioBlob:', entry.audioBlob, 'audioUrl:', entry.audioUrl);

    // First try to play existing audio if available
    if ((entry.audioBlob && entry.audioBlob.size > 0) || (entry.audioUrl && entry.audioUrl.trim() !== '')) {
      console.log('Using stored audio for entry:', id);
      setCurrentPlayingId(id);
      const playUrl = entry.audioBlob ? URL.createObjectURL(entry.audioBlob) : entry.audioUrl;
      if (playUrl) {
        const audio = new Audio(playUrl);
        audio.onended = () => {
          setCurrentPlayingId(null);
          if (entry.audioBlob && playUrl !== entry.audioUrl) {
            URL.revokeObjectURL(playUrl);
          }
        };
        audio.onerror = () => {
          console.error('Audio playback failed, falling back to synthesis');
          if (entry.audioBlob && playUrl !== entry.audioUrl) {
            URL.revokeObjectURL(playUrl);
          }
          // Fallback to on-the-fly synthesis
          synthesizeAndPlay(entry.stressedText, entry.text, id);
        };
        audio.play().catch(_error => {
          console.error('Failed to play stored audio, falling back to synthesis');
          if (entry.audioBlob && playUrl !== entry.audioUrl) {
            URL.revokeObjectURL(playUrl);
          }
          // Fallback to on-the-fly synthesis
          synthesizeAndPlay(entry.stressedText, entry.text, id);
        });
      }
    } else {
      // No stored audio - synthesize on-the-fly
      console.log('No stored audio found, synthesizing for entry:', id);
      synthesizeAndPlay(entry.stressedText, entry.text, id);
    }
  };

  const handleDeleteEntry = (id: string) => {
    const entryToDelete = entries.find(e => e.id === id);
    setEntries(prev => prev.filter(e => e.id !== id));
    if (currentPlayingId === id) {
      setCurrentPlayingId(null);
    }

    // Show success notification
    if (entryToDelete) {
      showNotification('success', 'Lausung kustutatud', undefined, undefined, 'success');
    }
  };

  const handleMenuOpen = (id: string) => {
    setOpenMenuId(id);
  };

  const handleMenuClose = () => {
    setOpenMenuId(null);
  };

  // Helper function to play a single entry during play-all
  const playSingleEntry = async (entry: TaskEntry, abortSignal: AbortSignal): Promise<boolean> => {
    if (abortSignal.aborted) return false;

    // Try stored audio first, fallback to synthesis
    let audioUrl: string | null = null;
    let shouldRevokeUrl = false;

    try {
      if (entry.audioBlob && entry.audioBlob.size > 0) {
        audioUrl = URL.createObjectURL(entry.audioBlob);
        shouldRevokeUrl = true;
      } else if (entry.audioUrl && entry.audioUrl.trim() !== '') {
        audioUrl = entry.audioUrl;
      } else {
        // Synthesize on-the-fly with polling
        setCurrentLoadingId(entry.id);
        try {
          audioUrl = await synthesizeWithPolling(entry.stressedText, getVoiceModel(entry.text));
          if (abortSignal.aborted) {
            setCurrentLoadingId(null);
            return false;
          }
        } catch {
          setCurrentLoadingId(null);
          return false;
        }
      }

      if (!audioUrl || abortSignal.aborted) return false;

      // Play the audio
      return new Promise((resolve) => {
        const audio = new Audio(audioUrl!);
        setCurrentAudio(audio);

        const cleanup = () => {
          setCurrentPlayingId(null);
          setCurrentLoadingId(null);
          setCurrentAudio(null);
          if (shouldRevokeUrl && audioUrl) {
            URL.revokeObjectURL(audioUrl);
          }
        };

        audio.onloadeddata = () => {
          setCurrentLoadingId(null);
          setCurrentPlayingId(entry.id);
        };

        audio.onended = () => {
          cleanup();
          resolve(true);
        };

        audio.onerror = (e) => {
          console.error('Audio playback failed:', e);
          cleanup();
          resolve(false);
        };

        if (abortSignal) {
          abortSignal.addEventListener('abort', () => {
            audio.pause();
            audio.src = '';
            cleanup();
            resolve(false);
          });
        }

        audio.play().catch((error) => {
          console.error('Audio play error:', error);
          cleanup();
          resolve(false);
        });
      });
    } catch (error) {
      console.error('Failed to play entry:', error);
      setCurrentLoadingId(null);
      setCurrentPlayingId(null);
      if (shouldRevokeUrl && audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      return false;
    }
  };

  const handlePlayAll = async () => {
    // If already playing or loading, stop
    if (isPlayingAll || isLoadingPlayAll) {
      playAllAbortController?.abort();
      setPlayAllAbortController(null);
      setIsPlayingAll(false);
      setIsLoadingPlayAll(false);
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = '';
        setCurrentAudio(null);
      }
      setCurrentPlayingId(null);
      setCurrentLoadingId(null);
      return;
    }

    if (entries.length === 0) return;

    // Start loading state
    const abortController = new AbortController();
    setPlayAllAbortController(abortController);
    setIsLoadingPlayAll(true);

    let isFirstEntry = true;
    for (const entry of entries) {
      if (abortController.signal.aborted) break;

      const success = await playSingleEntry(entry, abortController.signal);
      
      // After first entry starts playing, switch from loading to playing
      if (isFirstEntry && success) {
        setIsLoadingPlayAll(false);
        setIsPlayingAll(true);
        isFirstEntry = false;
      }
      
      if (!success || abortController.signal.aborted) break;
    }

    // Cleanup
    setIsPlayingAll(false);
    setIsLoadingPlayAll(false);
    setPlayAllAbortController(null);
    setCurrentPlayingId(null);
    setCurrentLoadingId(null);
  };

  // Handle tag click to open pronunciation variants
  const handleTagClick = (entryId: string, tagIndex: number, word: string) => {
    // Find the entry to get its custom phonetic form if available
    const entry = entries.find(e => e.id === entryId);
    const stressedWords = entry?.stressedText?.trim().split(/\s+/).filter(w => w.length > 0);
    const customPhoneticForm = stressedWords?.[tagIndex];

    setSelectedEntryId(entryId);
    setSelectedTagIndex(tagIndex);
    setVariantsWord(word);
    setVariantsCustomPhonetic(customPhoneticForm || null);
    setIsVariantsPanelOpen(true);
  };

  const handleCloseVariants = () => {
    setIsVariantsPanelOpen(false);
    setVariantsWord(null);
    setVariantsCustomPhonetic(null);
    setSelectedEntryId(null);
    setSelectedTagIndex(null);
  };

  const handleUseVariant = async (variantText: string) => {
    if (selectedEntryId !== null && selectedTagIndex !== null && task) {
      // Find the entry to update
      const entryToUpdate = entries.find(e => e.id === selectedEntryId);
      if (!entryToUpdate) {
        console.error('Entry not found:', selectedEntryId);
        handleCloseVariants();
        return;
      }

      // Split the text into words for display and stressed text for synthesis
      const displayWords = entryToUpdate.text.trim().split(/\s+/).filter(word => word.length > 0);
      const stressedWords = (entryToUpdate.stressedText || entryToUpdate.text).trim().split(/\s+/).filter(word => word.length > 0);

      // Validate index
      if (selectedTagIndex < 0 || selectedTagIndex >= displayWords.length) {
        console.error('Invalid tag index:', selectedTagIndex, 'for words:', displayWords);
        handleCloseVariants();
        return;
      }

      // Keep the original word in displayWords, update only stressedWords with phonetic variant
      stressedWords[selectedTagIndex] = variantText;
      const newStressedText = stressedWords.join(' ');
      // Keep text unchanged (displays original words)
      const newText = entryToUpdate.text;

      // Update local state immediately
      setEntries(prev =>
        prev.map(entry => {
          if (entry.id === selectedEntryId) {
            return {
              ...entry,
              text: newText, // Keep original text for display
              stressedText: newStressedText, // Update with phonetic variant
              // Clear audio cache since stressed text changed
              audioUrl: null,
              audioBlob: null
            };
          }
          return entry;
        })
      );

      // Close panel immediately for better UX
      handleCloseVariants();

      // Persist to backend asynchronously
      try {
        if (user) {
          await DataService.getInstance().updateTaskEntry(user.id, task.id, selectedEntryId, {
            text: newText, // Keep original text
            stressedText: newStressedText // Save phonetic variant
          });
          console.log('Entry updated successfully:', selectedEntryId);
        }
      } catch (error) {
        console.error('Failed to update entry:', error);
        // Revert on error and show user feedback
        setEntries(prev =>
          prev.map(entry => {
            if (entry.id === selectedEntryId) {
              return entryToUpdate;
            }
            return entry;
          })
        );
        // TODO: Show error notification to user
        alert('Viga: variandi salvestamine ebaõnnestus');
      }
    } else {
      handleCloseVariants();
    }
  };

  // Handle opening the sentence phonetic panel
  const handleExplorePhonetic = async (entryId: string) => {
    const entry = entries.find(e => e.id === entryId);
    if (!entry || !entry.text.trim()) return;
    
    // Close the menu
    handleMenuClose();
    
    // Fetch phonetic text if not available
    if (!entry.stressedText) {
      try {
        const analyzeResponse = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: entry.text })
        });
        
        if (analyzeResponse.ok) {
          const { stressedText } = await analyzeResponse.json();
          if (stressedText) {
            // Update entry with phonetic text
            setEntries(prev =>
              prev.map(e => e.id === entryId ? { ...e, stressedText } : e)
            );
          }
        }
      } catch (error) {
        console.error('Failed to analyze entry:', error);
      }
    }
    
    // Open the panel
    setPhoneticPanelEntryId(entryId);
    setShowPhoneticPanel(true);
  };

  // Handle applying phonetic changes
  const handlePhoneticApply = async (newPhoneticText: string) => {
    if (!phoneticPanelEntryId || !task || !user) {
      handleClosePhoneticPanel();
      return;
    }

    // Strip markers to get the plain text for display
    const newPlainText = stripPhoneticMarkers(newPhoneticText) || '';

    // Update local state immediately
    setEntries(prev =>
      prev.map(entry => {
        if (entry.id === phoneticPanelEntryId) {
          return {
            ...entry,
            text: newPlainText,           // Update display text (without markers)
            stressedText: newPhoneticText, // Update phonetic text (with markers)
            audioUrl: null,  // Clear cache
            audioBlob: null
          };
        }
        return entry;
      })
    );
    
    // Close panel
    handleClosePhoneticPanel();
    
    // Persist to localStorage (via DataService - same pattern as handleUseVariant)
    try {
      await DataService.getInstance().updateTaskEntry(user.id, task.id, phoneticPanelEntryId, {
        text: newPlainText,           // Save plain text
        stressedText: newPhoneticText // Save phonetic text
      });
    } catch (error) {
      console.error('Failed to update entry:', error);
      alert('Viga: foneetilise kuju salvestamine ebaõnnestus');
    }
  };

  // Handle closing the panel
  const handleClosePhoneticPanel = () => {
    setShowPhoneticPanel(false);
    setPhoneticPanelEntryId(null);
  };

  if (isLoading) {
    return (
      <div className="task-detail-view">
        <div className="task-detail-hero">
          <div className="task-detail-hero-header">
            <button onClick={onBack} className="task-back-button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15,18 9,12 15,6"/>
              </svg>
              <span>Tagasi</span>
            </button>
          </div>
        </div>
        <div className="task-detail-loading">
          <div className="loading-spinner"></div>
          <p>Laen ülesannet...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="task-detail-view">
        <div className="task-detail-hero">
          <div className="task-detail-hero-header">
            <button onClick={onBack} className="task-back-button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15,18 9,12 15,6"/>
              </svg>
              <span>Tagasi</span>
            </button>
          </div>
        </div>
        <div className="task-detail-error">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return null;
  }

  return (
    <div className="task-detail-view">
      {/* Page header using universal layout system */}
      {entries.length > 0 && (
        <div className="page-header page-header--full">
          <div className="page-header__content">
            <h1 className="page-header__title">{task.name}</h1>
            {task.description && (
              <p className="page-header__description">{task.description}</p>
            )}
          </div>
          <div className="page-header__actions">
            <button onClick={handleShare} className="button button--secondary">
              <span>Jaga</span>
            </button>
            <button
              onClick={handlePlayAll}
              className={`button button--primary ${isLoadingPlayAll ? 'loading' : ''}`}
              disabled={entries.length === 0}
            >
              {isLoadingPlayAll ? (
                <div className="loader-spinner"></div>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {isPlayingAll ? (
                    <>
                      <rect x="7" y="6" width="3" height="12" fill="currentColor" rx="1" />
                      <rect x="14" y="6" width="3" height="12" fill="currentColor" rx="1" />
                    </>
                  ) : (
                    <path d="M8.31445 6.5C8.32533 6.49867 8.38306 6.49567 8.56055 6.56641C8.73719 6.63681 8.96582 6.75129 9.30957 6.9248L17.958 11.291C17.9608 11.2924 17.964 11.2936 17.9668 11.2949C18.343 11.4848 18.5952 11.6131 18.7715 11.7227C18.9298 11.8211 18.9662 11.8696 18.9707 11.876C19.0093 11.9553 19.0094 12.0447 18.9707 12.124C18.9655 12.1314 18.9276 12.1805 18.7705 12.2783C18.593 12.3887 18.3379 12.5182 17.958 12.71L9.30957 17.0752C8.96567 17.2488 8.73701 17.3634 8.56055 17.4336C8.38339 17.5041 8.32566 17.5014 8.31445 17.5C8.20475 17.4865 8.11413 17.431 8.05957 17.3584C8.0567 17.3539 8.0328 17.3114 8.01758 17.1543C8.00046 16.9776 8 16.7364 8 16.3662V7.63477C8 7.26444 8.00045 7.02263 8.01758 6.8457C8.03473 6.66887 8.06291 6.63716 8.05957 6.6416C8.11415 6.56897 8.20478 6.51347 8.31445 6.5Z" fill="currentColor" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                  )}
                </svg>
              )}
              {isLoadingPlayAll ? 'Laadimine' : isPlayingAll ? 'Peata' : 'Mängi kõik'}
            </button>
            <div className="task-detail__menu-container">
                <button
                  className="task-detail__menu-button"
                  aria-label="Rohkem valikuid"
                  onClick={() => setIsHeaderMenuOpen(!isHeaderMenuOpen)}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 12C17 12.5523 17.4477 13 18 13C18.5523 13 19 12.5523 19 12C19 11.4477 18.5523 11 18 11C17.4477 11 17 11.4477 17 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M11 12C11 12.5523 11.4477 13 12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5 12C5 12.5523 5.44772 13 6 13C6.55228 13 7 12.5523 7 12C7 11.4477 6.55228 11 6 11C5.44772 11 5 11.4477 5 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {isHeaderMenuOpen && (
                  <>
                    <div className="task-detail__menu-backdrop" onClick={() => setIsHeaderMenuOpen(false)} />
                    <div className="task-detail__dropdown-menu">
                      <button
                        className="task-detail__menu-item"
                        onClick={() => {
                          onEditTask(task.id);
                          setIsHeaderMenuOpen(false);
                        }}
                      >
                        <div className="task-detail__menu-item-content">Muuda</div>
                      </button>
                      <button
                        className="task-detail__menu-item task-detail__menu-item--danger"
                        onClick={() => {
                          onDeleteTask(task.id);
                          setIsHeaderMenuOpen(false);
                        }}
                      >
                        <div className="task-detail__menu-item-content">Kustuta</div>
                      </button>
                    </div>
                  </>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Entries section */}
      <div className="task-detail__entries">
        {entries.length === 0 ? (
          <div className="task-detail__entries-empty">
              <div className="task-detail__empty-image">
                <img src="/icons/avatar_task_empty.png" alt="Tühi ülesanne" />
              </div>
              <h4 className="task-detail__empty-title">
                {task?.name || '[Siin on ülesande pealkiri]'}
              </h4>
              <p className="task-detail__empty-description">
                {task?.description || '[Siin on ülesande lühikirjeldus]'}
              </p>
              <button
                onClick={() => onAddEntryFromInput('', '', '', new Blob())}
                className="task-detail__empty-cta"
              >
                Hakkan sisu looma
              </button>
            </div>
          ) : (
            <div className="task-detail__entries-list">
              {entries.map((entry) => (
                <SentenceSynthesisItem
                  key={entry.id}
                  id={entry.id}
                  text={entry.text}
                  tags={entry.text.trim().split(/\s+/).filter(word => word.length > 0)}
                  mode="tags"
                  draggable={true}
                  isDragging={draggedId === entry.id}
                  isDragOver={dragOverId === entry.id}
                  isPlaying={currentPlayingId === entry.id}
                  isLoading={currentLoadingId === entry.id}
                  onPlay={handlePlayEntry}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                    onTagClick={handleTagClick}
                    selectedTagIndex={selectedEntryId === entry.id ? selectedTagIndex : null}
                    isPronunciationPanelOpen={isVariantsPanelOpen}
                  openMenuId={openMenuId}
                  onMenuOpen={handleMenuOpen}
                  onMenuClose={handleMenuClose}
                  rowMenuItems={[
                    {
                      label: 'Uuri foneetilist kuju',
                      onClick: handleExplorePhonetic
                    },
                    {
                      label: 'Kustuta',
                      onClick: handleDeleteEntry,
                      danger: true
                    }
                  ]}
                />
              ))}
            </div>
          )}
      </div>

      <ShareTaskModal
        isOpen={isShareModalOpen}
        shareToken={task?.shareToken || ''}
        taskName={task?.name || ''}
        onClose={() => setIsShareModalOpen(false)}
      />

      <PronunciationVariants
        isOpen={isVariantsPanelOpen}
        word={variantsWord || ''}
        onClose={handleCloseVariants}
        onUseVariant={handleUseVariant}
        customPhoneticForm={variantsCustomPhonetic}
      />

      {/* Sentence Phonetic Panel */}
      {phoneticPanelEntryId && (
        <SentencePhoneticPanel
          sentenceText={entries.find(e => e.id === phoneticPanelEntryId)?.text || ''}
          phoneticText={entries.find(e => e.id === phoneticPanelEntryId)?.stressedText || null}
          isOpen={showPhoneticPanel}
          onClose={handleClosePhoneticPanel}
          onApply={handlePhoneticApply}
        />
      )}
    </div>
  );
}