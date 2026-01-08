import type { User } from "@supabase/supabase-js";
import {
  BookMarked,
  ChevronDown,
  ChevronRight,
  Edit2,
  NotebookPen,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
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
  timestamp: string;
  reflections: ScriptureNoteReflection[];
}

interface ScriptureNoteReflection {
  id: string;
  content: string;
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
  const [loading, setLoading] = useState(false);
  const [reflectionDrafts, setReflectionDrafts] = useState<
    Record<string, string>
  >({});
  const [editingReflectionNoteId, setEditingReflectionNoteId] = useState<
    string | null
  >(null);
  const [editingReflectionId, setEditingReflectionId] = useState<string | null>(
    null
  );
  const [editingReflectionContent, setEditingReflectionContent] =
    useState("");
  const [expandedReflections, setExpandedReflections] = useState<
    Record<string, boolean>
  >({});
  const referenceRef = useRef<HTMLInputElement | null>(null);

  const formatReflectionTitle = (content: string) => {
    const trimmed = content.trim();
    if (trimmed.length <= 20) return trimmed;
    return `${trimmed.slice(0, 20)}…`;
  };

  useEffect(() => {
    loadNotes();
  }, [user]);

  useEffect(() => {
    if (isCreating && editingId && referenceRef.current) {
      referenceRef.current.focus();
    }
  }, [isCreating, editingId]);

  const normalizeLocalNotes = (rawNotes: unknown[]): ScriptureNote[] => {
    return rawNotes.map((note) => {
      const rawNote = note as {
        id?: string;
        reference?: string;
        verse?: string;
        timestamp?: string;
        reflections?: ScriptureNoteReflection[];
        reflection?: string;
      };
      const safeTimestamp =
        typeof rawNote.timestamp === "string" && rawNote.timestamp
          ? rawNote.timestamp
          : new Date().toISOString();
      const existingReflections = Array.isArray(rawNote.reflections)
        ? rawNote.reflections.map((reflection) => ({
            id: String(reflection.id ?? Date.now().toString()),
            content: reflection.content ?? "",
            timestamp: reflection.timestamp ?? safeTimestamp,
          }))
        : [];
      const legacyReflection =
        typeof rawNote.reflection === "string"
          ? rawNote.reflection.trim()
          : "";
      const normalizedReflections = [...existingReflections];

      if (legacyReflection) {
        normalizedReflections.unshift({
          id: `legacy-${rawNote.id ?? Date.now().toString()}`,
          content: legacyReflection,
          timestamp: safeTimestamp,
        });
      }

      return {
        id: rawNote.id ? String(rawNote.id) : Date.now().toString(),
        reference: rawNote.reference ?? "",
        verse: rawNote.verse ?? "",
        timestamp: safeTimestamp,
        reflections: normalizedReflections,
      };
    });
  };

  const loadNotes = async () => {
    setLoading(true);

    // 로그인 상태: Supabase에서 로드
    if (user) {
      try {
        const { data, error } = await supabase
          .from("scripture_notes")
          .select(
            "id, reference, verse, created_at, reflections:scripture_note_reflections ( id, content, created_at )"
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const mapped =
          data?.map((row) => ({
            id: String(row.id),
            reference: row.reference ?? "",
            verse: row.verse ?? "",
            timestamp: row.created_at ?? "",
            reflections:
              row.reflections
                ?.map((reflection) => ({
                  id: String(reflection.id),
                  content: reflection.content ?? "",
                  timestamp: reflection.created_at ?? "",
                }))
                .sort(
                  (a, b) =>
                    new Date(b.timestamp).getTime() -
                    new Date(a.timestamp).getTime()
                ) ?? [],
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
      const parsed = saved ? JSON.parse(saved) : [];
      const normalized = Array.isArray(parsed)
        ? normalizeLocalNotes(parsed)
        : [];
      setNotes(normalized);
      if (saved) {
        localStorage.setItem("scripture_notes", JSON.stringify(normalized));
      }
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
          })
          .select("id, reference, verse, created_at")
          .single();

        if (error) throw error;
        if (data) {
          const newNote: ScriptureNote = {
            id: String(data.id),
            reference: data.reference ?? "",
            verse: data.verse ?? "",
            timestamp: data.created_at ?? new Date().toISOString(),
            reflections: [],
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
      timestamp: new Date().toISOString(),
      reflections: [],
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
          })
          .eq("id", id)
          .eq("user_id", user.id)
          .select("id, reference, verse, created_at")
          .single();

        if (error) throw error;
        if (data) {
          const updated = notes.map((note) =>
            note.id === id
              ? {
                  id: String(data.id),
                  reference: data.reference ?? "",
                  verse: data.verse ?? "",
                  timestamp: data.created_at ?? note.timestamp,
                  reflections: note.reflections ?? [],
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
          }
        : note
    );

    saveNotesLocally(updated);
    resetForm();
  };

  const handleDelete = async (id: string) => {
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
    toast.success("말씀 노트를 삭제했습니다.");
  };

  const handleEdit = (note: ScriptureNote) => {
    setEditingId(note.id);
    setReference(note.reference);
    setVerse(note.verse);
    setIsCreating(true);
  };

  const resetForm = () => {
    setIsCreating(false);
    setEditingId(null);
    setReference("");
    setVerse("");
  };

  const resetReflectionEdit = () => {
    setEditingReflectionNoteId(null);
    setEditingReflectionId(null);
    setEditingReflectionContent("");
  };

  const handleCreateReflection = async (noteId: string) => {
    const content = (reflectionDrafts[noteId] ?? "").trim();
    if (!content) {
      toast.error("묵상을 입력해주세요.");
      return;
    }

    if (user) {
      try {
        const noteIdValue = Number(noteId);
        if (!Number.isFinite(noteIdValue)) {
          toast.error("묵상을 저장할 수 없습니다.");
          return;
        }

        const { data, error } = await supabase
          .from("scripture_note_reflections")
          .insert({
            user_id: user.id,
            scripture_note_id: noteIdValue,
            content,
          })
          .select("id, content, created_at")
          .single();

        if (error) throw error;
        if (data) {
          const newReflection: ScriptureNoteReflection = {
            id: String(data.id),
            content: data.content ?? "",
            timestamp: data.created_at ?? new Date().toISOString(),
          };
          setNotes((prev) =>
            prev.map((note) =>
              note.id === noteId
                ? {
                    ...note,
                    reflections: [newReflection, ...note.reflections],
                  }
                : note
            )
          );
        }
      } catch (e) {
        console.error("묵상 저장 실패:", e);
        toast.error("묵상을 저장하지 못했습니다.");
        return;
      }
    } else {
      const newReflection: ScriptureNoteReflection = {
        id: Date.now().toString(),
        content,
        timestamp: new Date().toISOString(),
      };
      const updated = notes.map((note) =>
        note.id === noteId
          ? {
              ...note,
              reflections: [newReflection, ...note.reflections],
            }
          : note
      );
      saveNotesLocally(updated);
    }

    setReflectionDrafts((prev) => ({ ...prev, [noteId]: "" }));
  };

  const handleUpdateReflection = async (
    noteId: string,
    reflectionId: string
  ) => {
    const content = editingReflectionContent.trim();
    if (!content) {
      toast.error("묵상을 입력해주세요.");
      return;
    }

    if (user) {
      try {
        const { data, error } = await supabase
          .from("scripture_note_reflections")
          .update({ content })
          .eq("id", reflectionId)
          .eq("user_id", user.id)
          .select("id, content, created_at")
          .single();

        if (error) throw error;
        if (data) {
          setNotes((prev) =>
            prev.map((note) =>
              note.id === noteId
                ? {
                    ...note,
                    reflections: note.reflections.map((reflection) =>
                      reflection.id === reflectionId
                        ? {
                            ...reflection,
                            content: data.content ?? "",
                            timestamp:
                              data.created_at ?? reflection.timestamp,
                          }
                        : reflection
                    ),
                  }
                : note
            )
          );
        }
      } catch (e) {
        console.error("묵상 수정 실패:", e);
        toast.error("묵상을 수정하지 못했습니다.");
        return;
      }
    } else {
      const updated = notes.map((note) =>
        note.id === noteId
          ? {
              ...note,
              reflections: note.reflections.map((reflection) =>
                reflection.id === reflectionId
                  ? { ...reflection, content }
                  : reflection
              ),
            }
          : note
      );
      saveNotesLocally(updated);
    }

    resetReflectionEdit();
  };

  const handleDeleteReflection = async (
    noteId: string,
    reflectionId: string
  ) => {
    if (user) {
      try {
        const { error } = await supabase
          .from("scripture_note_reflections")
          .delete()
          .eq("id", reflectionId)
          .eq("user_id", user.id);

        if (error) throw error;
      } catch (e) {
        console.error("묵상 삭제 실패:", e);
        toast.error("묵상을 삭제하지 못했습니다.");
        return;
      }
    }

    const updated = notes.map((note) =>
      note.id === noteId
        ? {
            ...note,
            reflections: note.reflections.filter(
              (reflection) => reflection.id !== reflectionId
            ),
          }
        : note
    );

    if (user) {
      setNotes(updated);
    } else {
      saveNotesLocally(updated);
    }

    if (editingReflectionId === reflectionId) {
      resetReflectionEdit();
    }
    toast.success("묵상을 삭제했습니다.");
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
          {notes.map((note) => {
            const reflections = [...note.reflections].sort(
              (a, b) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime()
            );

            return (
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

                <div className="bg-slate-50 p-4 rounded-lg mb-3">
                  <p className="text-sm text-slate-600 mb-3 flex items-center gap-2">
                    <NotebookPen className="size-4 text-slate-500" />
                    묵상 기록
                  </p>
                  {reflections.length === 0 ? (
                    <p className="text-sm text-slate-400">
                      아직 묵상이 없습니다.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {reflections.map((reflection) => {
                        const isEditing =
                          editingReflectionNoteId === note.id &&
                          editingReflectionId === reflection.id;
                        const reflectionKey = `${note.id}-${reflection.id}`;
                        const isExpanded = Boolean(
                          expandedReflections[reflectionKey]
                        );

                        return (
                          <div
                            key={reflection.id}
                            className="rounded-lg border border-slate-200 bg-white p-3"
                          >
                            {isEditing ? (
                              <div className="space-y-2">
                                <Textarea
                                  value={editingReflectionContent}
                                  onChange={(e) =>
                                    setEditingReflectionContent(
                                      e.target.value
                                    )
                                  }
                                  className="min-h-[120px] border-slate-200"
                                />
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() =>
                                      handleUpdateReflection(
                                        note.id,
                                        reflection.id
                                      )
                                    }
                                    className="bg-amber-600 hover:bg-amber-700"
                                  >
                                    <Save className="size-4 mr-2" />
                                    수정 완료
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={resetReflectionEdit}
                                  >
                                    <X className="size-4 mr-2" />
                                    취소
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div className="flex items-start justify-between gap-3">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setExpandedReflections((prev) => ({
                                        ...prev,
                                        [reflectionKey]: !isExpanded,
                                      }))
                                    }
                                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                                    title={isExpanded ? "묵상 접기" : "묵상 펼치기"}
                                  >
                                    {isExpanded ? (
                                      <ChevronDown className="size-4 text-slate-400" />
                                    ) : (
                                      <ChevronRight className="size-4 text-slate-400" />
                                    )}
                                    <span className="min-w-0 flex-1 text-sm text-slate-500">
                                      {formatReflectionTitle(
                                        reflection.content
                                      )}
                                    </span>
                                  </button>
                                  <div className="flex shrink-0 items-center gap-1">
                                    <button
                                      onClick={() => {
                                        setEditingReflectionNoteId(note.id);
                                        setEditingReflectionId(reflection.id);
                                        setEditingReflectionContent(
                                          reflection.content
                                        );
                                      }}
                                      className="text-amber-600 hover:text-amber-700 p-1"
                                      title="묵상 수정"
                                    >
                                      <Edit2 className="size-4" />
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteReflection(
                                          note.id,
                                          reflection.id
                                        )
                                      }
                                      className="text-red-600 hover:text-red-700 p-1"
                                      title="묵상 삭제"
                                    >
                                      <Trash2 className="size-4" />
                                    </button>
                                  </div>
                                </div>
                                {isExpanded && (
                                  <p className="mt-3 text-slate-700 whitespace-pre-wrap break-words">
                                    {reflection.content}
                                  </p>
                                )}
                                <p className="text-xs text-slate-400 mt-2">
                                  {formatDate(reflection.timestamp)}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="mt-4 space-y-2">
                    <Textarea
                      value={reflectionDrafts[note.id] ?? ""}
                      onChange={(e) =>
                        setReflectionDrafts((prev) => ({
                          ...prev,
                          [note.id]: e.target.value,
                        }))
                      }
                      placeholder="묵상을 기록하세요..."
                      className="min-h-[120px] border-slate-200"
                    />
                    <Button
                      onClick={() => handleCreateReflection(note.id)}
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      <Plus className="size-4 mr-2" />
                      묵상 추가
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-slate-400">
                  {formatDate(note.timestamp)}
                </p>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
