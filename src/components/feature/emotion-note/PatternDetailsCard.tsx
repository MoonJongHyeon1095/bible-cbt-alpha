import { Brain, Loader2, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";
import type { PatternDetail } from "./types";

type DetailEditor = PatternDetail;

interface PatternDetailsCardProps {
  details: PatternDetail[];
  onUpdateDetail: (detail: DetailEditor) => Promise<void>;
  onDeleteDetail: (id: string) => Promise<void>;
}

export function PatternDetailsCard({
  details,
  onUpdateDetail,
  onDeleteDetail,
}: PatternDetailsCardProps) {
  const [editing, setEditing] = useState<Record<string, DetailEditor>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setEditing(Object.fromEntries(details.map((d) => [d.id, { ...d }])));
  }, [details]);

  const handleChange = (id: string, field: keyof DetailEditor, value: string) => {
    setEditing((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] ?? details.find((d) => d.id === id) ?? {
          id,
          automaticThought: "",
          emotion: "",
          createdAt: "",
        }),
        [field]: value,
      },
    }));
  };

  const handleSave = async (id: string) => {
    const detail = editing[id];
    if (!detail) return;
    if (!detail.automaticThought.trim()) {
      toast.error("자동사고를 입력해주세요.");
      return;
    }
    setSavingId(id);
    try {
      await onUpdateDetail(detail);
      toast.success("저장되었습니다.");
    } catch (e) {
      console.error(e);
      toast.error("저장에 실패했습니다.");
    } finally {
      setSavingId(null);
    }
  };

  const hasChanges = (id: string) => {
    const original = details.find((d) => d.id === id);
    const current = editing[id];
    if (!original || !current) return false;
    return (current.automaticThought ?? "") !== (original.automaticThought ?? "");
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDeleteDetail(id);
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

  if (details.length === 0) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-amber-900">
          <Brain className="size-4" />
          배후의 자동 사고
        </div>
        <p className="mt-2 text-sm text-amber-800">
          아직 배후의 자동 사고가 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {details.map((detail, idx) => {
        const current = editing[detail.id] ?? detail;
        return (
          <div
            key={detail.id}
            className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-900">
                <Brain className="size-3" />
                배후의 자동 사고 #{idx + 1}
              </div>
              <div className="flex gap-2">
                {hasChanges(detail.id) && (
                  <Button
                    size="sm"
                    onClick={() => handleSave(detail.id)}
                    disabled={savingId === detail.id}
                    className="bg-indigo-600 hover:bg-indigo-700"
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
            <div>
              <span className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                {current.emotion || "-"}
              </span>
            </div>

              <label className="text-xs text-slate-700">배후의 자동 사고</label>
              <Textarea
                value={current.automaticThought}
                onChange={(e) =>
                  handleChange(detail.id, "automaticThought", e.target.value)
                }
                className="min-h-[80px] border-amber-200 bg-white/90"
                placeholder="배후의 자동 사고"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
