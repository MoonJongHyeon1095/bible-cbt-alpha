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
import { Save, X } from "lucide-react";
import type { CSSProperties, RefObject } from "react";

interface ScriptureNoteFormSectionProps {
  isCreating: boolean;
  editingId: string | null;
  book: string;
  chapterInput: string;
  startVerseInput: string;
  endVerseInput: string;
  verse: string;
  chapterOptions: string[];
  canSelectChapter: boolean;
  autoFillLoading: boolean;
  autoFillError: string | null;
  loading: boolean;
  scriptureFont: CSSProperties;
  bookRef: RefObject<HTMLButtonElement | null>;
  onBookChange: (value: string) => void;
  onChapterChange: (value: string) => void;
  onStartVerseChange: (value: string) => void;
  onEndVerseChange: (value: string) => void;
  onVerseChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export function ScriptureNoteFormSection({
  isCreating,
  editingId,
  book,
  chapterInput,
  startVerseInput,
  endVerseInput,
  verse,
  chapterOptions,
  canSelectChapter,
  autoFillLoading,
  autoFillError,
  loading,
  scriptureFont,
  bookRef,
  onBookChange,
  onChapterChange,
  onStartVerseChange,
  onEndVerseChange,
  onVerseChange,
  onSubmit,
  onCancel,
}: ScriptureNoteFormSectionProps) {
  if (!isCreating) return null;

  return (
    <Card className="p-8 mb-8 bg-white/90 border border-emerald-100 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.45)]">
      <h3 className="text-lg text-slate-900 mb-5">
        {editingId ? "말씀 노트 수정" : "새 말씀 노트 작성"}
      </h3>
      <div className="space-y-5">
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
                className="border-emerald-200 bg-emerald-50/40 focus-visible:ring-emerald-200"
              />
              <span className="text-slate-500">~</span>
              <Input
                type="number"
                inputMode="numeric"
                min={1}
                value={endVerseInput}
                onChange={(e) => onEndVerseChange(e.target.value)}
                placeholder="끝 절"
                className="border-emerald-200 bg-emerald-50/40 focus-visible:ring-emerald-200"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm text-slate-700 mb-2 block">
            말씀 본문 (개역한글)
          </label>
          <Textarea
            value={verse}
            onChange={(e) => onVerseChange(e.target.value)}
            placeholder="성경 말씀 본문을 입력하세요..."
            className="min-h-[160px] border-emerald-200 bg-emerald-50/40 focus-visible:ring-emerald-200"
            style={scriptureFont}
          />
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
