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
        그분은 말씀에 의지하여 기도하면 응답하십니다.
      </p>

      {!bibleLoading && (
        <div className="grid grid-cols-2 gap-3 mb-3">
          <Button
            onClick={onAccept}
            className="rounded-full bg-blue-600 hover:bg-blue-700"
          >
            말씀을 찾습니다
          </Button>

          <Button
            onClick={onDecline}
            variant="outline"
            className="rounded-full"
          >
            아니오
          </Button>
        </div>
      )}

      {bibleError && <p className="text-red-600 text-sm mt-3">{bibleError}</p>}
    </div>
  );
}
