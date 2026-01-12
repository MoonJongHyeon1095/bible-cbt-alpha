import { Button } from "../../ui/button";

export function SubmitSection({
  customThoughtTrimmed,
  selectedThoughtIndex,
  canSubmit,
  onSubmit,
}: {
  customThoughtTrimmed: string;
  selectedThoughtIndex: number | null;
  canSubmit: boolean;
  onSubmit: () => void;
}) {
  if (customThoughtTrimmed) {
    return null;
  }

  if (selectedThoughtIndex === null || selectedThoughtIndex === 999) {
    return null;
  }

  return (
    <Button
      onClick={onSubmit}
      disabled={!canSubmit}
      className="w-full rounded-2xl bg-blue-600 text-base font-semibold shadow-md transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg disabled:opacity-60"
    >
      이 생각으로 진행
    </Button>
  );
}
