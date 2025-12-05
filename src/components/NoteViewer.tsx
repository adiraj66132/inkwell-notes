import { Note } from '@/types/note';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Pencil, X } from 'lucide-react';
import { format } from 'date-fns';

interface NoteViewerProps {
  note: Note | null;
  open: boolean;
  onClose: () => void;
  onEdit: (note: Note) => void;
  onImageClick?: (imageUrl: string) => void;
}

export function NoteViewer({ note, open, onClose, onEdit, onImageClick }: NoteViewerProps) {
  if (!note) return null;

  const handleEdit = () => {
    onClose();
    onEdit(note);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b border-border/50">
          <div className="flex items-center justify-between gap-4">
            <DialogTitle className="text-xl font-semibold truncate pr-4">
              {note.title || 'Untitled'}
            </DialogTitle>
            <div className="flex gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                className="gap-2"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Last updated: {format(note.updatedAt, 'MMM d, yyyy • h:mm a')}
          </p>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
          <div className="p-6 space-y-4">
            {note.imageUrl && (
              <div 
                className="relative rounded-lg overflow-hidden cursor-pointer group"
                onClick={() => onImageClick?.(note.imageUrl!)}
              >
                <img
                  src={note.imageUrl}
                  alt={note.title}
                  className="w-full h-auto max-h-80 object-contain bg-muted/30 transition-transform duration-300 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>
            )}

            {note.content && (
              <div className="prose prose-sm prose-invert max-w-none">
                <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                  {note.content}
                </p>
              </div>
            )}

            {!note.content && !note.imageUrl && (
              <p className="text-muted-foreground italic">This note is empty.</p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
