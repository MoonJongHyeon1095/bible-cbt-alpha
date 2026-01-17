import type { CSSProperties } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import type { ChapterPreviewState } from "./types/prayerNotes.types";

interface PrayerChapterPreviewSectionProps {
  chapterPreview: ChapterPreviewState | null;
  chapterPreviewLoading: boolean;
  chapterPreviewError: string | null;
  onClose: () => void;
  scriptureFont: CSSProperties;
}

export function PrayerChapterPreviewSection({
  chapterPreview,
  chapterPreviewLoading,
  chapterPreviewError,
  onClose,
  scriptureFont,
}: PrayerChapterPreviewSectionProps) {
  return (
    <Dialog
      open={Boolean(chapterPreview)}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {chapterPreview
              ? `${chapterPreview.book} ${chapterPreview.chapter}장`
              : "말씀"}
          </DialogTitle>
        </DialogHeader>
        {chapterPreviewLoading && (
          <p className="text-sm text-slate-500">말씀을 불러오고 있습니다...</p>
        )}
        {chapterPreviewError && (
          <p className="text-sm text-rose-600">{chapterPreviewError}</p>
        )}
        {!chapterPreviewLoading && !chapterPreviewError && chapterPreview && (
          <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-2">
            {chapterPreview.verses.map((verseEntry) => {
              const start = chapterPreview.startVerse;
              const end = chapterPreview.endVerse ?? chapterPreview.startVerse;
              const isHighlighted =
                start !== null &&
                end !== null &&
                verseEntry.verse >= start &&
                verseEntry.verse <= end;
              return (
                <div
                  key={`${chapterPreview.noteId}-${verseEntry.verse}`}
                  className={`flex items-baseline gap-3 rounded-lg px-3 py-2 ${
                    isHighlighted
                      ? "bg-amber-100/70 text-amber-900"
                      : "bg-slate-50 text-slate-700"
                  }`}
                >
                  <span className="text-xs font-semibold text-slate-500 tabular-nums">
                    {verseEntry.verse}
                  </span>
                  <p className="text-sm leading-relaxed" style={scriptureFont}>
                    {verseEntry.text}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
