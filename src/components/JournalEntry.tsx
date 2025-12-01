'use client';

import { JournalEntry as JournalEntryType } from '@/lib/types';

interface JournalEntryProps {
  entry: JournalEntryType;
  onEdit: (entry: JournalEntryType) => void;
  onDelete: (id: string) => void;
}

export default function JournalEntry({ entry, onEdit, onDelete }: JournalEntryProps) {
  const formatDate = (date: Date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const entryDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (entryDate.getTime() === today.getTime()) {
      return 'Today';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (entryDate.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    }
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
  };

  const handleClick = (e: React.MouseEvent) => {
    // Don't trigger edit if clicking the delete button
    if ((e.target as HTMLElement).closest('.delete-button')) {
      return;
    }
    onEdit(entry);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this entry?')) {
      onDelete(entry.id);
    }
  };

  return (
    <div 
      className="group border-b border-gray-100 dark:border-gray-800 py-5 px-1 transition-all duration-200 hover:bg-gray-50/50 dark:hover:bg-gray-900/50 cursor-pointer relative"
      onClick={handleClick}
    >
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-gray-900 dark:text-gray-100 text-[15px] leading-relaxed whitespace-pre-wrap break-words">
            {truncateText(entry.content)}
          </p>
        </div>
        <button
          onClick={handleDelete}
          className="delete-button opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
          aria-label="Delete entry"
          title="Delete entry"
        >
          <svg 
            className="w-4 h-4 text-red-500 dark:text-red-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-3">
        <span>{formatDate(entry.createdAt)}</span>
        <span>•</span>
        <span>{formatTime(entry.createdAt)}</span>
        {entry.updatedAt && (
          <>
            <span>•</span>
            <span className="text-gray-400 dark:text-gray-500">edited</span>
          </>
        )}
      </div>
    </div>
  );
}

