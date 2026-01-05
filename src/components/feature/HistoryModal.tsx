import { Calendar, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

interface SessionHistory {
  id: string;
  timestamp: string;
  userInput: string;
  emotionThoughtPairs: Array<{
    emotion: string;
    intensity: number;
    thought: string;
  }>;
  selectedCognitiveErrors: string[];
  selectedAlternativeThought: string;
  positiveReframes: { [emotion: string]: string };
  bibleVerse?: {
    verse: string;
    reference: string;
    prayer: string;
  } | null;
}

interface HistoryModalProps {
  open: boolean;
  onClose: () => void;
}

export function HistoryModal({ open, onClose }: HistoryModalProps) {
  const [histories, setHistories] = useState<SessionHistory[]>([]);

  useEffect(() => {
    if (open) {
      loadHistories();
    }
  }, [open]);

  const loadHistories = () => {
    const saved = localStorage.getItem("cbt_history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHistories(parsed);
      } catch (e) {
        console.error("히스토리 로드 실패:", e);
      }
    }
  };

  const deleteHistory = (id: string) => {
    const updated = histories.filter((h) => h.id !== id);
    setHistories(updated);
    localStorage.setItem("cbt_history", JSON.stringify(updated));
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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl max-h-[80vh] overflow-y-auto bg-slate-900 border-slate-700 text-slate-100"
        aria-describedby="history-description"
      >
        <DialogHeader>
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

        <div className="space-y-4 mt-4">
          {histories.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="text-lg mb-2">저장된 기록이 없습니다.</p>
              <p className="text-sm">완료된 세션은 자동으로 저장됩니다.</p>
            </div>
          ) : (
            histories.map((history) => (
              <div
                key={history.id}
                className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-xl p-5 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-slate-400">
                        {formatDate(history.timestamp)}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {/* 경험 */}
                      <div>
                        <p className="text-xs text-indigo-400 mb-1">📝 경험</p>
                        <p className="text-slate-200">{history.userInput}</p>
                      </div>

                      {/* 감정-자동사고 */}
                      {history.emotionThoughtPairs.length > 0 && (
                        <div>
                          <p className="text-xs text-purple-400 mb-1">
                            💭 감정 & 자동사고
                          </p>
                          <div className="space-y-1">
                            {history.emotionThoughtPairs.map((pair, idx) => (
                              <p key={idx} className="text-sm text-slate-300">
                                • {pair.emotion} ({pair.intensity}/100):{" "}
                                {pair.thought}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 인지오류 */}
                      {history.selectedCognitiveErrors.length > 0 && (
                        <div>
                          <p className="text-xs text-orange-400 mb-1">
                            ⚠️ 인지오류
                          </p>
                          <div className="space-y-1">
                            {history.selectedCognitiveErrors.map(
                              (error, idx) => (
                                <p key={idx} className="text-sm text-slate-300">
                                  • {error}
                                </p>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {/* 대안사고 */}
                      {history.selectedAlternativeThought && (
                        <div>
                          <p className="text-xs text-green-400 mb-1">
                            ✨ 대안사고
                          </p>
                          <p className="text-sm text-slate-300 italic">
                            "{history.selectedAlternativeThought}"
                          </p>
                        </div>
                      )}

                      {/* 성경 말씀 */}
                      {history.bibleVerse && (
                        <div>
                          <p className="text-xs text-amber-400 mb-1">
                            📖 성경 말씀
                          </p>
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
                  </div>

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
              </div>
            ))
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            onClick={onClose}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            닫기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
