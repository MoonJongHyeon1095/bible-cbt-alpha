import { useState } from "react";
import { EnteranceStepLayoutSection } from "./EnteranceStepLayoutSection";

type EnteranceTermsSectionProps = {
  onAgree: () => void;
};

export function EnteranceTermsSection({ onAgree }: EnteranceTermsSectionProps) {
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const ready = agreeTerms && agreePrivacy;

  return (
    <EnteranceStepLayoutSection
      eyebrow="Terms"
      title="약관 및 개인정보 처리방침"
      body="마인드 렌즈는 당신이 기록한 사건·생각·감정을 바탕으로 세션을 구성하고, 패턴을 보여주기 위해 데이터를 사용합니다. 자세한 내용은 약관 및 개인정보 처리방침을 확인해 주세요."
      primaryLabel="동의하고 시작하기"
      onPrimary={onAgree}
      primaryDisabled={!ready}
    >
      <div className="mt-6 space-y-3 rounded-2xl border border-slate-200 bg-white/70 px-4 py-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(event) => setAgreeTerms(event.target.checked)}
            className="mt-1 size-4 rounded border-slate-300 text-slate-900"
          />
          <span>이용약관에 동의합니다 (필수)</span>
        </label>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={agreePrivacy}
            onChange={(event) => setAgreePrivacy(event.target.checked)}
            className="mt-1 size-4 rounded border-slate-300 text-slate-900"
          />
          <span>개인정보 처리방침에 동의합니다 (필수)</span>
        </label>
      </div>
    </EnteranceStepLayoutSection>
  );
}
