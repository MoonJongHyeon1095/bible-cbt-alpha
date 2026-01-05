// src/components/prayer-note/PrayerNotesPage.tsx
import { BookOpen, Edit2, Plus, Save, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { supabase } from "../../../lib/supabase/client";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

interface PrayerNote {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  tags: string[];
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
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const titleRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    loadNotes();
  }, [user]);

  useEffect(() => {
    if (isCreating && editingId && titleRef.current) {
      titleRef.current.focus();
    }
  }, [isCreating, editingId]);

  const parseTags = (raw: string) =>
    raw
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t);

  const loadNotes = async () => {
    // 로그인 사용자: Supabase에서 로드
    if (user) {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("prayer_notes")
          .select("id, title, content, tags, created_at")
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
    const saved = localStorage.getItem("prayer_notes");
    if (saved) {
      try {
        setNotes(JSON.parse(saved));
      } catch (e) {
        console.error("기도 노트 로드 실패:", e);
      }
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

    const tagList = parseTags(tags);

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
            tags: tagList,
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
      tags: tagList,
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

    const tagList = parseTags(tags);

    // 로그인 상태: Supabase 업데이트
    if (user) {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("prayer_notes")
          .update({
            title: title.trim(),
            content: content.trim(),
            tags: tagList,
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
            tags: tagList,
          }
        : note
    );

    saveNotesLocally(updated);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("이 기도 노트를 삭제하시겠습니까?")) return;

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
  };

  const handleEdit = (note: PrayerNote) => {
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setTags(note.tags.join(", "));
    setIsCreating(true);
  };

  const resetForm = () => {
    setIsCreating(false);
    setEditingId(null);
    setTitle("");
    setContent("");
    setTags("");
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
          <p className="text-slate-600">
            {user
              ? "로그인 상태에서 작성한 노트는 Supabase에 안전하게 저장됩니다."
              : "로그인 시 기도 노트를 Supabase에 저장할 수 있습니다."}
          </p>
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
                태그 (쉼표로 구분)
              </label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="예: 가족, 건강, 감사"
                className="border-purple-200"
              />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
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

              <p className="text-slate-600 text-sm mb-3 line-clamp-4 whitespace-pre-wrap">
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
