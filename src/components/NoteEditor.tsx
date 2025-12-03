import { useState, useRef, useEffect } from 'react';
import { Note, NoteInput } from '@/types/note';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X, Upload, Image, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NoteEditorProps {
  note?: Note | null;
  open: boolean;
  onClose: () => void;
  onSave: (input: NoteInput, imageFile?: File) => Promise<void>;
  isLoading?: boolean;
}

export function NoteEditor({ note, open, onClose, onSave, isLoading }: NoteEditorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setImagePreview(note.imageUrl || null);
    } else {
      setTitle('');
      setContent('');
      setImagePreview(null);
    }
    setImageFile(null);
  }, [note, open]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(
      { 
        title, 
        content, 
        imageUrl: imageFile ? undefined : imagePreview || undefined 
      }, 
      imageFile || undefined
    );
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-lg card-gradient border-border/50 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {note ? 'Edit Note' : 'New Note'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Note title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-medium border-0 bg-transparent px-0 focus-visible:ring-0 placeholder:text-muted-foreground/50"
              autoFocus
            />
          </div>

          <div>
            <Textarea
              placeholder="Write your note here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[150px] resize-none border-border/50 bg-secondary/30 placeholder:text-muted-foreground/50"
            />
          </div>

          {/* Image upload area */}
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

            {imagePreview ? (
              <div className="relative rounded-lg overflow-hidden border border-border/50">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full max-h-64 object-cover"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="icon-sm"
                  className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm"
                  onClick={handleRemoveImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "w-full py-8 border-2 border-dashed border-border/50 rounded-lg",
                  "flex flex-col items-center gap-2 text-muted-foreground",
                  "hover:border-primary/50 hover:text-foreground transition-colors"
                )}
              >
                <div className="p-3 rounded-full bg-secondary/50">
                  <Image className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium">Add photo of your note</span>
                <span className="text-xs text-muted-foreground/60">Click or drag to upload</span>
              </button>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="glow"
              className="flex-1"
              disabled={isLoading || (!title.trim() && !content.trim() && !imagePreview)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Note'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
