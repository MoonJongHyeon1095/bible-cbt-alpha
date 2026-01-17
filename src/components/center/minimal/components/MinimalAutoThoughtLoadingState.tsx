interface MinimalAutoThoughtLoadingStateProps {
  message: string;
}

export function MinimalAutoThoughtLoadingState({
  message,
}: MinimalAutoThoughtLoadingStateProps) {
  return (
    <div className="w-full flex flex-col items-center justify-center gap-3 text-sm text-slate-500">
      <div className="size-4 rounded-full border-2 border-slate-300 border-t-transparent animate-spin" />
      <span>{message}</span>
    </div>
  );
}
