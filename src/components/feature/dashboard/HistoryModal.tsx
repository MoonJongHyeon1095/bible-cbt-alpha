import type { User } from "@supabase/supabase-js";
import { Calendar, ChevronDown, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { normalizeSelectedCognitiveErrors } from "../../../lib/normalizeSelectedCognitiveErrors";
import { supabase } from "../../../lib/supabase/client";
import type { SessionHistory } from "../../../types/sessionHistory";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";

interface HistoryModalProps {
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
  user: User | null;
}

export function HistoryModal({
  open,
  onClose,
  onUpdated,
  user,
}: HistoryModalProps) {
  const [histories, setHistories] = useState<SessionHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [expandedErrors, setExpandedErrors] = useState<
    Record<string, Set<number>>
  >({});
  const [expandedBehaviors, setExpandedBehaviors] = useState<
    Record<string, boolean>
  >({});
  const [expandedHistories, setExpandedHistories] = useState<
    Record<string, boolean>
  >({});
  useEffect(() => {
    if (open) {
      loadHistories();
    }
  }, [open, user]);
  useEffect(() => {
    if (!open) {
      setConfirmDeleteAll(false);
    }
  }, [open]);

  const loadHistories = async () => {
    setLoading(true);

    // 로그인: Supabase에서 조회
    if (user) {
      try {
        const { data, error } = await supabase
          .from("session_history")
          .select(
            "id, timestamp, user_input, emotion_thought_pairs, selected_cognitive_errors, selected_alternative_thought, selected_behavior, positive_reframes, bible_verse"
          )
          .eq("user_id", user.id)
          .is("soft_deleted_at", null)
          .order("timestamp", { ascending: false })
          .limit(50);

        if (error) throw error;

        const mapped =
          data?.map((row) => ({
            id: String(row.id),
            timestamp: row.timestamp,
            userInput: row.user_input ?? "",
            emotionThoughtPairs: Array.isArray(row.emotion_thought_pairs)
              ? row.emotion_thought_pairs
              : [],
            selectedCognitiveErrors: normalizeSelectedCognitiveErrors(
              row.selected_cognitive_errors
            ),
            selectedAlternativeThought: row.selected_alternative_thought ?? "",
            selectedBehavior: row.selected_behavior ?? null,
            positiveReframes:
              (row.positive_reframes as Record<string, string>) ?? {},
            bibleVerse: row.bible_verse as SessionHistory["bibleVerse"],
          })) ?? [];

        setHistories(mapped);
        return;
      } catch (e) {
        console.error("히스토리 로드 실패:", e);
        toast.error("세션 기록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    }

    // 비로그인: 로컬 저장소
    const saved = localStorage.getItem("cbt_history");
    if (saved) {
      try {
        const parsed: SessionHistory[] = JSON.parse(saved).map((item: any) => ({
          ...item,
          selectedCognitiveErrors: normalizeSelectedCognitiveErrors(
            item.selectedCognitiveErrors
          ),
          selectedBehavior: item.selectedBehavior ?? null,
        }));
        setHistories(parsed);
      } catch (e) {
        console.error("히스토리 로드 실패:", e);
        setHistories([]);
      }
    } else {
      setHistories([]);
    }
    setLoading(false);
  };

  const deleteHistory = async (id: string) => {
    if (user) {
      try {
        setLoading(true);
        const { error } = await supabase
          .from("session_history")
          .update({ soft_deleted_at: new Date().toISOString() })
          .eq("id", id)
          .eq("user_id", user.id)
          .is("soft_deleted_at", null);
        if (error) throw error;
      } catch (e) {
        console.error("히스토리 삭제 실패:", e);
        toast.error("세션 기록을 삭제하지 못했습니다.");
        return;
      } finally {
        setLoading(false);
      }
    }

    const updated = histories.filter((h) => h.id !== id);
    setHistories(updated);
    if (!user) {
      localStorage.setItem("cbt_history", JSON.stringify(updated));
    }
    onUpdated();
  };

  const deleteAllHistories = async () => {
    if (user) {
      try {
        setLoading(true);
        const { error } = await supabase
          .from("session_history")
          .update({ soft_deleted_at: new Date().toISOString() })
          .eq("user_id", user.id)
          .is("soft_deleted_at", null);
        if (error) throw error;
      } catch (e) {
        console.error("전체 히스토리 삭제 실패:", e);
        toast.error("세션 기록을 모두 삭제하지 못했습니다.");
        return;
      } finally {
        setLoading(false);
      }
    }

    setHistories([]);
    setExpandedHistories({});
    setExpandedErrors({});
    if (!user) {
      localStorage.removeItem("cbt_history");
    }
    onUpdated();
  };
  const requestDeleteAll = () => {
    setConfirmDeleteAll(true);
  };
  const confirmDeleteAllHistories = async () => {
    await deleteAllHistories();
    setConfirmDeleteAll(false);
  };
  const cancelDeleteAll = () => {
    setConfirmDeleteAll(false);
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

  const toggleErrorDetail = (historyId: string, index: number) => {
    setExpandedErrors((prev) => {
      const currentSet = prev[historyId]
        ? new Set(prev[historyId])
        : new Set<number>();
      if (currentSet.has(index)) {
        currentSet.delete(index);
      } else {
        currentSet.add(index);
      }
      return { ...prev, [historyId]: currentSet };
    });
  };

  const toggleHistory = (historyId: string) => {
    setExpandedHistories((prev) => ({
      ...prev,
      [historyId]: !prev[historyId],
    }));
  };

  const toggleBehavior = (historyId: string) => {
    setExpandedBehaviors((prev) => ({
      ...prev,
      [historyId]: !prev[historyId],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl max-h-[80vh] bg-slate-900 border-slate-700 text-slate-100 p-0 overflow-hidden flex flex-col"
        aria-describedby="history-description"
      >
        <div className="sticky top-0 z-30 px-6 pt-6 pb-4 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/90 border-b border-slate-800">
          <DialogHeader className="text-left">
            <DialogTitle className="text-2xl text-white flex items-center gap-2">
              <Calendar className="size-6 text-indigo-400" />
              이전 기록 다시보기
            </DialogTitle>
            <DialogDescription
              id="history-description"
              className="text-slate-400"
            >
              저장된 인지치료 세션 기록을 확인하고 관리할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex flex-col items-end gap-2">
            <Button
              type="button"
              onClick={requestDeleteAll}
              variant="ghost"
              size="sm"
              disabled={loading || histories.length === 0}
              className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
            >
              <Trash2 className="size-4 mr-2" />
              전체 삭제
            </Button>
            {confirmDeleteAll && (
              <div className="flex flex-wrap items-center justify-end gap-3 rounded-lg border border-red-500/40 bg-red-950/30 px-3 py-2 text-sm text-red-100">
                <span>이전 세션 기록이 모두 삭제됩니다.</span>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    onClick={confirmDeleteAllHistories}
                    variant="destructive"
                    size="sm"
                    disabled={loading}
                    className="bg-red-600 text-white hover:bg-red-500"
                  >
                    삭제
                  </Button>
                  <Button
                    type="button"
                    onClick={cancelDeleteAll}
                    variant="outline"
                    size="sm"
                    disabled={loading}
                    className="border-white/70 bg-transparent text-white"
                  >
                    취소
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4 mt-4">
          {loading ? (
            <div className="text-center py-12 text-slate-400">
              <p className="text-lg mb-2">기록을 불러오는 중입니다...</p>
            </div>
          ) : histories.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="text-lg mb-2">저장된 기록이 없습니다.</p>
              <p className="text-sm">완료된 세션은 자동으로 저장됩니다.</p>
            </div>
          ) : (
            histories.map((history) => (
              <div
                key={history.id}
                className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-xl p-5 space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => toggleHistory(history.id)}
                    className="flex-1 text-left"
                    aria-expanded={expandedHistories[history.id] ?? false}
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className={`mt-0.5 inline-flex size-7 items-center justify-center rounded-full border ${
                          expandedHistories[history.id]
                            ? "border-indigo-300/70 bg-indigo-500/20"
                            : "border-indigo-400/50 bg-indigo-500/10"
                        } shadow-[0_0_0_1px_rgba(255,255,255,0.08)]`}
                      >
                        <ChevronDown
                          className={`size-4 transition-transform ${
                            expandedHistories[history.id]
                              ? "rotate-180 text-indigo-100"
                              : "text-indigo-200"
                          }`}
                        />
                      </span>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-100 leading-relaxed">
                          {history.userInput || "경험"}
                        </p>
                        <span className="text-xs text-slate-400">
                          {formatDate(history.timestamp)}
                        </span>
                      </div>
                    </div>
                  </button>

                  {/* 삭제 버튼 */}
                  <Button
                    onClick={() => deleteHistory(history.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>

                {expandedHistories[history.id] && (
                  <div className="space-y-6">
                    {/* 경험 */}
                    <div className="space-y-2">
                      <p className="text-xs text-indigo-400">📝 경험</p>
                      <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-3">
                        <p className="text-slate-200 leading-relaxed">
                          {history.userInput}
                        </p>
                      </div>
                    </div>

                    {/* 감정-자동사고 */}
                    {history.emotionThoughtPairs.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-purple-400">
                          💭 감정 & 자동사고
                        </p>
                        <div className="space-y-2">
                          {history.emotionThoughtPairs.map((pair, idx) => (
                            <div
                              key={idx}
                              className="rounded-lg border border-purple-300/40 bg-purple-900/30 p-3 space-y-2"
                            >
                              <div className="flex flex-wrap items-center gap-2 -ml-1">
                                <span className="inline-flex items-center rounded-full border-2 border-purple-100 bg-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-50 shadow-[0_0_0_1px_rgba(255,255,255,0.3)]">
                                  {pair.emotion}
                                </span>
                                {pair.intensity != null && (
                                  <span className="inline-flex items-center rounded-full border-2 border-purple-100 bg-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-50 shadow-[0_0_0_1px_rgba(255,255,255,0.3)]">
                                    강도 {pair.intensity}/100
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-slate-200 leading-relaxed">
                                {pair.thought}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 인지오류 */}
                    {history.selectedCognitiveErrors.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-orange-400">⚠️ 인지오류</p>
                        <div className="space-y-2">
                          {history.selectedCognitiveErrors.map((error, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => toggleErrorDetail(history.id, idx)}
                              className={`w-full rounded-lg border px-4 py-3 text-left transition-colors focus:outline-none focus:ring-2 ${
                                expandedErrors[history.id]?.has(idx)
                                  ? "border-orange-400/60 bg-orange-500/15 text-slate-100 focus:ring-orange-300/60"
                                  : "border-orange-500/30 bg-orange-500/5 text-slate-200 hover:bg-orange-500/10 focus:ring-orange-400/50"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-sm font-semibold">
                                  {error.title}
                                </span>
                                <ChevronDown
                                  className={`size-4 transition-transform ${
                                    expandedErrors[history.id]?.has(idx)
                                      ? "rotate-180 text-orange-200"
                                      : "text-orange-300"
                                  }`}
                                />
                              </div>
                              {expandedErrors[history.id]?.has(idx) &&
                                error.detail && (
                                  <p className="mt-2 text-sm leading-relaxed">
                                    {error.detail}
                                  </p>
                                )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 대안사고 */}
                    {history.selectedAlternativeThought && (
                      <div className="space-y-2">
                        <p className="text-xs text-green-400">✨ 대안사고</p>
                        <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3">
                          <p className="text-sm text-slate-200 italic leading-relaxed">
                            {history.selectedAlternativeThought}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* 행동 반응 */}
                    {history.selectedBehavior && (
                      <div className="space-y-2">
                        <p className="text-xs text-blue-400">🧭 행동 반응</p>
                        <button
                          type="button"
                          onClick={() => toggleBehavior(history.id)}
                          className={`w-full rounded-lg border px-4 py-3 text-left transition-colors focus:outline-none focus:ring-2 ${
                            expandedBehaviors[history.id]
                              ? "border-blue-400/60 bg-blue-500/15 text-blue-100 focus:ring-blue-300/60"
                              : "border-blue-500/30 bg-blue-500/5 text-blue-200 hover:bg-blue-500/10 focus:ring-blue-400/50"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold">
                              {history.selectedBehavior.behaviorLabel}
                            </span>
                            <ChevronDown
                              className={`size-4 transition-transform ${
                                expandedBehaviors[history.id]
                                  ? "rotate-180 text-blue-200"
                                  : "text-blue-300"
                              }`}
                            />
                          </div>
                          {expandedBehaviors[history.id] && (
                            <p className="mt-2 text-sm text-slate-200 leading-relaxed">
                              {history.selectedBehavior.behaviorText}
                            </p>
                          )}
                        </button>
                      </div>
                    )}

                    {/* 성경 말씀 */}
                    {history.bibleVerse && (
                      <div className="space-y-2">
                        <p className="text-xs text-amber-400">📖 성경 말씀</p>
                        <div className="bg-amber-900/30 border border-amber-700 rounded-lg p-3 space-y-2">
                          <p className="text-amber-300 text-sm font-semibold">
                            {history.bibleVerse.reference}
                          </p>
                          <p className="text-slate-200 text-sm italic leading-relaxed">
                            "{history.bibleVerse.verse}"
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
