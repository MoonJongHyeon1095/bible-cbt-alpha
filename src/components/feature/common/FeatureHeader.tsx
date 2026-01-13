import type { ComponentType, ReactNode } from "react";
import { cn } from "../../ui/utils";

type FeatureHeaderProps = {
  title: string;
  subtitle?: string;
  overline?: string;
  icon?: ComponentType<{ className?: string }>;
  action?: ReactNode;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  overlineClassName?: string;
  iconClassName?: string;
};

export function FeatureHeader({
  title,
  subtitle,
  overline,
  icon: Icon,
  action,
  className,
  titleClassName,
  subtitleClassName,
  overlineClassName,
  iconClassName,
}: FeatureHeaderProps) {
  return (
    <div
      className={cn(
        "mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div>
        {overline && (
          <div
            className={cn(
              "text-xs uppercase tracking-[0.3em] text-amber-700/70 mb-3",
              overlineClassName
            )}
          >
            {overline}
          </div>
        )}
        <h1
          className={cn(
            "text-4xl sm:text-5xl text-slate-900 flex items-center gap-3",
            titleClassName
          )}
        >
          {Icon && (
            <Icon
              className={cn("size-8 sm:size-9 text-amber-600", iconClassName)}
            />
          )}
          {title}
        </h1>
        {subtitle && (
          <p className={cn("text-slate-600 mt-3", subtitleClassName)}>
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}
