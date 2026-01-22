import { FolderOpen } from "lucide-react";
import { toast } from "sonner";
import { fetchTokenUsageStatus } from "../../../utils/tokenSessionStorage";
import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";
interface IncidentInputSectionProps {
  userInput: string;
  onInputChange: (value: string) => void;
  onNext: () => void;
  sessionKind: "minimal" | "cbt";
  onChangeSessionKind: (next: "minimal" | "cbt") => void;
  onOpenSavedTriggers: () => void;
}

export function IncidentInputSection({
  userInput,
  onInputChange,
  onNext,
  sessionKind,
  onChangeSessionKind,
  onOpenSavedTriggers,
}: IncidentInputSectionProps) {
  const isLite = sessionKind === "minimal";
  const handleStartSession = async () => {
    try {
      const status = await fetchTokenUsageStatus();
      const dailyLimit = status.is_member ? 20000 : 15000;
      const monthlyLimit = status.is_member ? 150000 : 50000;

      if (status.usage.daily_usage >= dailyLimit) {
        toast.error(
          "당일 토큰 사용량을 초과했습니다. (한국시간 매일 오전 09:00 초기화)",
        );
        return;
      }

      if (status.usage.monthly_usage >= monthlyLimit) {
        toast.error(
          "월 토큰 사용량을 초과했습니다. (한국시간 매월 1일 오전 09:00 초기화)",
        );
        return;
      }
    } catch (error) {
      console.error("token usage check failed:", error);
    }

    onNext();
  };
  const handleSelectSessionKind = (next: "minimal" | "cbt") => {
    if (sessionKind === next) return;
    onChangeSessionKind(next);
  };

  return (
    <div className="space-y-6 rounded-2xl border border-slate-200/70 bg-transparent p-5 shadow-sm">
      <div className="-mt-9 flex items-end gap-2">
        <button
          type="button"
          onClick={() => handleSelectSessionKind("minimal")}
          className={`relative rounded-t-2xl border border-b-0 px-4 py-2 text-sm font-semibold transition ${
            isLite
              ? "border-amber-200 bg-amber-50 text-amber-900 shadow-sm"
              : "border-slate-200 bg-white text-slate-500 hover:text-slate-700"
          }`}
        >
          Lite
          <span
            className={`absolute -bottom-2 left-4 h-2 w-10 rounded-b-full border border-t-0 ${
              isLite
                ? "border-amber-200 bg-amber-50"
                : "border-slate-200 bg-white"
            }`}
          />
        </button>
        <button
          type="button"
          onClick={() => handleSelectSessionKind("cbt")}
          className={`relative rounded-t-2xl border border-b-0 px-4 py-2 text-sm font-semibold transition ${
            !isLite
              ? "border-blue-200 bg-blue-50 text-blue-900 shadow-sm"
              : "border-slate-200 bg-white text-slate-500 hover:text-slate-700"
          }`}
        >
          심화
          <span
            className={`absolute -bottom-2 left-4 h-2 w-10 rounded-b-full border border-t-0 ${
              !isLite
                ? "border-blue-200 bg-blue-50"
                : "border-slate-200 bg-white"
            }`}
          />
        </button>
      </div>

      {isLite ? (
        <div className="pt-2">
          <Button
            onClick={() => void handleStartSession()}
            className="w-full rounded-2xl bg-amber-50 text-base font-semibold text-amber-900 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg hover:bg-amber-100"
          >
            세션 시작하기
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-end">
          <button
            onClick={onOpenSavedTriggers}
            className="flex flex-none shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-blue-200/70 bg-blue-50/80 px-3 py-2 text-sm font-semibold text-blue-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-100/80 hover:shadow-md"
            title="불러오기"
          >
            <FolderOpen className="size-4" />
            불러오기
          </button>
        </div>
      )}
      {/* 저장된 상황 불러오기는 모달로 분리 */}

      {!isLite && (
        <div className="space-y-2">
          <p className="text-base font-semibold text-slate-700">
            세션당 소요시간은 약 5분입니다.
          </p>
          <p className="text-sm text-slate-500">
            자세한 설명일수록 더욱 효과적입니다.
          </p>
        </div>
      )}

      {!isLite && (
        <Textarea
          value={userInput}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="여기에 직접 입력하세요..."
          className="min-h-[72px] sm:min-h-[80px] resize-none rounded-2xl border border-slate-200 bg-white/90 px-3 py-2 text-[15px] leading-relaxed shadow-sm transition focus-visible:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-200"
        />
      )}

      {!isLite && (
        <Button
          onClick={() => void handleStartSession()}
          className="w-full rounded-2xl bg-blue-600 text-base font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg"
        >
          세션 시작하기
        </Button>
      )}
    </div>
  );
}
