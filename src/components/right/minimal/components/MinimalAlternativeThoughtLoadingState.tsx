import { MinimalStepHeaderSection } from "../../../common/MinimalStepHeaderSection";

interface MinimalAlternativeThoughtLoadingStateProps {
  title: string;
  description: string;
  message: string;
}

export function MinimalAlternativeThoughtLoadingState({
  title,
  description,
  message,
}: MinimalAlternativeThoughtLoadingStateProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-12 pb-10">
      <div className="w-full max-w-4xl space-y-8">
        <MinimalStepHeaderSection title={title} description={description} />
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <div className="size-4 rounded-full border-2 border-slate-300 border-t-transparent animate-spin" />
          <span>{message}</span>
        </div>
      </div>
    </div>
  );
}
