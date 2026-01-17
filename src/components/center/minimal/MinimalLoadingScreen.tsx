interface MinimalLoadingScreenProps {
  message: string;
}

export function MinimalLoadingScreen({ message }: MinimalLoadingScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md text-center space-y-4">
        <div className="mx-auto size-12 rounded-full border-2 border-slate-300 border-t-transparent animate-spin" />
        <p className="text-sm sm:text-base text-slate-500">{message}</p>
      </div>
    </div>
  );
}
