'use client';

import { useState, useEffect, useRef } from 'react';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';

interface JournalEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: string, entryId?: string) => void;
  initialContent?: string;
  entryId?: string;
}

export default function JournalEditor({ 
  isOpen, 
  onClose, 
  onSave, 
  initialContent = '',
  entryId
}: JournalEditorProps) {
  const [content, setContent] = useState(initialContent);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Voice recorder hook
  const {
    isRecording,
    isProcessing,
    error: voiceError,
    startRecording,
    stopRecording,
  } = useVoiceRecorder({
    onTranscription: (text) => {
      // Append transcribed text to current content
      setContent(prev => prev + text);
    },
    segmentDuration: 5000, // 5 seconds - creates complete valid audio files
  });

  const handleToggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  useEffect(() => {
    if (isOpen) {
      setContent(initialContent);
      // Focus textarea after animation
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isOpen, initialContent]);

  const handleSave = () => {
    if (content.trim()) {
      onSave(content.trim(), entryId);
      setContent('');
      onClose();
    }
  };

  const handleCancel = () => {
    // Stop recording if active
    if (isRecording) {
      stopRecording();
    }
    setContent('');
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      handleCancel();
    }
    // Cmd/Ctrl + Enter to save
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleCancel}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 opacity-100"
        aria-hidden="true"
      />
      
      {/* Editor Container */}
      <div 
        className="relative w-full h-full bg-white dark:bg-gray-950 flex flex-col shadow-2xl transform transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {entryId ? 'Edit Entry' : 'New Entry'}
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!content.trim()}
              className="px-4 py-2 text-sm font-medium bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Save
            </button>
          </div>
        </div>

        {/* Textarea */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write your thoughts..."
            className="flex-1 w-full px-6 py-6 text-base leading-relaxed text-gray-900 dark:text-gray-100 bg-transparent border-none resize-none focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
            style={{ fontFamily: 'var(--font-geist-sans)' }}
          />
          
          {/* Mic Button */}
          <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
            {voiceError && (
              <div className="px-3 py-1.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md max-w-xs">
                {voiceError}
              </div>
            )}
            <button
              onClick={handleToggleRecording}
              disabled={isProcessing}
              className={`
                relative w-12 h-12 rounded-full flex items-center justify-center
                transition-all duration-200 shadow-lg
                ${isRecording 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                  : 'bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700'
                }
                ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              title={isRecording ? 'Stop recording' : 'Start voice recording'}
              aria-label={isRecording ? 'Stop recording' : 'Start voice recording'}
            >
              {isProcessing ? (
                <svg className="w-6 h-6 text-gray-600 dark:text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg 
                  className={`w-6 h-6 ${isRecording ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" 
                  />
                </svg>
              )}
              {isRecording && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full animate-ping"></span>
              )}
            </button>
          </div>
        </div>

        {/* Footer hint */}
        <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {isRecording ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                Recording... Click mic to stop
              </span>
            ) : (
              <>
                Press <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">Esc</kbd> to cancel • 
                <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs ml-1">⌘</kbd> + 
                <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">Enter</kbd> to save
                {!isRecording && (
                  <span className="ml-2">• Click <span className="inline-flex items-center"><svg className="w-3 h-3 mx-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg></span> to record</span>
                )}
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

