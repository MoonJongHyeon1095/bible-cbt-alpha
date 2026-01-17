import { Check } from "lucide-react";

export function GeneratedThoughtsSection({
  generatedThoughts,
  selectedThoughtIndex,
  onSelectThought,
}: {
  generatedThoughts: string[];
  selectedThoughtIndex: number | null;
  onSelectThought: (index: number) => void;
}) {
  return (
    <div className="space-y-3">
      {generatedThoughts.map((thought, index) => {
        return (
          <div key={index}>
            <button
              onClick={() => onSelectThought(index)}
              className={`w-full text-left p-4 rounded-2xl border transition-all shadow-sm ${
                selectedThoughtIndex === index
                  ? "border-blue-500 bg-transparent shadow-md"
                  : "border-slate-200/80 hover:border-blue-300 bg-transparent"
              }`}
            >
              <div className="flex items-start gap-3">
                <p className="text-slate-800 flex-1 leading-relaxed font-serif">
                  {thought}
                </p>
                {selectedThoughtIndex === index && (
                  <Check className="size-5 text-blue-600 flex-shrink-0" />
                )}
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
}
