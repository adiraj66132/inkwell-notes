export interface Note {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type NoteInput = Omit<Note, 'id' | 'createdAt' | 'updatedAt'>;
