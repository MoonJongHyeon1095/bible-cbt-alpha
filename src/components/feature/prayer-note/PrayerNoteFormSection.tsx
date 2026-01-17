import { BookOpenCheck, Save, X } from "lucide-react";
import type { CSSProperties, RefObject } from "react";
import { BIBLE_BOOKS } from "../../../constants/bibleBooks";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { Input } from "../../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Textarea } from "../../ui/textarea";

interface PrayerNoteFormSectionProps {
  isCreating: boolean;
  editingId: string | null;
  title: string;
  content: string;
  book: string;
  chapterInput: string;
  startVerseInput: string;
  endVerseInput: string;
  verseLines: string[];
  chapterOptions: string[];
  canSelectChapter: boolean;
  autoFillLoading: boolean;
  autoFillError: string | null;
  loading: boolean;
  scriptureFont: CSSProperties;
  bookRef: RefObject<HTMLButtonElement | null>;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onBookChange: (value: string) => void;
  onChapterChange: (value: string) => void;
  onStartVerseChange: (value: string) => void;
  onEndVerseChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export function PrayerNoteFormSection({
  isCreating,
  editingId,
  title,
  content,
  book,
  chapterInput,
  startVerseInput,
  endVerseInput,
  verseLines,
  chapterOptions,
  canSelectChapter,
  autoFillLoading,
  autoFillError,
  loading,
  scriptureFont,
  bookRef,
  onTitleChange,
  onContentChange,
  onBookChange,
  onChapterChange,
  onStartVerseChange,
  onEndVerseChange,
  onSubmit,
  onCancel,
}: PrayerNoteFormSectionProps) {
  if (!isCreating) return null;

  const parsedStartVerse = Number.parseInt(startVerseInput.trim(), 10);
  const startVerseNumber = Number.isFinite(parsedStartVerse)
    ? parsedStartVerse
    : null;
  const canSelectVerseRange = Boolean(canSelectChapter && chapterInput.trim());

  return (
    <Card className="p-8 mb-8 bg-white/90 border border-emerald-100 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.45)]">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-600/70 mb-2">
            Prayer Note
          </p>
          <h3 className="text-lg text-slate-900">
            {editingId ? "기도 노트 수정" : "새 기도 노트 작성"}
          </h3>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/60 px-3 py-1 text-xs font-semibold text-emerald-700">
          <BookOpenCheck className="size-4" />
          말씀 기반 기록
        </span>
      </div>

      <div className="space-y-6">
        <div>
          <label className="text-sm text-slate-700 mb-2 block">기도 제목</label>
          <Input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="말씀에 대한 기도 제목을 입력하세요"
            className="border-emerald-200 bg-emerald-50/40 focus-visible:ring-emerald-200"
          />
        </div>

        <div>
          <label className="text-sm text-slate-700 mb-2 block">기도문</label>
          <Textarea
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            placeholder="기도문을 기록하세요..."
            className="min-h-[140px] border-emerald-200 bg-emerald-50/40 focus-visible:ring-emerald-200"
          />
        </div>

        <div>
          <label className="text-sm text-slate-700 mb-2 flex items-center">
            성경 구절
            {(autoFillLoading || autoFillError) && (
              <span
                className={`ml-2 text-[13px] font-medium ${
                  autoFillError ? "text-rose-600" : "text-emerald-600"
                }`}
              >
                {autoFillLoading
                  ? "말씀을 불러오고 있습니다..."
                  : autoFillError}
              </span>
            )}
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.4fr_0.8fr_1fr]">
            <Select value={book} onValueChange={onBookChange}>
              <SelectTrigger
                ref={bookRef}
                className="border-emerald-200 bg-emerald-50/40 focus-visible:ring-emerald-200"
              >
                <SelectValue placeholder="책 선택" />
              </SelectTrigger>
              <SelectContent>
                {BIBLE_BOOKS.map((bookItem) => (
                  <SelectItem key={bookItem.number} value={bookItem.korean}>
                    {bookItem.korean}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={chapterInput}
              onValueChange={onChapterChange}
              disabled={!canSelectChapter}
            >
              <SelectTrigger className="border-emerald-200 bg-emerald-50/40 focus-visible:ring-emerald-200">
                <SelectValue placeholder="장 선택" />
              </SelectTrigger>
              <SelectContent>
                {chapterOptions.map((chapter) => (
                  <SelectItem key={chapter} value={chapter}>
                    {chapter}장
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
              <Input
                type="number"
                inputMode="numeric"
                min={1}
                value={startVerseInput}
                onChange={(e) => onStartVerseChange(e.target.value)}
                placeholder="시작 절"
                disabled={!canSelectVerseRange}
                className="border-emerald-200 bg-emerald-50/40 focus-visible:ring-emerald-200"
              />
              <span className="text-slate-500">~</span>
              <Input
                type="number"
                inputMode="numeric"
                min={startVerseNumber ?? 1}
                value={endVerseInput}
                onChange={(e) => onEndVerseChange(e.target.value)}
                placeholder="끝 절"
                disabled={!canSelectVerseRange}
                className="border-emerald-200 bg-emerald-50/40 focus-visible:ring-emerald-200"
              />
            </div>
          </div>
          {!canSelectVerseRange && (
            <p className="text-xs text-slate-500 mt-2">
              장을 선택하면 절 범위를 입력할 수 있습니다.
            </p>
          )}
        </div>

        <div>
          <label className="text-sm text-slate-700 mb-2 flex items-center gap-2">
            말씀 본문
            <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
              개역한글
            </span>
          </label>
          {verseLines.length > 0 ? (
            <div className="space-y-2 text-sm text-slate-700" style={scriptureFont}>
              {verseLines.map((line, index) => {
                const verseNumber =
                  startVerseNumber !== null ? startVerseNumber + index : null;
                return (
                  <div
                    key={`${startVerseNumber ?? "verse"}-${index}`}
                    className="flex gap-3 rounded-xl border border-emerald-100 bg-white/80 px-3 py-2 shadow-xs leading-relaxed"
                  >
                    {verseNumber !== null && (
                      <span className="text-xs font-semibold text-slate-500 tabular-nums pt-0.5">
                        {verseNumber}
                      </span>
                    )}
                    <span className="flex-1">{line}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-400">
              선택한 절의 본문이 여기에 표시됩니다.
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={onSubmit}
            disabled={loading || autoFillLoading || Boolean(autoFillError)}
            className="bg-emerald-700 hover:bg-emerald-800"
          >
            <Save className="size-4 mr-2" />
            {editingId ? "수정 완료" : "저장"}
          </Button>
          <Button onClick={onCancel} variant="outline">
            <X className="size-4 mr-2" />
            취소
          </Button>
        </div>
      </div>
    </Card>
  );
}
