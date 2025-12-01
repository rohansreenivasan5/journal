'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { JournalEntry } from '@/lib/types';
import { getEntries, createEntry, updateEntry, deleteEntry } from '@/lib/database/entries';
import { useAuth } from '@/hooks/useAuth';
import JournalEntryComponent from '@/components/JournalEntry';
import JournalEditor from '@/components/JournalEditor';
import UserMenu from '@/components/UserMenu';

const MAX_RECENT_ENTRIES = 10;

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | undefined>(undefined);
  const [editingContent, setEditingContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  // Load entries from Supabase when user is authenticated
  useEffect(() => {
    if (user && !authLoading) {
      loadEntriesFromDB();
    }
  }, [user, authLoading]);

  const loadEntriesFromDB = async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedEntries = await getEntries();
      setEntries(loadedEntries);
    } catch (err) {
      console.error('Error loading entries:', err);
      setError(err instanceof Error ? err.message : 'Failed to load entries');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEntry = async (content: string, entryId?: string) => {
    try {
      setError(null);
      if (entryId) {
        // Update existing entry
        const updatedEntry = await updateEntry(entryId, content);
        setEntries(prev => prev.map(entry => 
          entry.id === entryId ? updatedEntry : entry
        ));
      } else {
        // Create new entry
        const newEntry = await createEntry(content);
        setEntries(prev => [newEntry, ...prev]);
      }
      setEditingEntryId(undefined);
      setEditingContent('');
    } catch (err) {
      console.error('Error saving entry:', err);
      setError(err instanceof Error ? err.message : 'Failed to save entry');
    }
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntryId(entry.id);
    setEditingContent(entry.content);
    setIsEditorOpen(true);
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      setError(null);
      await deleteEntry(id);
      setEntries(prev => prev.filter(entry => entry.id !== id));
    } catch (err) {
      console.error('Error deleting entry:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete entry');
    }
  };

  const handleNewEntry = () => {
    setEditingEntryId(undefined);
    setEditingContent('');
    setIsEditorOpen(true);
  };

  // Show loading state while checking auth
  if (authLoading || !user) {
    return (
      <main className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </main>
    );
  }

  const recentEntries = entries.slice(0, MAX_RECENT_ENTRIES);

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Journal
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              A minimal journaling experience
            </p>
          </div>
          <UserMenu userEmail={user?.email} />
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* New Entry Button */}
        <button
          onClick={handleNewEntry}
          className="w-full mb-8 px-4 py-3 text-left border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors duration-200 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
              <svg 
                className="w-4 h-4 text-gray-600 dark:text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
              Write a new entry...
            </span>
          </div>
        </button>

        {/* Entries List */}
        <div className="space-y-0">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-400 dark:text-gray-500 text-sm">Loading entries...</p>
            </div>
          ) : recentEntries.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 dark:text-gray-500 text-sm mb-2">
                No entries yet
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-xs">
                Start by writing your first entry
              </p>
            </div>
          ) : (
            recentEntries.map((entry) => (
              <JournalEntryComponent 
                key={entry.id} 
                entry={entry}
                onEdit={handleEditEntry}
                onDelete={handleDeleteEntry}
              />
            ))
          )}
        </div>

        {/* Show more indicator if there are more entries */}
        {entries.length > MAX_RECENT_ENTRIES && (
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Showing {MAX_RECENT_ENTRIES} most recent entries
            </p>
          </div>
        )}
      </div>

      {/* Full-screen Editor */}
      <JournalEditor
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingEntryId(undefined);
          setEditingContent('');
        }}
        onSave={handleSaveEntry}
        entryId={editingEntryId}
        initialContent={editingContent}
      />
    </main>
  );
}
