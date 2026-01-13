import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../../../../ui/dialog";

interface PatternEditModalProps {
  open: boolean;
  title: string;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function PatternEditModal({
  open,
  title,
  onOpenChange,
  children,
}: PatternEditModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-white border border-slate-200 shadow-xl pt-10 pr-10">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">
          {title} 내용을 작성하는 모달입니다.
        </DialogDescription>
        <div className="relative">
          <div className="max-h-[85vh] overflow-y-auto">
            <div className="text-[15px] text-slate-700 leading-relaxed space-y-4">
              {children}
            </div>
          </div>
          <div
            data-floating-root="pattern-edit"
            className="pointer-events-none absolute inset-0"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
