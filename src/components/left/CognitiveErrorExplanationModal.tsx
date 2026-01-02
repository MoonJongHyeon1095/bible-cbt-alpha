// import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
// import { Button } from '../ui/button';
// import { AlertCircle, Lightbulb } from 'lucide-react';

// interface CognitiveErrorExplanationModalProps {
//   open: boolean;
//   errorName: string;
//   errorDescription: string;
//   userThought: string;
//   userExperience: string;
//   onClose: () => void;
// }

// // 각 인지오류별 맞춤형 질문 및 예시 생성
// function generateContextualExample(
//   errorName: string,
//   userThought: string,
//   userExperience: string
// ): { question: string; examples: string[] } {
//   // 기본 템플릿
//   const templates: { [key: string]: { question: string; exampleTemplate: (thought: string) => string[] } } = {
//     '흑백논리': {
//       question: '혹시 이런 방향으로 생각해보셨을까요?',
//       exampleTemplate: (thought) => [
//         '답장이 늦어지는 것이 꼭 "관심이 없어졌다"는 의미일까요?',
//         '친구가 바쁘거나, 휴대폰을 잘 안 보거나, 답장을 깜빡했을 가능성은 없을까요?',
//         '"관심 있음 or 관심 없음" 이 두 가지만이 전부일까요? 그 중간 지점도 있지 않을까요?',
//         '당신도 때때로 소중한 사람에게 답장이 늦어진 적이 있지 않나요?',
//       ],
//     },
//     '과잉일반화': {
//       question: '혹시 이런 방향으로 생각해보셨을까요?',
//       exampleTemplate: (thought) => [
//         '한 번의 일로 "항상 그렇다"고 결론내리는 것은 너무 성급한 판단이 아닐까요?',
//         '과거에 잘 되었던 경험들도 있지 않았나요?',
//         '이번 한 번의 일이 앞으로의 모든 일을 결정하는 건 아니지 않을까요?',
//         '샘플 크기가 1인 데이터로 전체를 판단하는 건 통계적으로 무리가 있지 않을까요?',
//       ],
//     },
//     '독심술': {
//       question: '혹시 이런 방향으로 생각해보셨을까요?',
//       exampleTemplate: (thought) => [
//         '상대방이 실제로 그렇게 생각한다고 확인한 적이 있나요?',
//         '당신이 상상하는 그들의 생각이, 실제 그들의 생각과 다를 수도 있지 않을까요?',
//         '만약 상대방에게 직접 물어본다면, 정말 그런 대답이 돌아올까요?',
//         '당신의 마음속 불안이 상대방의 생각을 추측하게 만든 건 아닐까요?',
//       ],
//     },
//     '파국화': {
//       question: '혹시 이런 방향으로 생각해보셨을까요?',
//       exampleTemplate: (thought) => [
//         '최악의 시나리오가 실제로 일어날 확률은 얼마나 될까요?',
//         '설령 그 일이 일어난다 해도, 정말 인생이 끝나는 걸까요?',
//         '비슷한 일을 겪은 다른 사람들은 어떻게 극복했을까요?',
//         '지금은 크게 느껴지지만, 1년 후에도 이 일이 그렇게 중요할까요?',
//       ],
//     },
//     '감정적 추론': {
//       question: '혹시 이런 방향으로 생각해보셨을까요?',
//       exampleTemplate: (thought) => [
//         '불안하다는 "느낌"이 실제 "사실"과 같은 건 아니지 않을까요?',
//         '객관적인 증거 없이 감정만으로 결론을 내리는 건 위험하지 않을까요?',
//         '감정은 날씨처럼 변할 수 있는데, 그 순간의 감정을 영원한 진실로 받아들여야 할까요?',
//         '만약 친한 친구가 당신과 똑같은 감정으로 똑같은 생각을 한다면, 당신은 뭐라고 조언해주실 건가요?',
//       ],
//     },
//     '당위적 사고': {
//       question: '혹시 이런 방향으로 생각해보셨을까요?',
//       exampleTemplate: (thought) => [
//         '"~해야 한다", "~여야 한다"는 생각이 당신을 더 괴롭게 만들고 있진 않나요?',
//         '그 기준은 누가 정한 건가요? 정말 모든 사람이 그렇게 해야만 할까요?',
//         '완벽한 기준 대신, 좀 더 유연하고 현실적인 기대를 가져볼 순 없을까요?',
//         '당신이 다른 사람에게는 관대한데, 유독 자신에게만 엄격한 건 아닐까요?',
//       ],
//     },
//     '명명화': {
//       question: '혹시 이런 방향으로 생각해보셨을까요?',
//       exampleTemplate: (thought) => [
//         '한 번의 실수나 부족함이 당신이라는 사람의 전체를 정의할 수 있을까요?',
//         '"나는 ~이다"라는 낙인보다, "나는 이번에 ~했다"로 표현할 순 없을까요?',
//         '당신에게는 이 부분도 있지만, 동시에 좋은 부분도 많지 않나요?',
//         '만약 친구가 자신을 그렇게 낙인찍는다면, 당신은 뭐라고 말해주실 건가요?',
//       ],
//     },
//     '개인화': {
//       question: '혹시 이런 방향으로 생각해보셨을까요?',
//       exampleTemplate: (thought) => [
//         '정말 모든 게 당신 때문일까요? 다른 요인들은 전혀 없을까요?',
//         '상대방에게도 그날의 기분, 상황, 컨디션이 있지 않을까요?',
//         '당신이 통제할 수 없는 외부 변수들이 더 큰 영향을 미친 건 아닐까요?',
//         '당신은 책임감이 강한 사람이지만, 모든 걸 떠안을 필요는 없지 않을까요?',
//       ],
//     },
//     '긍정 할인': {
//       question: '혹시 이런 방향으로 생각해보셨을까요?',
//       exampleTemplate: (thought) => [
//         '좋은 일들을 "그냥 운"이나 "당연한 것"으로 치부하고 있진 않나요?',
//         '긍정적인 면을 무시하고 부정적인 면만 확대하는 건 공정한 평가일까요?',
//         '당신의 노력과 장점을 인정해주는 사람들의 말도 귀담아들을 가치가 있지 않을까요?',
//         '만약 친구가 자신의 성취를 깎아내린다면, 당신은 뭐라고 말해주실 건가요?',
//       ],
//     },
//     '확대와 축소': {
//       question: '혹시 이런 방향으로 생각해보셨을까요?',
//       exampleTemplate: (thought) => [
//         '실수는 크게 보고 성공은 작게 보는 마음의 렌즈가 작동하고 있진 않나요?',
//         '객관적으로 봤을 때, 이 일이 정말 그렇게 중대한 일일까요?',
//         '1년 후, 5년 후에도 이 일이 그렇게 크게 보일까요?',
//         '당신의 장점과 단점을 공평한 저울로 달아본다면 어떨까요?',
//       ],
//     },
//   };

//   const template = templates[errorName] || {
//     question: '혹시 이런 방향으로 생각해보셨을까요?',
//     exampleTemplate: () => [
//       '이 생각이 정말 사실에 기반한 것일까요?',
//       '다른 관점에서 생각해볼 여지는 없을까요?',
//       '객관적인 증거가 있을까요?',
//       '친구가 똑같은 상황이라면 뭐라고 조언해줄까요?',
//     ],
//   };

//   return {
//     question: template.question,
//     examples: template.exampleTemplate(userThought),
//   };
// }

// export function CognitiveErrorExplanationModal({
//   open,
//   errorName,
//   errorDescription,
//   userThought,
//   userExperience,
//   onClose,
// }: CognitiveErrorExplanationModalProps) {
//   const { question, examples } = generateContextualExample(
//     errorName,
//     userThought,
//     userExperience
//   );

//   return (
//     <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
//       <DialogContent
//         className="max-w-4xl bg-white border-2 border-orange-200 shadow-2xl max-h-[85vh] overflow-y-auto"
//         aria-describedby="cognitive-error-description"
//       >
//         <DialogTitle className="sr-only">인지오류 설명: {errorName}</DialogTitle>
//         <DialogDescription id="cognitive-error-description" className="sr-only">
//           {errorDescription} 이 인지오류에 대한 구체적인 질문과 다른 관점을 제시합니다.
//         </DialogDescription>

//         <div className="space-y-8 py-4">
//           {/* 인지오류 제목 - 크게 */}
//           <div className="text-center bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-8">
//             <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full mb-4">
//               <AlertCircle className="size-10 text-white" />
//             </div>
//             <h2 className="text-red-900 text-4xl mb-3">
//               {errorName}
//             </h2>
//             <p className="text-red-700 text-lg leading-relaxed">
//               {errorDescription}
//             </p>
//           </div>

//           {/* 사용자의 생각 */}
//           <div className="bg-slate-100 border-2 border-slate-300 rounded-xl p-6">
//             <p className="text-slate-600 text-sm mb-2">당신이 떠올린 생각:</p>
//             <p className="text-slate-900 text-xl italic">
//               "{userThought}"
//             </p>
//           </div>

//           {/* 질문 섹션 */}
//           <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8">
//             <div className="flex items-start gap-4 mb-6">
//               <div className="flex-shrink-0">
//                 <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full">
//                   <Lightbulb className="size-6 text-white" />
//                 </div>
//               </div>
//               <div>
//                 <h3 className="text-indigo-900 text-2xl mb-3">
//                   {question}
//                 </h3>
//               </div>
//             </div>

//             {/* 구체적 질문들 */}
//             <div className="space-y-4 pl-16">
//               {examples.map((example, index) => (
//                 <div
//                   key={index}
//                   className="bg-white border border-blue-200 rounded-lg p-4 shadow-sm"
//                 >
//                   <p className="text-blue-900 text-lg leading-relaxed">
//                     💡 {example}
//                   </p>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* 안내 메시지 */}
//           <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
//             <p className="text-green-900 leading-relaxed text-center">
//               이런 질문들을 스스로에게 던져보는 것만으로도
//               <br />
//               <strong className="text-green-700">생각의 균형을 되찾고 감정을 조절</strong>하는 데 큰 도움이 됩니다.
//             </p>
//           </div>

//           {/* 닫기 버튼 */}
//           <Button
//             onClick={onClose}
//             className="w-full py-6 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
//           >
//             이해했습니다
//           </Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }
