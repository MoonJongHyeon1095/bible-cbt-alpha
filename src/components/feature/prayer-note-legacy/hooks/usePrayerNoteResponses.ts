import { useState } from "react";
import type { PrayerNoteResponse } from "../types/types";

type UsePrayerNoteResponsesOptions = {
  createResponse: (noteId: string, contentValue: string) => Promise<boolean>;
  updateResponse: (
    noteId: string,
    responseId: string,
    contentValue: string
  ) => Promise<boolean>;
  deleteResponse: (noteId: string, responseId: string) => Promise<boolean>;
};

export function usePrayerNoteResponses({
  createResponse,
  updateResponse,
  deleteResponse,
}: UsePrayerNoteResponsesOptions) {
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

  const resetResponseEdit = () => {
    setEditingResponseNoteId(null);
    setEditingResponseId(null);
    setEditingResponseContent("");
  };

  const toggleExpanded = (responseKey: string) => {
    setExpandedResponses((prev) => ({
      ...prev,
      [responseKey]: !prev[responseKey],
    }));
  };

  const startEditResponse = (
    noteId: string,
    response: PrayerNoteResponse
  ) => {
    setEditingResponseNoteId(noteId);
    setEditingResponseId(response.id);
    setEditingResponseContent(response.content);
  };

  const updateEditingContent = (value: string) => {
    setEditingResponseContent(value);
  };

  const changeDraft = (noteId: string, value: string) => {
    setResponseDrafts((prev) => ({ ...prev, [noteId]: value }));
  };

  const createResponseForNote = async (noteId: string) => {
    const contentValue = (responseDrafts[noteId] ?? "").trim();
    const ok = await createResponse(noteId, contentValue);
    if (ok) {
      setResponseDrafts((prev) => ({ ...prev, [noteId]: "" }));
    }
  };

  const updateResponseForNote = async (
    noteId: string,
    responseId: string
  ) => {
    const contentValue = editingResponseContent.trim();
    const ok = await updateResponse(noteId, responseId, contentValue);
    if (ok) {
      resetResponseEdit();
    }
  };

  const deleteResponseForNote = async (
    noteId: string,
    responseId: string
  ) => {
    const ok = await deleteResponse(noteId, responseId);
    if (ok && editingResponseId === responseId) {
      resetResponseEdit();
    }
  };

  return {
    responseDrafts,
    expandedResponses,
    editingResponseNoteId,
    editingResponseId,
    editingResponseContent,
    setExpandedResponses,
    setResponseDrafts,
    setEditingResponseContent,
    resetResponseEdit,
    toggleExpanded,
    startEditResponse,
    updateEditingContent,
    changeDraft,
    createResponseForNote,
    updateResponseForNote,
    deleteResponseForNote,
  };
}
