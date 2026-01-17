import {
  ChevronDown,
  ChevronRight,
  HandHeart,
  Search,
  Trash2,
} from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { getBibleBookByKorean } from "../../../constants/bibleBooks";
import { formatScriptureReference } from "../../../utils/scripture";
import { PrayerNoteResponseSection } from "./PrayerNoteResponseSection";
import type { PrayerNote, PrayerNoteResponse } from "./types/prayerNotes.types";
import { fetchBibleVersesRange } from "./utils/api";

interface PrayerNoteCardProps {
  note: PrayerNote;
  isOpen: boolean;
  onToggleOpen: () => void;
  containerRef?: React.Ref<HTMLDivElement>;
  scriptureFont: CSSProperties;
  chapterPreviewLoading: boolean;
  chapterPreviewNoteId: string | null;
  onOpenChapterPreview: (note: PrayerNote) => void;
  onDeleteNote: (noteId: string) => void;
  editingResponseNoteId: string | null;
  editingResponseId: string | null;
  editingResponseContent: string;
  onChangeEditingResponseContent: (value: string) => void;
  onStartEditResponse: (noteId: string, response: PrayerNoteResponse) => void;
  onCancelEditResponse: () => void;
  onUpdateResponse: (noteId: string, responseId: string) => void;
  onDeleteResponse: (noteId: string, responseId: string) => void;
  expandedResponses: Record<string, boolean>;
  onToggleExpanded: (key: string) => void;
  responseDraft: string;
  onChangeResponseDraft: (value: string) => void;
  onCreateResponse: (noteId: string) => void;
  formatResponseTitle: (content: string) => string;
  formatDate: (timestamp: string) => string;
}

export function PrayerNoteCard({
  note,
  isOpen,
  onToggleOpen,
  containerRef,
  scriptureFont,
  chapterPreviewLoading,
  chapterPreviewNoteId,
  onOpenChapterPreview,
  onDeleteNote,
  editingResponseNoteId,
  editingResponseId,
  editingResponseContent,
  onChangeEditingResponseContent,
  onStartEditResponse,
  onCancelEditResponse,
  onUpdateResponse,
  onDeleteResponse,
  expandedResponses,
  onToggleExpanded,
  responseDraft,
  onChangeResponseDraft,
  onCreateResponse,
  formatResponseTitle,
  formatDate,
}: PrayerNoteCardProps) {
  const responses = [...note.responses].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  const [verseLines, setVerseLines] = useState<string[]>([]);
  const [verseLoading, setVerseLoading] = useState(false);
  const [verseError, setVerseError] = useState<string | null>(null);
  const lastFetchKey = useRef<string | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (!note.book || !note.chapter || !note.startVerse) {
      setVerseLines([]);
      setVerseError("말씀 정보를 확인할 수 없습니다.");
      return;
    }

    const endVerse = note.endVerse ?? note.startVerse;
    const fetchKey = `${note.id}-${note.book}-${note.chapter}-${note.startVerse}-${endVerse}`;
    if (lastFetchKey.current === fetchKey) return;
    lastFetchKey.current = fetchKey;

    const bookMeta = getBibleBookByKorean(note.book);
    if (!bookMeta) {
      setVerseLines([]);
      setVerseError("말씀 정보를 확인할 수 없습니다.");
      return;
    }

    setVerseLoading(true);
    setVerseError(null);
    fetchBibleVersesRange({
      englishBook: bookMeta.english,
      chapter: note.chapter,
      startVerse: note.startVerse,
      endVerse,
    })
      .then((lines) => {
        if (!lines.length) {
          setVerseError("말씀을 불러오지 못했습니다.");
          setVerseLines([]);
          return;
        }
        setVerseLines(lines);
      })
      .catch(() => {
        setVerseError("말씀을 불러오지 못했습니다.");
        setVerseLines([]);
      })
      .finally(() => {
        setVerseLoading(false);
      });
  }, [
    isOpen,
    note.id,
    note.book,
    note.chapter,
    note.startVerse,
    note.endVerse,
  ]);

  useEffect(() => {
    if (!isOpen || !headerRef.current) return;
    const rect = headerRef.current.getBoundingClientRect();
    const offset = 120;
    const targetTop = window.scrollY + rect.top - offset;
    window.scrollTo({ top: targetTop, behavior: "smooth" });
  }, [isOpen]);

  return (
    <div ref={containerRef}>
      <div className="w-full">
        <div
          ref={headerRef}
          className="flex items-start justify-between gap-3 mb-6"
        >
          <div className="min-w-0 flex-1">
            <div className="text-xs uppercase tracking-[0.2em] text-emerald-600/70 mb-2">
              {formatDate(note.timestamp)}
            </div>
            <button
              type="button"
              onClick={onToggleOpen}
              className="flex min-w-0 items-center gap-2 text-left"
              title={isOpen ? "기도 노트 접기" : "기도 노트 펼치기"}
            >
              {isOpen ? (
                <ChevronDown className="size-4 text-slate-400" />
              ) : (
                <ChevronRight className="size-4 text-slate-400" />
              )}
              <h3 className="text-[1.35rem] sm:text-2xl text-emerald-950 leading-tight truncate font-medium tracking-tight">
                {note.title?.trim() || "기도 노트"}
              </h3>
            </button>
          </div>
          <div className="flex shrink-0 gap-1 pt-6 sm:pt-7">
            <button
              onClick={() => onDeleteNote(note.id)}
              className="text-red-600 hover:text-red-700 p-1"
              title="삭제"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>

        {isOpen && (
          <>
            <div className="mb-6 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-600/70">
                  Reference
                </p>
                <p
                  className="text-base text-emerald-900 font-semibold"
                  style={scriptureFont}
                >
                  {formatScriptureReference(
                    note.book,
                    note.chapter,
                    note.startVerse,
                    note.endVerse
                  )}
                </p>
                <button
                  onClick={() => onOpenChapterPreview(note)}
                  className="text-slate-500 hover:text-emerald-700 p-1 disabled:opacity-50"
                  title="장 보기"
                  disabled={
                    chapterPreviewLoading && chapterPreviewNoteId === note.id
                  }
                >
                  <Search className="size-4" />
                </button>
              </div>
            </div>

            {verseLoading && (
              <p className="text-sm text-slate-500">말씀을 불러오는 중...</p>
            )}
            {!verseLoading && verseError && (
              <p className="text-sm text-rose-600">{verseError}</p>
            )}
            {!verseLoading && !verseError && verseLines.length > 0 && (
              <div className="space-y-2" style={scriptureFont}>
                {verseLines.map((line, index) => {
                  const verseNumber = note.startVerse
                    ? note.startVerse + index
                    : null;
                  return (
                    <div
                      key={`${note.id}-verse-${index}`}
                      className="flex gap-3 rounded-xl border border-emerald-100 bg-white/80 px-3 py-2 text-[15px] sm:text-base text-slate-700 leading-7 sm:leading-8 shadow-xs"
                    >
                      {verseNumber !== null && (
                        <span className="text-xs font-semibold text-slate-500 tabular-nums pt-1">
                          {verseNumber}
                        </span>
                      )}
                      <span className="flex-1">{line}</span>
                    </div>
                  );
                })}
              </div>
            )}
            {!verseLoading && !verseError && verseLines.length === 0 && (
              <p className="text-sm text-slate-500">
                말씀을 불러올 수 없습니다.
              </p>
            )}

            {note.content && (
              <div className="bg-white border border-emerald-100 p-5 rounded-2xl mb-6">
                <p className="text-sm text-emerald-700 font-semibold mb-3 flex items-center gap-2">
                  <HandHeart className="size-4 text-emerald-600" />
                  기도문
                </p>
                <p className="text-[15px] sm:text-base text-slate-700 leading-7 whitespace-pre-wrap">
                  {note.content}
                </p>
              </div>
            )}

            <PrayerNoteResponseSection
              noteId={note.id}
              responses={responses}
              editingResponseNoteId={editingResponseNoteId}
              editingResponseId={editingResponseId}
              editingResponseContent={editingResponseContent}
              onChangeEditingContent={onChangeEditingResponseContent}
              onStartEdit={onStartEditResponse}
              onCancelEdit={onCancelEditResponse}
              onUpdateResponse={onUpdateResponse}
              onDeleteResponse={onDeleteResponse}
              expandedResponses={expandedResponses}
              onToggleExpanded={onToggleExpanded}
              responseDraft={responseDraft}
              onChangeDraft={onChangeResponseDraft}
              onCreateResponse={onCreateResponse}
              scriptureFont={scriptureFont}
              formatResponseTitle={formatResponseTitle}
              formatDate={formatDate}
              draftTextareaId={`prayer-response-${note.id}`}
            />

            <p className="text-xs text-slate-400">
              {formatDate(note.timestamp)}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
