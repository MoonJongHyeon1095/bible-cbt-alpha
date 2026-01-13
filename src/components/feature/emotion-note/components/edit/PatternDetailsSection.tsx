import type { PatternDetail } from "../../types";
import { PatternDetailsCard } from "../PatternDetailsCard";

interface PatternDetailsSectionProps {
  details: PatternDetail[];
  onUpdateDetail: (detail: PatternDetail) => Promise<void>;
  onDeleteDetail: (id: string) => Promise<void>;
}

export function PatternDetailsSection({
  details,
  onUpdateDetail,
  onDeleteDetail,
}: PatternDetailsSectionProps) {
  return (
    <PatternDetailsCard
      details={details}
      onUpdateDetail={onUpdateDetail}
      onDeleteDetail={onDeleteDetail}
    />
  );
}
