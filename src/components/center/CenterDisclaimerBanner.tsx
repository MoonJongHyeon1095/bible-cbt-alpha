import { Info } from "lucide-react";

const DISCLAIMER_TEXT =
  "이 서비스는 의료/치료/진단용이 아닙니다. AI가 생성한 참고용 정보를 제공합니다.";

type CenterDisclaimerBannerProps = {
  onOpenDetails: () => void;
};

export function CenterDisclaimerBanner({
  onOpenDetails,
}: CenterDisclaimerBannerProps) {
  return (
    <div className="mb-4 rounded-full border border-amber-200 bg-amber-50/80 px-4 py-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-amber-900 flex items-center gap-2">
          <Info className="size-4 text-amber-600" />
          {DISCLAIMER_TEXT}
        </p>
        <button
          type="button"
          onClick={onOpenDetails}
          className="text-xs font-semibold text-amber-700 hover:text-amber-900"
        >
          자세히
        </button>
      </div>
    </div>
  );
}
