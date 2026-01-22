type MinimalSavingModalProps = {
  open: boolean;
};

export function MinimalSavingModal({ open }: MinimalSavingModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#f7f3ee]/80 backdrop-blur-sm dark:bg-slate-900/70">
      <div className="mx-6 w-full max-w-xs rounded-2xl border border-white/60 bg-white/85 px-6 py-5 text-center shadow-lg dark:border-white/10 dark:bg-slate-900/80">
        <div className="mx-auto mb-3 size-10 rounded-full border-2 border-amber-600 border-t-transparent animate-spin dark:border-amber-300" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-100">
          세션이 만족스러우셨을지 모르겠습니다.
        </p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
          다만 우리는 진심으로, 당신의 평안을 바랍니다.
        </p>
      </div>
    </div>
  );
}
