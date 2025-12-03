import { useState, useMemo } from 'react';
import { useNotes } from '@/hooks/useNotes';
import { Note, NoteInput } from '@/types/note';
import { Header } from '@/components/Header';
import { SearchBar } from '@/components/SearchBar';
import { NoteCard } from '@/components/NoteCard';
import { NoteEditor } from '@/components/NoteEditor';
import { ImageViewer } from '@/components/ImageViewer';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { EmptyState } from '@/components/EmptyState';
import { FirebaseSetupBanner } from '@/components/FirebaseSetupBanner';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { notes, loading, addNote, updateNote, deleteNote, isFirebaseConfigured } = useNotes();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [deletingNote, setDeletingNote] = useState<Note | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Filter notes based on search query
  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    
    const query = searchQuery.toLowerCase();
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query)
    );
  }, [notes, searchQuery]);

  const handleCreateNote = () => {
    setEditingNote(null);
    setEditorOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setEditorOpen(true);
  };

  const handleSaveNote = async (input: NoteInput, imageFile?: File) => {
    setIsSaving(true);
    try {
      if (editingNote) {
        await updateNote(editingNote.id, input, imageFile);
      } else {
        await addNote(input, imageFile);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNote = (note: Note) => {
    setDeletingNote(note);
  };

  const handleConfirmDelete = async () => {
    if (deletingNote) {
      await deleteNote(deletingNote.id, deletingNote.imageUrl);
      setDeletingNote(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen surface-gradient flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen surface-gradient">
      <Header onCreateNote={handleCreateNote} notesCount={notes.length} />
      
      <main className="container mx-auto px-4 py-6">
        {!isFirebaseConfigured && <FirebaseSetupBanner />}
        
        {notes.length > 0 ? (
          <>
            <div className="mb-6">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>

            {filteredNotes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={handleEditNote}
                    onDelete={handleDeleteNote}
                    onImageClick={setViewingImage}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No notes match your search.</p>
              </div>
            )}
          </>
        ) : (
          <EmptyState onCreateNote={handleCreateNote} />
        )}
      </main>

      <NoteEditor
        note={editingNote}
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSave={handleSaveNote}
        isLoading={isSaving}
      />

      <ImageViewer
        imageUrl={viewingImage}
        open={Boolean(viewingImage)}
        onClose={() => setViewingImage(null)}
      />

      <DeleteConfirmDialog
        note={deletingNote}
        open={Boolean(deletingNote)}
        onClose={() => setDeletingNote(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default Index;
