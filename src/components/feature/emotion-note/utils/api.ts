import { ENV } from "../../../../config/env";
import { supabase } from "../../../../lib/supabase/client";

const API_BASE = ENV.API_BASE || "";
const APP_API_KEY = ENV.APP_API_KEY || "";

export async function authFetch(path: string, options: RequestInit = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (APP_API_KEY) headers["x-api-key"] = APP_API_KEY;

  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });
}

export async function fetchNotesAPI(includeDetails = false) {
  const params = new URLSearchParams();
  if (includeDetails) params.set("includeDetails", "true");
  const res = await authFetch(
    `/api/emotion-notes${params.toString() ? `?${params.toString()}` : ""}`,
    { method: "GET" }
  );
  const payload = await res.json().catch(() => ({}));
  return { ok: res.ok, payload };
}

export async function createNoteAPI(body: {
  title: string;
  trigger: string;
  behavior?: string;
}) {
  const res = await authFetch("/api/emotion-notes", {
    method: "POST",
    body: JSON.stringify(body),
  });
  const payload = await res.json().catch(() => ({}));
  return { ok: res.ok, payload };
}

export async function updateNoteAPI(body: Record<string, any>) {
  const res = await authFetch("/api/emotion-notes", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  const payload = await res.json().catch(() => ({}));
  return { ok: res.ok, payload };
}

export async function deleteNoteAPI(id: string) {
  const res = await authFetch(`/api/emotion-notes?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  const payload = await res.json().catch(() => ({}));
  return { ok: res.ok, payload };
}

export async function createDetailAPI(body: {
  noteId: string | number;
  automaticThought: string;
  emotion: string;
}) {
  const res = await authFetch("/api/emotion-note-details", {
    method: "POST",
    body: JSON.stringify(body),
  });
  const payload = await res.json().catch(() => ({}));
  return { ok: res.ok, payload };
}

export async function updateDetailAPI(body: {
  id: string | number;
  automaticThought?: string;
  emotion?: string;
}) {
  const res = await authFetch("/api/emotion-note-details", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  const payload = await res.json().catch(() => ({}));
  return { ok: res.ok, payload };
}

export async function deleteDetailAPI(id: string) {
  const res = await authFetch(
    `/api/emotion-note-details?id=${encodeURIComponent(id)}`,
    { method: "DELETE" }
  );
  const payload = await res.json().catch(() => ({}));
  return { ok: res.ok, payload };
}

export async function fetchAlternativesAPI(noteId?: string) {
  const params = new URLSearchParams();
  if (noteId) params.set("noteId", noteId);
  const res = await authFetch(
    `/api/emotion-alternative-details${params.toString() ? `?${params.toString()}` : ""}`,
    { method: "GET" }
  );
  const payload = await res.json().catch(() => ({}));
  return { ok: res.ok, payload };
}

export async function createAlternativeAPI(body: {
  noteId: string | number;
  alternative: string;
}) {
  const res = await authFetch("/api/emotion-alternative-details", {
    method: "POST",
    body: JSON.stringify(body),
  });
  const payload = await res.json().catch(() => ({}));
  return { ok: res.ok, payload };
}

export async function updateAlternativeAPI(body: {
  id: string | number;
  alternative: string;
}) {
  const res = await authFetch("/api/emotion-alternative-details", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  const payload = await res.json().catch(() => ({}));
  return { ok: res.ok, payload };
}

export async function deleteAlternativeAPI(id: string) {
  const res = await authFetch(
    `/api/emotion-alternative-details?id=${encodeURIComponent(id)}`,
    { method: "DELETE" }
  );
  const payload = await res.json().catch(() => ({}));
  return { ok: res.ok, payload };
}

export async function createBehaviorDetailAPI(body: {
  noteId: string | number;
  behaviorLabel: string;
  behaviorDescription: string;
  errorTags?: string[];
}) {
  const res = await authFetch("/api/emotion-behavior-details", {
    method: "POST",
    body: JSON.stringify(body),
  });
  const payload = await res.json().catch(() => ({}));
  return { ok: res.ok, payload };
}

export async function createErrorDetailsAPI(body: {
  noteId: string | number;
  errors: Array<{ errorLabel: string; errorDescription: string }>;
}) {
  const res = await authFetch("/api/emotion-error-details", {
    method: "POST",
    body: JSON.stringify(body),
  });
  const payload = await res.json().catch(() => ({}));
  return { ok: res.ok, payload };
}
