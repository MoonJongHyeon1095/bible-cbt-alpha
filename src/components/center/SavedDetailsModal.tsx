import { Bookmark, Loader2, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../ui/dialog";
import type { EmotionNoteDetailWithNote } from "./types";

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
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-4xl w-[95vw] bg-white">
        <DialogTitle className="flex items-center gap-2 text-lg">
          <Bookmark className="size-5 text-yellow-600" />
          저장한 자동사고 불러오기
        </DialogTitle>
        <DialogDescription className="sr-only">
          저장된 자동사고 목록에서 선택합니다.
        </DialogDescription>

        {showNoteScopeOnly && activeNoteTrigger ? (
          <p className="text-xs text-slate-600">
            트리거: {activeNoteTrigger}
          </p>
        ) : null}

        <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 max-h-[70vh] overflow-y-auto mt-3">
          {loading ? (
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <Loader2 className="size-4 animate-spin" />
              불러오는 중입니다...
            </div>
          ) : details.length === 0 ? (
            <p className="text-sm text-slate-500">
              저장된 자동사고가 없습니다.
            </p>
          ) : (
            <div className="space-y-2">
              {details.map((fav) => (
                <div
                  key={fav.id}
                  className="bg-white p-3 rounded-lg border-2 border-yellow-200"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {fav.emotion || "감정"}
                      </span>
                      <span className="text-xs text-slate-500">
                        {fav.noteTitle || "저장된 상황"}
                      </span>
                    </div>
                    <Button
                      onClick={() => onDelete(fav.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="size-4 mr-1" />
                      삭제
                    </Button>
                  </div>
                  <p className="text-slate-800 text-sm whitespace-pre-wrap">
                    {fav.automaticThought}
                  </p>
                  {fav.noteTrigger ? (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {fav.noteTrigger}
                    </p>
                  ) : null}
                  <div className="flex justify-end mt-3">
                    <Button
                      size="sm"
                      onClick={() => onSelect(fav)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      이 생각으로 진행하기
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
