import { MinimalStepHeaderSection } from "../../../common/MinimalStepHeaderSection";

interface MinimalCognitiveErrorLoadingStateProps {
  title: string;
  message: string;
}

export function MinimalCognitiveErrorLoadingState({
  title,
  message,
}: MinimalCognitiveErrorLoadingStateProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-12 pb-10">
      <div className="w-full max-w-4xl space-y-8">
        <MinimalStepHeaderSection title={title} />
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <div className="size-4 rounded-full border-2 border-slate-300 border-t-transparent animate-spin" />
          <span>{message}</span>
        </div>
      </div>
    </div>
  );
}
