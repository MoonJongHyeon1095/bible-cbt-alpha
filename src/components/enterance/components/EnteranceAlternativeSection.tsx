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
      title="새로운 목소리"
      subtitle="속삭이는 목소리를 바꿀 수 있다면?"
      body={
        <>
          조금만 들여다 보아도 목소리는 잦아듭니다.
          <br />
          그리고 어쩌면 우리는, 그 곳에 더 나은 목소리를 새길 수 있을지
          모릅니다.
        </>
      }
      primaryLabel="다음"
      onPrimary={onNext}
    />
  );
}
