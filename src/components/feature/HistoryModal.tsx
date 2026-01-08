import { Calendar, ChevronDown, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase/client";
import { toast } from "sonner";
import type { SessionHistory } from "../../types/sessionHistory";
import { normalizeSelectedCognitiveErrors } from "../../lib/normalizeSelectedCognitiveErrors";

interface HistoryModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
}

export function HistoryModal({ open, onClose, user }: HistoryModalProps) {
  const [histories, setHistories] = useState<SessionHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedErrors, setExpandedErrors] = useState<
    Record<string, Set<number>>
  >({});
  const [expandedHistories, setExpandedHistories] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    if (open) {
      loadHistories();
    }
  }, [open, user]);

  const loadHistories = async () => {
    setLoading(true);

    // 로그인: Supabase에서 조회
    if (user) {
      try {
        const { data, error } = await supabase
          .from("session_history")
          .select(
            "id, timestamp, user_input, emotion_thought_pairs, selected_cognitive_errors, selected_alternative_thought, positive_reframes, bible_verse"
          )
          .eq("user_id", user.id)
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
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);
        if (error) throw error;
      } catch (e) {
        console.error("히스토리 삭제 실패:", e);
        toast.error("세션 기록을 삭제하지 못했습니다.");
      } finally {
        setLoading(false);
      }
    }

    const updated = histories.filter((h) => h.id !== id);
    setHistories(updated);
    if (!user) {
      localStorage.setItem("cbt_history", JSON.stringify(updated));
    }
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
                          {history.selectedCognitiveErrors.map(
                            (error, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() =>
                                  toggleErrorDetail(history.id, idx)
                                }
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
                            )
                          )}
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
