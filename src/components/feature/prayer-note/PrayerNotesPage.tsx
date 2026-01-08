// src/components/prayer-note/PrayerNotesPage.tsx
import type { User } from "@supabase/supabase-js";
import {
  BookOpen,
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
import { EMOTIONS } from "../../center/constants/emotions";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";

interface PrayerNote {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  tags: string[];
  responses: PrayerNoteResponse[];
}

interface PrayerNoteResponse {
  id: string;
  content: string;
  timestamp: string;
}

interface PrayerNotesPageProps {
  user: User | null;
}

export function PrayerNotesPage({ user }: PrayerNotesPageProps) {
  const [notes, setNotes] = useState<PrayerNote[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [responseDrafts, setResponseDrafts] = useState<
    Record<string, string>
  >({});
  const [editingResponseNoteId, setEditingResponseNoteId] = useState<
    string | null
  >(null);
  const [editingResponseId, setEditingResponseId] = useState<string | null>(
    null
  );
  const [editingResponseContent, setEditingResponseContent] = useState("");
  const [expandedResponses, setExpandedResponses] = useState<
    Record<string, boolean>
  >({});
  const titleRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    loadNotes();
  }, [user]);

  useEffect(() => {
    if (isCreating && editingId && titleRef.current) {
      titleRef.current.focus();
    }
  }, [isCreating, editingId]);

  const emotionTags = EMOTIONS.map((emotion) => emotion.label);

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const formatResponseTitle = (content: string) => {
    const trimmed = content.trim();
    if (trimmed.length <= 20) return trimmed;
    return `${trimmed.slice(0, 20)}…`;
  };

  const normalizeLocalNotes = (rawNotes: unknown[]): PrayerNote[] => {
    return rawNotes.map((note) => {
      const rawNote = note as {
        id?: string;
        title?: string;
        content?: string;
        tags?: string[];
        timestamp?: string;
        responses?: PrayerNoteResponse[];
      };
      const safeTimestamp =
        typeof rawNote.timestamp === "string" && rawNote.timestamp
          ? rawNote.timestamp
          : new Date().toISOString();
      const responses = Array.isArray(rawNote.responses)
        ? rawNote.responses.map((response) => ({
            id: String(response.id ?? Date.now().toString()),
            content: response.content ?? "",
            timestamp: response.timestamp ?? safeTimestamp,
          }))
        : [];

      return {
        id: rawNote.id ? String(rawNote.id) : Date.now().toString(),
        title: rawNote.title ?? "",
        content: rawNote.content ?? "",
        tags: Array.isArray(rawNote.tags) ? rawNote.tags : [],
        timestamp: safeTimestamp,
        responses,
      };
    });
  };

  const loadNotes = async () => {
    setLoading(true);

    // 로그인 사용자: Supabase에서 로드
    if (user) {
      try {
        const { data, error } = await supabase
          .from("prayer_notes")
          .select(
            "id, title, content, tags, created_at, responses:prayer_note_responses ( id, content, created_at )"
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const mapped =
          data?.map((row) => ({
            id: String(row.id),
            title: row.title ?? "",
            content: row.content ?? "",
            tags: Array.isArray(row.tags) ? row.tags : [],
            timestamp: row.created_at ?? "",
            responses:
              row.responses
                ?.map((response) => ({
                  id: String(response.id),
                  content: response.content ?? "",
                  timestamp: response.created_at ?? "",
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
        console.error("기도 노트 로드 실패:", e);
        toast.error("기도 노트를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    }

    // 비로그인: 로컬 저장소
    try {
      const saved = localStorage.getItem("prayer_notes");
      const parsed = saved ? JSON.parse(saved) : [];
      const normalized = Array.isArray(parsed)
        ? normalizeLocalNotes(parsed)
        : [];
      setNotes(normalized);
      if (saved) {
        localStorage.setItem("prayer_notes", JSON.stringify(normalized));
      }
    } catch (e) {
      console.error("기도 노트 로드 실패:", e);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const saveNotesLocally = (updatedNotes: PrayerNote[]) => {
    localStorage.setItem("prayer_notes", JSON.stringify(updatedNotes));
    setNotes(updatedNotes);
  };

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("제목과 내용을 입력해주세요.");
      return;
    }

    // 로그인 상태: Supabase에 저장
    if (user) {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("prayer_notes")
          .insert({
            user_id: user.id,
            title: title.trim(),
            content: content.trim(),
            tags,
          })
          .select("id, title, content, tags, created_at")
          .single();

        if (error) throw error;
        if (data) {
          const newNote: PrayerNote = {
            id: String(data.id),
            title: data.title ?? "",
            content: data.content ?? "",
            tags: Array.isArray(data.tags) ? data.tags : [],
            timestamp: data.created_at ?? new Date().toISOString(),
            responses: [],
          };
          setNotes((prev) => [newNote, ...prev]);
        }
      } catch (e) {
        console.error("기도 노트 저장 실패:", e);
        toast.error("기도 노트를 저장하지 못했습니다.");
        return;
      } finally {
        setLoading(false);
        resetForm();
      }
      return;
    }

    // 비로그인: 로컬 저장
    const newNote: PrayerNote = {
      id: Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      timestamp: new Date().toISOString(),
      tags,
      responses: [],
    };

    const updated = [newNote, ...notes];
    saveNotesLocally(updated);
    resetForm();
  };

  const handleUpdate = async (id: string) => {
    if (!title.trim() || !content.trim()) {
      toast.error("제목과 내용을 입력해주세요.");
      return;
    }

    // 로그인 상태: Supabase 업데이트
    if (user) {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("prayer_notes")
          .update({
            title: title.trim(),
            content: content.trim(),
            tags,
          })
          .eq("id", id)
          .eq("user_id", user.id)
          .select("id, title, content, tags, created_at")
          .single();

        if (error) throw error;
        if (data) {
          const updated = notes.map((note) =>
            note.id === id
              ? {
                  id: String(data.id),
                  title: data.title ?? "",
                  content: data.content ?? "",
                  tags: Array.isArray(data.tags) ? data.tags : [],
                  timestamp: data.created_at ?? note.timestamp,
                  responses: note.responses ?? [],
                }
              : note
          );
          setNotes(updated);
        }
      } catch (e) {
        console.error("기도 노트 수정 실패:", e);
        toast.error("기도 노트를 수정하지 못했습니다.");
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
            title: title.trim(),
            content: content.trim(),
            tags,
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
          .from("prayer_notes")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);
        if (error) throw error;
      } catch (e) {
        console.error("기도 노트 삭제 실패:", e);
        toast.error("기도 노트를 삭제하지 못했습니다.");
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
    toast.success("기도 노트를 삭제했습니다.");
  };

  const handleEdit = (note: PrayerNote) => {
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setTags(note.tags);
    setIsCreating(true);
  };

  const resetForm = () => {
    setIsCreating(false);
    setEditingId(null);
    setTitle("");
    setContent("");
    setTags([]);
  };

  const resetResponseEdit = () => {
    setEditingResponseNoteId(null);
    setEditingResponseId(null);
    setEditingResponseContent("");
  };

  const handleCreateResponse = async (noteId: string) => {
    const contentValue = (responseDrafts[noteId] ?? "").trim();
    if (!contentValue) {
      toast.error("응답을 입력해주세요.");
      return;
    }

    if (user) {
      try {
        const noteIdValue = Number(noteId);
        if (!Number.isFinite(noteIdValue)) {
          toast.error("응답을 저장할 수 없습니다.");
          return;
        }

        const { data, error } = await supabase
          .from("prayer_note_responses")
          .insert({
            user_id: user.id,
            prayer_note_id: noteIdValue,
            content: contentValue,
          })
          .select("id, content, created_at")
          .single();

        if (error) throw error;
        if (data) {
          const newResponse: PrayerNoteResponse = {
            id: String(data.id),
            content: data.content ?? "",
            timestamp: data.created_at ?? new Date().toISOString(),
          };
          setNotes((prev) =>
            prev.map((note) =>
              note.id === noteId
                ? {
                    ...note,
                    responses: [newResponse, ...note.responses],
                  }
                : note
            )
          );
        }
      } catch (e) {
        console.error("응답 저장 실패:", e);
        toast.error("응답을 저장하지 못했습니다.");
        return;
      }
    } else {
      const newResponse: PrayerNoteResponse = {
        id: Date.now().toString(),
        content: contentValue,
        timestamp: new Date().toISOString(),
      };
      const updated = notes.map((note) =>
        note.id === noteId
          ? {
              ...note,
              responses: [newResponse, ...note.responses],
            }
          : note
      );
      saveNotesLocally(updated);
    }

    setResponseDrafts((prev) => ({ ...prev, [noteId]: "" }));
  };

  const handleUpdateResponse = async (
    noteId: string,
    responseId: string
  ) => {
    const contentValue = editingResponseContent.trim();
    if (!contentValue) {
      toast.error("응답을 입력해주세요.");
      return;
    }

    if (user) {
      try {
        const { data, error } = await supabase
          .from("prayer_note_responses")
          .update({ content: contentValue })
          .eq("id", responseId)
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
                    responses: note.responses.map((response) =>
                      response.id === responseId
                        ? {
                            ...response,
                            content: data.content ?? "",
                            timestamp:
                              data.created_at ?? response.timestamp,
                          }
                        : response
                    ),
                  }
                : note
            )
          );
        }
      } catch (e) {
        console.error("응답 수정 실패:", e);
        toast.error("응답을 수정하지 못했습니다.");
        return;
      }
    } else {
      const updated = notes.map((note) =>
        note.id === noteId
          ? {
              ...note,
              responses: note.responses.map((response) =>
                response.id === responseId
                  ? { ...response, content: contentValue }
                  : response
              ),
            }
          : note
      );
      saveNotesLocally(updated);
    }

    resetResponseEdit();
  };

  const handleDeleteResponse = async (
    noteId: string,
    responseId: string
  ) => {
    if (user) {
      try {
        const { error } = await supabase
          .from("prayer_note_responses")
          .delete()
          .eq("id", responseId)
          .eq("user_id", user.id);

        if (error) throw error;
      } catch (e) {
        console.error("응답 삭제 실패:", e);
        toast.error("응답을 삭제하지 못했습니다.");
        return;
      }
    }

    const updated = notes.map((note) =>
      note.id === noteId
        ? {
            ...note,
            responses: note.responses.filter(
              (response) => response.id !== responseId
            ),
          }
        : note
    );

    if (user) {
      setNotes(updated);
    } else {
      saveNotesLocally(updated);
    }

    if (editingResponseId === responseId) {
      resetResponseEdit();
    }
    toast.success("응답을 삭제했습니다.");
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
            <BookOpen className="size-8 text-purple-600" />
            기도 노트
          </h1>
          <p className="text-slate-600">기도와 응답을 기록하세요.</p>
        </div>
        {!isCreating && (
          <Button
            onClick={() => setIsCreating(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Plus className="size-5 mr-2" />새 기도 노트
          </Button>
        )}
      </div>

      {/* 작성/수정 폼 */}
      {isCreating && (
        <Card className="p-6 mb-6 bg-purple-50 border-2 border-purple-200">
          <h3 className="text-lg text-slate-900 mb-4">
            {editingId ? "기도 노트 수정" : "새 기도 노트 작성"}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-700 mb-2 block">제목</label>
              <Input
                ref={titleRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="기도 제목을 입력하세요"
                className="border-purple-200"
              />
            </div>

            <div>
              <label className="text-sm text-slate-700 mb-2 block">내용</label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="기도 내용, 감사한 일, 응답 등을 자유롭게 적어보세요..."
                className="min-h-[200px] border-purple-200"
              />
            </div>

            <div>
              <label className="text-sm text-slate-700 mb-2 block">
                태그 (감정 선택)
              </label>
              <div className="flex flex-wrap gap-2">
                {emotionTags.map((tag) => {
                  const selected = tags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`rounded-full border px-3 py-1 text-xs transition ${
                        selected
                          ? "bg-purple-600 text-white border-purple-600"
                          : "bg-white text-slate-700 border-slate-200 hover:border-purple-300"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() =>
                  editingId ? handleUpdate(editingId) : handleCreate()
                }
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700"
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
          <BookOpen className="size-16 text-slate-300 mx-auto mb-4 animate-pulse" />
          <p className="text-slate-500 text-lg mb-2">
            기도 노트를 불러오는 중입니다...
          </p>
        </Card>
      ) : notes.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="size-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-lg mb-2">
            아직 기도 노트가 없습니다.
          </p>
          <p className="text-slate-400">첫 번째 기도 노트를 작성해보세요.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => {
            const responses = [...note.responses].sort(
              (a, b) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime()
            );

            return (
              <Card
                key={note.id}
                className="p-5 hover:shadow-lg transition-shadow bg-white border-purple-100"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg text-slate-900 flex-1 mr-2">
                    {note.title}
                  </h3>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(note)}
                      className="text-purple-600 hover:text-purple-700 p-1"
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

                <p className="text-slate-600 text-sm mb-3 whitespace-pre-wrap">
                  {note.content}
                </p>

                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {note.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="bg-slate-50 p-4 rounded-lg mb-3">
                  <p className="text-sm text-slate-600 mb-3 flex items-center gap-2">
                    <NotebookPen className="size-4 text-slate-500" />
                    응답 기록
                  </p>
                  {responses.length === 0 ? (
                    <p className="text-sm text-slate-400">
                      아직 응답이 없습니다.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {responses.map((response) => {
                        const isEditing =
                          editingResponseNoteId === note.id &&
                          editingResponseId === response.id;
                        const responseKey = `${note.id}-${response.id}`;
                        const isExpanded = Boolean(
                          expandedResponses[responseKey]
                        );

                        return (
                          <div
                            key={response.id}
                            className="rounded-lg border border-slate-200 bg-white p-3"
                          >
                            {isEditing ? (
                              <div className="space-y-2">
                                <Textarea
                                  value={editingResponseContent}
                                  onChange={(e) =>
                                    setEditingResponseContent(
                                      e.target.value
                                    )
                                  }
                                  className="min-h-[120px] border-slate-200"
                                />
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() =>
                                      handleUpdateResponse(
                                        note.id,
                                        response.id
                                      )
                                    }
                                    className="bg-purple-600 hover:bg-purple-700"
                                  >
                                    <Save className="size-4 mr-2" />
                                    수정 완료
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={resetResponseEdit}
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
                                      setExpandedResponses((prev) => ({
                                        ...prev,
                                        [responseKey]: !isExpanded,
                                      }))
                                    }
                                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                                    title={isExpanded ? "응답 접기" : "응답 펼치기"}
                                  >
                                    {isExpanded ? (
                                      <ChevronDown className="size-4 text-slate-400" />
                                    ) : (
                                      <ChevronRight className="size-4 text-slate-400" />
                                    )}
                                    <span className="min-w-0 flex-1 text-sm text-slate-500">
                                      {formatResponseTitle(response.content)}
                                    </span>
                                  </button>
                                  <div className="flex shrink-0 items-center gap-1">
                                    <button
                                      onClick={() => {
                                        setEditingResponseNoteId(note.id);
                                        setEditingResponseId(response.id);
                                        setEditingResponseContent(
                                          response.content
                                        );
                                      }}
                                      className="text-purple-600 hover:text-purple-700 p-1"
                                      title="응답 수정"
                                    >
                                      <Edit2 className="size-4" />
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteResponse(
                                          note.id,
                                          response.id
                                        )
                                      }
                                      className="text-red-600 hover:text-red-700 p-1"
                                      title="응답 삭제"
                                    >
                                      <Trash2 className="size-4" />
                                    </button>
                                  </div>
                                </div>
                                {isExpanded && (
                                  <p className="mt-3 text-slate-700 whitespace-pre-wrap break-words">
                                    {response.content}
                                  </p>
                                )}
                                <p className="text-xs text-slate-400 mt-2">
                                  {formatDate(response.timestamp)}
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
                      value={responseDrafts[note.id] ?? ""}
                      onChange={(e) =>
                        setResponseDrafts((prev) => ({
                          ...prev,
                          [note.id]: e.target.value,
                        }))
                      }
                      placeholder="응답을 기록하세요..."
                      className="min-h-[120px] border-slate-200"
                    />
                    <Button
                      onClick={() => handleCreateResponse(note.id)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Plus className="size-4 mr-2" />
                      응답 추가
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
