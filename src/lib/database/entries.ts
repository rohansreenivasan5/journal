import { createClient } from '@/lib/supabase/client'
import { JournalEntry } from '@/lib/types'

export async function getEntries(): Promise<JournalEntry[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching entries:', error)
    throw error
  }

  // Transform database format to our JournalEntry type
  return (data || []).map((entry) => ({
    id: entry.id,
    content: entry.content,
    createdAt: new Date(entry.created_at),
    updatedAt: entry.updated_at ? new Date(entry.updated_at) : undefined,
  }))
}

export async function createEntry(content: string): Promise<JournalEntry> {
  const supabase = createClient()
  
  // Get the current user's ID from the session
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    console.error('Error getting user:', authError)
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('journal_entries')
    .insert({ content, user_id: user.id })
    .select()
    .single()

  if (error) {
    console.error('Error creating entry:', error)
    throw error
  }

  return {
    id: data.id,
    content: data.content,
    createdAt: new Date(data.created_at),
    updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
  }
}

export async function updateEntry(id: string, content: string): Promise<JournalEntry> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('journal_entries')
    .update({ content })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating entry:', error)
    throw error
  }

  return {
    id: data.id,
    content: data.content,
    createdAt: new Date(data.created_at),
    updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
  }
}

export async function deleteEntry(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting entry:', error)
    throw error
  }
}

