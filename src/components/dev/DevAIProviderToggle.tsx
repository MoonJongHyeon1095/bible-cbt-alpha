// src/components/dev/DevAIProviderToggle.tsx
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  getDevAIProvider,
  setDevAIProvider,
  type Provider,
} from "../../lib/devAiProvider";

const LS_HIDE_KEY = "DEV_AI_TOGGLE"; // "0"이면 숨김

function isHiddenBySetting(): boolean {
  if (typeof window === "undefined") return true;

  const sp = new URLSearchParams(window.location.search);
  if (sp.get("devtoggle") === "0") return true;

  try {
    return window.localStorage.getItem(LS_HIDE_KEY) === "0";
  } catch {
    return false;
  }
}

export function DevAIProviderToggle() {
  const [mounted, setMounted] = useState(false);
  const [hidden, setHidden] = useState(true);
  const [provider, setProviderState] = useState<Provider>("gemini");

  useEffect(() => {
    setMounted(true);
    setHidden(isHiddenBySetting());

    try {
      setProviderState(getDevAIProvider());
    } catch {
      // ignore
    }
  }, []);

  const onChange = (p: Provider) => {
    setProviderState(p);
    try {
      setDevAIProvider(p);
    } catch {
      // ignore
    }
  };

  const hide = () => {
    try {
      window.localStorage.setItem(LS_HIDE_KEY, "0");
    } catch {
      // ignore
    }
    setHidden(true);
  };

  const show = () => {
    try {
      window.localStorage.removeItem(LS_HIDE_KEY);
    } catch {
      // ignore
    }
    setHidden(false);
  };

  if (!mounted || typeof document === "undefined") return null;

  if (hidden) {
    return createPortal(
      <button
        type="button"
        onClick={show}
        style={{
          position: "fixed",
          right: 12,
          bottom: 12,
          zIndex: 2147483647,
          pointerEvents: "auto",
        }}
        className="rounded-xl border bg-white px-3 py-2 shadow-lg text-xs text-slate-800 hover:bg-slate-50"
      >
        Show AI Toggle
      </button>,
      document.body
    );
  }

  return createPortal(
    <div
      style={{
        position: "fixed",
        right: 12,
        bottom: 12,
        zIndex: 2147483647,
        pointerEvents: "auto",
      }}
      className="rounded-xl border bg-white px-3 py-2 shadow-lg text-slate-900 select-none"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold">AI Provider</span>
        <button
          type="button"
          onClick={hide}
          className="text-[10px] rounded border px-1.5 py-0.5 bg-white hover:bg-slate-50"
          title={`Hide (localStorage "${LS_HIDE_KEY}" = "0")`}
        >
          hide
        </button>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          aria-pressed={provider === "gemini"}
          onClick={() => onChange("gemini")}
          className={
            "px-3 py-1.5 rounded-md border text-sm transition " +
            (provider === "gemini"
              ? "bg-slate-200 border-slate-900 font-semibold"
              : "bg-white border-slate-300 text-slate-700")
          }
        >
          Gemini
        </button>

        <button
          type="button"
          aria-pressed={provider === "openai"}
          onClick={() => onChange("openai")}
          className={
            "px-3 py-1.5 rounded-md border text-sm transition " +
            (provider === "openai"
              ? "bg-slate-200 border-slate-900 font-semibold"
              : "bg-white border-slate-300 text-slate-700")
          }
        >
          GPT
        </button>
      </div>

      <div className="mt-2 text-[10px] text-slate-500">
        z=2147483647 · ?devtoggle=0 to hide
      </div>
    </div>,
    document.body
  );
}
