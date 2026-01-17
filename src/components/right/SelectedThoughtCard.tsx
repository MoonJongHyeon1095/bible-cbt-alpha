import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";

interface SelectedThoughtCardProps {
  thought: string;
  className?: string;
  onBackToAlternatives?: () => void;
  backDisabled?: boolean;
}

export function SelectedThoughtCard({
  thought,
  className = "",
  onBackToAlternatives,
  backDisabled = false,
}: SelectedThoughtCardProps) {
  const canShowBack = Boolean(onBackToAlternatives);

  return (
    <div
      className={`rounded-2xl border border-purple-200/70 bg-purple-50 p-5 shadow-sm ${className}`}
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-base font-semibold text-purple-800 whitespace-nowrap shrink-0">
            선택한 대안사고
          </p>
          <div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto sm:ml-auto">
            {canShowBack ? (
              <Button
                size="sm"
                variant="outline"
                onClick={onBackToAlternatives}
                className="gap-1 border-purple-300 text-purple-700 hover:bg-purple-50 whitespace-nowrap w-full sm:w-auto justify-center"
                disabled={backDisabled}
              >
                <ArrowLeft className="size-4" />
                다른 대안사고 보기
              </Button>
            ) : null}
          </div>
        </div>
      </div>
      <p
        className="mt-2 text-[15px] leading-7 text-slate-800"
        style={{
          fontFamily:
            '"Nanum Myeongjo", "Noto Serif KR", "Apple SD Gothic Neo", serif',
        }}
      >
        {thought}
      </p>
    </div>
  );
}
