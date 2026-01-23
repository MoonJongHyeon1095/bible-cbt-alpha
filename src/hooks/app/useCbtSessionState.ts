import { useState } from "react";

export function useCbtSessionState() {
  const [cbtStep, setCbtStep] = useState(1);
  const [cbtResetKey, setCbtResetKey] = useState(0);
  const [cbtSessionKind, setCbtSessionKind] = useState<"minimal" | "cbt">(
    "minimal"
  );

  const bumpCbtResetKey = () => {
    setCbtResetKey((prev) => prev + 1);
  };

  return {
    bumpCbtResetKey,
    cbtResetKey,
    cbtSessionKind,
    cbtStep,
    setCbtSessionKind,
    setCbtStep,
  };
}
