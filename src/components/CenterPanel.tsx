// src/components/CenterPanel.tsx
import {
  Bookmark,
  Check,
  Loader2,
  RefreshCw,
  Shuffle,
  Star,
} from "lucide-react";
import { useRef, useState } from "react";
// import { generateExtendedAutomaticThoughts } from "../lib/gemini";
import { generateExtendedAutomaticThoughts } from "@/lib/gpt";
import type { EmotionThoughtPair } from "../types";
import { FirstEmotionIntensityModal } from "./FirstEmotionIntensityModal";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Textarea } from "./ui/textarea";

interface CenterPanelProps {
  step: number;
  userInput: string;
  emotionThoughtPairs: EmotionThoughtPair[];
  onInputChange: (input: string) => void;
  onSetEmotionThoughtPairs: (pairs: EmotionThoughtPair[]) => void;
  onNext: () => void;
}

interface EmotionData {
  id: string;
  label: string;
  description: string;
  physical: string;
  color: string;
  positive: string[];
  caution: string[];
}

// 11개 부정적 감정 목록 (성취감, 만족감 제외)
const EMOTIONS = [
  {
    id: "sadness",
    label: "슬픔",
    description: "상실과 아픔을 느끼는 감정",
    physical: "가슴이 답답하고, 목이 메이며, 눈물이 나옴",
    color: "bg-blue-50 border-blue-300 hover:border-blue-500",
    positive: [
      "슬픔은 상실의 가치를 인정하는 신호입니다. 소중했던 것을 알게 해줍니다.",
      "눈물은 치유의 시작입니다. 감정을 표현하는 것이 회복의 첫걸음입니다.",
      "슬픔을 통해 우리는 더 깊은 공감 능력을 갖게 됩니다.",
    ],
    caution: [
      "지나친 슬픔에 빠지면 일상생활이 어려워질 수 있습니다.",
      "오랜 기간 지속되면 우울증으로 발전할 수 있으니 주의가 필요합니다.",
    ],
  },
  {
    id: "anger",
    label: "분노",
    description: "부당함과 침해에 대한 반응",
    physical: "심장이 빠르게 뛰고, 얼굴이 화끈거리며, 주먹이 쥐어짐",
    color: "bg-red-50 border-red-300 hover:border-red-500",
    positive: [
      "분노는 경계가 침해되었음을 알려주는 신호입니다.",
      "정당한 분노는 변화와 정의를 위한 에너지가 됩니다.",
      "자신의 가치를 지키려는 건강한 반응일 수 있습니다.",
    ],
    caution: [
      "분노를 억누르거나 폭발시키면 관계가 손상될 수 있습니다.",
      "분노 뒤에 숨은 두려움이나 상처를 살펴볼 필요가 있습니다.",
    ],
  },
  {
    id: "fear",
    label: "두려움",
    description: "위험을 감지하고 경계하는 감정",
    physical: "온몸이 경직되고, 식은땀이 나며, 심장이 두근거림",
    color: "bg-purple-50 border-purple-300 hover:border-purple-500",
    positive: [
      "두려움은 위험을 미리 감지하는 보호 기능입니다.",
      "신중함과 준비를 하게 만들어 더 안전하게 만듭니다.",
      "용기는 두려움이 없는 것이 아니라, 두려움에도 불구하고 나아가는 것입니다.",
    ],
    caution: [
      "과도한 두려움은 회피 행동으로 이어져 삶이 제한될 수 있습니다.",
      "불안장애로 발전하지 않도록 현실적인 위험 평가가 필요합니다.",
    ],
  },
  {
    id: "disgust",
    label: "혐오",
    description: "거부감과 멀어지고 싶은 느낌",
    physical: "속이 메스껍고, 얼굴을 찡그리며, 몸을 움츠림",
    color: "bg-green-50 border-green-300 hover:border-green-500",
    positive: [
      "혐오감은 건강하지 못한 것으로부터 자신을 지키는 본능입니다.",
      "부적절한 상황이나 관계를 구분하는 데 도움을 줍니다.",
      "자기 보호의 건강한 신호일 수 있습니다.",
    ],
    caution: [
      "과도한 혐오감은 타인과의 건강한 관계를 방해할 수 있습니다.",
      "자신에 대한 혐오로 이어지지 않도록 주의가 필요합니다.",
    ],
  },
  {
    id: "shame",
    label: "수치심",
    description: "남들 앞에서 부끄럽고 창피한 감정",
    physical: "얼굴이 붉어지고, 고개가 숙여지며, 시을 피하게 됨",
    color: "bg-rose-50 border-rose-300 hover:border-rose-500",
    positive: [
      "수치심은 사회적 규범을 배우고 성장하게 만듭니다.",
      "겸손함과 자기 성찰의 기회를 제공합니다.",
      "타인을 배려하는 마음에서 비롯될 수 있습니다.",
    ],
    caution: [
      "만성적인 수치심은 자존감을 크게 떨어뜨립니다.",
      '수치심과 죄책감을 구분하고, "나는 나쁜 사람"이 아니라 "실수를 했다"로 이해하세요.',
    ],
  },
  {
    id: "guilt",
    label: "죄책감",
    description: "잘못했다는 자책과 미안함",
    physical: "가슴이 무겁고, 어깨가 처지며, 한숨이 나옴",
    color: "bg-pink-50 border-pink-300 hover:border-pink-500",
    positive: [
      "죄책감은 양심이 살아있다는 증거입니다.",
      "잘못을 인정하고 관계를 회복할 기회를 줍니다.",
      "더 나은 사람이 되려는 동기가 됩니다.",
    ],
    caution: [
      "과도한 죄책감은 자기 비난으로 이어져 우울증을 유발할 수 있습니다.",
      "자신의 책임이 아닌 일까지 떠안지 않도록 주의하세요.",
    ],
  },
  {
    id: "loneliness",
    label: "외로움",
    description: "혼자라는 느낌과 연결의 부재",
    physical: "가슴이 텅 빈 느낌, 몸 차고, 기력이 없음",
    color: "bg-indigo-50 border-indigo-300 hover:border-indigo-500",
    positive: [
      "외로움은 연결이 필요하다는 신호입니다. 관계의 중요성을 일깨웁니다.",
      "자기 자신과 깊이 만날 수 있는 시간이 됩니다.",
      "진정한 친밀감을 갈망하게 만들어 의미 있는 관계를 추구하게 합니다.",
    ],
    caution: [
      "장기간 외로움은 우울증과 불안으로 이어질 수 있습니다.",
      "회피가 아닌 작은 연결부터 시도하는 것이 중요합니다.",
    ],
  },
  {
    id: "despair",
    label: "절망",
    description: "희망이 없고 막막한 감정",
    physical: "온몸에 힘이 빠지고, 숨쉬기 힘들며, 모든 게 무기력함",
    color: "bg-slate-50 border-slate-400 hover:border-slate-600",
    positive: [
      "절망은 근본적인 변화가 필요하다는 강력한 신호입니다.",
      "인생의 바닥을 경험한 후 새로운 시작을 할 수 있습니다.",
      "더 이상 내려갈 곳이 없다면, 이제는 올라갈 일만 남았습니다.",
    ],
    caution: [
      "절망감이 지속되면 자해나 자살 충동으로 이어질 수 있어 즉각적인 도움이 필요합니다.",
      "전문가의 도움을 받는 것이 중요합니다. 혼자 견디지 마세요.",
    ],
  },
  {
    id: "frustration",
    label: "답답함",
    description: "막히고 풀리지 않는 느낌",
    physical: "가슴이 답답하고, 한숨이 나오며, 안절부절못함",
    color: "bg-amber-50 border-amber-300 hover:border-amber-500",
    positive: [
      "답답함은 현재 방법이 효과가 없다는 신호입니다. 새로운 접근이 필요함을 알려줍니다.",
      "문제 해결을 위한 창의적 사고를 자극합니다.",
      "인내심과 끈기를 기르는 과정이 됩니다.",
    ],
    caution: [
      "지속적인 답답함은 포기나 무기력으로 이어질 수 있습니다.",
      "작은 성공 경험을 쌓으며 한 걸음씩 나아가는 것이 중요합니다.",
    ],
  },
  {
    id: "anxiety",
    label: "불안",
    description: "미래에 대한 걱정과 초조함",
    physical: "가슴이 두근거리고, 손발이 떨리며, 잠을 못 잠",
    color: "bg-orange-50 border-orange-300 hover:border-orange-500",
    positive: [
      "불안은 미래를 준비하도록 만드는 동기입니다.",
      "위험을 예측하고 대비하게 만들어 더 안전하게 합니다.",
      "적절한 불안은 집중력과 수행 능력을 높입니다.",
    ],
    caution: [
      "과도한 불안은 일상생활과 수면을 방해합니다.",
      "불안장애로 발전하지 않도록 현실적인 사고와 이완이 요합니다.",
    ],
  },
  {
    id: "irritation",
    label: "짜증",
    description: "작은 일에도 화가 나는 예민한 상태",
    physical: "신경이 곤두서고, 이를 악물며, 목소리가 날카로워짐",
    color: "bg-yellow-50 border-yellow-300 hover:border-yellow-500",
    positive: [
      "짜증은 피로나 스트레스가 누적되었다는 신호입다. 휴식이 필요함을 알려줍니다.",
      "경계를 설정하고 자기 보호가 필요한 때를 알려줍니다.",
      "무언가 변화가 필요하다는 메시지입니다.",
    ],
    caution: [
      "지속적인 짜증은 관계를 손상시키고 고립을 초래할 수 있습니다.",
      "근본 원인을 찾아 해결하지 않으면 만성 스트레스로 이어집니다.",
    ],
  },
];

// 확장된 예시 목록 (이모지 포함) - 다양한 삶의 영역에서 겪는 구체적 스트레스 상황
const ALL_EXAMPLES = [
  // 직장/업무 관련
  {
    text: "팀 회의에서 내 기획안을 발표했는데, 팀장이 '이건 현실성이 없어 보이네요'라며 3분 만에 잘라버렸어. 2주 동안 밤새 준비한 데.",
    emoji: "💼",
  },
  {
    text: "상사가 '이것도 모르세요?'라고 다른 동료 5명 에서 말했어. 다들 고개를 숙이고 어색한 웃음만 지었어.",
    emoji: "😣",
  },
  {
    text: "내가 성과를 냈는데 팀장이 회의에 '팀원들 덕분이죠'라고만 해. 나 혼자 야근하며 마감 맞춘 건데.",
    emoji: "😖",
  },
  {
    text: "동기는 입사 1년 만에 승진했는데, 나는 3년째 같은 자리야. 상사가 '넌 아직 준비가 안 된 것 같아'라고만 해.",
    emoji: "📊",
  },
  {
    text: "회식 자리에서 내 농담에는 아무도 안 웃고, 과장님 농담에만 다들 배꼽 잡고 웃어. 내가 투명인간 같았어.",
    emoji: "😰",
  },

  // 연인/썸 관련
  {
    text: "연인이 내 카톡은 12시간째 안 읽는데, 인스타 스토리는 계속 올려. 나한테만 바쁜 건가?",
    emoji: "💔",
  },
  {
    text: "좋아하는 사람에게 고백했는데 '나 지금 연애 생각 없어. 친구로 지내자'라는 답장만 왔어. 3개월 동안 신호 준 게 다 착각이었나.",
    emoji: "💌",
  },
  {
    text: "연인이 내가 준비한 깜짝 생일파티 보고 '아 고마워'라고만 하고 10분 만에 친구 전화받으러 나갔어.",
    emoji: "🎂",
  },
  {
    text: "데이트 중에 속 전 여자친구 얘기를 해. '걔는 이런 거 좋아했는데'라며 30분째 비교당하고 있어.",
    emoji: "😞",
  },
  {
    text: "썸타는 사람이 '오늘 바빠'라며 약속 취소했는데, 친구 인스 보니까 다른 이성이랑 카페에 있더라.",
    emoji: "☕",
  },

  // 가족 관련
  {
    text: "명절 때마다 친척들이 '결혼 언제 하니? 이제 서른인데'라며 나를 둘러싸. 부모님은 옆에서 한숨만 쉬셔.",
    emoji: "🏠",
  },
  {
    text: "부모님이 '네 동생은 의사인데 너는 뭐하니?'라고 친척 20명 앞에서 하셨어. 동생은 뿌듯한 표정으로 미소만.",
    emoji: "👨‍👩‍👧‍👦",
  },
  {
    text: "엄마에게 '오늘 힘들었어'라고 털어놨더니 '그게 힘든 거야? 엄마는 너 키우면서 얼마나...'라며 30분째 잔소리.",
    emoji: "😔",
  },
  {
    text: "형제가 '너는 항상 그 모양이야'라고 가족 단톡방에서 말했어. 부모님은 읽고도 아무 말 없으셔.",
    emoji: "📱",
  },
  {
    text: "아버지가 '네가 그렇게 하니까 안 되는 거지'라며 내 선택을 부정하셨어. 1년 동안 고민해서 결정한 건데.",
    emoji: "😟",
  },

  // 친구/대인관계
  {
    text: "친구가 내 카톡을 읽고도 8시간째 답장이 없어. 그런데 단톡방에는 계속 말하더라. 나한테만 이래.",
    emoji: "💬",
  },
  {
    text: "들이 나 빼고 만났다는 걸 SNS로 알게 됐어. 어제까지 '요즘 바빠'라고 했는데 다 거짓말이었네.",
    emoji: "📸",
  },
  {
    text: "친구에게 고민 상담했더니 '그건 별로 힘든  아닌데? 나는 더 힘들었어'라며 자기 얘기만 1시간.",
    emoji: "😢",
  },
  {
    text: "단톡방에 여행 계획 얘기가 있는데 나한테는 아무도 따로 연락이 없어. 5년 지기 친구들인데.",
    emoji: "✈️",
  },
  {
    text: "친구가 약속을 또 취소했어. 이번이 네 번째야. '미안 급한 일 생겼어'라는 3초 메시지만 보내고 전화도 안 받아.",
    emoji: "😓",
  },

  // 외로움/소외감
  {
    text: "회사에서 점심시간에 다들 짝지어 나가는데 나한테는 아무도 같이 가자고 안 해. 6개월째 혼밥 중이야.",
    emoji: "🍱",
  },
  {
    text: "대학 동기 모임에 갔는데 다들 취업, 결혼, 출산 얘기만 해. 나만 백수에 솔로야. 나 없는 것처럼 대화가 흘러갔어.",
    emoji: "🎓",
  },
  {
    text: "생일인데 축하 메시지가 카톡 자동 알림 빼고 2개야. 작년에는 30개 넘게 왔었는데.",
    emoji: "🎉",
  },
  {
    text: "주말에 할 일이 없어서 연락할 사람을 찾아봤는데, 부담 없이 연락할 사람이 한 명도 없어.",
    emoji: "📵",
  },

  // 성취/능력 관련
  {
    text: "자격증 시험에 5번째 떨어졌어. 같이 시작한 친구들은 다 붙었는데 나만 계속 실패야. '머리가 나쁜가?'라는 생각뿐.",
    emoji: "📝",
  },
  {
    text: "면접에서 '이력서를 보니 공백이 많네. 그동안 뭐하셨어요?'라는 질문에 제대로 대답을 못 했어.",
    emoji: "😨",
  },
  {
    text: "프로젝트 발표 중에 갑자기 머릿속이 하얘져서 30초 동안 멈춰 있었어. 청중들 20명이 다 쳐다보는데.",
    emoji: "🎤",
  },
  {
    text: "3개월 준비한 공모전에서 탈락했어. 심사평엔 '참신하지 않음'이라고만 써있더라. 밤새 아이디어 짰는데.",
    emoji: "🏆",
  },

  // 나이/시간 압박
  {
    text: "30대 중반인데 아직 연애 경험이 별로 없어. 주변 사람들 다 결혼하거나 둘째 낳을 때인데.",
    emoji: "⏰",
  },
  {
    text: "20대 후배가 나보다 연봉이 높다는 걸 알게 됐어. 나는 10년째 이 일 하는데.",
    emoji: "💰",
  },
  {
    text: "이제 40대인데 새로운 걸 시작하기엔 너무 늦은 것 같아. '그때 했어야 했는데'라는 후회만.",
    emoji: "🕐",
  },

  // 비교/열등감
  {
    text: "SNS를 보니 대학 동기는 해외여행 중이고, 다른 친구는 승진했다고 올렸어. 나만 제자리인 것 같아.",
    emoji: "📲",
  },
  {
    text: "동창회에서 다들 '요즘 뭐해?'라고 물어볼 때 내 대답이 너무 초라해서 얼버무렸어.",
    emoji: "🎭",
  },
  {
    text: "형제는 부모님께 칭찬받는데, 나는 '형제 좀 본받아라'라는 말만 들어. 30년째 비교당하고 있어.",
    emoji: "😤",
  },

  // 소망/희망 좌절
  {
    text: "꿈꿔왔던 회사에 최종 면접까지 갔는데 떨어졌어. '아쉽지만...'이라는 메일만 왔어. 2년 준비했는데.",
    emoji: "💼",
  },
  {
    text: "유튜브 채널을 6개월 동안 운영했는데 구독자가 50명이야. 같이 시작한 친구는 1만 명 넘었어.",
    emoji: "🎬",
  },
  {
    text: "작년에 '올해는 꼭 살 빼겠다'고 다짐했는데 오히려 5kg 쪘어. 또 실패했어.",
    emoji: "⚖️",
  },

  // 기술/변화 적응
  {
    text: "신입사원이 '이거 AI로 하면 10분이면 되는데요'라고 했어. 나는 3시간 걸려서 한 일인데.",
    emoji: "🤖",
  },
  {
    text: "회사에서 새 프로그램을 배우라는데, 젊은 애들은 금방 배우는데 나만 한 달째 헤매고 있어.",
    emoji: "💻",
  },
];

export function CenterPanel({
  step,
  userInput,
  emotionThoughtPairs,
  onInputChange,
  onSetEmotionThoughtPairs,
  onNext,
}: CenterPanelProps) {
  // ref for scrolling
  const containerRef = useRef<HTMLDivElement>(null);

  // 랜덤으로 섞인 예시 8개 + 새로고침 함수
  const [randomExamples, setRandomExamples] = useState(() => {
    const shuffled = [...ALL_EXAMPLES].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 8);
  });

  const refreshExamples = () => {
    const shuffled = [...ALL_EXAMPLES].sort(() => Math.random() - 0.5);
    setRandomExamples(shuffled.slice(0, 8));
  };

  // 현재 선택된 감정
  const [selectedEmotion, setSelectedEmotion] = useState<string>("");
  const [emotionIntensity, setEmotionIntensity] = useState(50);
  const [emotionSet, setEmotionSet] = useState(false);
  const [showIntensityModal, setShowIntensityModal] = useState(false);

  // 감정 상세 뷰 상태
  const [showEmotionDetail, setShowEmotionDetail] = useState(false);
  const [selectedEmotionData, setSelectedEmotionData] =
    useState<EmotionData | null>(null);
  const [viewedPositives, setViewedPositives] = useState<Set<number>>(
    new Set()
  );
  const [viewedCautions, setViewedCautions] = useState<Set<number>>(new Set());

  // AI가 생성한 5개의 자동사고
  const [generatedThoughts, setGeneratedThoughts] = useState<string[]>([]);
  const [selectedThoughtIndex, setSelectedThoughtIndex] = useState<
    number | null
  >(null);

  // 사용자 직접 입력 자동사고
  const [customThought, setCustomThought] = useState<string>("");

  // 자동사고 표시 페이지 (false: 첫 7개, true: 나머지 8개)
  const [showSecondPage, setShowSecondPage] = useState(false);

  // 즐겨찾기 상태
  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useState<any[]>([]);

  // 로딩 상태
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 예시 클릭
  const handleExampleClick = (example: string) => {
    onInputChange(example);
  };

  // 감정 선택 - 상세 뷰 열기
  const handleEmotionSelect = (emotionData: EmotionData) => {
    setSelectedEmotionData(emotionData);
    setShowEmotionDetail(true);
    setViewedPositives(new Set());
    setViewedCautions(new Set());
  };

  // 긍정적 측면 펼치기
  const togglePositive = (index: number) => {
    setViewedPositives((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // 주의할 점 펼치기
  const toggleCaution = (index: number) => {
    setViewedCautions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // 모든 긍정적 측면을 봤는지 확인
  const allPositivesViewed = selectedEmotionData
    ? viewedPositives.size === selectedEmotionData.positive.length
    : false;

  // 이 감정 다루기
  const handleSelectThisEmotion = () => {
    if (allPositivesViewed && selectedEmotionData) {
      setSelectedEmotion(selectedEmotionData.label);
      setShowEmotionDetail(false);
      setShowIntensityModal(true);
    }
  };

  // 감정 강도 설정 완료 → AI가 자동사고 13개 생성 (SDT 3개 + 인지오류 10개)
  const handleEmotionConfirm = async () => {
    setEmotionSet(true);
    setLoading(true);
    setError(null);

    try {
      const result = await generateExtendedAutomaticThoughts(
        userInput,
        selectedEmotion
      );

      // SDT 3개 + 인지오류 기반 10개를 하나의 배열로 합치기 (레이블 제거)
      const allThoughts = [
        ...result.sdtThoughts.map((st) => st.thought),
        ...result.cognitiveThoughts.map((ct) =>
          ct.replace(/\s*\([^)]*\)\s*$/g, "").trim()
        ), // 괄호 제거
      ];

      setGeneratedThoughts(allThoughts);

      // 화면을 위로 스크롤
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      console.error("자동사고 생성 오류:", err);
    } finally {
      setLoading(false);
    }
  };

  // 자동사고 선택
  const handleThoughtSelect = (index: number) => {
    setSelectedThoughtIndex(index);
  };

  // 선택 완료 → Step 3로
  const handleComplete = () => {
    if (selectedThoughtIndex !== null) {
      const newPair: EmotionThoughtPair = {
        emotion: selectedEmotion,
        intensity: emotionIntensity,
        thought: generatedThoughts[selectedThoughtIndex],
      };

      onSetEmotionThoughtPairs([...emotionThoughtPairs, newPair]);

      // 화면 스크롤
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }
      window.scrollTo({ top: 0, behavior: "smooth" });

      onNext();
    }
  };

  // 즐겨찾기 불러오기
  const loadFavorites = () => {
    const stored = JSON.parse(
      localStorage.getItem("cbt-thought-favorites") || "[]"
    );
    setFavorites(stored);
    setShowFavorites(true);
  };

  // 자동사고 즐겨찾기 추가
  const addThoughtToFavorites = (
    thought: string,
    emotion: string,
    intensity: number
  ) => {
    const favorites = JSON.parse(
      localStorage.getItem("cbt-thought-favorites") || "[]"
    );

    // 중복 체크
    const exists = favorites.some(
      (f: any) => f.thought === thought && f.emotion === emotion
    );

    if (exists) {
      alert("이미 즐겨찾기에 있습니다.");
      return;
    }

    if (favorites.length >= 20) {
      alert("최대 20개까지 저장할 수 있습니다.");
      return;
    }

    const newFavorite = {
      id: Date.now().toString(),
      thought,
      emotion,
      intensity,
      createdAt: Date.now(),
    };

    favorites.unshift(newFavorite);
    localStorage.setItem("cbt-thought-favorites", JSON.stringify(favorites));
    alert("자동사고가 즐겨찾기에 추가되었습니다!");
  };

  // 즐겨찾기에서 자동사고 불러오기
  const loadFromFavorites = (favorite: any) => {
    setSelectedEmotion(favorite.emotion);
    setEmotionIntensity(favorite.intensity);
    setEmotionSet(true);
    setCustomThought(favorite.thought);
    setSelectedThoughtIndex(999); // 커스텀 입력으로 설정
    setShowFavorites(false);

    // 화면 스크롤
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 즐겨찾기 삭제
  const removeFromFavorites = (id: string) => {
    const favorites = JSON.parse(
      localStorage.getItem("cbt-thought-favorites") || "[]"
    );
    const filtered = favorites.filter((f: any) => f.id !== id);
    localStorage.setItem("cbt-thought-favorites", JSON.stringify(filtered));
    setFavorites(filtered);
  };

  return (
    <Card className="bg-slate-50/95 backdrop-blur-sm p-6 shadow-2xl border border-slate-200/50 min-h-[600px] flex flex-col">
      <div className="mb-4">
        <div className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1.5 rounded-full mb-3 shadow-lg text-sm">
          중앙 (1~2) 💭
        </div>
        <h2 className="text-slate-800 text-xl">자동사고 체크</h2>
      </div>

      {/* 감정 강도 모달 */}
      <FirstEmotionIntensityModal
        open={showIntensityModal}
        emotion={selectedEmotion}
        intensity={emotionIntensity}
        onIntensityChange={setEmotionIntensity}
        onConfirm={() => {
          setShowIntensityModal(false);
          handleEmotionConfirm();
        }}
      />

      <div className="flex-1 space-y-6 overflow-y-auto" ref={containerRef}>
        {/* Step 1: 사건 기록 */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-900 mb-2 text-lg">
                오늘 당신에게 무슨 일이 있었는지 들려주신다면, 우리는 같이
                감정을 만드는 생각을 다뤄갈 수 있습니다.
              </p>
              <p className="text-slate-700 mb-2 text-base">
                마음이 힘들었던 경험이나 불편했던 상황을 자유롭게 적어주세요.
              </p>
              <p className="text-blue-700 text-base">
                💡 자세한 설명일수록 더욱 효과적입니다.
              </p>
            </div>

            {/* 예시 버튼들 */}
            <div className="space-y-2">
              <p className="text-slate-600 text-base">
                또는 예시를 선택하세요:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {randomExamples.map((example, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <button
                      onClick={() => handleExampleClick(example.text)}
                      className="flex-1 text-left p-3 rounded-lg border border-slate-300 hover:border-blue-400 hover:bg-blue-50 transition-all text-sm text-slate-700 leading-relaxed"
                    >
                      <span className="text-lg mr-1">{example.emoji}</span>
                      <span className="text-sm">{example.text}</span>
                    </button>
                    <button
                      onClick={() => {
                        // 즐겨찾기에 추가
                        const favorites = JSON.parse(
                          localStorage.getItem("cbt-favorites") || "[]"
                        );
                        const exists = favorites.some(
                          (f: any) => f.text === example.text
                        );

                        if (exists) {
                          alert("이미 즐겨찾기에 있습니다.");
                          return;
                        }

                        if (favorites.length >= 10) {
                          alert("최대 10개까지 저장할 수 있습니다.");
                          return;
                        }

                        const newFavorite = {
                          id: Date.now().toString(),
                          text: example.text,
                          createdAt: Date.now(),
                        };

                        favorites.unshift(newFavorite);
                        localStorage.setItem(
                          "cbt-favorites",
                          JSON.stringify(favorites)
                        );
                        alert("즐겨찾기에 추가되었습니다!");
                      }}
                      className="p-2 rounded-lg border border-yellow-300 hover:border-yellow-500 hover:bg-yellow-50 transition-all text-yellow-600 hover:text-yellow-700 flex-shrink-0"
                      title="즐겨찾기에 추가"
                    >
                      <Star className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={refreshExamples}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-indigo-300 hover:border-indigo-500 hover:bg-indigo-50 transition-all text-sm text-indigo-700"
              >
                <Shuffle className="size-4" />
                다른 예시 보기
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-slate-700 text-sm">직접 입력:</label>
                <button
                  onClick={() => {
                    if (!userInput.trim()) {
                      alert("먼저 내용을 입력해주세요.");
                      return;
                    }

                    // 즐겨찾기에 추가
                    const favorites = JSON.parse(
                      localStorage.getItem("cbt-favorites") || "[]"
                    );
                    const exists = favorites.some(
                      (f: any) => f.text === userInput
                    );

                    if (exists) {
                      alert("이미 즐겨찾기에 있습니다.");
                      return;
                    }

                    if (favorites.length >= 10) {
                      alert("최대 10개까지 저장할 수 있습니다.");
                      return;
                    }

                    const newFavorite = {
                      id: Date.now().toString(),
                      text: userInput,
                      createdAt: Date.now(),
                    };

                    favorites.unshift(newFavorite);
                    localStorage.setItem(
                      "cbt-favorites",
                      JSON.stringify(favorites)
                    );
                    alert("즐겨찾기에 추가되었습니다!");
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-yellow-300 hover:border-yellow-500 hover:bg-yellow-50 transition-all text-yellow-600 hover:text-yellow-700 text-sm"
                  title="즐겨찾기에 추가"
                >
                  <Star className="size-4" />
                  즐겨찾기 추가
                </button>
              </div>
              <Textarea
                value={userInput}
                onChange={(e) => onInputChange(e.target.value)}
                placeholder="여기에 직접 입력하세요..."
                className="min-h-[120px] resize-none"
              />
            </div>

            <Button
              onClick={onNext}
              disabled={!userInput.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              다음: 감정 선택하기
            </Button>

            {/* 면책 조항 */}
            <div className="text-center mt-4">
              <p className="text-slate-400 text-xs">
                이 치료기법은 일반적인 인지행동치료 원리를 기반으로 AI를
                활용하여 생성되었음을 알려드립니다.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: 감정 1개 선택 */}
        {step === 2 && !emotionSet && !showEmotionDetail && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border-2 border-blue-200">
              <h3 className="text-blue-900 mb-2 text-lg">
                당신이 느낀 감정을 <strong>1가지</strong> 선택해주세요
              </h3>
              <p className="text-slate-700 text-sm mb-1">
                가장 다루고 싶은 주요 감정을 골라주세.
              </p>
              <p className="text-blue-600 text-xs">
                💡 한 번에 여러개를 다루시려면 뒤로 돌아가셔서 즐겨찾기를
                등록하시고 다시 해주시면 더욱 효과가 좋습니다.
              </p>
            </div>

            {selectedEmotion && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-xl text-center text-green-900 border-2 border-green-300 shadow-sm">
                <span className="text-lg">
                  선택된 감정:{" "}
                  <strong className="text-xl">{selectedEmotion}</strong> ✓
                </span>
              </div>
            )}

            {/* 2열 그리드로 감정 카드 배치 */}
            <div className="grid grid-cols-2 gap-3 max-h-[550px] overflow-y-auto pr-2">
              {EMOTIONS.map((emotion) => {
                const isSelected = selectedEmotion === emotion.label;
                return (
                  <button
                    key={emotion.id}
                    onClick={() => handleEmotionSelect(emotion)}
                    className={`text-left p-3 rounded-xl border-2 transition-all hover:shadow-lg hover:scale-[1.02] ${
                      isSelected
                        ? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg scale-[1.02]"
                        : emotion.color + " border-2 hover:border-blue-300"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-slate-900 font-semibold">
                          {emotion.label}
                        </h3>
                        {isSelected && (
                          <Check className="size-4 text-blue-600" />
                        )}
                      </div>
                      <p className="text-slate-700 text-xs leading-relaxed">
                        {emotion.description}
                      </p>
                      <p className="text-slate-500 text-xs">
                        💭 {emotion.physical}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: 감정 상세 정보 */}
        {step === 2 &&
          !emotionSet &&
          showEmotionDetail &&
          selectedEmotionData && (
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-3 rounded-lg border-2 border-indigo-300">
                <h2 className="text-indigo-900 text-base mb-1">
                  지금 이 순간의 감정 인식하기: {selectedEmotionData.label}
                </h2>
                <p className="text-slate-700 text-xs">
                  {selectedEmotionData.description}
                </p>
                <p className="text-slate-600 text-xs mt-1">
                  💭 {selectedEmotionData.physical}
                </p>
              </div>

              {/* 긍정적 측면 */}
              <div className="space-y-2">
                <div className="bg-green-50 p-2 rounded-lg border border-green-300">
                  <h3 className="text-green-900 text-sm">
                    ✨ 긍정적 측면 (모두 펼쳐보기)
                  </h3>
                </div>
                {selectedEmotionData.positive.map(
                  (item: string, index: number) => (
                    <div
                      key={index}
                      className="border border-green-200 rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() => togglePositive(index)}
                        className="w-full text-left p-2 bg-green-50 hover:bg-green-100 transition-colors flex items-center justify-between text-sm"
                      >
                        <span className="text-green-900">
                          긍정적 측면 {index + 1}
                        </span>
                        <span className="text-green-600 text-xs">
                          {viewedPositives.has(index) ? "▼" : "▶"}
                        </span>
                      </button>
                      {viewedPositives.has(index) && (
                        <div className="p-3 bg-white border-t border-green-200">
                          <p className="text-slate-700 leading-relaxed text-sm">
                            {item}
                          </p>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>

              {/* 주의할 점 */}
              <div className="space-y-2">
                <div className="bg-amber-50 p-2 rounded-lg border border-amber-300">
                  <h3 className="text-amber-900 text-sm">
                    ⚠️ 주의할 점 (선택적으로 보기)
                  </h3>
                </div>
                {selectedEmotionData.caution.map(
                  (item: string, index: number) => (
                    <div
                      key={index}
                      className="border border-amber-200 rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() => toggleCaution(index)}
                        className="w-full text-left p-2 bg-amber-50 hover:bg-amber-100 transition-colors flex items-center justify-between text-sm"
                      >
                        <span className="text-amber-900">
                          주의할 점 {index + 1}
                        </span>
                        <span className="text-amber-600 text-xs">
                          {viewedCautions.has(index) ? "▼" : "▶"}
                        </span>
                      </button>
                      {viewedCautions.has(index) && (
                        <div className="p-3 bg-white border-t border-amber-200">
                          <p className="text-slate-700 leading-relaxed text-sm">
                            {item}
                          </p>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>

              {/* 진행 상태 */}
              <div
                className={`p-3 rounded-lg border ${
                  allPositivesViewed
                    ? "bg-green-50 border-green-300"
                    : "bg-slate-50 border-slate-300"
                }`}
              >
                <p
                  className={`text-center text-sm ${
                    allPositivesViewed ? "text-green-900" : "text-slate-600"
                  }`}
                >
                  {allPositivesViewed
                    ? "✓ 모든 긍정적 측면을 확인했습니다!"
                    : `긍정적 측면 ${viewedPositives.size}/${selectedEmotionData.positive.length} 확인함`}
                </p>
              </div>

              {/* 버튼들 */}
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowEmotionDetail(false);
                    setSelectedEmotionData(null);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  다른 감정 보기
                </Button>
                <Button
                  onClick={handleSelectThisEmotion}
                  disabled={!allPositivesViewed}
                  className={`flex-1 ${
                    allPositivesViewed
                      ? "bg-indigo-600 hover:bg-indigo-700"
                      : "bg-slate-300 cursor-not-allowed"
                  }`}
                >
                  이 감정 다루기
                </Button>
              </div>

              {!allPositivesViewed && (
                <p className="text-center text-slate-500 text-xs">
                  💡 모든 긍정적 측면을 확인한 후 진행할 수 있습니다.
                </p>
              )}
            </div>
          )}

        {/* Step 2: AI가 자동사고 3개 생성 → 사용자가 1개 선택 */}
        {step === 2 && emotionSet && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-blue-900 mb-2">
                <strong>{selectedEmotion}</strong> (강도: {emotionIntensity})
              </p>
              <p className="text-slate-700">
                이 감정 뒤에 숨어있을 수 있는 생각들입니다.{" "}
                <strong>가장 잘 맞는 것을 1개 골라주세요.</strong>
                <br />
                만약 없으면 <strong>다른 생각 보기</strong>를 누르시거나{" "}
                <strong>직접 적어주세요.</strong>
              </p>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="size-8 animate-spin text-blue-600 mb-4" />
                <p className="text-slate-600">
                  당신의 마음을 분석하고 있습니다...
                </p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
                <p className="mb-2">{error}</p>
                <Button
                  onClick={handleEmotionConfirm}
                  variant="outline"
                  size="sm"
                >
                  다시 시도
                </Button>
              </div>
            ) : generatedThoughts.length > 0 ? (
              <>
                {/* 재생성 버튼 */}
                <div className="flex justify-end">
                  <Button
                    onClick={handleEmotionConfirm}
                    variant="outline"
                    size="sm"
                    className="gap-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                  >
                    <RefreshCw className="size-4" />
                    다시 만들기
                  </Button>
                </div>

                {/* 즐겨찾기 목록 보기 버튼 */}
                {!showFavorites ? (
                  <Button
                    onClick={loadFavorites}
                    variant="outline"
                    className="w-full gap-2 border-2 border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                  >
                    <Bookmark className="size-4" />
                    저장한 자동사고 불러오기
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-yellow-50 p-3 rounded-lg border border-yellow-300">
                      <h3 className="text-yellow-900 font-semibold">
                        저장한 자동사고 목록
                      </h3>
                      <Button
                        onClick={() => setShowFavorites(false)}
                        variant="ghost"
                        size="sm"
                        className="text-yellow-700"
                      >
                        닫기
                      </Button>
                    </div>
                    {favorites.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        <Bookmark className="size-12 mx-auto mb-2 opacity-30" />
                        <p>저장된 자동사고가 없습니다.</p>
                        <p className="text-sm mt-1">
                          마음에 드는 자동사고를 저장해보세요.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {favorites.map((fav: any) => (
                          <div
                            key={fav.id}
                            className="bg-white p-3 rounded-lg border-2 border-yellow-200 hover:border-yellow-400 transition-all"
                          >
                            <div className="flex items-start gap-2 mb-2">
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                {fav.emotion} (강도: {fav.intensity})
                              </span>
                              <span className="text-xs text-slate-400">
                                {new Date(fav.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-slate-700 text-sm mb-3">
                              {fav.thought}
                            </p>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => loadFromFavorites(fav)}
                                size="sm"
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                              >
                                이 생각으로 진행하기
                              </Button>
                              <Button
                                onClick={() => removeFromFavorites(fav.id)}
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:bg-red-50"
                              >
                                삭제
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-3">
                  {(showSecondPage
                    ? generatedThoughts.slice(7)
                    : generatedThoughts.slice(0, 7)
                  ).map((thought, idx) => {
                    const index = showSecondPage ? idx + 7 : idx;
                    return (
                      <div key={index} className="flex items-start gap-2">
                        <button
                          onClick={() => handleThoughtSelect(index)}
                          className={`flex-1 text-left p-4 rounded-lg border-2 transition-all relative ${
                            selectedThoughtIndex === index
                              ? "border-blue-600 bg-blue-50"
                              : "border-slate-200 hover:border-blue-300 bg-white"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span
                              className={`flex-shrink-0 w-6 h-6 rounded-full text-white flex items-center justify-center text-sm ${
                                selectedThoughtIndex === index
                                  ? "bg-blue-600"
                                  : "bg-slate-400"
                              }`}
                            >
                              {index + 1}
                            </span>
                            <p className="text-slate-800 flex-1">{thought}</p>
                            {selectedThoughtIndex === index && (
                              <Check className="size-5 text-blue-600 flex-shrink-0" />
                            )}
                          </div>
                        </button>
                        <button
                          onClick={() =>
                            addThoughtToFavorites(
                              thought,
                              selectedEmotion,
                              emotionIntensity
                            )
                          }
                          className="p-3 rounded-lg border-2 border-yellow-300 hover:border-yellow-500 hover:bg-yellow-50 transition-all text-yellow-600 hover:text-yellow-700 flex-shrink-0"
                          title="즐겨찾기에 추가"
                        >
                          <Bookmark className="size-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* 다른 생각 보기 버튼 */}
                {generatedThoughts.length > 7 && (
                  <Button
                    onClick={() => {
                      setShowSecondPage(!showSecondPage);
                      // 페이지 변경 시 선택 초기화
                      setSelectedThoughtIndex(null);
                    }}
                    variant="outline"
                    className="w-full gap-2 border-2 border-purple-300 text-purple-700 hover:bg-purple-50"
                  >
                    <Shuffle className="size-4" />
                    {showSecondPage ? "처음 7개 보기" : "다른 생각 보기"}
                  </Button>
                )}

                {/* 직접 입력 칸 */}
                <div className="border-t-2 border-slate-300 pt-4">
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-200 mb-3">
                    <p className="text-indigo-900 mb-2">
                      ✍️ 또는 당신의 생각을 직접 적어보세요
                    </p>
                    <p className="text-slate-600 text-sm">
                      AI가 제안한 생각 중에 딱 맞는 것이 없다면, 당신의 진짜
                      생각을 그대로 적어주세요.
                    </p>
                  </div>
                  <Textarea
                    value={customThought}
                    onChange={(e) => {
                      setCustomThought(e.target.value);
                      // 커스텀 입력 시작하면 기존 선택 해제
                      if (
                        e.target.value &&
                        selectedThoughtIndex !== null &&
                        selectedThoughtIndex !== 999
                      ) {
                        setSelectedThoughtIndex(null);
                      }
                    }}
                    placeholder="예: 나는 이렇게 하면 안 된다고 생각해..."
                    className="min-h-[80px] resize-none"
                  />
                  {customThought.trim() && (
                    <Button
                      onClick={() => setSelectedThoughtIndex(999)}
                      className={`w-full mt-3 ${
                        selectedThoughtIndex === 999
                          ? "bg-purple-600 hover:bg-purple-700"
                          : "bg-indigo-600 hover:bg-indigo-700"
                      }`}
                    >
                      {selectedThoughtIndex === 999 && (
                        <Check className="size-4 mr-2" />
                      )}
                      이 생각 선택기
                    </Button>
                  )}
                </div>

                {selectedThoughtIndex !== null && (
                  <div className="bg-blue-50 p-3 rounded-lg text-center text-blue-800 border border-blue-300">
                    {selectedThoughtIndex === 999
                      ? "선택됨: 직접 입력한 생각"
                      : `선택됨: 생각 ${selectedThoughtIndex + 1}`}
                  </div>
                )}

                <Button
                  onClick={() => {
                    if (selectedThoughtIndex === 999 && customThought.trim()) {
                      // 커스텀 생각 사용
                      const newPair: EmotionThoughtPair = {
                        emotion: selectedEmotion,
                        intensity: emotionIntensity,
                        thought: customThought.trim(),
                      };
                      onSetEmotionThoughtPairs([
                        ...emotionThoughtPairs,
                        newPair,
                      ]);
                      onNext();
                    } else {
                      // AI 생각 사용
                      handleComplete();
                    }
                  }}
                  disabled={selectedThoughtIndex === null}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  선택 완료 → 인지오류 검토로 이동
                </Button>
              </>
            ) : null}
          </div>
        )}

        {/* Step 3 이상: 완료 */}
        {step >= 3 && (
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <p className="text-green-800 mb-2">✓ 자동사고 체크 완료</p>
            <div className="space-y-2 text-slate-700">
              {emotionThoughtPairs.map((pair, i) => (
                <div
                  key={i}
                  className="bg-white p-3 rounded border border-green-300"
                >
                  <p className="text-sm mb-1">
                    <strong>{pair.emotion}</strong> (강도: {pair.intensity})
                  </p>
                  <p className="text-xs text-slate-600">"{pair.thought}"</p>
                </div>
              ))}
            </div>
            <p className="text-emerald-600 mt-3 text-base">
              → 좌측 패널에서 인지오류를 검토해주세요.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
