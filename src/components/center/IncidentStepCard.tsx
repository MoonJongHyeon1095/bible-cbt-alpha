import { Bookmark, Shuffle } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import type { EmotionNote } from "./types";

interface ExampleItem {
  emoji: string;
  text: string;
}

interface IncidentStepCardProps {
  userInput: string;
  onInputChange: (value: string) => void;
  onNext: () => void;
  randomExamples: ExampleItem[];
  onExampleClick: (text: string) => void;
  onRefreshExamples: () => void;
  onSaveTrigger: () => void;
  onOpenSavedTriggers: () => void;
}

export function IncidentStepCard({
  userInput,
  onInputChange,
  onNext,
  randomExamples,
  onExampleClick,
  onRefreshExamples,
  onSaveTrigger,
  onOpenSavedTriggers,
}: IncidentStepCardProps) {
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-slate-700 mb-2 text-base">
          마음이 힘들었던 경험이나 불편했던 상황을 자유롭게 적어주세요.
        </p>
        <p className="text-blue-700 text-base">
          💡 자세한 설명일수록 더욱 효과적입니다.
        </p>
      </div>

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <button
          onClick={onSaveTrigger}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-indigo-300 hover:border-indigo-500 hover:bg-indigo-50 transition-all text-indigo-700 hover:text-indigo-800 text-sm"
          title="상황 저장"
        >
          <Bookmark className="size-4" />
          상황 저장
        </button>

        <button
          onClick={onOpenSavedTriggers}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all text-slate-700 text-sm"
          title="저장된 상황 불러오기"
        >
          저장된 상황 불러오기
        </button>
      </div>
      {/* 저장된 상황 불러오기는 모달로 분리 */}

      <Textarea
        value={userInput}
        onChange={(e) => onInputChange(e.target.value)}
        placeholder="여기에 직접 입력하세요..."
        className="min-h-[120px] resize-none"
      />

      <Button
        onClick={onNext}
        disabled={!userInput.trim()}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        다음 단계로 이동
      </Button>

      <div className="space-y-2 pt-2">
        <p className="text-slate-600 text-base">또는 예시를 선택하세요.</p>

        <div className="space-y-2">
          {randomExamples.map((example, i) => (
            <button
              key={i}
              onClick={() => onExampleClick(example.text)}
              className="w-full text-left p-4 rounded-lg border border-slate-300 hover:border-blue-400 hover:bg-blue-50 transition-all text-[15px] text-slate-700 leading-6"
            >
              <span className="text-lg mr-2">{example.emoji}</span>
              {example.text}
            </button>
          ))}
        </div>

        <button
          onClick={onRefreshExamples}
          className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-indigo-300 hover:border-indigo-500 hover:bg-indigo-50 transition-all text-sm text-indigo-700"
        >
          <Shuffle className="size-4" />
          다른 예시 보기
        </button>
      </div>

      <p className="text-center text-slate-400 text-xs">
        이 치료기법은 일반적인 인지행동치료 원리를 기반으로 AI를 활용해
        생성되었습니다.
      </p>
    </div>
  );
}
