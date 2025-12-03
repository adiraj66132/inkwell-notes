import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onCreateNote: () => void;
}

export function EmptyState({ onCreateNote }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-fade-in">
      <div className="p-6 rounded-full bg-secondary/50 mb-6">
        <FileText className="h-12 w-12 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold text-foreground mb-2">No notes yet</h2>
      <p className="text-muted-foreground text-center max-w-sm mb-6">
        Start capturing your thoughts, ideas, or photos of handwritten notes.
      </p>
      <Button variant="glow" size="lg" onClick={onCreateNote}>
        <Plus className="h-5 w-5" />
        Create your first note
      </Button>
    </div>
  );
}
