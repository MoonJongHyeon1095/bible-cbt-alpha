import type { ReactNode } from "react";
import { MinimalFloatingNextButton } from "../../minimal/common/MinimalFloatingNextButton";

type EnteranceStepLayoutSectionProps = {
  eyebrow?: string;
  title: string;
  subtitle?: ReactNode;
  body?: ReactNode;
  primaryLabel: string;
  secondaryLabel?: string;
  onPrimary: () => void;
  onSecondary?: () => void;
  primaryDisabled?: boolean;
  children?: ReactNode;
};

export function EnteranceStepLayoutSection({
  eyebrow,
  title,
  subtitle,
  body,
  primaryLabel,
  secondaryLabel,
  onPrimary,
  onSecondary,
  primaryDisabled,
  children,
}: EnteranceStepLayoutSectionProps) {
  return (
    <section className="w-full max-w-2xl min-h-[60vh] flex flex-col">
      <div className="flex-1 flex flex-col justify-center">
        {(subtitle || body) && (
          <div className="text-left">
            {subtitle && (
              <p className="text-lg text-slate-700 dark:text-slate-200">
                {subtitle}
              </p>
            )}
            {body && (
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {body}
              </p>
            )}
          </div>
        )}
        {children && <div className="mt-6">{children}</div>}
      </div>
      <div className="mt-16">
        {eyebrow && (
          <p className="text-xs uppercase tracking-[0.28em] text-amber-600 dark:text-amber-300">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </h1>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {secondaryLabel && onSecondary && (
            <button
              type="button"
              onClick={onSecondary}
              className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-600 dark:text-slate-200 dark:hover:border-slate-500"
            >
              {secondaryLabel}
            </button>
          )}
        </div>
      </div>
      <MinimalFloatingNextButton
        onClick={onPrimary}
        ariaLabel={primaryLabel}
        disabled={primaryDisabled}
      />
    </section>
  );
}
