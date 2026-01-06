import { Save, Trash2 } from "lucide-react";
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
    if (!confirm("이 자동사고를 삭제하시겠습니까?")) return;
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
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-600">
        아직 저장된 자동사고가 없습니다.
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
          className="border border-yellow-200 rounded-lg p-3 bg-yellow-50"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-slate-500">
              저장된 자동사고 #{idx + 1}
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
                <Trash2 className="size-4 mr-1" />
                삭제
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              감정
              <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-700 px-2 py-1 text-[11px]">
                {current.emotion || "-"}
              </span>
            </div>

            <label className="text-xs text-slate-600">자동사고</label>
            <Textarea
              value={current.automaticThought}
              onChange={(e) =>
                  handleChange(detail.id, "automaticThought", e.target.value)
                }
                className="min-h-[80px] border-slate-200"
                placeholder="자동사고"
              />

            </div>
          </div>
        );
      })}
    </div>
  );
}
