import { EnteranceStepLayoutSection } from "./EnteranceStepLayoutSection";

type EnteranceErrorSectionProps = {
  onNext: () => void;
};

export function EnteranceErrorSection({ onNext }: EnteranceErrorSectionProps) {
  return (
    <EnteranceStepLayoutSection
      eyebrow="Step 3"
      title="반복되는 경향 찾기"
      subtitle="생각은 우리를 어디론가 데려가지만..."
      body={
        <>
          우리 의지와 상관없이 어떤 장소에 도착했습니다.
          <br />
          속삭이는 목소리들이 들립니다.
          <br />
          하지만 목소리들이 진실만 말하는 것 같지는 않습니다.
        </>
      }
      primaryLabel="다음"
      onPrimary={onNext}
    />
  );
}
