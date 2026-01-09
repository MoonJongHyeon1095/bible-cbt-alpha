export function ShalomCard({
  className = "text-blue-900 mb-3",
}: {
  className?: string;
}) {
  return (
    <p className={className}>
      세션이 만족스러우셨을지 모르겠습니다. 다만 우리는 진심으로, 당신의 평안을
      바랍니다.
    </p>
  );
}
