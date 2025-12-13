import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Heart, Sparkles, Plus, Minus } from 'lucide-react';
import { useState } from 'react';

interface FirstEmotionIntensityModalProps {
  open: boolean;
  emotion: string;
  intensity: number;
  onIntensityChange: (value: number) => void;
  onConfirm: () => void;
}

// 각 감정의 장점 (5가지 이상)
const EMOTION_BENEFITS: { [key: string]: string[] } = {
  '슬픔': [
    '내가 무엇을 소중히 여기는지 깨닫게 해줍니다',
    '타인의 아픔에 공감하고 위로할 수 있는 능력을 키워줍니다',
    '인생에서 정말 중요한 것이 무엇인지 재평가하게 합니다',
    '다른 사람들이 내게 다가와 위로를 나눌 수 있는 기회가 됩니다',
    '감정을 표현하고 눈물로 해소하는 것은 신체적 스트레스를 줄여줍니다',
    '상실을 인정하고 받아들이는 과정을 통해 성장할 수 있습니다',
  ],
  '분노': [
    '나의 경계선이 침범당했음을 알려주는 중요한 신호입니다',
    '불공정한 상황을 바로잡으려는 강력한 동기를 제공합니다',
    '나 자신과 소중한 사람을 지키기 위한 에너지를 줍니다',
    '문제 상황을 명확히 인식하고 행동하게 만듭니다',
    '정의감과 공정함에 대한 민감성이 있다는 증거입니다',
    '적절히 표현하면 관계에서 솔직한 대화의 계기가 됩니다',
  ],
  '두려움': [
    '위험을 미리 감지하여 나를 보호합니다',
    '준비를 철저히 하게 만들어 성공 확률을 높입니다',
    '신중하게 행동하여 무모한 실수를 방지합니다',
    '중요한 상황에 집중력을 높여줍니다',
    '생존 본능으로서 인간의 자연스러운 반응입니다',
    '안전과 보호에 대한 건강한 관심을 가지고 있다는 의미입니다',
  ],
  '혐오': [
    '나에게 해로운 것을 직관적으로 구별합니다',
    '건강한 경계를 설정하고 유지하는 데 도움을 줍니다',
    '독성 있는 관계나 환경에서 벗어나게 합니다',
    '자기 가치를 지키고 존중받을 권리를 주장하게 만듭니다',
    '윤리적 기준과 가치관이 명확하다는 증거입니다',
  ],
  '수치심': [
    '타인과의 관계에서 품위를 지키려는 의식이 있습니다',
    '사회적 규범과 예의를 존중하는 태도를 가지고 있습니다',
    '자신을 성찰하고 개선하려는 동기가 됩니다',
    '타인의 시선을 의식하는 것은 사회적 존재로서 자연스러운 반응입니다',
    '윤리적 경계와 도덕적 기준이 있다는 의미입니다',
  ],
  '죄책감': [
    '타인에게 피해를 주었음을 인식하는 양심이 있습니다',
    '잘못을 바로잡으려는 책임감을 불러일으킵니다',
    '사과하고 관계를 회복할 수 있는 계기가 됩니다',
    '앞으로 같은 실수를 반복하지 않도록 배우게 합니다',
    '타인을 배려하는 도덕적 감수성이 있다는 증거입니다',
    '진심 어린 반성은 인격적 성장의 기회입니다',
  ],
  '외로움': [
    '사람과의 연결이 필요함을 알려주는 신호입니다',
    '친밀한 관계를 추구하고 노력하게 만드는 동기입니다',
    '자신을 돌아보고 내면을 탐색할 수 있는 시간이 됩니다',
    '진정한 관계의 소중함을 깨닫게 합니다',
    '혼자 있는 시간에 자기 이해와 성찰이 깊어집니다',
  ],
  '절망': [
    '현재 상황이 매우 힘들다는 것을 정직하게 인식합니다',
    '변화가 절실히 필요하다는 것을 깨닫게 합니다',
    '삶의 바닥을 경험한 후 더 단단해질 수 있습니다',
    '도움을 요청하고 받아들일 수 있는 계기가 됩니다',
    '더 이상 나빠질 수 없다는 것은 오르기만 하면 된다는 의미입니다',
  ],
  '답답함': [
    '현재 막힌 상황을 해결하려는 의지가 있습니다',
    '돌파구를 찾으려는 창의적 에너지의 원천입니다',
    '현상 유지에 만족하지 않고 발전을 추구합니다',
    '문제를 인식하고 있다는 것 자체가 해결의 첫걸음입니다',
    '포기하지 않는 끈기와 인내심을 키워줍니다',
  ],
  '불안': [
    '미래의 위험을 예상하고 대비할 수 있게 합니다',
    '중요한 일에 신중하고 준비된 자세를 가지게 합니다',
    '완벽을 추구하고 실수를 최소화하려는 동기가 됩니다',
    '예민함은 세밀한 부분까지 인식하는 능력입니다',
    '걱정은 당신이 소중히 여기는 것이 있다는 증거입니다',
  ],
  '짜증': [
    '작은 불편함을 민감하게 인식하는 능력이 있습니다',
    '개선이 필요한 부분을 빠르게 파악합니다',
    '나의 에너지 한계를 알려주는 신호입니다',
    '휴식과 재충전이 필요하다는 신체의 메시지입니다',
    '자신의 욕구와 필요를 존중하게 만듭니다',
  ],
};

// 각 감정의 주의할 점 (5가지)
const EMOTION_WARNINGS: { [key: string]: string[] } = {
  '슬픔': [
    '너무 오래 지속되면 우울증으로 발전할 수 있습니다',
    '일상 활동에 대한 의욕을 잃게 만들 수 있습니다',
    '사회적으로 고립되고 관계가 단절될 수 있습니다',
    '자기 돌봄을 소홀히 하고 건강이 악화될 수 있습니다',
    '부정적 생각이 반복되어 악순환에 빠질 수 있습니다',
  ],
  '분노': [
    '충동적으로 행동하여 소중한 관계를 파괴할 수 있습니다',
    '신체 건강에 악영향을 미쳐 심혈관 문제를 일으킬 수 있습니다',
    '이성적 판단력이 흐려져 후회할 결정을 내릴 수 있습니다',
    '주변 사람들이 두려워하고 멀어지게 만듭니다',
    '습관화되면 사소한 일에도 과민 반응하게 됩니다',
  ],
  '두려움': [
    '과도한 회피로 인해 기회를 놓치고 성장이 멈출 수 있습니다',
    '도전을 피하게 되어 삶의 범위가 좁아집니다',
    '안전지대에만 머물러 잠재력을 발휘하지 못합니다',
    '불안 장애나 공황 증상으로 발전할 수 있습니다',
    '지나친 걱정으로 현재를 즐기지 못하게 됩니다',
  ],
  '혐오': [
    '편견과 차별로 이어져 관계를 단절시킬 수 있습니다',
    '새로운 경험과 다양성을 받아들이지 못하게 됩니다',
    '지나치게 비판적이 되어 타인을 상처 입힙니다',
    '자신도 혐오의 대상이 될까 두려워 위축될 수 있습니다',
    '완벽주의와 결합하여 자신에게도 가혹해질 수 있습니다',
  ],
  '수치심': [
    '자존감이 무너지고 자신을 가치 없다고 느끼게 됩니다',
    '사회적 상황을 회피하고 고립될 수 있습니다',
    '자기 표현을 억제하고 진정한 자신을 숨기게 됩니다',
    '우울증과 불안 장애로 이어질 수 있습니다',
    '다른 사람의 시선에 과도하게 민감해집니다',
  ],
  '죄책감': [
    '과도한 자책으로 자존감이 무너질 수 있습니다',
    '이미 지나간 일에 집착하여 현재를 살지 못합니다',
    '필요 이상으로 자신을 희생하고 타인을 우선시하게 됩니다',
    '죄책감을 이용당하고 조종당할 수 있습니다',
    '우울증으로 발전하여 일상 기능이 저하될 수 있습니다',
  ],
  '외로움': [
    '고립감이 심화되어 우울과 무기력에 빠질 수 있습니다',
    '절망적인 관계에 매달리게 만들 수 있습니다',
    '자신을 부정적으로 평가하고 자존감이 낮아집니다',
    '사회적 불안이 커져서 더욱 관계 맺기가 어려워집니다',
    '만성화되면 신체 건강에도 악영향을 미칩니다',
  ],
  '절망': [
    '희망을 완전히 잃고 삶을 포기하게 될 위험이 있습니다',
    '극단적인 생각과 행동으로 이어질 수 있습니다',
    '무기력감이 심화되어 아무것도 시도하지 않게 됩니다',
    '주변의 도움과 지지를 거부하게 만듭니다',
    '신체적 건강이 급격히 악화될 수 있습니다',
  ],
  '답답함': [
    '초조함과 조급함으로 성급한 결정을 내릴 수 있습니다',
    '인내심을 잃고 쉽게 포기하게 만들 수 있습니다',
    '타인에게 짜증을 내어 관계가 악화될 수 있습니다',
    '신체적 긴장과 스트레스가 누적됩니다',
    '현실적 해결책 대신 회피나 도피를 선택할 수 있습니다',
  ],
  '불안': [
    '과도한 걱정으로 현재를 즐기지 못하고 삶의 질이 떨어집니다',
    '신체 증상(두근거림, 떨림, 불면)이 나타나 건강을 해칩니다',
    '회피 행동이 심해져 일상생활이 제한됩니다',
    '만성화되면 불안 장애나 공황 장애로 발전할 수 있습니다',
    '지나친 완벽주의로 스트레스가 가중됩니다',
  ],
  '짜증': [
    '사소한 일에도 과민 반응하여 관계가 틀어질 수 있습니다',
    '타인을 불편하게 만들고 멀어지게 합니다',
    '자신도 피곤해지고 에너지가 고갈됩니다',
    '문제의 본질을 보지 못하고 증상에만 반응하게 됩니다',
    '습관화되면 만성적 스트레스 상태가 됩니다',
  ],
};

export function FirstEmotionIntensityModal({
  open,
  emotion,
  intensity,
  onIntensityChange,
  onConfirm,
}: FirstEmotionIntensityModalProps) {
  // 0: 설명 단계, 1: 강도 측정, 2: 긍정적 측면 소개, 3: 줄이기 선택
  const [modalStep, setModalStep] = useState(0);
  const [wantsToReduce, setWantsToReduce] = useState<boolean | null>(null);

  const benefits = EMOTION_BENEFITS[emotion] || [];
  const warnings = EMOTION_WARNINGS[emotion] || [];

  // 감정 강도에 따른 표현
  const getIntensityDescription = () => {
    if (intensity === 0) return '감정을 측정해주세요';
    if (intensity <= 20) return '약한 정도 - 살짝 불편하시군요';
    if (intensity <= 40) return '조금 느껴지는 정도 - 불편하시군요';
    if (intensity <= 60) return '중간 정도 - 상당히 불편하시군요';
    if (intensity <= 80) return '상당히 강한 정도 - 매우 고통스러우시군요';
    return '매우 강렬한 정도 - 극심하게 고통스러우시군요';
  };

  const handleNext = () => {
    if (modalStep === 0) {
      setModalStep(1);
    } else if (modalStep === 1 && intensity > 0) {
      setModalStep(2);
    } else if (modalStep === 2) {
      setModalStep(3);
    } else if (modalStep === 3 && wantsToReduce !== null) {
      onConfirm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-[98vw] w-[2000px] bg-white border-2 border-pink-200 shadow-2xl max-h-[95vh] overflow-y-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        aria-describedby="emotion-intensity-description"
      >
        <DialogTitle className="sr-only">감정 강도 측정하기</DialogTitle>
        <DialogDescription id="emotion-intensity-description" className="sr-only">
          {emotion} 감정의 강도를 0부터 100까지 측정하여 감정을 인식하는 중요한 과정입니다.
        </DialogDescription>
        
        <div className="space-y-6 py-4 px-2">
          {/* 헤더 */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full mb-4 animate-pulse">
              <Heart className="size-10 text-white" />
            </div>
            <p className="text-slate-600 text-lg">선택한 감정: <strong className="text-pink-600 text-2xl">{emotion}</strong></p>
          </div>

          {/* Step 0: 감정을 숫자로 표현하는 중요성 설명 */}
          {modalStep === 0 && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-8 space-y-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="size-8 text-blue-600 flex-shrink-0 mt-1" />
                  <div className="space-y-4 flex-1">
                    <h3 className="text-blue-900 text-2xl">
                      왜 감정의 강도를 숫자로 표현하는 것이 중요할까요?
                    </h3>
                    
                    <p className="text-blue-800 leading-relaxed text-lg">
                      많은 사람들이 부정적인 감정을 느낄 때 <strong>"그냥 기분이 안 좋아"</strong>라고만 생각합니다. 
                      하지만 심리학 연구에 따르면, <strong className="text-blue-900">감정을 구체적으로 인식하고 
                      숫자로 표현하는 순간, 뇌의 편도체(감정 중추)가 진정되기 시작</strong>합니다.
                    </p>

                    <div className="bg-white rounded-lg p-6 border border-blue-200">
                      <p className="text-slate-800 leading-relaxed text-lg mb-3">
                        💡 <strong>예를 들어:</strong>
                      </p>
                      <p className="text-slate-700 leading-relaxed text-base mt-2">
                        • 막연한 불안 → "<strong>{emotion}</strong>이 <strong>70점</strong>이구나" 라고 인식
                      </p>
                      <p className="text-slate-700 leading-relaxed text-base">
                        • 이렇게 구체화하는 것만으로도 감정에 <strong>휩쓸리지 않고 관찰</strong>할 수 있게 됩니다
                      </p>
                      <p className="text-slate-700 leading-relaxed text-base">
                        • 감정을 <strong>통제 가능한 대상</strong>으로 만드는 첫걸음입니다
                      </p>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border-2 border-purple-300">
                      <p className="text-purple-900 leading-relaxed text-lg">
                        <strong>🎯 핵심:</strong> 지금 당신이 "{emotion}"의 강도를 측정하는 이 행위 자체가 
                        <strong className="text-purple-900"> 이미 치유의 과정</strong>입니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleNext}
                className="w-full py-7 text-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                다음: {emotion}의 강도 측정하기 →
              </Button>
            </div>
          )}

          {/* Step 1: 강도 측정 슬라이더 */}
          {modalStep === 1 && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-rose-50 to-pink-50 border-2 border-rose-300 rounded-xl p-8">
                <p className="text-slate-800 text-2xl mb-6 text-center">
                  <strong>지금 이 순간, "{emotion}"의 강도는 얼마인가요?</strong>
                </p>
                
                <div className="space-y-6">
                  {/* 현재 강도 표시 */}
                  <div className="text-center">
                    <div className="inline-block bg-white rounded-2xl px-12 py-8 shadow-lg border-2 border-rose-400">
                      <div className="text-7xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                        {intensity}
                      </div>
                      <div className="text-2xl text-slate-600 mt-2">/ 100</div>
                    </div>
                    
                    <div className="mt-4 text-slate-700 text-xl">
                      {getIntensityDescription()}
                    </div>
                  </div>

                  {/* 슬라이더 */}
                  <div className="px-4">
                    <Slider
                      value={[intensity]}
                      onValueChange={(values) => onIntensityChange(values[0])}
                      max={100}
                      min={0}
                      step={5}
                      className="w-full"
                    />
                    
                    <div className="flex justify-between text-base text-slate-500 mt-3">
                      <span>0 (전혀 안 느껴짐)</span>
                      <span>50 (중간)</span>
                      <span>100 (최대한 강함)</span>
                    </div>
                  </div>

                  {/* 안내 메시지 */}
                  <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-5 text-center">
                    <p className="text-amber-900 text-lg">
                      💡 <strong>정답은 없습니다.</strong> 지금 이 순간 당신이 느끼는 그대로를 표현해주세요.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleNext}
                disabled={intensity === 0}
                className="w-full py-7 text-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white disabled:opacity-40"
              >
                {intensity === 0 
                  ? '강도를 선택해주세요' 
                  : `${emotion} ${intensity}점으로 계속하기 →`
                }
              </Button>
            </div>
          )}

          {/* Step 2: 긍정적 측면 소개 */}
          {modalStep === 2 && (
            <div className="space-y-6">
              {/* 긍정적 측면을 질문형으로 부드럽게 제안 */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-300 rounded-xl p-8 space-y-4">
                <div className="flex items-start gap-3">
                  <Plus className="size-8 text-purple-600 flex-shrink-0 mt-1" />
                  <div className="space-y-3 flex-1">
                    <h3 className="text-purple-900 text-2xl">
                      당��이 "{emotion}"을 느낀다면, 혹시 이런 측면이 강한 사람이 아닐까요?
                    </h3>
                    
                    <div className="space-y-3">
                      {benefits.map((benefit, idx) => (
                        <div key={idx} className="bg-white rounded-lg p-4 border border-green-200">
                          <p className="text-slate-800 leading-relaxed text-base">
                            <span className="text-green-600 mr-2">{idx + 1}.</span>
                            {benefit}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-5 border-2 border-green-300 mt-4">
                      <p className="text-green-900 leading-relaxed text-lg">
                        <strong>💚 이 감정을 느끼는 당신은</strong> 위와 같은 가치들을 소중히 여기는 사람입니다.
                        이것은 <strong>당신의 강점</strong>입니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 주의할 점 */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-6 space-y-4">
                <div className="flex items-start gap-3 mb-3">
                  <Minus className="size-7 text-amber-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h4 className="text-amber-900 text-xl mb-4"><strong>다만, 이 감정이 너무 강할 때 주의할 점:</strong></h4>
                    <div className="space-y-3">
                      {warnings.map((warning, idx) => (
                        <div key={idx} className="bg-white rounded-lg p-4 border border-amber-200">
                          <p className="text-slate-800 leading-relaxed text-base">
                            <span className="text-amber-600 mr-2">{idx + 1}.</span>
                            {warning}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleNext}
                className="w-full py-7 text-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white"
              >
                측면을 확인했습니다. 이 감정을 다루기 →
              </Button>
            </div>
          )}

          {/* Step 3: 줄이기 선택 */}
          {modalStep === 3 && (
            <div className="space-y-6">
              {/* 줄이기 선택 */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border-2 border-purple-300">
                <p className="text-purple-900 text-xl mb-5 text-center">
                  <strong>"{emotion}"의 강도({intensity}점)를 줄이고 싶으신가요?</strong>
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => setWantsToReduce(true)}
                    className={`py-7 text-lg whitespace-normal h-auto ${
                      wantsToReduce === true
                        ? 'bg-purple-600 hover:bg-purple-700'
                        : 'bg-purple-400 hover:bg-purple-500'
                    }`}
                  >
                    네, 줄이고 싶습니다
                  </Button>
                  <Button
                    onClick={() => setWantsToReduce(false)}
                    variant="outline"
                    className={`py-7 text-lg whitespace-normal h-auto border-2 ${
                      wantsToReduce === false
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-slate-300'
                    }`}
                  >
                    아니요, 이 정도면 괜찮습니다
                  </Button>
                </div>

                {wantsToReduce !== null && (
                  <div className="mt-4 bg-green-50 border-2 border-green-300 rounded-lg p-4 text-center">
                    <p className="text-green-800 text-lg">
                      {wantsToReduce 
                        ? '✓ 감정을 적절한 수준으로 조절하는 방향으로 진행됩니다'
                        : '✓ 현재 상태를 인정하며 진행됩니다'
                      }
                    </p>
                  </div>
                )}
              </div>

              <Button
                onClick={handleNext}
                disabled={wantsToReduce === null}
                className="w-full py-7 text-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white disabled:opacity-40"
              >
                {wantsToReduce === null
                  ? '위 질문에 답해주세요'
                  : '다음 단계로 진행하기 →'
                }
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}