import type { User } from "@supabase/supabase-js";
import { BookMarked, Edit2, Plus, Save, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "../../../lib/supabase/client";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";

interface ScriptureNote {
  id: string;
  reference: string;
  verse: string;
  reflection: string;
  timestamp: string;
}

interface ScriptureNotesPageProps {
  user: User | null;
}

export function ScriptureNotesPage({ user }: ScriptureNotesPageProps) {
  const [notes, setNotes] = useState<ScriptureNote[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [reference, setReference] = useState("");
  const [verse, setVerse] = useState("");
  const [reflection, setReflection] = useState("");
  const [loading, setLoading] = useState(false);
  const referenceRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    loadNotes();
  }, [user]);

  useEffect(() => {
    if (isCreating && editingId && referenceRef.current) {
      referenceRef.current.focus();
    }
  }, [isCreating, editingId]);

  const loadNotes = async () => {
    setLoading(true);

    // 로그인 상태: Supabase에서 로드
    if (user) {
      try {
        const { data, error } = await supabase
          .from("scripture_notes")
          .select("id, reference, verse, reflection, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const mapped =
          data?.map((row) => ({
            id: String(row.id),
            reference: row.reference ?? "",
            verse: row.verse ?? "",
            reflection: row.reflection ?? "",
            timestamp: row.created_at ?? "",
          })) ?? [];

        setNotes(mapped);
        return;
      } catch (e) {
        console.error("말씀 노트 로드 실패:", e);
        toast.error("말씀 노트를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    }

    // 비로그인: 로컬 저장소
    try {
      const saved = localStorage.getItem("scripture_notes");
      setNotes(saved ? JSON.parse(saved) : []);
    } catch (e) {
      console.error("말씀 노트 로드 실패:", e);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const saveNotesLocally = (updatedNotes: ScriptureNote[]) => {
    localStorage.setItem("scripture_notes", JSON.stringify(updatedNotes));
    setNotes(updatedNotes);
  };

  const handleCreate = async () => {
    if (!reference.trim() || !verse.trim()) {
      toast.error("성경 구절과 말씀을 입력해주세요.");
      return;
    }

    // 로그인 상태: Supabase에 저장
    if (user) {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("scripture_notes")
          .insert({
            user_id: user.id,
            reference: reference.trim(),
            verse: verse.trim(),
            reflection: reflection.trim(),
          })
          .select("id, reference, verse, reflection, created_at")
          .single();

        if (error) throw error;
        if (data) {
          const newNote: ScriptureNote = {
            id: String(data.id),
            reference: data.reference ?? "",
            verse: data.verse ?? "",
            reflection: data.reflection ?? "",
            timestamp: data.created_at ?? new Date().toISOString(),
          };
          setNotes((prev) => [newNote, ...prev]);
        }
      } catch (e) {
        console.error("말씀 노트 저장 실패:", e);
        toast.error("말씀 노트를 저장하지 못했습니다.");
        return;
      } finally {
        setLoading(false);
        resetForm();
      }
      return;
    }

    const newNote: ScriptureNote = {
      id: Date.now().toString(),
      reference: reference.trim(),
      verse: verse.trim(),
      reflection: reflection.trim(),
      timestamp: new Date().toISOString(),
    };

    const updated = [newNote, ...notes];
    saveNotesLocally(updated);
    resetForm();
  };

  const handleUpdate = async (id: string) => {
    if (!reference.trim() || !verse.trim()) {
      toast.error("성경 구절과 말씀을 입력해주세요.");
      return;
    }

    // 로그인 상태: Supabase 업데이트
    if (user) {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("scripture_notes")
          .update({
            reference: reference.trim(),
            verse: verse.trim(),
            reflection: reflection.trim(),
          })
          .eq("id", id)
          .eq("user_id", user.id)
          .select("id, reference, verse, reflection, created_at")
          .single();

        if (error) throw error;
        if (data) {
          const updated = notes.map((note) =>
            note.id === id
              ? {
                  id: String(data.id),
                  reference: data.reference ?? "",
                  verse: data.verse ?? "",
                  reflection: data.reflection ?? "",
                  timestamp: data.created_at ?? note.timestamp,
                }
              : note
          );
          setNotes(updated);
        }
      } catch (e) {
        console.error("말씀 노트 수정 실패:", e);
        toast.error("말씀 노트를 수정하지 못했습니다.");
        return;
      } finally {
        setLoading(false);
        resetForm();
      }
      return;
    }

    const updated = notes.map((note) =>
      note.id === id
        ? {
            ...note,
            reference: reference.trim(),
            verse: verse.trim(),
            reflection: reflection.trim(),
          }
        : note
    );

    saveNotesLocally(updated);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("이 말씀 노트를 삭제하시겠습니까?")) return;

    if (user) {
      try {
        setLoading(true);
        const { error } = await supabase
          .from("scripture_notes")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);
        if (error) throw error;
      } catch (e) {
        console.error("말씀 노트 삭제 실패:", e);
        toast.error("말씀 노트를 삭제하지 못했습니다.");
        return;
      } finally {
        setLoading(false);
      }
    }

    const updated = notes.filter((note) => note.id !== id);
    if (user) {
      setNotes(updated);
    } else {
      saveNotesLocally(updated);
    }
  };

  const handleEdit = (note: ScriptureNote) => {
    setEditingId(note.id);
    setReference(note.reference);
    setVerse(note.verse);
    setReflection(note.reflection);
    setIsCreating(true);
  };

  const resetForm = () => {
    setIsCreating(false);
    setEditingId(null);
    setReference("");
    setVerse("");
    setReflection("");
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-slate-900 mb-2 flex items-center gap-3">
            <BookMarked className="size-8 text-amber-600" />
            말씀 노트
          </h1>
          <p className="text-slate-600">말씀과 묵상을 기록하세요.</p>
        </div>
        <div className="flex gap-2">
          {!isCreating && (
            <Button
              onClick={() => setIsCreating(true)}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
            >
              <Plus className="size-5 mr-2" />새 말씀 노트
            </Button>
          )}
        </div>
      </div>

      {/* 작성/수정 폼 */}
      {isCreating && (
        <Card className="p-6 mb-6 bg-amber-50 border-2 border-amber-200">
          <h3 className="text-lg text-slate-900 mb-4">
            {editingId ? "말씀 노트 수정" : "새 말씀 노트 작성"}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-700 mb-2 block">
                성경 구절
              </label>
              <Input
                ref={referenceRef}
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="예: 요한복음 3:16, 시편 23:1"
                className="border-amber-200"
              />
            </div>

            <div>
              <label className="text-sm text-slate-700 mb-2 block">
                말씀 본문
              </label>
              <Textarea
                value={verse}
                onChange={(e) => setVerse(e.target.value)}
                placeholder="성경 말씀 본문을 입력하세요..."
                className="min-h-[120px] border-amber-200"
              />
            </div>

            <div>
              <label className="text-sm text-slate-700 mb-2 block">
                묵상 / 적용 (선택사항)
              </label>
              <Textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="이 말씀을 통해 깨달은 점, 적용하고 싶은 내용을 자유롭게 적어보세요..."
                className="min-h-[150px] border-amber-200"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() =>
                  editingId ? handleUpdate(editingId) : handleCreate()
                }
                disabled={loading}
                className="bg-amber-600 hover:bg-amber-700"
              >
                <Save className="size-4 mr-2" />
                {editingId ? "수정 완료" : "저장"}
              </Button>
              <Button onClick={resetForm} variant="outline">
                <X className="size-4 mr-2" />
                취소
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* 노트 목록 */}
      {loading ? (
        <Card className="p-12 text-center">
          <BookMarked className="size-16 text-slate-300 mx-auto mb-4 animate-pulse" />
          <p className="text-slate-500 text-lg mb-2">
            말씀 노트를 불러오는 중입니다...
          </p>
        </Card>
      ) : notes.length === 0 ? (
        <Card className="p-12 text-center">
          <BookMarked className="size-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-lg mb-2">
            아직 말씀 노트가 없습니다.
          </p>
          <p className="text-slate-400">첫 번째 말씀 노트를 작성해보세요.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <Card
              key={note.id}
              className="p-6 hover:shadow-lg transition-shadow bg-white border-amber-100"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl text-amber-900 flex-1">
                  {note.reference}
                </h3>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(note)}
                    className="text-amber-600 hover:text-amber-700 p-1"
                    title="수정"
                  >
                    <Edit2 className="size-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="text-red-600 hover:text-red-700 p-1"
                    title="삭제"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg mb-3">
                <p className="text-slate-700 italic leading-relaxed whitespace-pre-wrap">
                  "{note.verse}"
                </p>
              </div>

              {note.reflection && (
                <div className="bg-slate-50 p-4 rounded-lg mb-3">
                  <p className="text-sm text-slate-600 mb-1">💭 묵상 / 적용:</p>
                  <p className="text-slate-700 whitespace-pre-wrap">
                    {note.reflection}
                  </p>
                </div>
              )}

              <p className="text-xs text-slate-400">
                {formatDate(note.timestamp)}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
