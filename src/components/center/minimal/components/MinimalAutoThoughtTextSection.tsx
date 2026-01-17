interface MinimalAutoThoughtTextSectionProps {
  text: string;
  fallback: string;
}

export function MinimalAutoThoughtTextSection({
  text,
  fallback,
}: MinimalAutoThoughtTextSectionProps) {
  return (
    <p className="w-full px-1 py-2 text-left font-serif text-lg sm:text-xl leading-relaxed text-slate-800">
      {text || fallback}
    </p>
  );
}
