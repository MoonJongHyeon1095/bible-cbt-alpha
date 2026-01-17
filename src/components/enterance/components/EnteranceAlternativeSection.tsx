import { EnteranceStepLayoutSection } from "./EnteranceStepLayoutSection";

type EnteranceAlternativeSectionProps = {
  onNext: () => void;
};

export function EnteranceAlternativeSection({
  onNext,
}: EnteranceAlternativeSectionProps) {
  return (
    <EnteranceStepLayoutSection
      eyebrow="Step 4"
      title="4) 대안 사고를 만들어봐요"
      body="더 균형 잡힌 해석을 한 문장으로 바꿔봅니다. 현실적이고, 나를 돕는 방향이면 충분해요."
      primaryLabel="다음"
      onPrimary={onNext}
    />
  );
}
