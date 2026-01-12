import { Shuffle } from "lucide-react";

interface ExampleItem {
  emoji: string;
  text: string;
}

interface IncidentExamplesSectionProps {
  randomExamples: ExampleItem[];
  onExampleClick: (text: string) => void;
  onRefreshExamples: () => void;
}

export function IncidentExamplesSection({
  randomExamples,
  onExampleClick,
  onRefreshExamples,
}: IncidentExamplesSectionProps) {
  return (
    <div className="space-y-2 pt-6">
      <p className="text-slate-600 text-base">또는 예시를 선택하세요.</p>

      <div className="space-y-2">
        {randomExamples.map((example, i) => (
          <button
            key={i}
            onClick={() => onExampleClick(example.text)}
            className="w-full text-left p-4 rounded-2xl border border-slate-300 hover:border-blue-400 hover:bg-blue-50 transition-all text-[15px] text-slate-700 leading-6"
          >
            <span className="text-lg mr-2">{example.emoji}</span>
            {example.text}
          </button>
        ))}
      </div>

      <button
        onClick={onRefreshExamples}
        className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl border-2 border-indigo-300 hover:border-indigo-500 hover:bg-indigo-50 transition-all text-sm text-indigo-700"
      >
        <Shuffle className="size-4" />
        다른 예시 보기
      </button>
    </div>
  );
}
