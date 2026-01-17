interface MinimalCognitiveErrorHeaderSectionProps {
  description: string;
}

export function MinimalCognitiveErrorHeaderSection({
  description,
}: MinimalCognitiveErrorHeaderSectionProps) {
  return (
    <div className="space-y-3">
      <p className="text-base sm:text-lg text-slate-500 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
