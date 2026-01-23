import { EnteranceStepLayoutSection } from "./EnteranceStepLayoutSection";

type EnteranceThoughtSectionProps = {
  onNext: () => void;
};

export function EnteranceThoughtSection({
  onNext,
}: EnteranceThoughtSectionProps) {
  return (
    <EnteranceStepLayoutSection
      eyebrow="Step 2"
      title="숨어있는 생각 찾기"
      subtitle="감정 가까이 있는 숨은 생각을 찾아봅니다."
      body="어떤 생각은 종종 우리가 눈치채기 전에 자동으로 작동하고, 우리를 어딘가로 데려갑니다."
      primaryLabel="다음"
      onPrimary={onNext}
    />
  );
}
