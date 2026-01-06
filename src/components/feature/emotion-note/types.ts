export interface PatternDetail {
  id: string;
  automaticThought: string;
  emotion: string;
  createdAt: string;
}

export interface PatternAlternative {
  id: string;
  noteId: string;
  alternative: string;
  createdAt: string;
}

export interface Pattern {
  id: string;
  title: string;
  trigger: string;
  behavior: string;
  timestamp: string;
  frequency: number;
  details: PatternDetail[];
  alternatives: PatternAlternative[];
}
