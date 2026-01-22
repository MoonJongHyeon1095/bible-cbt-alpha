interface MinimalAlternativeThoughtBodySectionProps {
  thought: string;
  technique?: string;
  fallback: string;
}

export function MinimalAlternativeThoughtBodySection({
  thought,
  technique,
  fallback,
}: MinimalAlternativeThoughtBodySectionProps) {
  return (
    <>
      <div className="bg-transparent px-1 py-2 text-base sm:text-lg text-slate-800 font-serif leading-relaxed">
        {thought || fallback}
      </div>
      {technique && (
        <div className="inline-flex items-center rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-medium text-slate-600">
          {technique}
        </div>
      )}
    </>
  );
}
