import { Info } from "lucide-react";
import { CognitiveErrorInfoPopover } from "../../../feature/emotion-note/components/info-popovers";

interface MinimalCognitiveErrorCardProps {
  title: string;
  infoLabel?: string;
  evidenceQuote?: string;
  reason: string;
  detail?: string;
}

export function MinimalCognitiveErrorCard({
  title,
  infoLabel,
  evidenceQuote,
  reason,
  detail,
}: MinimalCognitiveErrorCardProps) {
  return (
    <div className="w-full rounded-3xl border border-slate-200 bg-white/80 px-6 py-5 text-left">
      <div className="flex items-center gap-2">
        <p className="text-base sm:text-lg font-semibold text-slate-900">
          {title}
        </p>
        {infoLabel && (
          <CognitiveErrorInfoPopover errorLabel={infoLabel}>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full p-1 text-rose-500 hover:bg-rose-100"
              aria-label={`${infoLabel} 설명 보기`}
            >
              <Info className="size-4" />
            </button>
          </CognitiveErrorInfoPopover>
        )}
      </div>
      {evidenceQuote && (
        <p className="mt-2 text-xs sm:text-sm text-slate-500">
          “{evidenceQuote}”
        </p>
      )}
      <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
        {reason}
      </p>
      {detail ? (
        <p className="mt-3 text-sm sm:text-base text-slate-700 leading-relaxed">
          {detail}
        </p>
      ) : (
        <div className="mt-3 flex items-center gap-3 text-sm text-slate-500">
          <div className="size-4 rounded-full border-2 border-slate-300 border-t-transparent animate-spin" />
          <span>설명을 불러오는 중입니다.</span>
        </div>
      )}
    </div>
  );
}
