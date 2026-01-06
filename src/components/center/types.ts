export interface EmotionData {
  id: string;
  label: string;
  description: string;
  physical: string;
  color: string;
  positive: string[];
  caution: string[];
}

export type EmotionNoteDetail = {
  id: string;
  noteId: string;
  automaticThought: string;
  emotion: string;
  alternative: string;
  createdAt: string;
};

export type EmotionNote = {
  id: string;
  title: string;
  trigger: string;
  createdAt: string;
  behavior?: string;
  frequency?: number;
  timestamp?: string;
  details?: EmotionNoteDetail[];
};

export type EmotionNoteDetailWithNote = EmotionNoteDetail & {
  noteTitle: string;
  noteTrigger: string;
};
