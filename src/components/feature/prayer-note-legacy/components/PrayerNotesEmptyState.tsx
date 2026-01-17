import { BookOpen } from "lucide-react";
import { Card } from "../../../ui/card";

export function PrayerNotesEmptyState() {
  return (
    <Card className="p-12 text-center">
      <BookOpen className="size-16 text-slate-300 mx-auto mb-4" />
      <p className="text-slate-500 text-lg mb-2">아직 기도 노트가 없습니다.</p>
      <p className="text-slate-400">첫 번째 기도 노트를 작성해보세요.</p>
    </Card>
  );
}
