interface MinimalAutoThoughtHeaderSectionProps {
  emotion: string;
  error?: string | null;
  onReload: () => void;
}

export function MinimalAutoThoughtHeaderSection({
  emotion,
  error,
  onReload,
}: MinimalAutoThoughtHeaderSectionProps) {
  return (
    <div className="space-y-3">
      <h1 className="text-3xl sm:text-4xl font-serif font-semibold leading-tight text-slate-900">
        {emotion} 뒤에 숨어있는
        <span className="hidden sm:inline"> </span>
        <br className="sm:hidden" />
        생각을 찾아볼게요.
      </h1>
      {error && (
        <div className="text-sm text-slate-500">
          {error}{" "}
          <button
            type="button"
            onClick={onReload}
            className="underline underline-offset-4 hover:text-slate-700"
          >
            다시 불러오기
          </button>
        </div>
      )}
    </div>
  );
}
