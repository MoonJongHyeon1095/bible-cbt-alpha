import type { AlternativeThought } from "./types";

interface AlternativeThoughtCardProps {
  item: AlternativeThought;
  onSelect: (thought: string) => void;
}

export function AlternativeThoughtCard({
  item,
  onSelect,
}: AlternativeThoughtCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(item.thought)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(item.thought);
        }
      }}
      className="group relative w-full cursor-pointer overflow-hidden rounded-2xl border border-purple-200/70 bg-white/90 p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-purple-300 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300/60"
    >
      <div className="absolute right-0 top-0 h-20 w-32 rounded-bl-[80px] bg-gradient-to-bl from-purple-200/60 via-fuchsia-100/40 to-transparent" />
      <div className="relative flex flex-col gap-4">
        <div className="flex items-center justify-between"></div>

        <div
          className="space-y-3 text-[15px] leading-7 text-slate-800"
          style={{
            fontFamily:
              '"Nanum Myeongjo", "Noto Serif KR", "Apple SD Gothic Neo", serif',
          }}
        >
          {item.thought.split(/\. (?=[A-Z가-힣])/).map(
            (sentence, sIndex) =>
              sentence.trim() && (
                <p key={sIndex} className="whitespace-pre-line">
                  {sentence.trim()}
                  {!sentence.endsWith(".") && "."}
                </p>
              )
          )}
        </div>

        <div className="rounded-xl border border-purple-200/70 bg-gradient-to-r from-purple-50 via-white to-fuchsia-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-purple-700 text-base">🎯</span>
            <span className="text-purple-900 font-semibold">
              {item.technique}
            </span>
          </div>
          <p className="text-slate-600 text-sm italic leading-relaxed">
            {item.techniqueDescription}
          </p>
        </div>
      </div>
    </div>
  );
}
