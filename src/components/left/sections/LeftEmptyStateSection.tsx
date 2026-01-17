interface LeftEmptyStateSectionProps {
  message: string;
}

export function LeftEmptyStateSection({
  message,
}: LeftEmptyStateSectionProps) {
  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-slate-500">{message}</p>
    </div>
  );
}
