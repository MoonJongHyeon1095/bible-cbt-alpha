// src/lib/gpt/alternative.ts
import { callGptText } from "./client";

export async function generateContextualAlternativeThoughts(
  situation: string,
  emotion: string,
  thought: string,
  cognitiveErrors: string[]
): Promise<Array<{ thought: string; technique: string; techniqueDescription: string }>> {
  const systemPrompt = `당신은 기독교 상담 관점을 가진 CBT 전문가입니다. 부정적 자동사고를 균형잡힌 대안적 사고로 전환하는 것을 돕습니다. 현실적이고 구체적이며 희망적인 사고를 제안하세요.`;

  const prompt = `상황: ${situation}
감정: ${emotion}
부정적 자동사고: ${thought}
발견된 인지오류: ${cognitiveErrors.join(", ")}

이 상황에 대한 더 균형잡힌 대안적 사고 3가지를 제안해주세요.

형식:
1. [대안적 사고 1]
2. [대안적 사고 2]
3. [대안적 사고 3]`;

  const response = await callGptText(prompt, { systemPrompt });

  const thoughts = response
    .split("\n")
    .filter((line) => line.trim().match(/^\d+\./))
    .map((line) => line.replace(/^\d+\.\s*/, "").trim())
    .slice(0, 3);

  const defaultThoughts = [
    "이 상황은 어렵지만 나는 대처할 수 있는 자원이 있다",
    "과거에도 비슷한 어려움을 극복한 적이 있다",
    "완벽하지 않아도 괜찮다. 최선을 다하는 것으로 충분하다",
  ];

  const finalThoughts = thoughts.length === 3 ? thoughts : defaultThoughts;

  const techniques = [
    {
      technique: "현실검증",
      description: "극단적 사고를 현실적으로 재평가하여 균형잡힌 관점을 찾습니다.",
    },
    {
      technique: "강점 발견",
      description: "과거 경험에서 자신의 대처 능력과 회복탄력성을 확인합니다.",
    },
    {
      technique: "자기수용",
      description: "완벽주의를 내려놓고 있는 그대로의 자신을 인정합니다.",
    },
  ];

  return finalThoughts.map((t, idx) => ({
    thought: t,
    technique: techniques[idx]?.technique || "인지 재구성",
    techniqueDescription:
      techniques[idx]?.description || "부정적 사고를 더 적응적인 사고로 바꿉니다.",
  }));
}
