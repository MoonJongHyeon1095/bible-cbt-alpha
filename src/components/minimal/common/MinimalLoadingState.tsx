import { MinimalStepHeaderSection } from "./MinimalStepHeaderSection";

type MinimalLoadingStateProps = {
  message: string;
  title?: string;
  description?: string;
  variant?: "inline" | "page";
};

export function MinimalLoadingState({
  message,
  title,
  description,
  variant = "inline",
}: MinimalLoadingStateProps) {
  const spinner = (
    <div className="size-4 rounded-full border-2 border-slate-300 border-t-transparent animate-spin" />
  );

  if (variant === "page") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 pt-12 pb-10">
        <div className="w-full max-w-4xl space-y-8">
          {(title || description) && (
            <MinimalStepHeaderSection
              title={title ?? ""}
              description={description}
            />
          )}
          <div className="rounded-3xl border border-slate-200 bg-white/70 px-6 py-5 shadow-sm">
            <div className="space-y-3">
              <div className="h-4 w-10/12 rounded-full bg-slate-100 animate-pulse" />
              <div className="h-4 w-9/12 rounded-full bg-slate-100 animate-pulse" />
              <div className="h-4 w-7/12 rounded-full bg-slate-100 animate-pulse" />
            </div>
            <div className="mt-5 flex items-center gap-3 text-sm text-slate-500">
              {spinner}
              <span>{message}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      <div className="space-y-2">
        <div className="h-4 w-11/12 rounded-full bg-slate-100 animate-pulse" />
        <div className="h-4 w-9/12 rounded-full bg-slate-100 animate-pulse" />
      </div>
      <div className="flex items-center gap-3 text-sm text-slate-500">
        {spinner}
        <span>{message}</span>
      </div>
    </div>
  );
}
