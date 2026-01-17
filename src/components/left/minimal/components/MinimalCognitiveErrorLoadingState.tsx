import { MinimalStepHeaderSection } from "../../../common/MinimalStepHeaderSection";

interface MinimalCognitiveErrorLoadingStateProps {
  description: string;
  message: string;
}

export function MinimalCognitiveErrorLoadingState({
  description,
  message,
}: MinimalCognitiveErrorLoadingStateProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-12 pb-10">
      <div className="w-full max-w-xl space-y-8">
        <MinimalStepHeaderSection description={description} />
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <div className="size-4 rounded-full border-2 border-slate-300 border-t-transparent animate-spin" />
          <span>{message}</span>
        </div>
      </div>
    </div>
  );
}
