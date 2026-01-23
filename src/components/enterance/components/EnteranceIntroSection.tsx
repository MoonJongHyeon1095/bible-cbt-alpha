import { EnteranceStepLayoutSection } from "./EnteranceStepLayoutSection";

type EnteranceIntroSectionProps = {
  onStart: () => void;
  onExplore?: () => void;
};

export function EnteranceIntroSection({
  onStart,
  onExplore,
}: EnteranceIntroSectionProps) {
  return (
    <EnteranceStepLayoutSection
      eyebrow="Mind Lens"
      title="마인드 렌즈"
      subtitle={
        <>
          생각의 자동 반응을 비추고,
          <br className="sm:hidden" /> 더 나은 선택으로 연결합니다.
        </>
      }
      body="몇 분만 투자해 오늘의 사건과 생각을 정리해 볼까요?"
      primaryLabel="시작하기"
      onPrimary={onStart}
      onSecondary={onExplore}
    />
  );
}
