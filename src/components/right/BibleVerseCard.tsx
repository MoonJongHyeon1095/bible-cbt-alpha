import { BookmarkPlus, Loader2, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import type { BibleVerseResult } from "./types";

interface BibleVerseCardProps {
  bibleVerse: BibleVerseResult;
  onSaveScripture?: () => void;
  onSavePrayer?: () => void;
  savingScripture?: boolean;
  savingPrayer?: boolean;
  canSave?: boolean;
}

export function BibleVerseCard({
  bibleVerse,
  onSaveScripture,
  onSavePrayer,
  savingScripture,
  savingPrayer,
  canSave = true,
}: BibleVerseCardProps) {
  return (
    <div className="bg-amber-50 p-6 rounded-xl border-2 border-amber-400">
      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="text-amber-900 text-xl">📖 {bibleVerse.reference}</p>

        {(onSaveScripture || onSavePrayer) && (
          <div className="flex items-center gap-2">
            {onSaveScripture && (
              <Button
                onClick={onSaveScripture}
                variant="outline"
                size="sm"
                className="gap-2 border-amber-300 text-amber-800 hover:bg-amber-100"
                disabled={!canSave || savingScripture}
              >
                {savingScripture ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <BookmarkPlus className="size-4" />
                )}
                {savingScripture ? "저장 중..." : "말씀 저장"}
              </Button>
            )}
            {onSavePrayer && (
              <Button
                onClick={onSavePrayer}
                variant="outline"
                size="sm"
                className="gap-2 border-blue-200 text-blue-800 hover:bg-blue-50"
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
      <p className="text-slate-800 mb-5 italic leading-relaxed text-lg">
        "{bibleVerse.verse}"
      </p>

      <div className="border-t border-amber-300 pt-4 mt-4">
        <p className="text-slate-700 mb-2 text-base">
          <strong>짧은 기도:</strong>
        </p>
        <p className="text-slate-800 leading-relaxed text-base">
          {bibleVerse.prayer}
        </p>
      </div>

      <div className="border-t border-amber-300 pt-4 mt-4">
        <p className="text-slate-700 mb-3 text-base">
          <strong>기도의 방법:</strong>
        </p>
        <ol className="list-decimal list-inside space-y-2 text-slate-700 text-base leading-relaxed">
          <li>{bibleVerse.reference} 말씀을 따라 읽습니다.</li>
          <li>
            이 말씀을 읽고 "하나님의 뜻을 알려주시기를 바랍니다"라고 기도하십시오.
          </li>
          <li>기도문을 자신의 말로 바꾸어 기도해보십시오.</li>
        </ol>
      </div>

      <div className="border-t border-amber-300 pt-4 mt-4">
        <p className="text-slate-600 text-sm leading-relaxed">
          만일 당신이 신앙의 여정을 원한다면, 가까운 건강한 교회에 문의하시거나
          우리 팀에 메일을 보내시기 바랍니다.
        </p>
      </div>
    </div>
  );
}
