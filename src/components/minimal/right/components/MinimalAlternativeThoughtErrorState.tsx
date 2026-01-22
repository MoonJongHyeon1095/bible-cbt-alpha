interface MinimalAlternativeThoughtErrorStateProps {
  error: string;
  onRetry: () => void;
}

export function MinimalAlternativeThoughtErrorState({
  error,
  onRetry,
}: MinimalAlternativeThoughtErrorStateProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-12 pb-10">
      <div className="w-full max-w-4xl text-center space-y-4">
        <p className="text-base text-slate-600">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="rounded-3xl border border-slate-300 bg-white/90 px-6 py-3 text-sm font-medium text-slate-700"
        >
          다시 불러오기
        </button>
      </div>
    </div>
  );
}
