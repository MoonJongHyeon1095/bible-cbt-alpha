import { Dialog, DialogContent, DialogTitle } from "../../../../ui/dialog";

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
      <DialogContent className="max-w-3xl bg-white border border-slate-200 shadow-xl pt-10 pr-10 max-h-[85vh] overflow-y-auto">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <div className="text-[15px] text-slate-700 leading-relaxed space-y-4">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
