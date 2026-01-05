import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";

interface BibleOfferCardProps {
  onAccept: () => void;
  onDecline: () => void;
  bibleLoading: boolean;
  bibleError?: string | null;
}

export function BibleOfferCard({
  onAccept,
  onDecline,
  bibleLoading,
  bibleError,
}: BibleOfferCardProps) {
  return (
    <div className="bg-blue-50 p-5 rounded-lg border border-blue-200">
      <p className="text-blue-900 mb-4">
        하나님의 위로의 말씀을 찾아보시겠습니까?
        <br />
        그분은 말씀으로 기도하면 응답하십니다.
      </p>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <Button
          onClick={onAccept}
          disabled={bibleLoading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {bibleLoading ? (
            <Loader2 className="size-4 animate-spin mr-2" />
          ) : null}
          말씀을 찾습니다
        </Button>

        <Button onClick={onDecline} variant="outline">
          아니오
        </Button>
      </div>

      {bibleError && <p className="text-red-600 text-sm mt-3">{bibleError}</p>}
    </div>
  );
}
