import { BookOpen, Plus, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

interface HeaderProps {
  onCreateNote: () => void;
  notesCount: number;
}

export function Header({ onCreateNote, notesCount }: HeaderProps) {
  const { signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Note Vault</h1>
              <p className="text-xs text-muted-foreground">
                {notesCount} {notesCount === 1 ? 'note' : 'notes'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="glow" onClick={onCreateNote} className="shrink-0">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Note</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={signOut} title="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
