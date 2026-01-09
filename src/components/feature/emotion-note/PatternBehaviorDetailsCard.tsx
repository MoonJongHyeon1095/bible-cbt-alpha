import { Footprints, Loader2, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";
import type { PatternBehaviorDetail } from "./types";

type BehaviorEditor = PatternBehaviorDetail;

interface PatternBehaviorDetailsCardProps {
  behaviorDetails: PatternBehaviorDetail[];
  onUpdateBehavior: (detail: PatternBehaviorDetail) => Promise<void>;
  onDeleteBehavior: (id: string) => Promise<void>;
}

export function PatternBehaviorDetailsCard({
  behaviorDetails,
  onUpdateBehavior,
  onDeleteBehavior,
}: PatternBehaviorDetailsCardProps) {
  const [editing, setEditing] = useState<Record<string, BehaviorEditor>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setEditing(
      Object.fromEntries(
        behaviorDetails.map((b) => [b.id, { ...b }])
      )
    );
  }, [behaviorDetails]);

  const handleChange = (
    id: string,
    field: keyof BehaviorEditor,
    value: string
  ) => {
    setEditing((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] ??
          behaviorDetails.find((d) => d.id === id) ?? {
            id,
            noteId: "",
            behaviorLabel: "",
            behaviorDescription: "",
            errorTags: [],
            createdAt: "",
          }),
        [field]: value,
      },
    }));
  };

  const handleSave = async (id: string) => {
    const detail = editing[id];
    if (!detail) return;
    if (!detail.behaviorLabel.trim() && !detail.behaviorDescription.trim()) {
      toast.error("행동 반응을 입력해주세요.");
      return;
    }
    setSavingId(id);
    try {
      await onUpdateBehavior({
        id: detail.id,
        noteId: detail.noteId,
        behaviorLabel: detail.behaviorLabel,
        behaviorDescription: detail.behaviorDescription,
        errorTags: detail.errorTags ?? [],
        createdAt: detail.createdAt,
      });
      toast.success("저장되었습니다.");
    } catch (e) {
      console.error(e);
      toast.error("저장에 실패했습니다.");
    } finally {
      setSavingId(null);
    }
  };

  const hasChanges = (id: string) => {
    const original = behaviorDetails.find((e) => e.id === id);
    const current = editing[id];
    if (!original || !current) return false;
    return (
      (current.behaviorLabel ?? "") !== (original.behaviorLabel ?? "") ||
      (current.behaviorDescription ?? "") !==
        (original.behaviorDescription ?? "")
    );
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDeleteBehavior(id);
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

  if (behaviorDetails.length === 0) {
    return (
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-blue-900">
          <Footprints className="size-4" />
          행동 반응
        </div>
        <p className="mt-2 text-sm text-blue-800">
          아직 저장된 행동 반응이 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {behaviorDetails.map((detail, idx) => {
        const current = editing[detail.id] ?? detail;
        return (
          <div
            key={detail.id}
            className="rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-900">
                <Footprints className="size-3" />
                행동 반응 #{idx + 1}
              </div>
              <div className="flex gap-2">
                {hasChanges(detail.id) && (
                  <Button
                    size="sm"
                    onClick={() => handleSave(detail.id)}
                    disabled={savingId === detail.id}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="size-4 mr-1" />
                    저장
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
              <div className="text-[10px] font-semibold text-blue-900">
                {current.behaviorLabel || "행동 반응"}
              </div>
              {current.errorTags?.length ? (
                <div className="flex flex-wrap gap-2 text-[11px] text-blue-700">
                  {current.errorTags.map((tag) => (
                    <span
                      key={`${detail.id}-${tag}`}
                      className="rounded-full bg-blue-100 px-2 py-0.5"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-blue-700">인지오류 태그 없음</p>
              )}
              <Textarea
                value={current.behaviorDescription}
                onChange={(e) =>
                  handleChange(detail.id, "behaviorDescription", e.target.value)
                }
                className="min-h-[80px] border-blue-200 bg-white/90"
                placeholder="행동 반응 설명"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
