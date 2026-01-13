import type { PatternBehaviorDetail } from "../../types";
import { PatternBehaviorDetailsCard } from "../PatternBehaviorDetailsCard";

interface PatternBehaviorSectionProps {
  behaviorDetails: PatternBehaviorDetail[];
  onUpdateBehavior: (detail: PatternBehaviorDetail) => Promise<void>;
  onDeleteBehavior: (id: string) => Promise<void>;
}

export function PatternBehaviorSection({
  behaviorDetails,
  onUpdateBehavior,
  onDeleteBehavior,
}: PatternBehaviorSectionProps) {
  return (
    <PatternBehaviorDetailsCard
      behaviorDetails={behaviorDetails}
      onUpdateBehavior={onUpdateBehavior}
      onDeleteBehavior={onDeleteBehavior}
    />
  );
}
