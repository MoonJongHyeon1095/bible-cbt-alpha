import { EnteranceStepLayoutSection } from "./EnteranceStepLayoutSection";

type EnteranceStartSectionProps = {
  onStart: () => void;
  onLater?: () => void;
};

export function EnteranceStartSection({
  onStart,
  onLater,
}: EnteranceStartSectionProps) {
  return (
    <EnteranceStepLayoutSection
      eyebrow="Ready"
      title="첫 세션을 시작해볼까요?"
      body={
        <>
          지금 떠오르는 일을 하나만 골라 정리해봅니다.
          <br />
          3~5 분 정도면 충분합니다.
          <br />
          완벽하게 쓰지 않아도 괜찮습니다.
        </>
      }
      primaryLabel="세션 시작"
      secondaryLabel={onLater ? "나중에" : undefined}
      onPrimary={onStart}
      onSecondary={onLater}
    />
  );
}
