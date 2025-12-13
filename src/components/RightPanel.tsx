import { Card } from './ui/card';
import { Button } from './ui/button';
import { useState, useEffect } from 'react';
import { generateContextualAlternativeThoughts, generateBibleVerse } from '../lib/gemini';
import { Loader2, Check, RefreshCw, Star } from 'lucide-react';
import type { EmotionThoughtPair } from '../types';

interface RightPanelProps {
  step: number;
  emotionThoughtPairs: EmotionThoughtPair[];
  userInput: string;
  positiveReframes: {[emotion: string]: string};
  selectedCognitiveErrors: string[];
  selectedAlternativeThought: string;
  onSetSelectedAlternativeThought: (thought: string) => void;
  onComplete: () => void;
  onRestartWithSameInput?: () => void;
  onNext: () => void;
}

export function RightPanel({
  step,
  emotionThoughtPairs,
  userInput,
  positiveReframes,
  selectedCognitiveErrors,
  selectedAlternativeThought,
  onSetSelectedAlternativeThought,
  onComplete,
  onRestartWithSameInput,
  onNext,
}: RightPanelProps) {
  // 대안사고 생성 상태 (치료 기법 포함)
  const [alternativeThoughts, setAlternativeThoughts] = useState<Array<{
    thought: string;
    technique: string;
    techniqueDescription: string;
  }>>([]);
  const [thoughtsLoading, setThoughtsLoading] = useState(false);
  const [thoughtsError, setThoughtsError] = useState<string | null>(null);
  
  // 성경 말씀 선택 여부
  const [wantsBibleVerse, setWantsBibleVerse] = useState<boolean | null>(null);
  
  // 성경 말씀 생성 상태
  const [bibleVerse, setBibleVerse] = useState<{verse: string, reference: string, prayer: string} | null>(null);
  const [bibleLoading, setBibleLoading] = useState(false);
  const [bibleError, setBibleError] = useState<string | null>(null);
  
  // 최종 감정 강도 기록
  const [finalIntensities, setFinalIntensities] = useState<{[emotion: string]: number}>({});
  const [showFinalIntensity, setShowFinalIntensity] = useState(false);

  // 번즈 5단계 제안 기법 상태
  const [burnsAdvice, setBurnsAdvice] = useState<{
    thoughtEmpathy: string;
    emotionEmpathy: string;
    iStatement: string;
    question: string;
    soothing: string;
  } | null>(null);
  const [burnsLoading, setBurnsLoading] = useState(false);
  
  // Step 4일 때 대안사고 생성
  useEffect(() => {
    if (step === 4 && alternativeThoughts.length === 0 && !thoughtsLoading && emotionThoughtPairs.length > 0) {
      generateAlternatives();
    }
  }, [step, emotionThoughtPairs]);

  // 대안사고 생성
  const generateAlternatives = async () => {
    setThoughtsLoading(true);
    setThoughtsError(null);

    try {
      // 모든 감정-자동사고 쌍을 결합하여 대안사고 생성
      const emotions = emotionThoughtPairs.map(p => p.emotion).join(', ');
      const firstPair = emotionThoughtPairs[0];
      
      const thoughts = await generateContextualAlternativeThoughts(
        userInput,
        emotions,
        firstPair.thought,
        selectedCognitiveErrors
      );
      
      setAlternativeThoughts(thoughts);
    } catch (err) {
      setThoughtsError(err instanceof Error ? err.message : '오류가 발생했습니다.');
      console.error('대안사고 생성 오류:', err);
    } finally {
      setThoughtsLoading(false);
    }
  };

  // 대안사고 선택
  const handleSelectThought = (thought: string) => {
    onSetSelectedAlternativeThought(thought);
  };

  // 성경 말씀 "선택함" → Step 5로
  const handleWantsBible = async () => {
    setWantsBibleVerse(true);
    setBibleLoading(true);
    setBibleError(null);

    try {
      const verse = await generateBibleVerse(selectedAlternativeThought, userInput);
      setBibleVerse(verse);
      onNext();
    } catch (err) {
      setBibleError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setBibleLoading(false);
    }
  };

  // 성경 말씀 "선택 안 함" → 최종 감정 강도 기록으로
  const handleDoesNotWantBible = () => {
    setWantsBibleVerse(false);
    setShowFinalIntensity(true);
    // 초기값 설정
    const initialIntensities: {[emotion: string]: number} = {};
    emotionThoughtPairs.forEach(pair => {
      initialIntensities[pair.emotion] = pair.intensity;
    });
    setFinalIntensities(initialIntensities);
    onNext();
  };

  // 최종 완료
  const handleFinalComplete = () => {
    // 히스토리 저장
    try {
      const historyItem = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        userInput,
        emotionThoughtPairs,
        selectedCognitiveErrors,
        selectedAlternativeThought,
        positiveReframes,
        bibleVerse: wantsBibleVerse ? bibleVerse : null
      };
      
      const existing = localStorage.getItem('cbt_history');
      const histories = existing ? JSON.parse(existing) : [];
      histories.unshift(historyItem);
      
      // 최대 20개까지만 저장
      if (histories.length > 20) {
        histories.pop();
      }
      
      localStorage.setItem('cbt_history', JSON.stringify(histories));
    } catch (e) {
      console.error('히스토리 저장 실패:', e);
    }

    alert('✅ 치유의 여정을 완료하셨습니다.\n기록이 저장되었습니다. 평안을 기원합니다.');
    onComplete();
  };

  return (
    <Card className="bg-slate-50/95 backdrop-blur-sm p-6 shadow-2xl border border-slate-200/50 min-h-[600px] flex flex-col">
      <div className="mb-4">
        <div className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1.5 rounded-full mb-3 shadow-lg text-sm">
          우측 (4~6) ✨
        </div>
        <h2 className="text-slate-800 text-xl">대안사고 구성</h2>
        <p className="text-slate-600 text-sm mt-2">
          우리의 생각을 더 진실된 생각으로 바꾸면, 우리의 감정도 적절한 자리를 찾아갑니다.
        </p>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto">
        {step < 4 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-500">좌측 패널에서 인지오류 검토를 완료해주세요.</p>
          </div>
        )}

        {/* Step 4: 대안사고 선택 */}
        {step === 4 && !selectedAlternativeThought && (
          <div className="space-y-4">
            <div className="bg-purple-50 p-5 rounded-xl border-2 border-purple-300">
              <p className="text-purple-900 mb-3 text-xl">💡 대안적 사고를 선택해주세요</p>
              <p className="text-slate-700 text-base leading-relaxed mb-2">
                인지오류를 바로잡고, 긍정적 가치를 담은 새로운 생각을 골라주세요.
              </p>
              <p className="text-purple-700 text-sm">
                각 대안사고에는 심리치료 기법이 적용되어 있습니다.
              </p>
            </div>

            {thoughtsLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="size-10 animate-spin text-purple-600 mb-4" />
                <p className="text-slate-600 text-lg">대안적 사고를 생성하고 있습니다...</p>
              </div>
            ) : thoughtsError ? (
              <div className="bg-red-50 border border-red-200 text-red-800 p-5 rounded-lg">
                <p className="mb-3 text-base">{thoughtsError}</p>
                <Button onClick={generateAlternatives} variant="outline" size="sm">
                  다시 시도
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {alternativeThoughts.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectThought(item.thought)}
                    className="w-full text-left p-6 rounded-xl border-2 border-slate-200 hover:border-purple-400 bg-white transition-all group hover:shadow-lg"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-base group-hover:bg-purple-600 transition-colors">
                        {index + 1}
                      </span>
                      <div className="flex-1 space-y-4">
                        {/* 대안사고 - 문단별 분리 */}
                        <div className="space-y-3">
                          {item.thought.split(/\. (?=[A-Z가-힣])/).map((sentence, sIndex) => (
                            sentence.trim() && (
                              <p key={sIndex} className="text-slate-800 text-base leading-relaxed">
                                {sentence.trim()}{!sentence.endsWith('.') && '.'}
                              </p>
                            )
                          ))}
                        </div>
                        
                        {/* 치료 기법 */}
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-200">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-indigo-700 text-base">🎯 치료 기법:</span>
                            <span className="text-indigo-900 font-semibold">{item.technique}</span>
                          </div>
                          <p className="text-slate-600 text-sm italic leading-relaxed">
                            {item.techniqueDescription}
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 4: 대안사고 선택 완료 → 성경 말씀 제안 */}
        {step === 4 && selectedAlternativeThought && (
          <div className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-300">
              <p className="text-purple-900 mb-2">✓ 선택한 대안사고:</p>
              <p className="text-slate-800 italic">"{selectedAlternativeThought}"</p>
            </div>

            {/* 치료 기법 복습 표시 */}
            {alternativeThoughts.find(t => t.thought === selectedAlternativeThought) && (
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-indigo-700">🎯 적용된 치료 기법:</span>
                  <span className="text-indigo-900">
                    {alternativeThoughts.find(t => t.thought === selectedAlternativeThought)?.technique}
                  </span>
                </div>
                <p className="text-slate-600 text-sm italic">
                  {alternativeThoughts.find(t => t.thought === selectedAlternativeThought)?.techniqueDescription}
                </p>
                <div className="mt-3 pt-3 border-t border-indigo-200">
                  <p className="text-slate-700 text-sm">
                    💡 <strong>다음에 비슷한 상황이 오면</strong> 이 기법을 떠올려보세요. 스스로 생각을 점검하는 습관이 됩니다.
                  </p>
                </div>
              </div>
            )}
            
            {/* 번즈의 5단계 제안 기법 */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-5 rounded-lg border-2 border-emerald-300">
              <h3 className="text-emerald-900 mb-3">💬 번즈의 5단계 제안 기법</h3>
              <div className="space-y-3 text-sm text-slate-700">
                <div className="bg-white p-3 rounded border border-emerald-200">
                  <p className="text-emerald-800"><strong>1. 감정/사고 공감:</strong></p>
                  <p className="mt-1">당신의 생각과 감정을 충분히 이해합니다. 그런 상황에서 그렇게 느끼는 것은 자연스러운 반응입니다.</p>
                </div>
                <div className="bg-white p-3 rounded border border-emerald-200">
                  <p className="text-emerald-800"><strong>2. 재진술:</strong></p>
                  <p className="mt-1">
                    당신의 경험을 다시 정리하자면, 이 상황이 당신에게 {emotionThoughtPairs[0]?.emotion}을/를 불러일으켰습니다. 
                    {emotionThoughtPairs[0]?.intensity <= 20 && ' 살짝 불편하셨군요.'}
                    {emotionThoughtPairs[0]?.intensity > 20 && emotionThoughtPairs[0]?.intensity <= 40 && ' 불편하셨군요.'}
                    {emotionThoughtPairs[0]?.intensity > 40 && emotionThoughtPairs[0]?.intensity <= 60 && ' 상당히 불편하셨군요.'}
                    {emotionThoughtPairs[0]?.intensity > 60 && emotionThoughtPairs[0]?.intensity <= 80 && ' 매우 고통스러우셨군요.'}
                    {emotionThoughtPairs[0]?.intensity > 80 && ' 극심하게 고통스러우셨군요.'}
                    {' '}그것이 정당한 이유가 있었습니다.
                  </p>
                </div>
                <div className="bg-white p-3 rounded border border-emerald-200">
                  <p className="text-emerald-800"><strong>3. 나 전달법:</strong></p>
                  <p className="mt-1">저는 당신이 선택한 대안사고가 인지오류를 바로잡고 더 건강한 관점을 제시한다고 생각합니다.</p>
                </div>
                <div className="bg-white p-3 rounded border border-emerald-200">
                  <p className="text-emerald-800"><strong>4. 달래기:</strong></p>
                  <p className="mt-1">당신이 이 과정을 함께 해준 것만으로도 당신은 자신의 마음을 돌볼 줄 아는 성숙한 사람입니다.</p>
                </div>
                <div className="bg-white p-3 rounded border border-emerald-200">
                  <p className="text-emerald-800"><strong>5. 재질문:</strong></p>
                  <p className="mt-1">더 궁금하신 게 있으신가요? 원하시면 아래 즐겨찾기 버튼을 누르시고, 같은 질문으로 다른 답변을 검토할 수 있습니다.</p>
                </div>
              </div>
            </div>

            {/* 다른 답변 검토 버튼 */}
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  onSetSelectedAlternativeThought('');
                  generateAlternatives();
                }}
                variant="outline"
                className="flex-1 gap-2 border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                <RefreshCw className="size-4" />
                다른 답변 검토하기
              </Button>
              <Button
                onClick={() => {
                  // 현재 질문을 즐겨찾기에 추가
                  const favorites = JSON.parse(localStorage.getItem('cbt-favorites') || '[]');
                  const exists = favorites.some((f: any) => f.text === userInput);
                  
                  if (exists) {
                    alert('이미 즐겨찾기에 있습니다.');
                    return;
                  }
                  
                  if (favorites.length >= 10) {
                    alert('최대 10개까지 저장할 수 있습니다.');
                    return;
                  }
                  
                  const newFavorite = {
                    id: Date.now().toString(),
                    text: userInput,
                    createdAt: Date.now(),
                  };
                  
                  favorites.unshift(newFavorite);
                  localStorage.setItem('cbt-favorites', JSON.stringify(favorites));
                  alert('즐겨찾기에 추가되었습니다!');
                }}
                variant="outline"
                className="gap-2 border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                title="질문을 즐겨찾기에 추가"
              >
                <Star className="size-4" />
                즐겨찾기
              </Button>
            </div>
            
            <div className="bg-blue-50 p-5 rounded-lg border border-blue-200">
              <p className="text-blue-900 mb-4">
                하나님의 위로의 말씀을 찾아보시겠습니까?<br />
                그분은 말씀으로 기도하면 응답하십니다.
              </p>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <Button
                  onClick={handleWantsBible}
                  disabled={bibleLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {bibleLoading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                  말씀을 찾습니다
                </Button>
                <Button
                  onClick={handleDoesNotWantBible}
                  variant="outline"
                >
                  아니오
                </Button>
              </div>

              {/* 즐겨찾기 추가 버튼 */}
              <div className="border-t border-blue-300 pt-3 mt-3">
                <p className="text-blue-800 text-sm mb-2">💡 이 질문을 즐겨찾기 하시겠습니까?</p>
                <Button
                  onClick={() => {
                    // 현재 질문을 즐겨찾기에 추가
                    const favorites = JSON.parse(localStorage.getItem('cbt-favorites') || '[]');
                    const exists = favorites.some((f: any) => f.text === userInput);
                    
                    if (exists) {
                      alert('이미 즐겨찾기에 있습니다.');
                      return;
                    }
                    
                    if (favorites.length >= 10) {
                      alert('최대 10개까지 저장할 수 있습니다.');
                      return;
                    }
                    
                    const newFavorite = {
                      id: Date.now().toString(),
                      text: userInput,
                      createdAt: Date.now(),
                    };
                    
                    favorites.unshift(newFavorite);
                    localStorage.setItem('cbt-favorites', JSON.stringify(favorites));
                    alert('즐겨찾기에 추가되었습니다!');
                  }}
                  variant="outline"
                  className="w-full gap-2 border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                >
                  <Star className="size-4" />
                  즐겨찾기 추가
                </Button>
              </div>

              {bibleError && (
                <p className="text-red-600 text-sm mt-3">{bibleError}</p>
              )}
            </div>
          </div>
        )}

        {/* Step 5: 성경 말씀 "선택함" → 말씀 표시 */}
        {step === 5 && wantsBibleVerse === true && bibleVerse && (
          <div className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-300">
              <p className="text-purple-900 mb-2 text-lg">✓ 선택한 대안사고:</p>
              <p className="text-slate-800 italic text-base">"{selectedAlternativeThought}"</p>
            </div>

            <div className="bg-amber-50 p-6 rounded-xl border-2 border-amber-400">
              <p className="text-amber-900 mb-3 text-xl">📖 {bibleVerse.reference}</p>
              <p className="text-slate-800 mb-5 italic leading-relaxed text-lg">
                "{bibleVerse.verse}"
              </p>
              
              <div className="border-t border-amber-300 pt-4 mt-4">
                <p className="text-slate-700 mb-3 text-base">
                  <strong>기도의 방법:</strong>
                </p>
                <ol className="list-decimal list-inside space-y-2 text-slate-700 text-base leading-relaxed">
                  <li>이 말씀을 따라 읽습니다.</li>
                  <li>이 말씀을 읽고 "이대로 도와주시기를 바랍니다"라고 하십시오.</li>
                  <li>"예수님의 이름으로 기도합니다. 아멘"이라고 해보세요.</li>
                </ol>
              </div>

              <div className="border-t border-amber-300 pt-4 mt-4">
                <p className="text-slate-600 text-sm leading-relaxed">
                  만일 당신이 신앙의 여정을 원한다면, 가까운 건강한 교회에 문의하시거나 
                  우리 팀에 메일을 보내시기 바랍니다.
                </p>
              </div>
            </div>

            {/* 말씀 공유 및 저장 기능 */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border-2 border-blue-300">
              <p className="text-blue-900 mb-4 text-lg">
                <strong>✨ 이 말씀을 간직하고 싶으신가요?</strong>
              </p>
              
              <div className="grid grid-cols-3 gap-3 mb-4">
                {/* 즐겨찾기 */}
                <Button
                  onClick={() => {
                    const bibleVerses = JSON.parse(localStorage.getItem('cbt-bible-favorites') || '[]');
                    
                    if (bibleVerses.length >= 20) {
                      alert('최대 20개까지 저장할 수 있습니다.');
                      return;
                    }
                    
                    const newVerse = {
                      id: Date.now().toString(),
                      ...bibleVerse,
                      alternativeThought: selectedAlternativeThought,
                      savedAt: Date.now(),
                    };
                    
                    bibleVerses.unshift(newVerse);
                    localStorage.setItem('cbt-bible-favorites', JSON.stringify(bibleVerses));
                    alert('말씀이 즐겨찾기에 저장되었습니다!');
                  }}
                  variant="outline"
                  className="gap-2 border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                >
                  <Star className="size-4" />
                  즐겨찾기
                </Button>

                {/* 메일로 보내기 */}
                <Button
                  onClick={() => {
                    const subject = encodeURIComponent(`${bibleVerse.reference} - 오늘의 말씀`);
                    const body = encodeURIComponent(
                      `${bibleVerse.reference}\n\n"${bibleVerse.verse}"\n\n대안사고: "${selectedAlternativeThought}"\n\n기도의 방법:\n1. 이 말씀을 따라 읽습니다.\n2. 이 말씀을 읽고 "이대로 도와주시기를 바랍니다"라고 하십시오.\n3. "예수님의 이름으로 기도합니다. 아멘"이라고 해보세요.\n\n- 마음생각고쳐쓰기 도구에서 -`
                    );
                    window.location.href = `mailto:?subject=${subject}&body=${body}`;
                  }}
                  variant="outline"
                  className="gap-2 border-purple-300 text-purple-700 hover:bg-purple-50"
                >
                  📧 메일
                </Button>

                {/* 카톡으로 공유 */}
                <Button
                  onClick={() => {
                    const text = `${bibleVerse.reference}\n\n"${bibleVerse.verse}"\n\n대안사고: "${selectedAlternativeThought}"`;
                    
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(text).then(() => {
                        alert('말씀이 클립보드에 복사되었습니다!\n카카오톡에서 붙여넣기 해주세요.');
                      }).catch(() => {
                        alert('복사 실패. 말씀을 직접 복사해주세요:\n\n' + text);
                      });
                    } else {
                      alert('복사할 텍스트:\n\n' + text);
                    }
                  }}
                  variant="outline"
                  className="gap-2 border-green-300 text-green-700 hover:bg-green-50"
                >
                  💬 카톡
                </Button>
              </div>

              <p className="text-blue-700 text-sm text-center">
                💡 말씀을 저장하거나 공유하여 언제든지 다시 묵상하세요.
              </p>
            </div>

            <Button
              onClick={handleFinalComplete}
              className="w-full py-6 text-lg bg-purple-600 hover:bg-purple-700"
            >
              완료
            </Button>
          </div>
        )}

        {/* Step 5/6: 성경 말씀 "선택 안 함" → 최종 감정 강도 기록 */}
        {step >= 5 && wantsBibleVerse === false && (
          <div className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-300">
              <p className="text-purple-900 mb-2">✓ 선택한 대안사고:</p>
              <p className="text-slate-800 italic text-sm">"{selectedAlternativeThought}"</p>
            </div>

            <div className="bg-blue-50 p-5 rounded-lg border border-blue-200">
              <p className="text-blue-900 mb-3">당신의 행복을 바랍니다</p>
              
              <div className="bg-white p-4 rounded border border-blue-300 mb-4">
                <p className="text-slate-800 mb-2"><strong>대안사고 정리:</strong></p>
                <p className="text-slate-700 italic">"{selectedAlternativeThought}"</p>
              </div>

              <div className="bg-white p-4 rounded border border-green-300 mb-4">
                <p className="text-green-800 mb-2"><strong>당신의 장점:</strong></p>
                <div className="space-y-1">
                  {emotionThoughtPairs.map((pair, i) => {
                    const reframe = positiveReframes[pair.emotion];
                    if (!reframe) return null;
                    return (
                      <p key={i} className="text-slate-700 text-sm">
                        • {reframe.replace('제가 당신 마음을 헤아려 보니, ', '')}
                      </p>
                    );
                  })}
                </div>
              </div>

              {!showFinalIntensity ? (
                <Button
                  onClick={() => setShowFinalIntensity(true)}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  감정 변화 기록하기
                </Button>
              ) : (
                <>
                  <div className="bg-white p-4 rounded border border-purple-300 mb-4">
                    <p className="text-purple-800 mb-3">
                      <strong>감정이 좋아졌다면 얼마나 좋아졌는지 기록해주세요:</strong>
                    </p>
                    <div className="space-y-4">
                      {emotionThoughtPairs.map((pair, i) => (
                        <div key={i} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-700">{pair.emotion}</span>
                            <div className="flex gap-4 text-sm">
                              <span className="text-slate-500">이전: {pair.intensity}</span>
                              <span className="text-purple-600">
                                현재: {finalIntensities[pair.emotion] || pair.intensity}
                              </span>
                            </div>
                          </div>
                          <Slider
                            value={[finalIntensities[pair.emotion] || pair.intensity]}
                            onValueChange={(val) =>
                              setFinalIntensities({
                                ...finalIntensities,
                                [pair.emotion]: val[0],
                              })
                            }
                            min={0}
                            max={100}
                            step={5}
                          />
                          <div className="flex justify-between text-slate-400">
                            <span>0</span>
                            <span>100</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={handleFinalComplete}
                    className="w-full bg-purple-600 hover:bg-purple-700 mb-4"
                  >
                    완료
                  </Button>

                  {/* 같은 주제로 다시 하기 버튼 */}
                  {onRestartWithSameInput && (
                    <Button
                      onClick={() => {
                        if (confirm('같은 주제로 다시 하시겠습니까? 아직 감정이 남아 있다면 반복하시면 더욱 효과적입니다.')) {
                          onRestartWithSameInput();
                        }
                      }}
                      variant="outline"
                      className="w-full mb-4 gap-2 border-2 border-green-400 text-green-700 hover:bg-green-50"
                    >
                      <RefreshCw className="size-4" />
                      같은 주제로 다시 하기
                    </Button>
                  )}

                  {/* 명언 */}
                  <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 backdrop-blur-md border border-indigo-500/50 rounded-xl p-6 text-center">
                    <div className="text-indigo-200 text-2xl mb-3">💭</div>
                    <p className="text-white text-lg leading-relaxed mb-2">
                      "생각이 고통을 만든다.<br/>생각을 바꾸면 고통도 바뀐다."
                    </p>
                    <p className="text-indigo-300 text-sm">— 마음생각고쳐쓰기의 핵심 원리</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}