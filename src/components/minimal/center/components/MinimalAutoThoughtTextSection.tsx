interface MinimalAutoThoughtTextSectionProps {
  belief: string;
  emotionReason: string;
  fallback: string;
}

export function MinimalAutoThoughtTextSection({
  belief,
  emotionReason,
  fallback,
}: MinimalAutoThoughtTextSectionProps) {
  if (!belief && !emotionReason) {
    return (
      <p className="w-full px-1 py-2 text-left font-serif text-lg sm:text-xl leading-relaxed text-slate-800">
        {fallback}
      </p>
    );
  }

  return (
    <div className="w-full px-1 py-2 text-left font-serif text-lg sm:text-xl leading-relaxed text-slate-800 space-y-3">
      {belief ? <p>{belief}</p> : null}
      {/* {emotionReason ? (
        <p className="text-sm sm:text-base text-slate-500 font-sans">
          {emotionReason}
        </p>
      ) : null} */}
    </div>
  );
}
