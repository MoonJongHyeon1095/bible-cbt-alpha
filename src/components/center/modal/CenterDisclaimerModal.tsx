import { AlertTriangle } from "lucide-react";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";

const DISCLAIMER_TEXT =
  "AI가 제공하는 참고용 정보이며 의료/치료/진단이 아닙니다.";

const SUPPORT_TEXT =
  "위급하거나 위기 상황이라면 즉시 전문기관 또는 응급 서비스를 이용해주세요.";

type CenterDisclaimerModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function CenterDisclaimerModal({
  open,
  onOpenChange,
  onConfirm,
}: CenterDisclaimerModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-amber-600" />
            중요 안내
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm text-slate-700">
          <p className="font-semibold text-amber-900">{DISCLAIMER_TEXT}</p>
          <p className="text-slate-600">{SUPPORT_TEXT}</p>
        </div>
        <DialogFooter>
          <Button
            onClick={onConfirm}
            className="bg-amber-600 hover:bg-amber-700"
          >
            확인했습니다
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
