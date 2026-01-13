import { Copy, Edit2, Loader2, Maximize2, Plus, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { Dialog, DialogContent, DialogTitle } from "../../../ui/dialog";

type Tone = "amber" | "rose" | "green" | "blue" | "slate";

const toneStyles: Record<
  Tone,
  {
    badge: string;
    edit: string;
    action: string;
    deleteBorder: string;
  }
> = {
  amber: {
    badge: "bg-amber-100 text-amber-900",
    edit: "border-amber-200 text-amber-700 hover:border-amber-300 hover:bg-amber-100",
    action:
      "border-amber-200 text-amber-700 hover:border-amber-300 hover:bg-amber-50",
    deleteBorder: "border-amber-200",
  },
  rose: {
    badge: "bg-rose-100 text-rose-900",
    edit: "border-rose-200 text-rose-700 hover:border-rose-300 hover:bg-rose-100",
    action:
      "border-rose-200 text-rose-700 hover:border-rose-300 hover:bg-rose-50",
    deleteBorder: "border-rose-200",
  },
  green: {
    badge: "bg-green-100 text-green-900",
    edit:
      "border-green-200 text-green-700 hover:border-green-300 hover:bg-green-100",
    action:
      "border-green-200 text-green-700 hover:border-green-300 hover:bg-green-50",
    deleteBorder: "border-green-200",
  },
  blue: {
    badge: "bg-blue-100 text-blue-900",
    edit: "border-blue-200 text-blue-700 hover:border-blue-300 hover:bg-blue-100",
    action:
      "border-blue-200 text-blue-700 hover:border-blue-300 hover:bg-blue-50",
    deleteBorder: "border-blue-200",
  },
  slate: {
    badge: "bg-slate-200 text-slate-700",
    edit:
      "border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100",
    action:
      "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50",
    deleteBorder: "border-slate-200",
  },
};

interface PatternSectionHeaderProps {
  tone: Tone;
  title: string;
  icon: ReactNode;
  onEdit?: () => void;
  onAdd?: () => void;
  editLabel?: string;
  addLabel?: string;
}

export function PatternSectionHeader({
  tone,
  title,
  icon,
  onEdit,
  onAdd,
  editLabel,
  addLabel,
}: PatternSectionHeaderProps) {
  const styles = toneStyles[tone];
  return (
    <div className="flex items-center justify-between">
      <span
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${styles.badge}`}
      >
        {icon}
        {title}
      </span>
      <div className="flex items-center gap-2">
        {onAdd ? (
          <button
            type="button"
            onClick={onAdd}
            className={`rounded-full border bg-white p-1 ${styles.edit}`}
            aria-label={addLabel ?? `${title} 추가`}
          >
            <Plus className="size-4" />
          </button>
        ) : null}
        {onEdit ? (
          <button
            type="button"
            onClick={onEdit}
            className={`rounded-full border bg-white p-1 ${styles.edit}`}
            aria-label={editLabel ?? `${title} 편집`}
          >
            <Edit2 className="size-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

interface PatternContentActionsProps {
  tone: Tone;
  onCopy?: () => void;
  onExpand?: () => void;
  onDelete?: () => void;
  deleting?: boolean;
  copyLabel?: string;
  expandLabel?: string;
  deleteLabel?: string;
}

export function PatternContentActions({
  tone,
  onCopy,
  onExpand,
  onDelete,
  deleting,
  copyLabel = "복사",
  expandLabel = "확대",
  deleteLabel = "삭제",
}: PatternContentActionsProps) {
  const styles = toneStyles[tone];

  if (!onCopy && !onExpand && !onDelete) {
    return null;
  }

  return (
    <div className="mt-3 flex items-center justify-end gap-2">
      {onCopy ? (
        <button
          type="button"
          onClick={onCopy}
          className={`inline-flex items-center gap-1 rounded-full border bg-white px-2.5 py-1 text-xs font-semibold ${styles.action}`}
          aria-label={`${copyLabel} 복사`}
        >
          <Copy className="size-3.5" />
          {copyLabel}
        </button>
      ) : null}
      {onExpand ? (
        <button
          type="button"
          onClick={onExpand}
          className={`inline-flex items-center gap-1 rounded-full border bg-white px-2.5 py-1 text-xs font-semibold ${styles.action}`}
          aria-label={`${expandLabel} 확대`}
        >
          <Maximize2 className="size-3.5" />
          {expandLabel}
        </button>
      ) : null}
      {onDelete ? (
        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          className={`inline-flex items-center gap-1 rounded-full border bg-white px-2.5 py-1 text-xs font-semibold text-red-600 hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 ${styles.deleteBorder}`}
          aria-label={`${deleteLabel} 삭제`}
        >
          {deleting ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Trash2 className="size-3.5" />
          )}
          {deleting ? "삭제중" : deleteLabel}
        </button>
      ) : null}
    </div>
  );
}

interface PatternPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tone: Tone;
  title: string;
  label?: string;
  trigger: string;
  content: string;
}

export function PatternPreviewDialog({
  open,
  onOpenChange,
  tone,
  title,
  label,
  trigger,
  content,
}: PatternPreviewDialogProps) {
  const styles = toneStyles[tone];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-white border border-slate-200 shadow-xl pt-12 pr-12 max-h-[80vh] overflow-y-auto">
        <DialogTitle className="sr-only">본문 확대 보기</DialogTitle>
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${styles.badge}`}
            >
              {title}
            </span>
            {label ? (
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                {label}
              </span>
            ) : null}
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
            <p className="text-xs font-semibold text-slate-500">
              트리거 텍스트
            </p>
            <p className="mt-2 text-slate-800 whitespace-pre-wrap leading-[1.85] text-[15px]">
              {trigger}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm">
            <p className="text-slate-900 whitespace-pre-wrap leading-[1.9] text-[16px]">
              {content}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
