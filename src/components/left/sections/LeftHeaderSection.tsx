type LeftHeader = {
  badge: string;
  title: string;
  desc: string;
};

interface LeftHeaderSectionProps {
  header: LeftHeader;
}

export function LeftHeaderSection({ header }: LeftHeaderSectionProps) {
  return (
    <div className="mb-4 space-y-2">
      <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
        {header.badge}
      </div>
      <h2 className="text-slate-800 text-xl lg:text-3xl font-serif">
        {header.title}
      </h2>
      <p className="text-slate-600 text-sm lg:text-lg mt-1">
        {header.desc}
      </p>
    </div>
  );
}
