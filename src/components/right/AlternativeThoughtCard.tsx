import type { AlternativeThought } from "./types";

interface AlternativeThoughtCardProps {
  item: AlternativeThought;
  index: number;
  onSelect: (thought: string) => void;
}

export function AlternativeThoughtCard({
  item,
  index,
  onSelect,
}: AlternativeThoughtCardProps) {
  return (
    <button
      onClick={() => onSelect(item.thought)}
      className="w-full text-left p-6 rounded-xl border-2 border-slate-200 hover:border-purple-400 bg-white transition-all group hover:shadow-lg"
    >
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-base group-hover:bg-purple-600 transition-colors">
          {index + 1}
        </span>

        <div className="flex-1 space-y-4">
          <div className="space-y-3">
            {item.thought.split(/\. (?=[A-Z가-힣])/).map(
              (sentence, sIndex) =>
                sentence.trim() && (
                  <p
                    key={sIndex}
                    className="text-slate-800 text-base leading-relaxed"
                  >
                    {sentence.trim()}
                    {!sentence.endsWith(".") && "."}
                  </p>
                )
            )}
          </div>

          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-indigo-700 text-base">🎯</span>
              <span className="text-indigo-900 font-semibold">
                {item.technique}
              </span>
            </div>
            <p className="text-slate-600 text-sm italic leading-relaxed">
              {item.techniqueDescription}
            </p>
          </div>
        </div>
      </div>
    </button>
  );
}
