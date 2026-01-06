import { Bookmark, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../ui/dialog";
import type { EmotionNote } from "./types";

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
  return (
    <Dialog
      open={open}
      onOpenChange={(next: boolean) => {
        if (!next) onClose();
      }}
    >
      <DialogContent className="max-w-3xl w-[95vw] bg-white">
        <DialogTitle className="flex items-center gap-2 text-lg">
          <Bookmark className="size-5 text-indigo-600" />
          저장된 상황 불러오기
        </DialogTitle>
        <DialogDescription className="sr-only">
          이전에 저장한 상황을 선택하여 불러옵니다.
        </DialogDescription>

        <div className="space-y-4 mt-2">
          <p className="text-sm text-slate-600">
            저장해둔 상황을 선택하여 세션을 진행합니다.
          </p>

          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 max-h-[60vh] overflow-y-auto">
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
                {triggers.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => onSelect(note)}
                    className="w-full text-left px-3 py-2 rounded-md border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm"
                  >
                    <div className="text-slate-800 font-semibold text-sm">
                      {note.title || "저장된 상황"}
                    </div>
                    <div className="text-slate-700 text-base leading-6 line-clamp-3 mt-1">
                      {note.trigger}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
