import {
  Bookmark,
  Check,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { LoadingInsightCard } from "./LoadingInsightCard";
import type { EmotionData, EmotionNoteDetailWithNote } from "./types";

interface ThoughtSelectionCardProps {
  selectedEmotion: string;
  selectedEmotionData: EmotionData | null;
  loading: boolean;
  error: string | null;
  generatedThoughts: string[];
  selectedThoughtIndex: number | null;
  customThought: string;
  showFavorites: boolean;
  savedDetails: EmotionNoteDetailWithNote[];
  notesLoading: boolean;
  currentPrefetchKey: string | null;
  activeNoteTrigger?: string | null;
  showNoteScopeOnly?: boolean;
  onSelectThought: (index: number) => void;
  onRegenerate: () => void;
  onRetry: () => void;
  onAddFavorite: (thought: string) => void;
  onLoadFavorites: () => void;
  onCloseFavorites: () => void;
  onUseFavorite: (note: EmotionNoteDetailWithNote) => void;
  onRemoveFavorite: (id: string) => void;
  onCustomThoughtChange: (value: string) => void;
  onCustomThoughtSelect: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
}

export function ThoughtSelectionCard({
  selectedEmotion,
  selectedEmotionData,
  loading,
  error,
  generatedThoughts,
  selectedThoughtIndex,
  customThought,
  showFavorites,
  savedDetails,
  notesLoading,
  currentPrefetchKey,
  activeNoteTrigger,
  showNoteScopeOnly,
  onSelectThought,
  onRegenerate,
  onRetry,
  onAddFavorite,
  onLoadFavorites,
  onCloseFavorites,
  onUseFavorite,
  onRemoveFavorite,
  onCustomThoughtChange,
  onCustomThoughtSelect,
  onSubmit,
  canSubmit,
}: ThoughtSelectionCardProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-600">당신의 마음을 살펴보고 있습니다...</p>
        {selectedEmotionData ? (
          <LoadingInsightCard
            emotion={selectedEmotion}
            emotionData={selectedEmotionData}
          />
        ) : null}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
        <p className="mb-2">{error}</p>
        <Button onClick={onRetry} variant="outline" size="sm">
          다시 시도
        </Button>
      </div>
    );
  }

  if (!generatedThoughts.length) {
    return null;
  }

  return (
    <>
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <p className="text-slate-700">
          <strong>{selectedEmotion}</strong> 뒤에 숨어있을 수 있는 생각들입니다.{" "}
          <strong>가장 잘 맞는 것을 1개 골라주세요.</strong>
          <br />
          만약 없으면 <strong>다시 만들기</strong>를 누르시거나{" "}
          <strong>직접 적어주세요.</strong>
        </p>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={onRegenerate}
          variant="outline"
          size="sm"
          className="gap-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50"
          title={currentPrefetchKey ? `key: ${currentPrefetchKey}` : undefined}
        >
          <RefreshCw className="size-4" />
          다시 만들기
        </Button>
      </div>

      {!showFavorites ? (
        <Button
          onClick={onLoadFavorites}
          variant="outline"
          className="w-full gap-2 border-2 border-yellow-300 text-yellow-700 hover:bg-yellow-50"
        >
          <Bookmark className="size-4" />
          저장한 자동사고 불러오기
        </Button>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-yellow-50 p-3 rounded-lg border border-yellow-300">
            <div>
              <h3 className="text-yellow-900 font-semibold">
                저장한 자동사고 목록
              </h3>
              {showNoteScopeOnly && activeNoteTrigger ? (
                <p className="text-xs text-slate-600 mt-1">
                  트리거: {activeNoteTrigger}
                </p>
              ) : null}
            </div>
            <Button
              onClick={onCloseFavorites}
              variant="ghost"
              size="sm"
              className="text-yellow-700"
            >
              닫기
            </Button>
          </div>

          {notesLoading ? (
            <div className="flex items-center gap-2 text-slate-600 px-3 py-4">
              <Loader2 className="size-4 animate-spin text-yellow-600" />
              불러오는 중입니다...
            </div>
          ) : savedDetails.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Bookmark className="size-12 mx-auto mb-2 opacity-30" />
              <p>저장된 자동사고가 없습니다.</p>
              <p className="text-sm mt-1">마음에 드는 자동사고를 저장해보세요.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {savedDetails.map((fav) => (
                <div
                  key={fav.id}
                  className="bg-white p-3 rounded-lg border-2 border-yellow-200 hover:border-yellow-400 transition-all"
                >
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {fav.emotion || "감정"}
                    </span>
                    <span className="text-xs text-slate-400">
                      {fav.noteTitle || "저장된 상황"}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-slate-700 text-sm">{fav.automaticThought}</p>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {fav.noteTrigger}
                    </p>
                    <span className="block h-2" />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => onUseFavorite(fav)}
                      size="sm"
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      이 생각으로 진행하기
                    </Button>
                    <Button
                      onClick={() => onRemoveFavorite(fav.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                    >
                      삭제
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="space-y-3">
        {generatedThoughts.map((thought, index) => (
          <div key={index} className="flex items-start gap-2">
            <button
              onClick={() => onSelectThought(index)}
              className={`flex-1 text-left p-4 rounded-lg border-2 transition-all relative ${
                selectedThoughtIndex === index
                  ? "border-blue-600 bg-blue-50"
                  : "border-slate-200 hover:border-blue-300 bg-white"
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`flex-shrink-0 w-6 h-6 rounded-full text-white flex items-center justify-center text-sm ${
                    selectedThoughtIndex === index ? "bg-blue-600" : "bg-slate-400"
                  }`}
                >
                  {index + 1}
                </span>
                <p className="text-slate-800 flex-1">{thought}</p>
                {selectedThoughtIndex === index && (
                  <Check className="size-5 text-blue-600 flex-shrink-0" />
                )}
              </div>
            </button>

            <button
              onClick={() => onAddFavorite(thought)}
              className="p-3 rounded-lg border-2 border-yellow-300 hover:border-yellow-500 hover:bg-yellow-50 transition-all text-yellow-600 hover:text-yellow-700 flex-shrink-0"
              title="즐겨찾기에 추가"
            >
              <Bookmark className="size-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="border-t-2 border-slate-300 pt-4">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-200 mb-3">
          <p className="text-indigo-900 mb-2">✍️ 또는 당신의 생각을 직접 적어보세요</p>
          <p className="text-slate-600 text-sm">
            제안한 생각 중에 딱 맞는 것이 없다면, 당신의 진짜 생각을 그대로 적어주세요.
          </p>
        </div>

        <Textarea
          value={customThought}
          onChange={(e) => onCustomThoughtChange(e.target.value)}
          placeholder="예: 나는 이렇게 하면 안 된다고 생각해..."
          className="min-h-[80px] resize-none"
        />

        {customThought.trim() && (
          <div className="flex items-center justify-between mt-2">
            <Button
              onClick={() => onAddFavorite(customThought.trim())}
              variant="outline"
              size="sm"
              className="gap-2 border-yellow-300 text-yellow-700 hover:bg-yellow-50"
            >
              <Bookmark className="size-4" />
              감정 노트에 저장
            </Button>
          </div>
        )}

        {customThought.trim() && (
          <Button
            onClick={onCustomThoughtSelect}
            className={`w-full mt-3 ${
              selectedThoughtIndex === 999
                ? "bg-purple-600 hover:bg-purple-700"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {selectedThoughtIndex === 999 && <Check className="size-4 mr-2" />}
            이 생각 선택하기
          </Button>
        )}
      </div>

      <Button
        onClick={onSubmit}
        disabled={!canSubmit}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        다음 단계로 이동
      </Button>
    </>
  );
}
