import { Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";
import type { PatternAlternative } from "./types";

interface PatternAlternativesCardProps {
  alternatives: PatternAlternative[];
  onUpdateAlternative: (alternative: PatternAlternative) => Promise<void>;
  onDeleteAlternative: (id: string) => Promise<void>;
}

export function PatternAlternativesCard({
  alternatives,
  onUpdateAlternative,
  onDeleteAlternative,
}: PatternAlternativesCardProps) {
  const [editing, setEditing] = useState<Record<string, PatternAlternative>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setEditing(Object.fromEntries(alternatives.map((alt) => [alt.id, { ...alt }])));
  }, [alternatives]);

  const handleChange = (id: string, value: string) => {
    setEditing((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] ?? alternatives.find((a) => a.id === id) ?? {
          id,
          noteId: "",
          alternative: "",
          createdAt: "",
        }),
        alternative: value,
      },
    }));
  };

  const handleSave = async (id: string) => {
    const current = editing[id];
    if (!current) return;
    if (!current.alternative.trim()) {
      toast.error("대안 사고를 입력해주세요.");
      return;
    }
    setSavingId(id);
    try {
      await onUpdateAlternative(current);
      toast.success("저장되었습니다.");
    } catch (e) {
      console.error(e);
      toast.error("저장에 실패했습니다.");
    } finally {
      setSavingId(null);
    }
  };

  const hasChanges = (id: string) => {
    const original = alternatives.find((a) => a.id === id);
    const current = editing[id];
    if (!original || !current) return false;
    return (current.alternative ?? "") !== (original.alternative ?? "");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("이 대안 사고를 삭제하시겠습니까?")) return;
    setDeletingId(id);
    try {
      await onDeleteAlternative(id);
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

  if (alternatives.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-600">
        아직 저장된 대안 사고가 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alternatives.map((alt, idx) => {
        const current = editing[alt.id] ?? alt;
        return (
        <div
          key={alt.id}
          className="border border-green-200 rounded-lg p-3 bg-green-50"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-slate-500">
              저장된 대안사고 #{idx + 1}
            </div>
            <div className="flex gap-2">
              {hasChanges(alt.id) && (
                <Button
                  size="sm"
                  onClick={() => handleSave(alt.id)}
                  disabled={savingId === alt.id}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="size-4 mr-1" />
                  저장
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDelete(alt.id)}
                disabled={deletingId === alt.id}
                className="text-red-600 hover:bg-red-50"
              >
                <Trash2 className="size-4 mr-1" />
                삭제
              </Button>
            </div>
          </div>

            <Textarea
              value={current.alternative}
              onChange={(e) => handleChange(alt.id, e.target.value)}
              className="min-h-[80px] border-green-200"
              placeholder="대안적 사고"
            />
          </div>
        );
      })}
    </div>
  );
}
