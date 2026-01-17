import { Info } from "lucide-react";

type CenterDisclaimerBannerProps = {
  onOpenDetails: () => void;
};

export function CenterDisclaimerBanner({
  onOpenDetails,
}: CenterDisclaimerBannerProps) {
  return (
    <div className="mb-6 -mt-8 rounded-full border border-amber-200 bg-amber-50/80 px-4 py-2">
      <div className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-2">
        <p className="min-w-0 text-sm text-amber-900 flex items-center gap-2">
          <Info className="size-4 text-amber-600" />
          <span>
            <span className="sm:hidden">중요 안내</span>
            <span className="hidden sm:inline">
              이 서비스는 치료/진단용이 아닙니다. AI가 생성한 참고용 정보를
              제공합니다.
            </span>
          </span>
        </p>
        <button
          type="button"
          onClick={onOpenDetails}
          className="justify-self-end whitespace-nowrap text-xs font-semibold text-amber-700 hover:text-amber-900"
        >
          자세히
        </button>
      </div>
    </div>
  );
}
