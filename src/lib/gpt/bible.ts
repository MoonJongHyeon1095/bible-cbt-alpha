// src/lib/gpt/bible.ts
import { callGptText } from "./client";

export async function generateBibleVerse(
  situation: string,
  emotion: string
): Promise<{ verse: string; reference: string; prayer: string }> {
  const systemPrompt = `당신은 성경에 정통한 기독교 목회 상담가입니다. 사람들의 상황과 감정에 맞는 위로와 희망의 성경 구절을 추천하고, 그에 기반한 짧은 기도문을 작성합니다. 항상 다음 형식을 따르세요:
구절: [성경 본문]
출처: [책 장:절]
기도: [2-3문장의 기도문]`;

  const prompt = `상황: ${situation}
감정: ${emotion}

이 상황에 위로와 희망을 주는 성경 구절 1개를 추천하고, 그 말씀에 기반한 짧은 기도문을 작성해주세.`;

  try {
    const response = await callGptText(prompt, { systemPrompt });

    const verseMatch = response.match(/구절[:\s]*(.+)/);
    const referenceMatch = response.match(/출처[:\s]*(.+)/);
    const prayerMatch = response.match(/기도[:\s]*([\s\S]+)/);

    return {
      verse:
        verseMatch?.[1]?.trim() ||
        "하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니",
      reference: referenceMatch?.[1]?.trim() || "요한복음 3:16",
      prayer:
        prayerMatch?.[1]?.trim() ||
        "주님, 이 어려운 시간 가운데 당신의 사랑과 은혜를 경험하게 하소서. 아멘.",
    };
  } catch (error) {
    console.error("성경 구절 생성 실패:", error);
    return {
      verse:
        "수고하고 무거운 짐 진 자들아 다 내게로 오라 내가 너희를 쉬게 하리라",
      reference: "마태복음 11:28",
      prayer:
        "주님, 제 마음의 무거운 짐을 주님께 내려놓습니다. 주님의 평안으로 채워주소서. 아멘.",
    };
  }
}
