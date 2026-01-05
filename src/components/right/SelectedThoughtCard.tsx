interface SelectedThoughtCardProps {
  thought: string;
  className?: string;
}

export function SelectedThoughtCard({
  thought,
  className = "",
}: SelectedThoughtCardProps) {
  return (
    <div
      className={`bg-purple-50 p-4 rounded-lg border-2 border-purple-300 ${className}`}
    >
      <p className="text-purple-900 mb-2">✓ 선택한 대안사고:</p>
      <p className="text-slate-800 italic">"{thought}"</p>
    </div>
  );
}
