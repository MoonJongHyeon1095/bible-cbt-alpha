import { AlertCircle, Save } from "lucide-react";
import { Button } from "../../../../ui/button";
import { Textarea } from "../../../../ui/textarea";
import { ErrorSelector } from "./PatternSelectors";

interface PatternErrorAddSectionProps {
  errorLabel: string;
  errorDescription: string;
  loading: boolean;
  onChangeErrorLabel: (value: string) => void;
  onChangeErrorDescription: (value: string) => void;
  onAddErrorDetail: () => void;
}

export function PatternErrorAddSection({
  errorLabel,
  errorDescription,
  loading,
  onChangeErrorLabel,
  onChangeErrorDescription,
  onAddErrorDetail,
}: PatternErrorAddSectionProps) {
  return (
    <div className="border border-rose-200 rounded-xl bg-white shadow-sm">
      <div className="border-b border-rose-200 px-4 py-3 text-sm font-semibold text-slate-800 flex items-center gap-2">
        <AlertCircle className="size-4" />
        인지오류 추가
      </div>
      <div className="p-5 space-y-4 bg-rose-50/70">
        <div className="flex items-center justify-between gap-2 text-sm text-slate-700">
          <div className="flex items-center gap-2">🧠 인지오류 추가</div>
          <Button
            size="sm"
            onClick={onAddErrorDetail}
            disabled={!errorLabel.trim() || loading}
            className="bg-rose-500 text-white hover:bg-rose-600"
          >
            <Save className="size-4 mr-1" />
            저장
          </Button>
        </div>
        <div>
          <p className="text-xs text-slate-600 mb-2">인지오류 선택</p>
          <ErrorSelector value={errorLabel} onSelect={onChangeErrorLabel} />
        </div>
        <Textarea
          value={errorDescription}
          onChange={(e) => onChangeErrorDescription(e.target.value)}
          placeholder="인지오류 설명"
          className="min-h-[120px] border-rose-200 bg-white/90 px-3 py-2 text-[16px] leading-[1.85]"
        />
      </div>
    </div>
  );
}
