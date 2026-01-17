import type { ReactNode } from "react";

type EnteranceStepLayoutSectionProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  body?: string;
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
    <section className="w-full max-w-2xl">
      <div className="rounded-3xl border border-white/60 bg-white/70 p-8 shadow-xl backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/70">
        {eyebrow && (
          <p className="text-xs uppercase tracking-[0.28em] text-amber-600 dark:text-amber-300">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 text-lg text-slate-700 dark:text-slate-200">
            {subtitle}
          </p>
        )}
        {body && (
          <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {body}
          </p>
        )}
        {children}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onPrimary}
            disabled={primaryDisabled}
            className="rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 dark:bg-amber-300 dark:text-slate-900 dark:hover:bg-amber-200"
          >
            {primaryLabel}
          </button>
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
    </section>
  );
}
