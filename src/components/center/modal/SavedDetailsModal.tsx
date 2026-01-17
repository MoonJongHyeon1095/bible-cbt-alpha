import { Bookmark, Loader2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../../ui/dialog";
import type { EmotionNoteDetailWithNote } from "../types";

interface SavedDetailsModalProps {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  details: EmotionNoteDetailWithNote[];
  showNoteScopeOnly?: boolean;
  activeNoteTrigger?: string | null;
  onSelect: (detail: EmotionNoteDetailWithNote) => void;
  onDelete: (id: string) => void;
}

export function SavedDetailsModal({
  open,
  onClose,
  loading,
  details,
  showNoteScopeOnly,
  activeNoteTrigger,
  onSelect,
  onDelete,
}: SavedDetailsModalProps) {
  const pageSize = 3;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(details.length / pageSize));
  const paged = details.slice((page - 1) * pageSize, page * pageSize);

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const resetPage = () => setPage(1);

  useEffect(() => {
    resetPage();
  }, [details, open]);

  return (
    <Dialog
      open={open}
      onOpenChange={(next: boolean) => {
        if (!next) onClose();
      }}
    >
      <DialogContent className="bg-white max-w-4xl w-[92vw] sm:w-full max-h-[90vh] p-0 overflow-hidden flex flex-col border border-slate-200 shadow-2xl rounded-2xl">
        <div className="p-6 flex flex-col gap-4 h-full min-h-0">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <DialogTitle className="flex items-center gap-2 text-lg pr-14">
                <span className="flex size-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                  <Bookmark className="size-4" />
                </span>
                감정노트에서 불러오기
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-600">
                감정노트에 저장된 자동 사고 목록에서 선택합니다.
              </DialogDescription>
            </div>
          </div>

          <div className="flex flex-col gap-3 flex-1 min-h-0">
            <div className="flex-1 min-h-0 overflow-y-auto">
              {loading ? (
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Loader2 className="size-4 animate-spin" />
                  불러오는 중입니다...
                </div>
              ) : details.length === 0 ? (
                <p className="text-sm text-slate-500">
                  저장된 자동 사고가 없습니다.
                </p>
              ) : (
                <div className="space-y-2">
                  {paged.map((fav) => (
                    <button
                      key={fav.id}
                      onClick={() => onSelect(fav)}
                      className="group w-full text-left bg-white p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                            {fav.emotion || "감정"}
                          </span>
                          <span className="text-xs text-slate-500">
                            {fav.noteTitle || "저장된 상황"}
                          </span>
                        </div>
                      </div>
                      <p className="text-slate-800 text-sm whitespace-pre-wrap">
                        {fav.automaticThought}
                      </p>
                      {fav.noteTrigger ? (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {fav.noteTrigger}
                        </p>
                      ) : null}
                      <div className="flex justify-end mt-3 gap-2">
                        <Button
                          onClick={(event) => {
                            event.stopPropagation();
                            onDelete(fav.id);
                          }}
                          variant="outline"
                          size="sm"
                          className="text-indigo-600 hover:bg-indigo-50"
                        >
                          <Trash2 className="size-4 mr-1" />
                          삭제
                        </Button>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {details.length > pageSize && (
              <div className="flex items-center justify-center gap-3 text-sm text-slate-600">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!hasPrev}
                >
                  이전
                </Button>
                <span className="min-w-[64px] text-center">
                  {page} / {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={!hasNext}
                >
                  다음
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
