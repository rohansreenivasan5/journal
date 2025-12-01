import { JournalEntry } from './types';

const STORAGE_KEY = 'journal-entries';

export function saveEntries(entries: JournalEntry[]): void {
  try {
    const serialized = entries.map(entry => ({
      ...entry,
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt?.toISOString(),
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
  } catch (error) {
    console.error('Failed to save entries:', error);
  }
}

export function loadEntries(): JournalEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored) as Array<{
      id: string;
      content: string;
      createdAt: string;
      updatedAt?: string;
    }>;
    return parsed.map((entry) => ({
      id: entry.id,
      content: entry.content,
      createdAt: new Date(entry.createdAt),
      updatedAt: entry.updatedAt ? new Date(entry.updatedAt) : undefined,
    }));
  } catch (error) {
    console.error('Failed to load entries:', error);
    return [];
  }
}

