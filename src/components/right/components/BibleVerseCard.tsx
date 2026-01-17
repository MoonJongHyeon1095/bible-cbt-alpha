import { BookOpen, Loader2, Sparkles } from "lucide-react";
import { Button } from "../../ui/button";
import type { BibleVerseResult } from "../types";
import { formatScriptureReference } from "../../../utils/scripture";

interface BibleVerseCardProps {
  bibleVerse: BibleVerseResult;
  onSavePrayer?: () => void;
  savingPrayer?: boolean;
  canSave?: boolean;
}

export function BibleVerseCard({
  bibleVerse,
  onSavePrayer,
  savingPrayer,
  canSave = true,
}: BibleVerseCardProps) {
  const serifFont = {
    fontFamily:
      '"Nanum Myeongjo", "Noto Serif KR", "Apple SD Gothic Neo", serif',
  };
  const referenceLabel =
    formatScriptureReference(
      bibleVerse.book,
      bibleVerse.chapter,
      bibleVerse.startVerse,
      bibleVerse.endVerse
    ) || "말씀";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50 via-amber-100/60 to-white p-6 shadow-lg shadow-amber-200/40">
      <div className="pointer-events-none absolute inset-0 opacity-60 [background:radial-gradient(circle_at_top,rgba(251,191,36,0.25),transparent_60%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.2),transparent_55%)]" />
      <div className="relative flex flex-col gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-amber-900 text-lg sm:text-xl flex-1 min-w-0 break-words flex items-center gap-2">
            <BookOpen className="size-5 text-amber-700" aria-hidden="true" />
            {referenceLabel}
          </p>
        </div>

        {onSavePrayer && (
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end sm:flex-nowrap">
            {onSavePrayer && (
              <Button
                onClick={onSavePrayer}
                variant="outline"
                size="sm"
                className="gap-2 border-blue-200/80 bg-white/70 text-blue-900 hover:bg-blue-50/80 w-auto max-sm:w-full sm:px-3 sm:text-xs"
                disabled={!canSave || savingPrayer}
              >
                {savingPrayer ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4" />
                )}
                {savingPrayer ? "저장 중..." : "기도 저장"}
              </Button>
            )}
          </div>
        )}
      </div>
      <blockquote className="relative pl-4 text-slate-900 text-lg sm:text-xl leading-relaxed">
        <span className="absolute left-0 inset-y-1 w-1 rounded-full bg-amber-400" />
        <span className="block italic" style={serifFont}>
          "{bibleVerse.verse}"
        </span>
      </blockquote>

      <div className="mt-6 space-y-2 text-base text-slate-800">
        <p className="text-lg sm:text-xl font-semibold uppercase tracking-[0.2em] text-amber-700/80">
          짧은 기도
        </p>
        <p className="leading-relaxed" style={serifFont}>
          {bibleVerse.prayer}
        </p>
      </div>

      <div className="mt-6 space-y-3 text-base text-slate-700">
        <p className="text-lg sm:text-xl font-semibold uppercase tracking-[0.2em] text-amber-700/80">
          기도의 방법
        </p>
        <ul className="list-disc list-inside space-y-2 leading-relaxed">
          <li>{referenceLabel} 말씀을 따라 읽습니다.</li>
          <li>
            이 말씀을 읽고 "하나님의 뜻을 알려주시기를 바랍니다"라고
            기도하십시오.
          </li>
          <li>기도문을 자신의 말로 바꾸어 기도해보십시오.</li>
        </ul>
      </div>

      <div className="mt-6 text-sm text-slate-600 leading-relaxed">
        <p className="max-w-[60ch]">
          만일 당신이 신앙의 여정을 원한다면, 가까운 건강한 교회에 문의하시거나
          우리 팀에 메일을 보내시기 바랍니다.
        </p>
      </div>
    </div>
  );
}
