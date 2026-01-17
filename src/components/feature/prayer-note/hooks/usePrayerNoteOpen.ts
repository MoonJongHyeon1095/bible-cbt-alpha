import { useMemo, useRef, useState } from "react";
import { useAutoCloseOnScroll } from "../../common/utils/useAutoCloseOnScroll";
import type { PrayerNote } from "../types/types";

type UsePrayerNoteOpenOptions = {
  notes: PrayerNote[];
  isCreating: boolean;
};

export function usePrayerNoteOpen({
  notes,
  isCreating,
}: UsePrayerNoteOpenOptions) {
  const [openNoteId, setOpenNoteId] = useState<string | null>(null);
  const openNoteRef = useRef<HTMLDivElement | null>(null);

  const selectedNote = useMemo(() => {
    return openNoteId
      ? notes.find((note) => note.id === openNoteId) ?? null
      : null;
  }, [notes, openNoteId]);

  const showSelectedActions = Boolean(selectedNote) && !isCreating;

  useAutoCloseOnScroll({
    isOpen: Boolean(openNoteId),
    targetRef: openNoteRef,
    onClose: () => setOpenNoteId(null),
  });

  const toggleOpen = (noteId: string) => {
    setOpenNoteId((prev) => (prev === noteId ? null : noteId));
  };

  return {
    openNoteId,
    setOpenNoteId,
    openNoteRef,
    selectedNote,
    showSelectedActions,
    toggleOpen,
  };
}
