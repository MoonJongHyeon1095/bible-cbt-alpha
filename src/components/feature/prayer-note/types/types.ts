import type { User } from "@supabase/supabase-js";

export interface PrayerNote {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  tags: string[];
  responses: PrayerNoteResponse[];
}

export interface PrayerNoteResponse {
  id: string;
  content: string;
  timestamp: string;
}

export interface PrayerNotesPageProps {
  user: User | null;
}
