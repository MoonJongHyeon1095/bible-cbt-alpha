import { useEffect, useState } from "react";
import type { CbtMode } from "../../components/header/navigation/ModePicker";

const CBT_MODE_STORAGE_KEY = "cbt-mode";
const DEFAULT_MODE: CbtMode = {
  emotionDialMode: "emotion-dial-active",
  toneMode: "christian",
};

export function useModePreference() {
  const [mode, setMode] = useState<CbtMode>(DEFAULT_MODE);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CBT_MODE_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<CbtMode> & {
        detailMode?: "lite" | "deep";
      };
      const restored: CbtMode = {
        emotionDialMode:
          parsed.emotionDialMode ??
          (parsed.detailMode === "deep"
            ? "emotion-dial-active"
            : "emotion-dial-inactive"),
        toneMode: parsed.toneMode === "christian" ? "christian" : "normal",
      };
      setMode(restored);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CBT_MODE_STORAGE_KEY, JSON.stringify(mode));
    } catch {
      // ignore
    }
  }, [mode]);

  return { mode, setMode };
}
