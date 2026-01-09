import type { EmotionThoughtPair } from "../../types";
import type { SelectedCognitiveError } from "../../types/sessionHistory";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

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
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-slate-700 text-sm font-semibold mb-2">
        지금까지 진행한 내용
      </p>
      <Accordion type="multiple" className="w-full">
        <AccordionItem value="trigger">
          <AccordionTrigger className="text-slate-700">
            트리거 텍스트
          </AccordionTrigger>
          <AccordionContent className="text-slate-700">
            {hasUserInput ? (
              <p className="whitespace-pre-wrap">{userInput}</p>
            ) : (
              <p className="text-slate-500">입력된 트리거가 없습니다.</p>
            )}
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="auto-thoughts">
          <AccordionTrigger className="text-slate-700">
            자동사고
          </AccordionTrigger>
          <AccordionContent>
            {hasPairs ? (
              <div className="space-y-2">
                {emotionThoughtPairs.map((pair, index) => (
                  <div
                    key={`${pair.emotion}-${index}`}
                    className="rounded-md border border-slate-200 bg-slate-50 p-3"
                  >
                    <p className="text-xs text-slate-500 mb-1">
                      {pair.emotion}
                    </p>
                    <p className="text-slate-700 whitespace-pre-wrap">
                      "{pair.thought}"
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500">자동사고가 없습니다.</p>
            )}
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="cognitive-errors">
          <AccordionTrigger className="text-slate-700">
            선택한 인지오류
          </AccordionTrigger>
          <AccordionContent>
            {hasErrors ? (
              <div className="space-y-2">
                {selectedCognitiveErrors.map((error, index) => (
                  <div
                    key={`${error.title}-${index}`}
                    className="rounded-md border border-amber-200 bg-amber-50/60 p-3"
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
              <p className="text-slate-500">선택된 인지오류가 없습니다.</p>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
