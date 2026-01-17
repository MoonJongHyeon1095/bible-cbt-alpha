import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { generateExtendedAutomaticThoughts } from "../../../lib/ai";
import { validateUserText } from "../../../utils/validation";
import { MinimalFloatingNextButton } from "../../common/MinimalFloatingNextButton";

interface MinimalAutoThoughtStepProps {
  userInput: string;
  emotion: string;
  wantsCustom: boolean;
  onWantsCustomChange: (next: boolean) => void;
  onSubmitThought: (thought: string) => void;
}

type AutoThoughtCacheEntry = {
  thoughts: string[];
  index: number;
  hasShownCustomPrompt: boolean;
};

const autoThoughtCache = new Map<string, AutoThoughtCacheEntry>();
const AUTO_THOUGHT_STORAGE_PREFIX = "minimal-auto-thoughts:";

export function MinimalAutoThoughtStep({
  userInput,
  emotion,
  wantsCustom,
  onWantsCustomChange,
  onSubmitThought,
}: MinimalAutoThoughtStepProps) {
  const [thoughts, setThoughts] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasShownCustomPrompt, setHasShownCustomPrompt] = useState(false);
  const [customThought, setCustomThought] = useState("");
  const shouldShowCustom = hasShownCustomPrompt;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const customTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const cacheKey = useMemo(
    () => `${emotion}::${userInput.trim()}`,
    [emotion, userInput]
  );

  useLayoutEffect(() => {
    const el = customTextareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [customThought, shouldShowCustom]);

  const resetSelection = () => {
    onWantsCustomChange(false);
    setCustomThought("");
  };

  const loadThoughts = async () => {
    if (!userInput.trim() || !emotion) return;
    setLoading(true);
    setError(null);
    resetSelection();
    try {
      const result = await generateExtendedAutomaticThoughts(
        userInput,
        emotion,
      );
      const nextThoughts = result.sdtThoughts.map((item) => item.thought);
      setThoughts(nextThoughts);
      setCurrentIndex(0);
      onWantsCustomChange(false);
      autoThoughtCache.set(cacheKey, {
        thoughts: nextThoughts,
        index: 0,
        hasShownCustomPrompt: false,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userInput.trim() || !emotion) return;
    const cached = autoThoughtCache.get(cacheKey);
    if (cached) {
      setThoughts(cached.thoughts);
      setCurrentIndex(cached.index);
      setHasShownCustomPrompt(cached.hasShownCustomPrompt);
      setLoading(false);
      setError(null);
      return;
    }
    if (typeof window !== "undefined") {
      try {
        const raw = sessionStorage.getItem(
          `${AUTO_THOUGHT_STORAGE_PREFIX}${cacheKey}`
        );
        if (raw) {
          const parsed = JSON.parse(raw) as AutoThoughtCacheEntry;
          if (parsed?.thoughts?.length) {
            setThoughts(parsed.thoughts);
            setCurrentIndex(parsed.index ?? 0);
            setHasShownCustomPrompt(Boolean(parsed.hasShownCustomPrompt));
            setLoading(false);
            setError(null);
            autoThoughtCache.set(cacheKey, parsed);
            return;
          }
        }
      } catch {
        // ignore cache read errors
      }
    }
    setHasShownCustomPrompt(false);
    onWantsCustomChange(false);
    void loadThoughts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, emotion, userInput]);

  const currentThought = useMemo(() => {
    return thoughts[currentIndex] ?? "";
  }, [currentIndex, thoughts]);

  useEffect(() => {
    if (currentIndex >= 2) {
      setHasShownCustomPrompt(true);
    }
  }, [currentIndex]);

  useEffect(() => {
    if (!cacheKey || thoughts.length === 0) return;
    const entry = {
      thoughts,
      index: currentIndex,
      hasShownCustomPrompt,
    };
    autoThoughtCache.set(cacheKey, entry);
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(
          `${AUTO_THOUGHT_STORAGE_PREFIX}${cacheKey}`,
          JSON.stringify(entry)
        );
      } catch {
        // ignore cache write errors
      }
    }
  }, [cacheKey, currentIndex, hasShownCustomPrompt, thoughts]);

  const handleNextThought = () => {
    if (currentIndex < thoughts.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      resetSelection();
      return;
    }
    void loadThoughts();
  };

  const handleCustomChange = (value: string) => {
    setCustomThought(value);
  };

  const handleSubmit = () => {
    if (wantsCustom) {
      const validation = validateUserText(customThought, {
        minLength: 10,
        minLengthMessage: "직접 입력한 생각을 10자 이상 적어주세요.",
      });
      if (!validation.ok) {
        toast.error(validation.message);
        return;
      }
      onSubmitThought(customThought.trim());
      return;
    }

    if (!currentThought) {
      toast.error("생각을 불러오는 중입니다.");
      return;
    }

    onSubmitThought(currentThought);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 pt-12 pb-10">
      <div className="w-full max-w-xl space-y-8">
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-serif font-semibold leading-tight text-slate-900">
            {emotion} 뒤에 숨어있는
            <span className="hidden sm:inline"> </span>
            <br className="sm:hidden" />
            생각을 찾아볼게요.
          </h1>
          {error && (
            <div className="text-sm text-slate-500">
              {error}{" "}
              <button
                type="button"
                onClick={() => void loadThoughts()}
                className="underline underline-offset-4 hover:text-slate-700"
              >
                다시 불러오기
              </button>
            </div>
          )}
        </div>

        <div className="min-h-[72px] flex items-center">
          {wantsCustom ? (
            <div
              className={`${
                customThought.trim() ? "is-filled" : ""
              } minimal-idle-caret-wrap w-full`}
            >
              <textarea
                ref={customTextareaRef}
                value={customThought}
                onChange={(event) => handleCustomChange(event.target.value)}
                rows={1}
                placeholder="예: 나는 항상 실수만 하는 사람 같아."
                className="w-full resize-none rounded-3xl border-0 bg-transparent px-1 py-2 text-base sm:text-lg text-slate-800 outline-none focus:ring-0"
              />
            </div>
          ) : loading ? (
            <div className="w-full flex flex-col items-center justify-center gap-3 text-sm text-slate-500">
              <div className="size-4 rounded-full border-2 border-slate-300 border-t-transparent animate-spin" />
              <span>생각을 정리하고 있어요.</span>
            </div>
          ) : (
            <p className="w-full px-1 py-2 text-left font-serif text-lg sm:text-xl leading-relaxed text-slate-800">
              {currentThought || "생각을 불러오는 중입니다."}
            </p>
          )}
        </div>

        {wantsCustom ? (
          <div className="space-y-2 pt-4">
            <p className="text-base sm:text-lg font-medium text-slate-800">
              당신의 생각을 직접 적어보세요
            </p>
            <p className="text-sm text-slate-500">
              솔직한 문장이 가장 좋은 출발점입니다.
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleNextThought}
              aria-label="다른 생각 보기"
              disabled={loading}
              className={`inline-flex size-8 items-center justify-center text-slate-500 transition active:scale-95 ${
                loading
                  ? "opacity-40 cursor-not-allowed"
                  : "hover:text-slate-900"
              }`}
            >
              <RefreshCw className="size-5" strokeWidth={2.5} />
            </button>

            {shouldShowCustom && !wantsCustom && (
              <button
                type="button"
                onClick={() => onWantsCustomChange(true)}
                className="inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900 hover:shadow-md"
              >
                직접 입력
              </button>
            )}
          </div>
        )}

        <MinimalFloatingNextButton onClick={handleSubmit} />
      </div>
    </div>
  );
}
