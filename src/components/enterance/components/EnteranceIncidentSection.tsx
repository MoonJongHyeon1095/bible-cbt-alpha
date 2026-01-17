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
      title="1) 사건을 기록해요"
      body="감정을 흔든 “상황/사건”을 짧게 적어보세요. 사실에 가까운 문장으로 쓰면 다음 단계가 쉬워집니다."
      primaryLabel="다음"
      onPrimary={onNext}
    />
  );
}
