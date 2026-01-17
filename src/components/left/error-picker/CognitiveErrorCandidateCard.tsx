import { Check, Loader2 } from "lucide-react";
import type { ErrorIndex } from "../../../lib/ai";
import type { CognitiveErrorMeta, DetailItem, RankItem } from "./types";
import { splitToSentences } from "./utils";

type Props = {
  idx: ErrorIndex;
  meta?: CognitiveErrorMeta;
  selectedOn: boolean;
  rankItem?: RankItem;
  detail?: DetailItem;
  detailLoading: boolean;
  onToggleSelect: (idx: ErrorIndex) => void;
};

export function CognitiveErrorCandidateCard({
  idx,
  meta,
  selectedOn,
  rankItem,
  detail,
  detailLoading,
  onToggleSelect,
}: Props) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onToggleSelect(idx)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onToggleSelect(idx);
        }
      }}
      className={`w-full text-left p-4 rounded-2xl border transition-all relative cursor-pointer shadow-sm ${
        selectedOn
          ? "border-emerald-300 bg-emerald-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex flex-col gap-2 mb-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="order-2 space-y-1 sm:order-1">
          <p className="text-slate-900 font-semibold">
            {meta?.title ?? "인지오류"}
          </p>
          <p className="text-slate-500 text-sm leading-relaxed">
            {meta?.description ?? ""}
          </p>
        </div>
        <div className="order-1 flex flex-wrap items-center gap-2 self-end sm:order-2 sm:self-auto sm:flex-nowrap sm:justify-end">
          {selectedOn && (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-white px-2 py-1 text-[11px] font-semibold text-emerald-800">
              <Check className="size-3" />
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {(rankItem?.reason || rankItem?.evidenceQuote) && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-3">
            {rankItem?.reason && (
              <div className="space-y-1">
                <p className="text-xs text-slate-500">🧾 추천 이유</p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {rankItem.reason}
                </p>
              </div>
            )}

            {rankItem?.evidenceQuote && (
              <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-2 space-y-1">
                <p className="text-xs text-emerald-800">📝 당신이 쓴 문장</p>
                <p className="text-sm text-emerald-900 italic whitespace-pre-line">
                  "{rankItem.evidenceQuote}"
                </p>
              </div>
            )}
          </div>
        )}

        {detail ? (
          <div className="rounded-xl border border-emerald-100 bg-white p-3">
            <p className="text-xs text-emerald-800 mb-2">🔍 상세 설명</p>
            <div
              className="text-sm text-slate-800 leading-6 space-y-2 tracking-wide"
              style={{
                fontFamily:
                  '"Nanum Myeongjo", "Noto Serif KR", "Apple SD Gothic Neo", serif',
              }}
            >
              {splitToSentences(detail.analysis).map((line, i) => (
                <p key={i} className="whitespace-pre-line">
                  {line}
                </p>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-600 text-sm">
            {detailLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                <span>상세 서술을 불러오는 중...</span>
              </div>
            ) : (
              <span>상세 서술이 준비되는 대로 표시됩니다...</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
