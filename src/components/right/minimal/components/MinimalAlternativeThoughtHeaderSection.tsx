interface MinimalAlternativeThoughtHeaderSectionProps {
  title: string;
  description: string;
}

export function MinimalAlternativeThoughtHeaderSection({
  title,
  description,
}: MinimalAlternativeThoughtHeaderSectionProps) {
  return (
    <div className="space-y-3">
      <h1 className="text-3xl sm:text-4xl font-serif font-semibold leading-tight text-slate-900">
        {title}
      </h1>
      <p className="text-base sm:text-lg text-slate-500 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
