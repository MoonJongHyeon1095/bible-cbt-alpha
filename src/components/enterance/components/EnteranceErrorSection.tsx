import { EnteranceStepLayoutSection } from "./EnteranceStepLayoutSection";

type EnteranceErrorSectionProps = {
  onNext: () => void;
};

export function EnteranceErrorSection({
  onNext,
}: EnteranceErrorSectionProps) {
  return (
    <EnteranceStepLayoutSection
      eyebrow="Step 3"
      title="3) 인지오류를 점검해요"
      body="자동 사고에는 왜곡된 패턴(인지오류)이 섞일 수 있어요. 패턴을 알아차리면 감정이 덜 휘둘립니다."
      primaryLabel="다음"
      onPrimary={onNext}
    />
  );
}
