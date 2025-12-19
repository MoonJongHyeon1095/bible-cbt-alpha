// src/lib/gemini.ts
import { projectId, publicAnonKey } from "../utils/supabase/info";

const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-4ba10e96`;

export async function callGeminiAPI(
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  try {
    const body: any = { prompt };
    if (systemPrompt) {
      body.systemPrompt = systemPrompt;
    }

    const response = await fetch(`${serverUrl}/gemini`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      // 429 오류 (할당량 초과)인 경우 더 자세한 안내
      if (response.status === 429) {
        const retryAfterSeconds = data.retryAfterSeconds || 3600;
        const retryMessage =
          retryAfterSeconds > 3600
            ? "내일"
            : `약 ${Math.ceil(retryAfterSeconds / 60)}분 후`;

        const errorMessage = `⏰ AI 서버의 일일 무료 사용량을 초과했습니다.\n\n${retryMessage}에 다시 시도하시거나, 더 많이 사용하시려면 Google AI Studio(https://aistudio.google.com)에서 새로운 무료 API 키를 발급받아 설정하실 수 있습니다.\n\n불편을 드려 죄송합니다.`;

        console.error("Gemini API 할당량 초과:", {
          status: response.status,
          retryAfterSeconds,
          error: data.error,
        });
        throw new Error(errorMessage);
      }

      // 503 오류 (과부하)인 경우
      if (response.status === 503) {
        const errorMessage =
          data.error ||
          "⚠️ AI 서버가 현재 사용량이 많습니다.\n\n1-2분 후 다시 시도해주세요.";
        console.error("Gemini API 과부하:", {
          status: response.status,
          error: errorMessage,
        });
        throw new Error(errorMessage);
      }

      // 서버에서 반환한 사용자 친화적 오류 메시지 사용
      const errorMessage = data.error || `서버 응답 오류: ${response.status}`;
      console.error("Gemini API 오류:", {
        status: response.status,
        error: errorMessage,
        details: data.details,
      });
      throw new Error(errorMessage);
    }

    // Gemini API 응답 파싱
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    }

    throw new Error("AI 응답 형식이 올바르지 않습니다.");
  } catch (error) {
    console.error("Gemini API 호출 오류:", error);
    throw error;
  }
}

// export async function generateThreeAutomaticThoughts(
//   situation: string,
//   emotion: string
// ): Promise<string[]> {
//   const systemPrompt = `당신은 기독교 상담 전문성을 갖춘 인지행동치료(CBT) 전문가입니다. 사용자의 상황과 감정을 분석하여 자동적 사고를 정확하게 파악합니다. 항상 간결하고 구체적으로 응답하세요.`;

//   const prompt = `상황: ${situation}
// 감정: ${emotion}

// 이 상황에서 \"${emotion}\" 감정을 느낄 때 사람들이 흔히 가지는 자동적 사고 3가지를 생성해주세요.

// 형식:
// 1. [자동적 사고 1]
// 2. [자동적 사고 2]
// 3. [자동적 사고 3]`;

//   const response = await callGeminiAPI(prompt, systemPrompt);

//   // 응답을 파싱하여 배열로 변환
//   const thoughts = response
//     .split("\n")
//     .filter((line) => line.trim().match(/^\d+\./))
//     .map((line) => line.replace(/^\d+\.\s*/, "").trim())
//     .slice(0, 3);

//   return thoughts.length === 3
//     ? thoughts
//     : [
//         "이 상황은 나를 힘들게 만든다",
//         "나는 이것을 감당할 수 없을 것 같다",
//         "이런 일이 또 일어날 것이다",
//       ];
// }

// SDT(자기결정이론) 기반 자동사고 3개 + 인지오류 기반 자동사고 10개 생성
export async function generateExtendedAutomaticThoughts(
  situation: string,
  emotion: string
): Promise<{
  sdtThoughts: Array<{ category: string; thought: string }>;
  cognitiveThoughts: string[];
}> {
  const systemPrompt = `당신은 자기결정이론(SDT)과 인지행동치료(CBT)를 통합하는 전문 상담가입니다. 
사용자의 상황을 분석하여 SDT 욕구(관계성, 유능감, 자율성) 관련 자동사고와 인지오류 기반 자동사고를 정확히 파악합니다.
간결하고 구체적으로 응답하세요.`;

  const prompt = `상황: ${situation}
감정: ${emotion}

이 상황에서 "${emotion}" 감정을 느낄 때 떠오를 수 있는 자동적 사고를 다음 두 그룹으로 생성해주세요:

[SDT 기반 자동사고 3개]
관계성: [관계와 소속감 관련된 부정적 생각]
유능감: [능력과 성취 관련된 부정적 생각]
자율성: [통제와 선택 관련된 부정적 생각]

[인지오류 기반 자동사고 10개]
1. [극단적으로 생각하는 사고]
2. [한 번의 일을 항상 그렇다고 생각하는 사고]
3. [좋은 건 무시하고 나쁜 것만 보는 사고]
4. [좋은 일을 평가절하하는 사고]
5. [근거 없이 부정적으로 예측하는 사고]
6. [문제를 과장하거나 장점을 축소하는 사고]
7. [기분이 곧 사실이라고 믿는 사고]
8. [반드시 ~해야 한다고 생각하는 사고]
9. [자신에게 부정적 꼬리표를 붙이는 사고]
10. [모든 것을 자기 탓으로 돌리는 사고]

주의: 각 사고는 순수하게 생각만 작성하고, 괄호나 카테고리 레이블을 붙이지 마세요.`;

  try {
    const response = await callGeminiAPI(prompt, systemPrompt);

    // SDT 사고 파싱
    const sdtThoughts = [];
    const relationMatch = response.match(/관계성[:\s]+(.+?)(?=\n|유능감|$)/);
    const competenceMatch = response.match(/유능감[:\s]+(.+?)(?=\n|자율성|$)/);
    const autonomyMatch = response.match(
      /자율성[:\s]+(.+?)(?=\n|인지오류|\[|$)/
    );

    if (relationMatch) {
      sdtThoughts.push({
        category: "관계성",
        thought: relationMatch[1].replace(/\[.*?\]\s*/g, "").trim(),
      });
    }
    if (competenceMatch) {
      sdtThoughts.push({
        category: "유능감",
        thought: competenceMatch[1].replace(/\[.*?\]\s*/g, "").trim(),
      });
    }
    if (autonomyMatch) {
      sdtThoughts.push({
        category: "자율성",
        thought: autonomyMatch[1].replace(/\[.*?\]\s*/g, "").trim(),
      });
    }

    // 기본값 설정
    if (sdtThoughts.length < 3) {
      const defaults = [
        { category: "관계성", thought: "사람들이 나를 이해하지 못할 것이다" },
        {
          category: "유능감",
          thought: "나는 이 일을 제대로 해낼 수 없을 것이다",
        },
        {
          category: "자율성",
          thought: "내가 통제할 수 있는 것이 아무것도 없다",
        },
      ];
      while (sdtThoughts.length < 3) {
        const missing = defaults.find(
          (d) => !sdtThoughts.some((st) => st.category === d.category)
        );
        if (missing) sdtThoughts.push(missing);
      }
    }

    // 인지오류 기반 사고 파싱
    const cognitiveThoughts: string[] = [];
    const lines = response.split("\n");

    for (const line of lines) {
      const match = line.match(/^\s*\d+\.\s*(.+?)(?:\s*\(.*?\)\s*)?$/);
      if (match) {
        const thought = match[1]
          .replace(/\[.*?\]\s*/g, "") // 대괄호 제거
          .replace(/\(.*?\)\s*$/g, "") // 끝의 괄호 제거
          .trim();
        if (thought && cognitiveThoughts.length < 10) {
          cognitiveThoughts.push(thought);
        }
      }
    }

    // 기본값 설정
    const defaultCognitiveThoughts = [
      "이 일은 완전한 실패야",
      "항상 이런 식이야",
      "좋았던 것들은 하나도 기억나지 않아",
      "내가 한 좋은 일들은 별거 아니야",
      "분명히 나쁜 일이 일어날 거야",
      "이 문제는 너무 크고, 내 강점은 너무 작아",
      "이런 기분이 드니까 사실인 게 분명해",
      "나는 반드시 완벽해야만 해",
      "나는 실패자야",
      "모든 게 다 내 잘못이야",
    ];

    while (cognitiveThoughts.length < 10) {
      cognitiveThoughts.push(
        defaultCognitiveThoughts[cognitiveThoughts.length]
      );
    }

    return {
      sdtThoughts: sdtThoughts.slice(0, 3),
      cognitiveThoughts: cognitiveThoughts.slice(0, 10),
    };
  } catch (error) {
    console.error("확장 자동사고 생성 실패:", error);
    // 전체 기본값 반환
    return {
      sdtThoughts: [
        { category: "관계성", thought: "사람들이 나를 이해하지 못할 것이다" },
        {
          category: "유능감",
          thought: "나는 이 일을 제대로 해낼 수 없을 것이다",
        },
        {
          category: "자율성",
          thought: "내가 통제할 수 있는 것이 아무것도 없다",
        },
      ],
      cognitiveThoughts: [
        "이 일은 완전한 실패야",
        "항상 이런 식이야",
        "좋았던 것들은 하나도 기억나지 않아",
        "내가 한 좋은 일들은 별거 아니야",
        "분명히 나쁜 일이 일어날 거야",
        "이 문제는 너무 크고, 내 강점은 너무 작아",
        "이런 기분이 드니까 사실인 게 분명해",
        "나는 반드시 완벽해야만 해",
        "나는 실패자야",
        "모든 게 다 내 잘못이야",
      ],
    };
  }
}

export interface BurnsEmpathyResult {
  thoughtEmpathy: string;
  emotionEmpathy: string;
  iStatement: string;
  question: string;
  soothing: string;
}

export async function generateBurnsEmpathy(
  situation: string,
  emotion: string,
  thought: string,
  intensity: number
): Promise<BurnsEmpathyResult> {
  const systemPrompt = `당신은 번즈식 5단계 공감법을 완벽히 활용하는 공감적인 기독교 상담가입니다. 
각 단계를 명확히 구분하여 2-3문장으로 작성하세요.`;

  const prompt = `상황: ${situation}
감정: ${emotion} (강도: ${intensity}/100)
자동적 사고: ${thought}

번즈식 5단계 공감법으로 깊이 공감하는 메시지를 작성해주세요:

1. 생각 공감: 상대방의 생각이 그 수 있다고 인정
2. 감정 공감: 감정의 타당성을 인정하고 공감
3. 나 전달: 상담자 자신도 비슷한 감정을 경험했음을 전달
4. 달래기(핵심): 지금 느끼는 감정에서 발견할 수 있는 긍정적인 면을 다음 형식으로 작성:
   "제 생각은, 당신이 이런 ${emotion}을 느낀다면...
   (1) [첫 번째 긍정적 특성]
   (2) [두 번째 긍정적 특성]  
   (3) [세 번째 긍정적 특성]
   그 증거가 바로 지금 느끼는 이 ${emotion}입니다."
5. 질문법: 부드러운 질문으로 마무리

형식:
---생각공감---
[생각 공감 내용]
---감정공감---
[감정 공감 내용]
---나전달---
[나 전달 내용]
---달래기---
제 생각은, 당신이 이런 ${emotion}을 느낀다면...
(1) [긍정적 특성 1]
(2) [긍정적 특성 2]
(3) [긍정적 특성 3]
그 증거가 바로 지금 느끼는 이 ${emotion}입니다.
---질문법---
[질문 내용]`;

  const response = await callGeminiAPI(prompt, systemPrompt);

  // 응답 파싱
  const sections = {
    thoughtEmpathy: "",
    emotionEmpathy: "",
    iStatement: "",
    soothing: "",
    question: "",
  };

  const thoughtMatch = response.match(
    /---생각공감---\s*([\s\S]*?)---감정공감---/
  );
  const emotionMatch = response.match(
    /---감정공감---\s*([\s\S]*?)---나전달---/
  );
  const iStatementMatch = response.match(
    /---나전달---\s*([\s\S]*?)---달래기---/
  );
  const soothingMatch = response.match(/---달래기---\s*([\s\S]*?)---질문법---/);
  const questionMatch = response.match(/---질문법---\s*([\s\S]*?)$/);

  if (thoughtMatch) sections.thoughtEmpathy = thoughtMatch[1].trim();
  if (emotionMatch) sections.emotionEmpathy = emotionMatch[1].trim();
  if (iStatementMatch) sections.iStatement = iStatementMatch[1].trim();
  if (soothingMatch) sections.soothing = soothingMatch[1].trim();
  if (questionMatch) sections.question = questionMatch[1].trim();

  // 파싱 실패 시 기본값
  if (!sections.thoughtEmpathy) {
    sections.thoughtEmpathy = `"${thought}"라는 생각이 드셨군요. 그럴 수 있습니다.`;
  }
  if (!sections.emotionEmpathy) {
    sections.emotionEmpathy = `${emotion}을 느끼시는 것이 충분히 이해됩니다.`;
  }
  if (!sections.iStatement) {
    sections.iStatement = `저도 비슷한 상황에서 비슷한 감정을 느낀 적이 있습니다.`;
  }
  if (!sections.soothing) {
    sections.soothing = `제 생각은, 당신이 이런 ${emotion}을 느낀다면...\n(1) 당신은 자신의 감정을 인식할 수 있는 사람입니다\n(2) 성장하려는 의지가 있는 사람입니다\n(3) 변화를 두려워하지 않는 용기 있는 사람입니다\n그 증거가 바로 지금 느끼는 이 ${emotion}입니다.`;
  }
  if (!sections.question) {
    sections.question = `이 ${emotion}이 당신에게 무엇을 말해주고 있을까요?`;
  }

  return sections;
}

export interface CognitiveErrorAnalysisResult {
  errors: Array<{
    title: string;
    description: string;
    userQuote: string; // 사용자의 원본 글에서 인용한 부분
    analysis: string; // 해당 오류가 왜 나타났는지 구체적 분석
  }>;
}

export async function analyzeCognitiveErrors(
  situation: string,
  thought: string
): Promise<CognitiveErrorAnalysisResult> {
  const cognitiveErrors = [
    {
      title: "전부 아니면 전무 사고",
      description:
        "흑백논리, 극단적 사고. 중간 지대 없이 완전한 성공 아니면 완전한 실패로만 생각합니다.",
    },
    {
      title: "과잉일반화",
      description:
        '한 번의 경험을 모든 것에 적용. 한 번의 부정적 사건을 "항상", "절대" 같은 표현으로 일반화합니다.',
    },
    {
      title: "정신적 여과",
      description:
        "부정적인 것만 보고 긍정적인 것 무시. 좋은 일들은 걸러내고 나쁜 일만 집중합니다.",
    },
    {
      title: "긍정 무시",
      description:
        '좋은 일을 평가절하. 긍정적 경험을 "별거 아니야", "운이 좋았을 뿐"이라고 폄하합니다.',
    },
    {
      title: "성급한 결론",
      description:
        "근거 없이 부정적으로 해석. 증거 없이 나쁜 결과를 확신합니다.",
    },
    {
      title: "확대와 축소",
      description:
        "문제를 과장하거나 장점을 축소. 실수는 크게, 성공은 작게 봅니다.",
    },
    {
      title: "감정적 추론",
      description:
        '감정이 사실이라고 믿음. "이런 기분이 드니까 사실일 거야"라고 생각합니다.',
    },
    {
      title: "당위적 진술",
      description:
        '~해야 한다는 경직된 규칙. "반드시", "꼭", "절대" 같은 경직된 기준을 적용합니다.',
    },
    {
      title: "이름 붙이기",
      description:
        '자신이나 타인에게 부정적 꼬리표. "나는 실패자야", "저 사람은 이기적이야"라고 단정합니다.',
    },
    {
      title: "개인화",
      description:
        "모든 것을 자신 탓으로 돌림. 자신이 통제할 수 없는 일도 자기 책임으로 여깁니다.",
    },
  ];

  const systemPrompt = `당신은 인지행동치료 전문가입니다. 사용자가 작성한 경험과 자동적 사고를 깊이 분석하여, 그 안에 담긴 인지오류를 찾아내고 사용자의 원본 글을 구체적으로 인용하면서 왜 그런 오류가 나타났는지 설명해주세요.`;

  const prompt = `사용자가 작성한 경험:
"${situation}"

사용자의 자동적 사고:
"${thought}"

위 내용을 바탕으로 다음 10가지 인지오류 중 해당하는 것을 최소 3개 ��택하고, 각 오류마다 사용자가 쓴 글에서 구체적인 부분을 인용하면서 분석해주세요:

${cognitiveErrors
  .map((e, i) => `${i + 1}. ${e.title}: ${e.description}`)
  .join("\n")}

응답 형식 (정확히 따라주세요):
---
오류번호: [번호]
인용: [사용자가 쓴 글에서 해당 오류를 보여주는 구체적인 문장이나 표현을 그대로 인용]
분석: [왜 이 부분이 해당 인지오류인지, 사용자의 글을 바탕으로 2-3문장으로 구체적으로 설명]
---

최소 3개, 최대 5개의 오류를 선택하여 위 형식으로 작성해주세요.`;

  try {
    const response = await callGeminiAPI(prompt, systemPrompt);

    // 응답 파싱
    const errorBlocks = response.split("---").filter((block) => block.trim());
    const selectedErrors: Array<{
      title: string;
      description: string;
      userQuote: string;
      analysis: string;
    }> = [];

    for (const block of errorBlocks) {
      const numberMatch = block.match(/오류번호[:\s]*(\d+)/);
      const quoteMatch = block.match(/인용[:\s]*(.+?)(?=\n분석|$)/s);
      const analysisMatch = block.match(/분석[:\s]*(.+?)$/s);

      if (numberMatch && quoteMatch && analysisMatch) {
        const index = parseInt(numberMatch[1]) - 1;
        if (index >= 0 && index < cognitiveErrors.length) {
          selectedErrors.push({
            ...cognitiveErrors[index],
            userQuote: quoteMatch[1].trim().replace(/^[""]|[""]$/g, ""),
            analysis: analysisMatch[1].trim(),
          });
        }
      }
    }

    // 최소 3개는 반환
    if (selectedErrors.length < 3) {
      return {
        errors: [
          {
            ...cognitiveErrors[0],
            userQuote: thought,
            analysis:
              "이 생각은 극단적인 이분법적 사고를 보여줍니다. 중간 지대나 다양한 가능성을 고려하지 않고 있습니다.",
          },
          {
            ...cognitiveErrors[4],
            userQuote: situation,
            analysis: "충분한 근거 없이 부정적인 결과를 확신하고 있습니다.",
          },
          {
            ...cognitiveErrors[6],
            userQuote: thought,
            analysis: "현재 느끼는 감정을 객관적 사실로 받아들이고 있습니다.",
          },
        ],
      };
    }

    return { errors: selectedErrors };
  } catch (error) {
    console.error("인지오류 분석 실패:", error);
    // 기본값 반환
    return {
      errors: [
        {
          ...cognitiveErrors[0],
          userQuote: thought,
          analysis: "이 생각은 극단적인 이분법적 사고를 보여줍니다.",
        },
        {
          ...cognitiveErrors[4],
          userQuote: situation,
          analysis: "충분한 근거 없이 부정적인 결과를 확신하고 있습니다.",
        },
        {
          ...cognitiveErrors[6],
          userQuote: thought,
          analysis: "현재 느끼는 감정을 객관적 사실로 받아들이고 있습니다.",
        },
      ],
    };
  }
}

export async function generateContextualAlternativeThoughts(
  situation: string,
  emotion: string,
  thought: string,
  cognitiveErrors: string[]
): Promise<
  Array<{ thought: string; technique: string; techniqueDescription: string }>
> {
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

  const response = await callGeminiAPI(prompt, systemPrompt);

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

  // 치료 기법 매핑
  const techniques = [
    {
      technique: "현실검증",
      description:
        "극단적 사고를 현실적으로 재평가하여 균형잡힌 관점을 찾습니다.",
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

  return finalThoughts.map((thought, idx) => ({
    thought,
    technique: techniques[idx]?.technique || "인지 재구성",
    techniqueDescription:
      techniques[idx]?.description ||
      "부정적 사고를 더 적응적인 사고로 바꿉니다.",
  }));
}

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
    const response = await callGeminiAPI(prompt, systemPrompt);

    const verseMatch = response.match(/구절[:\s]*(.+)/);
    const referenceMatch = response.match(/출처[:\s]*(.+)/);
    const prayerMatch = response.match(/기도[:\s]*([\s\S]+)/);

    return {
      verse:
        verseMatch?.[1]?.trim() ||
        "하나님이 세상을 이처럼 사랑하사 독생자를 주으니",
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
