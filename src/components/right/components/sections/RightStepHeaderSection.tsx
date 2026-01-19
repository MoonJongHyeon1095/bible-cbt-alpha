interface RightStepHeaderSectionProps {
  badge: string;
  title?: string;
  desc?: string;
}

export function RightStepHeaderSection({
  badge,
  title,
  desc,
}: RightStepHeaderSectionProps) {
  return (
    <div className="mb-4 space-y-2">
      <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
        {badge}
      </div>
      {title ? (
        <h2 className="text-slate-800 text-xl min-[600px]:text-3xl font-serif font-semibold">
          {title}
        </h2>
      ) : null}
      {desc ? (
        <p className="text-slate-600 text-sm min-[600px]:text-lg mt-1">
          {desc}
        </p>
      ) : null}
    </div>
  );
}
