import type { ReactNode } from "react";

interface MinimalStepHeaderSectionProps {
  title?: ReactNode;
  description?: ReactNode;
  titleClassName?: string;
  children?: ReactNode;
}

export function MinimalStepHeaderSection({
  title,
  description,
  titleClassName,
  children,
}: MinimalStepHeaderSectionProps) {
  return (
    <div className="space-y-3">
      {title && (
        <h1
          className={`text-2xl sm:text-4xl font-serif font-semibold leading-tight text-slate-900 ${
            titleClassName ?? ""
          }`}
        >
          {title}
        </h1>
      )}
      {description && (
        <p className="text-base sm:text-lg text-slate-500 leading-relaxed">
          {description}
        </p>
      )}
      {children}
    </div>
  );
}
