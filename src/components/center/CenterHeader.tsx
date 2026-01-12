interface CenterHeaderProps {
  step: number;
  emotionSet: boolean;
  showEmotionDetail: boolean;
}

export function CenterHeader({
  step,
  emotionSet,
  showEmotionDetail,
}: CenterHeaderProps) {
  const header = (() => {
    if (step === 1) {
      return {
        badge: "STEP 1 · 사건 기록",
        title: "오늘 무슨 일이 있었나요?",
        desc: "힘들었던 경험이나 불편했던 상황을 자유롭게 적어주세요.",
      };
    }

    if (step === 2 && !emotionSet && !showEmotionDetail) {
      return {
        badge: "STEP 2 · 감정 선택",
        title: "지금 느낀 감정을 한 가지 골라볼까요?",
        desc: "감정을 고르면, 그 감정의 의미를 짧게 확인한 뒤 진행해요.",
      };
    }

    if (step === 2 && showEmotionDetail) {
      return {
        badge: "STEP 2 · 감정 확인",
        title: "지금 이 순간의 감정을 인식해볼까요?",
        desc: "긍정적 의미와 주의할 점을 확인하면 다음으로 넘어갈 수 있어요.",
      };
    }

    if (step === 2 && emotionSet) {
      return {
        badge: "STEP 2 · 자동사고 찾기",
        title: "감정 뒤에 숨어있는 생각을 찾아볼게요.",
        desc: "가장 잘 맞는 생각 1개를 고르거나, 직접 적어도 좋아요.",
      };
    }

    return {
      badge: "STEP 3 · 다음 단계",
      title: "다음 단계로 진행해볼까요?",
      desc: "인지오류를 검토하게 될 거예요.",
    };
  })();

  return (
    <div className="mb-0">
      <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
        {header.badge}
      </div>

      <h2 className="mt-3 text-slate-900 text-2xl font-extrabold tracking-tight">
        {header.title}
      </h2>

      <p className="mt-1 text-sm text-slate-500">{header.desc}</p>
    </div>
  );
}
