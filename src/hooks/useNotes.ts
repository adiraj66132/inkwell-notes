import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage, isFirebaseConfigured } from '@/lib/firebase';
import { Note, NoteInput } from '@/types/note';
import { toast } from 'sonner';

// Local storage key for offline notes
const LOCAL_NOTES_KEY = 'vault_notes';

// Helper to get notes from local storage
const getLocalNotes = (): Note[] => {
  const stored = localStorage.getItem(LOCAL_NOTES_KEY);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    return parsed.map((note: any) => ({
      ...note,
      createdAt: new Date(note.createdAt),
      updatedAt: new Date(note.updatedAt),
    }));
  } catch {
    return [];
  }
};

// Helper to save notes to local storage
const saveLocalNotes = (notes: Note[]) => {
  localStorage.setItem(LOCAL_NOTES_KEY, JSON.stringify(notes));
};

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  // Load notes from Firebase or local storage
  useEffect(() => {
    if (isFirebaseConfigured && db) {
      const q = query(collection(db, 'notes'), orderBy('updatedAt', 'desc'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedNotes: Note[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title,
            content: data.content,
            imageUrl: data.imageUrl,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          };
        });
        setNotes(fetchedNotes);
        setLoading(false);
      }, (error) => {
        console.error('Error fetching notes:', error);
        toast.error('Failed to load notes');
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      // Use local storage if Firebase is not configured
      setNotes(getLocalNotes());
      setLoading(false);
    }
  }, []);

  const addNote = useCallback(async (input: NoteInput, imageFile?: File): Promise<Note | null> => {
    try {
      let imageUrl = input.imageUrl;

      // Upload image if provided
      if (imageFile && isFirebaseConfigured && storage) {
        const imageRef = ref(storage, `notes/${Date.now()}_${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      } else if (imageFile) {
        // Convert to base64 for local storage
        imageUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(imageFile);
        });
      }

      const now = new Date();
      const noteData = {
        title: input.title,
        content: input.content,
        imageUrl,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
      };

      if (isFirebaseConfigured && db) {
        const docRef = await addDoc(collection(db, 'notes'), noteData);
        const newNote: Note = {
          id: docRef.id,
          ...input,
          imageUrl,
          createdAt: now,
          updatedAt: now,
        };
        toast.success('Note created');
        return newNote;
      } else {
        // Save to local storage
        const newNote: Note = {
          id: `local_${Date.now()}`,
          ...input,
          imageUrl,
          createdAt: now,
          updatedAt: now,
        };
        const updatedNotes = [newNote, ...notes];
        saveLocalNotes(updatedNotes);
        setNotes(updatedNotes);
        toast.success('Note saved locally');
        return newNote;
      }
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to create note');
      return null;
    }
  }, [notes]);

  const updateNote = useCallback(async (id: string, input: Partial<NoteInput>, imageFile?: File): Promise<boolean> => {
    try {
      let imageUrl = input.imageUrl;

      if (imageFile && isFirebaseConfigured && storage) {
        const imageRef = ref(storage, `notes/${Date.now()}_${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      } else if (imageFile) {
        imageUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(imageFile);
        });
      }

      const updateData = {
        ...input,
        ...(imageUrl && { imageUrl }),
        updatedAt: Timestamp.fromDate(new Date()),
      };

      if (isFirebaseConfigured && db) {
        await updateDoc(doc(db, 'notes', id), updateData);
        toast.success('Note updated');
      } else {
        const updatedNotes = notes.map((note) =>
          note.id === id
            ? { ...note, ...input, imageUrl: imageUrl || note.imageUrl, updatedAt: new Date() }
            : note
        );
        saveLocalNotes(updatedNotes);
        setNotes(updatedNotes);
        toast.success('Note updated locally');
      }
      return true;
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
      return false;
    }
  }, [notes]);

  const deleteNote = useCallback(async (id: string, imageUrl?: string): Promise<boolean> => {
    try {
      // Delete image from storage if it exists and is a Firebase URL
      if (imageUrl && isFirebaseConfigured && storage && imageUrl.includes('firebase')) {
        try {
          const imageRef = ref(storage, imageUrl);
          await deleteObject(imageRef);
        } catch {
          // Image might not exist, continue with note deletion
        }
      }

      if (isFirebaseConfigured && db) {
        await deleteDoc(doc(db, 'notes', id));
        toast.success('Note deleted');
      } else {
        const updatedNotes = notes.filter((note) => note.id !== id);
        saveLocalNotes(updatedNotes);
        setNotes(updatedNotes);
        toast.success('Note deleted locally');
      }
      return true;
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
      return false;
    }
  }, [notes]);

  return {
    notes,
    loading,
    addNote,
    updateNote,
    deleteNote,
    isFirebaseConfigured,
  };
}
