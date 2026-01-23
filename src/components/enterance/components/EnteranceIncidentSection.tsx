import { EnteranceStepLayoutSection } from "./EnteranceStepLayoutSection";

type EnteranceIncidentSectionProps = {
  onNext: () => void;
};

export function EnteranceIncidentSection({
  onNext,
}: EnteranceIncidentSectionProps) {
  return (
    <EnteranceStepLayoutSection
      eyebrow="Step 1"
      title="짧은 감정-일기"
      subtitle="감정을 뒤흔든 일에 대해 짧게 적어보세요."
      body="사실에 가까운 문장으로 쓰면 다음 단계가 쉬워집니다."
      primaryLabel="다음"
      onPrimary={onNext}
    />
  );
}
