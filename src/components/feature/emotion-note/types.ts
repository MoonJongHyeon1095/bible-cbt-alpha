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

export interface PatternBehaviorDetail {
  id: string;
  noteId: string;
  behaviorLabel: string;
  behaviorDescription: string;
  errorTags?: string[];
  createdAt: string;
}

export interface PatternErrorDetail {
  id: string;
  noteId: string;
  errorLabel: string;
  errorDescription: string;
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
  behaviorDetails?: PatternBehaviorDetail[];
  errorDetails?: PatternErrorDetail[];
}
