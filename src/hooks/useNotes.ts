import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Note, NoteInput } from '@/types/note';
import { toast } from 'sonner';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load notes from database
  useEffect(() => {
    if (!user) {
      setNotes([]);
      setLoading(false);
      return;
    }

    const fetchNotes = async () => {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching notes:', error);
        toast.error('Failed to load notes');
      } else {
        setNotes(
          data.map((note) => ({
            id: note.id,
            title: note.title,
            content: note.content || '',
            imageUrl: note.image_url || undefined,
            createdAt: new Date(note.created_at),
            updatedAt: new Date(note.updated_at),
          }))
        );
      }
      setLoading(false);
    };

    fetchNotes();

    // Subscribe to changes
    const channel = supabase
      .channel('notes-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notes', filter: `user_id=eq.${user.id}` },
        () => {
          fetchNotes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!user) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from('note-images')
      .upload(fileName, file);

    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }

    const { data } = supabase.storage.from('note-images').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const addNote = useCallback(
    async (input: NoteInput, imageFile?: File): Promise<Note | null> => {
      if (!user) return null;

      try {
        let imageUrl = input.imageUrl;

        if (imageFile) {
          imageUrl = (await uploadImage(imageFile)) || undefined;
        }

        const { data, error } = await supabase
          .from('notes')
          .insert({
            user_id: user.id,
            title: input.title,
            content: input.content,
            image_url: imageUrl,
          })
          .select()
          .single();

        if (error) throw error;

        toast.success('Note created');
        return {
          id: data.id,
          title: data.title,
          content: data.content || '',
          imageUrl: data.image_url || undefined,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
        };
      } catch (error) {
        console.error('Error adding note:', error);
        toast.error('Failed to create note');
        return null;
      }
    },
    [user]
  );

  const updateNote = useCallback(
    async (id: string, input: Partial<NoteInput>, imageFile?: File): Promise<boolean> => {
      if (!user) return false;

      try {
        let imageUrl = input.imageUrl;

        if (imageFile) {
          imageUrl = (await uploadImage(imageFile)) || undefined;
        }

        const { error } = await supabase
          .from('notes')
          .update({
            title: input.title,
            content: input.content,
            ...(imageUrl !== undefined && { image_url: imageUrl }),
          })
          .eq('id', id);

        if (error) throw error;

        toast.success('Note updated');
        return true;
      } catch (error) {
        console.error('Error updating note:', error);
        toast.error('Failed to update note');
        return false;
      }
    },
    [user]
  );

  const deleteNote = useCallback(
    async (id: string): Promise<boolean> => {
      if (!user) return false;

      try {
        const { error } = await supabase.from('notes').delete().eq('id', id);

        if (error) throw error;

        toast.success('Note deleted');
        return true;
      } catch (error) {
        console.error('Error deleting note:', error);
        toast.error('Failed to delete note');
        return false;
      }
    },
    [user]
  );

  return {
    notes,
    loading,
    addNote,
    updateNote,
    deleteNote,
  };
}
