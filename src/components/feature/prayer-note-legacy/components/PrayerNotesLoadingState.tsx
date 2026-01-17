import { BookOpen } from "lucide-react";
import { Card } from "../../../ui/card";

export function PrayerNotesLoadingState() {
  return (
    <Card className="p-12 text-center">
      <BookOpen className="size-16 text-slate-300 mx-auto mb-4 animate-pulse" />
      <p className="text-slate-500 text-lg mb-2">
        기도 노트를 불러오는 중입니다...
      </p>
    </Card>
  );
}
