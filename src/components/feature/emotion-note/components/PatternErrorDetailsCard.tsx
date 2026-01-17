import { AlertCircle, Info, Loader2, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { validateUserText } from "../../../../utils/validation";
import { Button } from "../../../ui/button";
import { Textarea } from "../../../ui/textarea";
import type { PatternErrorDetail } from "../types";
import {
  CognitiveErrorInfoPopover,
  getCognitiveErrorMeta,
} from "./pop-over/InfoPopovers";

type ErrorEditor = PatternErrorDetail;

interface PatternErrorDetailsCardProps {
  errorDetails: PatternErrorDetail[];
  onUpdateError: (detail: ErrorEditor) => Promise<void>;
  onDeleteError: (id: string) => Promise<void>;
}

export function PatternErrorDetailsCard({
  errorDetails,
  onUpdateError,
  onDeleteError,
}: PatternErrorDetailsCardProps) {
  const [editing, setEditing] = useState<Record<string, ErrorEditor>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setEditing(Object.fromEntries(errorDetails.map((e) => [e.id, { ...e }])));
  }, [errorDetails]);

  const handleChange = (
    id: string,
    field: keyof ErrorEditor,
    value: string,
  ) => {
    setEditing((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] ??
          errorDetails.find((d) => d.id === id) ?? {
            id,
            noteId: "",
            errorLabel: "",
            errorDescription: "",
            createdAt: "",
          }),
        [field]: value,
      },
    }));
  };

  const handleSave = async (id: string) => {
    const detail = editing[id];
    if (!detail) return;
    if (!detail.errorLabel.trim() && !detail.errorDescription.trim()) {
      toast.error("인지오류 내용을 입력해주세요.");
      return;
    }
    if (!detail.errorDescription.trim()) {
      toast.error("인지오류 설명을 입력해주세요.");
      return;
    }
    const validation = validateUserText(detail.errorDescription, {
      minLength: 10,
      minLengthMessage: "인지오류 설명을 10자 이상 입력해주세요.",
    });
    if (!validation.ok) {
      toast.error(validation.message);
      return;
    }
    setSavingId(id);
    try {
      await onUpdateError(detail);
      toast.success("저장되었습니다.");
    } catch (e) {
      console.error(e);
      toast.error("저장에 실패했습니다.");
    } finally {
      setSavingId(null);
    }
  };

  const hasChanges = (id: string) => {
    const original = errorDetails.find((e) => e.id === id);
    const current = editing[id];
    if (!original || !current) return false;
    return (
      (current.errorDescription ?? "") !== (original.errorDescription ?? "")
    );
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDeleteError(id);
      toast.success("삭제되었습니다.");
      setEditing((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch (e) {
      console.error(e);
      toast.error("삭제에 실패했습니다.");
    } finally {
      setDeletingId(null);
    }
  };

  if (errorDetails.length === 0) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-rose-900">
          <AlertCircle className="size-4" />
          인지오류
        </div>
        <p className="mt-2 text-sm text-rose-800">
          아직 저장된 인지오류가 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {errorDetails.map((detail, idx) => {
        const current = editing[detail.id] ?? detail;
        return (
          <div
            key={detail.id}
            className="rounded-xl border border-rose-200 bg-rose-50 p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="inline-flex items-center gap-1 text-sm font-semibold text-rose-900">
                <AlertCircle className="size-3" />
                인지오류 #{idx + 1}
              </div>
              <div className="flex gap-2">
                {hasChanges(detail.id) && (
                  <Button
                    size="sm"
                    onClick={() => handleSave(detail.id)}
                    disabled={savingId === detail.id}
                    className="bg-rose-600 hover:bg-rose-700"
                  >
                    {savingId === detail.id ? (
                      <Loader2 className="size-4 mr-1 animate-spin" />
                    ) : (
                      <Save className="size-4 mr-1" />
                    )}
                    {savingId === detail.id ? "저장 중" : "저장"}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(detail.id)}
                  disabled={deletingId === detail.id}
                  className="text-red-600 hover:bg-red-50"
                >
                  {deletingId === detail.id ? (
                    <Loader2 className="size-4 mr-1 animate-spin" />
                  ) : (
                    <Trash2 className="size-4 mr-1" />
                  )}
                  삭제
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="text-sm font-semibold text-rose-900">
                  {current.errorLabel || "인지오류"}
                </div>
                {getCognitiveErrorMeta(current.errorLabel) && (
                  <CognitiveErrorInfoPopover
                    errorLabel={current.errorLabel}
                    align="end"
                  >
                    <button
                      type="button"
                      className="rounded-full p-1 text-rose-500 hover:bg-rose-100"
                      aria-label={`${current.errorLabel} 설명 보기`}
                    >
                      <Info className="size-4" />
                    </button>
                  </CognitiveErrorInfoPopover>
                )}
              </div>
              <Textarea
                value={current.errorDescription}
                onChange={(e) =>
                  handleChange(detail.id, "errorDescription", e.target.value)
                }
                className="min-h-[120px] border-rose-200 bg-white/95 px-3 py-2 text-[16px] leading-[1.85]"
                placeholder="인지오류 설명"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
