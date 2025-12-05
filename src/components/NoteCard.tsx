import { Note } from '@/types/note';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Image, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface NoteCardProps {
  note: Note;
  onView: (note: Note) => void;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
  onImageClick?: (imageUrl: string) => void;
}

export function NoteCard({ note, onView, onEdit, onDelete, onImageClick }: NoteCardProps) {
  const hasImage = Boolean(note.imageUrl);

  return (
    <Card 
      className={cn(
        "group card-gradient border-border/50 hover:border-primary/30 transition-all duration-300",
        "hover:shadow-glow animate-scale-in cursor-pointer overflow-hidden"
      )}
      onClick={() => onView(note)}
    >
      {hasImage && note.imageUrl && (
        <div 
          className="relative aspect-video overflow-hidden bg-muted/30"
          onClick={(e) => {
            e.stopPropagation();
            onImageClick?.(note.imageUrl!);
          }}
        >
          <img
            src={note.imageUrl}
            alt={note.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {hasImage ? (
              <Image className="h-4 w-4 text-primary shrink-0" />
            ) : (
              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
            <h3 className="font-semibold text-foreground truncate">
              {note.title || 'Untitled'}
            </h3>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(note);
              }}
              className="h-7 w-7"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(note);
              }}
              className="h-7 w-7 hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {note.content && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
            {note.content}
          </p>
        )}
        <p className="text-xs text-muted-foreground/60">
          {format(note.updatedAt, 'MMM d, yyyy • h:mm a')}
        </p>
      </CardContent>
    </Card>
  );
}
