import type { EmotionThoughtPair } from "../../../types";
import type { SelectedCognitiveError } from "../../../types/sessionHistory";
import { AlertCircle, Brain, Flag } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../ui/accordion";

export function ProgressSummaryCard({
  userInput,
  emotionThoughtPairs,
  selectedCognitiveErrors,
}: {
  userInput: string;
  emotionThoughtPairs: EmotionThoughtPair[];
  selectedCognitiveErrors: SelectedCognitiveError[];
}) {
  const hasUserInput = userInput.trim().length > 0;
  const hasPairs = emotionThoughtPairs.length > 0;
  const hasErrors = selectedCognitiveErrors.length > 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-slate-800 text-base font-semibold">
          지금까지 진행한 내용
        </p>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
          요약
        </span>
      </div>
      <Accordion type="multiple" className="w-full space-y-2">
        <AccordionItem
          value="trigger"
          className="rounded-xl border border-slate-200/80 bg-slate-50/40 px-3"
        >
          <AccordionTrigger className="text-slate-700 rounded-lg px-2 py-2 transition hover:bg-slate-100/70">
            <span className="inline-flex items-center gap-2">
              <Flag className="size-4 text-slate-400" />
              트리거 텍스트
            </span>
          </AccordionTrigger>
          <AccordionContent className="text-slate-700 px-2 pb-3">
            {hasUserInput ? (
              <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm whitespace-pre-wrap">
                {userInput}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">
                입력된 트리거가 없습니다.
              </p>
            )}
          </AccordionContent>
        </AccordionItem>
        <AccordionItem
          value="auto-thoughts"
          className="rounded-xl border border-slate-200/80 bg-slate-50/40 px-3"
        >
          <AccordionTrigger className="text-slate-700 rounded-lg px-2 py-2 transition hover:bg-slate-100/70">
            <span className="inline-flex items-center gap-2">
              <Brain className="size-4 text-slate-400" />
              자동사고
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-2 pb-3">
            {hasPairs ? (
              <div className="space-y-2">
                {emotionThoughtPairs.map((pair, index) => (
                  <div
                    key={`${pair.emotion}-${index}`}
                    className="rounded-lg border border-slate-200 bg-white p-3"
                  >
                    <p className="text-xs text-slate-500 mb-1">
                      {pair.emotion}
                    </p>
                    <p className="text-slate-700 text-sm whitespace-pre-wrap">
                      "{pair.thought}"
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">자동사고가 없습니다.</p>
            )}
          </AccordionContent>
        </AccordionItem>
        <AccordionItem
          value="cognitive-errors"
          className="rounded-xl border border-slate-200/80 bg-slate-50/40 px-3"
        >
          <AccordionTrigger className="text-slate-700 rounded-lg px-2 py-2 transition hover:bg-slate-100/70">
            <span className="inline-flex items-center gap-2">
              <AlertCircle className="size-4 text-amber-500" />
              선택한 인지오류
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-2 pb-3">
            {hasErrors ? (
              <div className="space-y-2">
                {selectedCognitiveErrors.map((error, index) => (
                  <div
                    key={`${error.title}-${index}`}
                    className="rounded-lg border border-amber-200/80 bg-amber-50/60 p-3"
                  >
                    <p className="text-slate-800 font-medium mb-1">
                      {error.title}
                    </p>
                    <p className="text-slate-600 text-sm whitespace-pre-wrap">
                      {error.detail?.trim().length
                        ? error.detail
                        : "설명 텍스트가 없습니다."}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">
                선택된 인지오류가 없습니다.
              </p>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
