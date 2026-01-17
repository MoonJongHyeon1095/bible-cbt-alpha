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
      title="2) 자동 사고를 찾아요"
      body="사건 뒤에 자동으로 떠오른 생각이 있을 거예요. “내가 순간적으로 뭐라고 해석했지?”를 붙잡습니다."
      primaryLabel="다음"
      onPrimary={onNext}
    />
  );
}
