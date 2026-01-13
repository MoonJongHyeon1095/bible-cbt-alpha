import type { PatternErrorDetail } from "../../types";
import { PatternErrorDetailsCard } from "../PatternErrorDetailsCard";

interface PatternErrorSectionProps {
  errorDetails: PatternErrorDetail[];
  onUpdateError: (detail: PatternErrorDetail) => Promise<void>;
  onDeleteError: (id: string) => Promise<void>;
}

export function PatternErrorSection({
  errorDetails,
  onUpdateError,
  onDeleteError,
}: PatternErrorSectionProps) {
  return (
    <PatternErrorDetailsCard
      errorDetails={errorDetails}
      onUpdateError={onUpdateError}
      onDeleteError={onDeleteError}
    />
  );
}
