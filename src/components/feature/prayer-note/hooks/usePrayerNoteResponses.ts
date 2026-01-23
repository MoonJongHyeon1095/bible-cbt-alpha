import type { User } from "@supabase/supabase-js";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { toast } from "sonner";
import type { PrayerNote, PrayerNoteResponse } from "../types/prayerNotes.types";
import {
  createPrayerNoteResponse,
  deletePrayerNoteResponse,
  updatePrayerNoteResponse,
} from "../utils/api";

interface UsePrayerNoteResponsesParams {
  user: User | null;
  notes: PrayerNote[];
  setNotes: Dispatch<SetStateAction<PrayerNote[]>>;
}

export function usePrayerNoteResponses({
  user,
  notes,
  setNotes,
}: UsePrayerNoteResponsesParams) {
  const [responseDrafts, setResponseDrafts] = useState<Record<string, string>>(
    {}
  );
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

  const resetResponseEdit = () => {
    setEditingResponseNoteId(null);
    setEditingResponseId(null);
    setEditingResponseContent("");
  };

  const handleCreateResponse = async (noteId: string) => {
    const content = (responseDrafts[noteId] ?? "").trim();
    if (!content) {
      toast.error("응답-묵상을 입력해주세요.");
      return;
    }

    if (!user) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    try {
      const noteIdValue = Number(noteId);
      if (!Number.isFinite(noteIdValue)) {
        toast.error("응답-묵상을 저장할 수 없습니다.");
        return;
      }

      const newResponse = await createPrayerNoteResponse(
        user.id,
        noteIdValue,
        content
      );
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
    } catch (error) {
      console.error("응답-묵상 저장 실패:", error);
      toast.error("응답-묵상을 저장하지 못했습니다.");
      return;
    }

    setResponseDrafts((prev) => ({ ...prev, [noteId]: "" }));
  };

  const handleUpdateResponse = async (
    noteId: string,
    responseId: string
  ) => {
    const content = editingResponseContent.trim();
    if (!content) {
      toast.error("응답-묵상을 입력해주세요.");
      return;
    }

    if (!user) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    try {
      const updatedResponse = await updatePrayerNoteResponse(
        user.id,
        responseId,
        content
      );
      setNotes((prev) =>
        prev.map((note) =>
          note.id === noteId
            ? {
                ...note,
                responses: note.responses.map((response) =>
                  response.id === responseId
                    ? {
                        ...response,
                        content: updatedResponse.content,
                        timestamp:
                          updatedResponse.timestamp ?? response.timestamp,
                      }
                    : response
                ),
              }
            : note
        )
      );
    } catch (error) {
      console.error("응답-묵상 수정 실패:", error);
      toast.error("응답-묵상을 수정하지 못했습니다.");
      return;
    }

    resetResponseEdit();
  };

  const handleDeleteResponse = async (
    noteId: string,
    responseId: string
  ) => {
    if (!user) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    try {
      await deletePrayerNoteResponse(user.id, responseId);
    } catch (error) {
      console.error("응답-묵상 삭제 실패:", error);
      toast.error("응답-묵상을 삭제하지 못했습니다.");
      return;
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

    setNotes(updated);

    if (editingResponseId === responseId) {
      resetResponseEdit();
    }
    toast.success("응답-묵상을 삭제했습니다.");
  };

  const startEditResponse = (noteId: string, response: PrayerNoteResponse) => {
    setEditingResponseNoteId(noteId);
    setEditingResponseId(response.id);
    setEditingResponseContent(response.content);
  };

  const toggleExpandedResponse = (key: string) => {
    setExpandedResponses((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const updateResponseDraft = (noteId: string, value: string) => {
    setResponseDrafts((prev) => ({ ...prev, [noteId]: value }));
  };

  return {
    responseDrafts,
    editingResponseNoteId,
    editingResponseId,
    editingResponseContent,
    expandedResponses,
    setEditingResponseContent,
    startEditResponse,
    resetResponseEdit,
    handleCreateResponse,
    handleUpdateResponse,
    handleDeleteResponse,
    toggleExpandedResponse,
    updateResponseDraft,
  };
}
