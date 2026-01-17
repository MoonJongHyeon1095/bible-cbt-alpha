import { Bookmark, ChevronDown, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../../ui/dialog";
import type { EmotionNote } from "../types";

interface SavedTriggersModalProps {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  triggers: EmotionNote[];
  onSelect: (note: EmotionNote) => void;
}

export function SavedTriggersModal({
  open,
  onClose,
  loading,
  triggers,
  onSelect,
}: SavedTriggersModalProps) {
  const pageSize = 5;
  const [page, setPage] = useState(1);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const totalPages = Math.max(1, Math.ceil(triggers.length / pageSize));
  const paged = triggers.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
    setExpandedIds({});
  }, [triggers, open]);

  return (
    <Dialog
      open={open}
      onOpenChange={(next: boolean) => {
        if (!next) onClose();
      }}
    >
      <DialogContent className="max-w-4xl w-[92vw] sm:w-full max-h-[90vh] bg-white p-0 overflow-hidden flex flex-col border border-slate-200 shadow-2xl rounded-2xl">
        <div className="p-6 flex flex-col gap-4 h-full min-h-0">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <DialogTitle className="flex items-center gap-2 text-lg">
                <span className="flex size-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                  <Bookmark className="size-4" />
                </span>
                저장된 상황 불러오기
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-600">
                감정노트에서 저장된 상황을 선택하여 세션을 진행합니다.
              </DialogDescription>
            </div>
          </div>

          <div className="flex flex-col gap-3 flex-1 min-h-0">
            <div className="flex-1 min-h-0 border border-slate-200 rounded-xl p-3 bg-slate-50/80 overflow-y-auto">
              {loading ? (
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Loader2 className="size-4 animate-spin" />
                  불러오는 중입니다...
                </div>
              ) : triggers.length === 0 ? (
                <p className="text-sm text-slate-500">
                  아직 저장된 상황이 없습니다.
                </p>
              ) : (
                <div className="space-y-2">
                  {paged.map((note) => {
                    const isExpanded = Boolean(expandedIds[note.id]);
                    return (
                    <button
                      key={note.id}
                      onClick={() => onSelect(note)}
                      className="group w-full text-left px-4 py-3 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-slate-800 font-semibold text-sm">
                          {note.title || "저장된 상황"}
                        </div>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setExpandedIds((prev) => ({
                              ...prev,
                              [note.id]: !prev[note.id],
                            }));
                          }}
                          className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600 hover:border-indigo-300 hover:text-indigo-700 sm:hidden"
                          aria-expanded={isExpanded}
                          aria-label="내용 펼치기"
                        >
                          <ChevronDown
                            className={`size-3 transition-transform ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      </div>
                      <div
                        className={`text-slate-700 text-sm leading-6 mt-1 overflow-hidden transition-[max-height] duration-300 ease-out sm:group-hover:max-h-48 sm:group-hover:line-clamp-none ${
                          isExpanded
                            ? "max-h-48"
                            : "line-clamp-2 max-h-12"
                        }`}
                      >
                        {note.trigger}
                      </div>
                    </button>
                  );
                  })}
                </div>
              )}
            </div>

            {triggers.length > pageSize && (
              <div className="flex items-center justify-center gap-3 text-xs text-slate-600">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:border-indigo-300 hover:text-indigo-700 disabled:opacity-50"
                  disabled={page === 1}
                >
                  이전
                </button>
                <span className="min-w-[64px] text-center">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:border-indigo-300 hover:text-indigo-700 disabled:opacity-50"
                  disabled={page === totalPages}
                >
                  다음
                </button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
