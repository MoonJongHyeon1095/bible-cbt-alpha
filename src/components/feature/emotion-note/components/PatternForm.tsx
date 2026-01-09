import {
  AlertCircle,
  Brain,
  Footprints,
  Lightbulb,
  Save,
  X,
} from "lucide-react";
import type { Pattern, PatternAlternative, PatternDetail } from "../types";
import { EMOTIONS } from "../../../center/constants/emotions";
import { Button } from "../../../ui/button";
import { Card } from "../../../ui/card";
import { Input } from "../../../ui/input";
import { Textarea } from "../../../ui/textarea";
import { PatternAlternativesCard } from "../PatternAlternativesCard";
import { PatternDetailsCard } from "../PatternDetailsCard";

interface EmotionSelectorProps {
  value: string;
  onSelect: (next: string) => void;
}

const EmotionSelector = ({ value, onSelect }: EmotionSelectorProps) => {
  const emotionOptions = EMOTIONS.map((e) => e.label);
  return (
    <div className="flex flex-wrap gap-2">
      {emotionOptions.map((label) => {
        const active = value === label;
        return (
          <button
            key={label}
            type="button"
            onClick={() => onSelect(label)}
            className={`px-3 py-1 text-xs rounded-full border transition ${
              active
                ? "bg-blue-600 text-white border-blue-600 shadow"
                : "bg-white text-slate-700 border-slate-200 hover:border-blue-400"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};

interface PatternFormProps {
  isCreating: boolean;
  editingId: string | null;
  title: string;
  trigger: string;
  behavior: string;
  automaticThought: string;
  emotion: string;
  alternativeText: string;
  loading: boolean;
  showDetailEditor: boolean;
  showAlternativeEditor: boolean;
  titleRef: React.RefObject<HTMLInputElement | null>;
  onChangeTitle: (value: string) => void;
  onChangeTrigger: (value: string) => void;
  onChangeBehavior: (value: string) => void;
  onChangeAutomaticThought: (value: string) => void;
  onSelectEmotion: (value: string) => void;
  onChangeAlternativeText: (value: string) => void;
  onToggleDetailEditor: () => void;
  onToggleAlternativeEditor: () => void;
  onSave: () => void;
  onCancel: () => void;
  onAddDetail: () => void;
  onAddAlternative: () => void;
  patterns: Pattern[];
  onDetailUpdate: (detail: PatternDetail) => Promise<void>;
  onDetailDelete: (id: string) => Promise<void>;
  onAlternativeUpdate: (alternative: PatternAlternative) => Promise<void>;
  onAlternativeDelete: (id: string) => Promise<void>;
}

export function PatternForm({
  isCreating,
  editingId,
  title,
  trigger,
  behavior,
  automaticThought,
  emotion,
  alternativeText,
  loading,
  showDetailEditor,
  showAlternativeEditor,
  titleRef,
  onChangeTitle,
  onChangeTrigger,
  onChangeBehavior,
  onChangeAutomaticThought,
  onSelectEmotion,
  onChangeAlternativeText,
  onToggleDetailEditor,
  onToggleAlternativeEditor,
  onSave,
  onCancel,
  onAddDetail,
  onAddAlternative,
  patterns,
  onDetailUpdate,
  onDetailDelete,
  onAlternativeUpdate,
  onAlternativeDelete,
}: PatternFormProps) {
  if (!isCreating) return null;

  const currentDetails =
    patterns.find((p) => p.id === editingId)?.details ?? [];
  const currentAlternatives =
    patterns.find((p) => p.id === editingId)?.alternatives ?? [];

  return (
    <Card className="p-6 mb-6 bg-indigo-50 border-2 border-indigo-200">
      <div className="flex items-start justify-between mb-4 gap-4">
        <h3 className="text-lg text-slate-900">
          {editingId ? "감정패턴 수정" : "추가"}
        </h3>
        <div className="flex gap-2">
          <Button
            onClick={onSave}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Save className="size-4 mr-2" />
            {editingId ? "수정 완료" : "저장"}
          </Button>
          <Button onClick={onCancel} variant="outline">
            <X className="size-4 mr-2" />
            취소
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-sm text-slate-700 mb-2 block flex items-center gap-2">
            <AlertCircle className="size-4" />
            감정패턴 제목
          </label>
          <Input
            ref={titleRef}
            value={title}
            onChange={(e) => onChangeTitle(e.target.value)}
            placeholder="예: 사람들 앞에서 발표할 때"
            className="border-indigo-200"
          />
        </div>

        <div>
          <label className="text-sm text-slate-700 mb-2 flex items-center gap-2">
            <AlertCircle className="size-4" />
            트리거 (촉발 상황)
          </label>
          <Input
            value={trigger}
            onChange={(e) => onChangeTrigger(e.target.value)}
            placeholder="어떤 상황에서 이 패턴이 나타나나요?"
            className="border-indigo-200"
          />
        </div>

        <div>
          <label className="text-sm text-slate-700 mb-2 flex items-center gap-2">
            <Footprints className="size-4" />
            행동 반응
          </label>
          <Textarea
            value={behavior}
            onChange={(e) => onChangeBehavior(e.target.value)}
            placeholder="그 감정 때문에 어떻게 행동하나요?"
            className="min-h-[80px] border-indigo-200"
          />
        </div>

        {editingId ? (
          <div className="space-y-4">
            <div className="border border-slate-200 rounded-lg bg-white">
              <button
                type="button"
                onClick={onToggleDetailEditor}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-slate-800"
              >
                <span className="flex items-center gap-2">
                  <Brain className="size-4" />
                  배후의 자동 사고 편집
                </span>
                <span className="text-xs text-slate-500">
                  {showDetailEditor ? "접기" : "펼치기"}
                </span>
              </button>
              {showDetailEditor && (
                <div className="border-t border-slate-200 p-4 space-y-3">
                  <div className="border border-slate-200 rounded-lg p-4 space-y-3 bg-slate-50">
                    <div className="flex items-center justify-between gap-2 text-sm text-slate-700">
                      <div className="flex items-center gap-2">
                        💭 새로운 자동사고 추가
                      </div>
                      <Button
                        size="sm"
                        onClick={onAddDetail}
                        disabled={!emotion.trim() || !automaticThought.trim()}
                        className="bg-yellow-500 text-slate-900 hover:bg-yellow-600"
                      >
                        <Save className="size-4 mr-1" />
                        자동사고 저장
                      </Button>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-2">감정 선택</p>
                      <EmotionSelector value={emotion} onSelect={onSelectEmotion} />
                    </div>
                    <Textarea
                      value={automaticThought}
                      onChange={(e) => onChangeAutomaticThought(e.target.value)}
                      placeholder="자동적으로 떠오르는 생각을 적어주세요."
                      className="min-h-[80px] border-indigo-200 bg-white"
                    />
                  </div>

                  <PatternDetailsCard
                    details={currentDetails}
                    onUpdateDetail={onDetailUpdate}
                    onDeleteDetail={onDetailDelete}
                  />
                </div>
              )}
            </div>

            <div className="border border-green-200 rounded-lg bg-white">
              <button
                type="button"
                onClick={onToggleAlternativeEditor}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-slate-800"
              >
                <span className="flex items-center gap-2">
                  <Lightbulb className="size-4" />
                  저장된 대안사고 편집
                </span>
                <span className="text-xs text-slate-500">
                  {showAlternativeEditor ? "접기" : "펼치기"}
                </span>
              </button>
              {showAlternativeEditor && (
                <div className="border-t border-green-200 p-4 space-y-3 bg-green-50">
                  <div className="border border-slate-200 rounded-lg p-4 space-y-3 bg-slate-50">
                    <div className="flex items-center justify-between gap-2 text-sm text-slate-700">
                      <div className="flex items-center gap-2">
                        💡 대안 사고 추가 (선택)
                      </div>
                      <Button
                        size="sm"
                        onClick={onAddAlternative}
                        disabled={!alternativeText.trim()}
                        className="bg-green-500 text-slate-900 hover:bg-green-600"
                      >
                        <Save className="size-4 mr-1" />
                        대안 사고 저장
                      </Button>
                    </div>
                    <Textarea
                      value={alternativeText}
                      onChange={(e) => onChangeAlternativeText(e.target.value)}
                      placeholder="대안적 사고를 적어주세요."
                      className="min-h-[80px] border-green-200"
                    />
                  </div>

                  <PatternAlternativesCard
                    alternatives={currentAlternatives}
                    onUpdateAlternative={onAlternativeUpdate}
                    onDeleteAlternative={onAlternativeDelete}
                  />
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
