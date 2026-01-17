import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "../../../ui/button";
import type { AlternativeThought } from "../../types";
import { AlternativeThoughtCard } from "../AlternativeThoughtCard";
import { AlternativeThoughtQuoteCard } from "../AlternativeThoughtQuoteCard";

interface RightAlternativePickerSectionProps {
  thoughtsLoading: boolean;
  thoughtsError: string | null;
  alternativeThoughts: AlternativeThought[];
  onSelectThought: (thought: string) => void;
  onRetry: () => void;
  onReviewAlternatives: () => void;
}

export function RightAlternativePickerSection({
  thoughtsLoading,
  thoughtsError,
  alternativeThoughts,
  onSelectThought,
  onRetry,
  onReviewAlternatives,
}: RightAlternativePickerSectionProps) {
  return (
    <div className="space-y-4">
      {thoughtsLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="size-10 animate-spin text-purple-600 mb-4" />
          <p className="text-slate-600 text-lg">
            대안적 사고를 생성하고 있습니다...
          </p>
        </div>
      ) : thoughtsError ? (
        <div className="bg-red-50 border border-red-200 text-red-800 p-5 rounded-lg">
          <p className="mb-3 text-base">{thoughtsError}</p>
          <Button onClick={onRetry} variant="outline" size="sm">
            다시 시도
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={onReviewAlternatives}
              className="gap-1 border-purple-300 text-purple-700 hover:bg-purple-50 whitespace-normal leading-tight"
              disabled={thoughtsLoading}
            >
              <RefreshCw className="size-4" />
              다른 답변 검토
            </Button>
          </div>
          <div className="space-y-4">
            {alternativeThoughts.map((item, index) => (
              <AlternativeThoughtCard
                key={index}
                item={item}
                onSelect={onSelectThought}
              />
            ))}
          </div>
        </div>
      )}

      {thoughtsLoading && <AlternativeThoughtQuoteCard />}
    </div>
  );
}
