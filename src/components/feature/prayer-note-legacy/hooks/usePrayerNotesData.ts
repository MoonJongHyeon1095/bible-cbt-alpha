import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "../../../../lib/supabase/client";
import { validateUserText } from "../../../../utils/validation";
import type { PrayerNote, PrayerNoteResponse } from "../types/types";
import { normalizeLocalNotes } from "../utils/utils";

type CreateNoteInput = {
  title: string;
  content: string;
  tags: string[];
};

type UpdateNoteInput = CreateNoteInput & { id: string };

export type PrayerNoteMutateResult = {
  ok: boolean;
  shouldReset: boolean;
};

export function usePrayerNotesData(user: User | null) {
  const [notes, setNotes] = useState<PrayerNote[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotes();
  }, [user]);

  const loadNotes = async () => {
    setLoading(true);

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

    try {
      const saved = localStorage.getItem("prayer_notes");
      const parsed = saved ? JSON.parse(saved) : [];
      const normalized = Array.isArray(parsed) ? normalizeLocalNotes(parsed) : [];
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

  const createNote = async ({
    title,
    content,
    tags,
  }: CreateNoteInput): Promise<PrayerNoteMutateResult> => {
    if (!title.trim()) {
      toast.error("제목을 입력해주세요.");
      return { ok: false, shouldReset: false };
    }

    const validation = validateUserText(content);
    if (!validation.ok) {
      toast.error(validation.message);
      return { ok: false, shouldReset: false };
    }

    if (user) {
      let ok = false;
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
          ok = true;
        }
      } catch (e) {
        console.error("기도 노트 저장 실패:", e);
        toast.error("기도 노트를 저장하지 못했습니다.");
      } finally {
        setLoading(false);
      }

      return { ok, shouldReset: true };
    }

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

    return { ok: true, shouldReset: true };
  };

  const updateNote = async ({
    id,
    title,
    content,
    tags,
  }: UpdateNoteInput): Promise<PrayerNoteMutateResult> => {
    if (!title.trim() || !content.trim()) {
      toast.error("제목과 내용을 입력해주세요.");
      return { ok: false, shouldReset: false };
    }

    if (user) {
      let ok = false;
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
          ok = true;
        }
      } catch (e) {
        console.error("기도 노트 수정 실패:", e);
        toast.error("기도 노트를 수정하지 못했습니다.");
      } finally {
        setLoading(false);
      }

      return { ok, shouldReset: true };
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
    return { ok: true, shouldReset: true };
  };

  const deleteNote = async (id: string) => {
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
        return false;
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
    return true;
  };

  const createResponse = async (noteId: string, contentValue: string) => {
    if (!contentValue) {
      toast.error("응답을 입력해주세요.");
      return false;
    }

    if (user) {
      try {
        const noteIdValue = Number(noteId);
        if (!Number.isFinite(noteIdValue)) {
          toast.error("응답을 저장할 수 없습니다.");
          return false;
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
          return true;
        }
      } catch (e) {
        console.error("응답 저장 실패:", e);
        toast.error("응답을 저장하지 못했습니다.");
        return false;
      }
      return false;
    }

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
    return true;
  };

  const updateResponse = async (
    noteId: string,
    responseId: string,
    contentValue: string
  ) => {
    if (!contentValue) {
      toast.error("응답을 입력해주세요.");
      return false;
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
                            timestamp: data.created_at ?? response.timestamp,
                          }
                        : response
                    ),
                  }
                : note
            )
          );
          return true;
        }
      } catch (e) {
        console.error("응답 수정 실패:", e);
        toast.error("응답을 수정하지 못했습니다.");
        return false;
      }
      return false;
    }

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
    return true;
  };

  const deleteResponse = async (noteId: string, responseId: string) => {
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
        return false;
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

    toast.success("응답을 삭제했습니다.");
    return true;
  };

  return {
    notes,
    loading,
    loadNotes,
    createNote,
    updateNote,
    deleteNote,
    createResponse,
    updateResponse,
    deleteResponse,
  };
}
