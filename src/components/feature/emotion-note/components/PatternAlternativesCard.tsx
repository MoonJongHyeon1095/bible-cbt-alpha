import { Lightbulb, Loader2, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "../../../ui/button";
import { Textarea } from "../../../ui/textarea";
import type { PatternAlternative } from "../types";

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
  const [editing, setEditing] = useState<Record<string, PatternAlternative>>(
    {}
  );
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setEditing(
      Object.fromEntries(alternatives.map((alt) => [alt.id, { ...alt }]))
    );
  }, [alternatives]);

  const handleChange = (id: string, value: string) => {
    setEditing((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] ??
          alternatives.find((a) => a.id === id) ?? {
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
      <div className="rounded-xl border border-green-200 bg-white p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-green-900">
          <Lightbulb className="size-4" />
          저장된 대안 사고
        </div>
        <p className="mt-2 text-sm text-green-800">
          아직 저장된 대안 사고가 없습니다.
        </p>
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
            className="rounded-xl border border-green-200 bg-green-50 p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="inline-flex items-center gap-1 text-sm font-semibold text-green-900">
                <Lightbulb className="size-3" />
                대안사고 #{idx + 1}
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
                  {deletingId === alt.id ? (
                    <Loader2 className="size-4 mr-1 animate-spin" />
                  ) : (
                    <Trash2 className="size-4 mr-1" />
                  )}
                  삭제
                </Button>
              </div>
            </div>

            <Textarea
              value={current.alternative}
              onChange={(e) => handleChange(alt.id, e.target.value)}
              className="min-h-[120px] border-green-200 bg-white/95 px-3 py-2 text-[16px] leading-[1.85]"
              placeholder="대안적 사고"
            />
          </div>
        );
      })}
    </div>
  );
}
