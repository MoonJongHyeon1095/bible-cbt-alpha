import type { PatternAlternative } from "../../types";
import { PatternAlternativesCard } from "../PatternAlternativesCard";

interface PatternAlternativesSectionProps {
  alternatives: PatternAlternative[];
  onUpdateAlternative: (alternative: PatternAlternative) => Promise<void>;
  onDeleteAlternative: (id: string) => Promise<void>;
}

export function PatternAlternativesSection({
  alternatives,
  onUpdateAlternative,
  onDeleteAlternative,
}: PatternAlternativesSectionProps) {
  return (
    <PatternAlternativesCard
      alternatives={alternatives}
      onUpdateAlternative={onUpdateAlternative}
      onDeleteAlternative={onDeleteAlternative}
    />
  );
}
