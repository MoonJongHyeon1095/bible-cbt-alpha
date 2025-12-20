// import { useState } from 'react';
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
// import { Button } from './ui/button';
// import { Input } from './ui/input';
// import { setApiKey, listAvailableModels } from '../lib/gemini';
// import { Loader2 } from 'lucide-react';

// interface ApiKeyModalProps {
//   open: boolean;
//   onClose: (success: boolean) => void;
// }

// export function ApiKeyModal({ open, onClose }: ApiKeyModalProps) {
//   const [key, setKey] = useState('');
//   const [checking, setChecking] = useState(false);
//   const [models, setModels] = useState<string[]>([]);

//   const handleCheckModels = async () => {
//     if (!key.trim()) return;

//     setChecking(true);
//     try {
//       // 임시로 키 저장
//       setApiKey(key.trim());
//       const availableModels = await listAvailableModels();
//       setModels(availableModels);

//       if (availableModels.length > 0) {
//         alert(`✅ API 키 확인 완료!\n\n사용 가능한 모델 ${availableModels.length}개를 찾았습니다.\n콘솔(F12)에서 전체 목록을 확인하세요.`);
//       }
//     } catch (error) {
//       alert('❌ API 키 확인 실패. 키가 올바른지 확인해주세요.');
//     } finally {
//       setChecking(false);
//     }
//   };

//   const handleSave = () => {
//     if (key.trim()) {
//       setApiKey(key.trim());
//       onClose(true);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={(open) => !open && onClose(false)}>
//       <DialogContent className="sm:max-w-[500px]" aria-describedby="api-key-description">
//         <DialogHeader>
//           <DialogTitle>Gemini API 키 설정</DialogTitle>
//           <DialogDescription id="api-key-description">
//             AI 기능을 사용하려면 Gemini API 키가 필요합니다.
//           </DialogDescription>
//         </DialogHeader>

//         <div className="space-y-4 py-4">
//           <div className="space-y-2">
//             <label className="text-slate-700">API 키</label>
//             <Input
//               type="password"
//               placeholder="AIza..."
//               value={key}
//               onChange={(e) => setKey(e.target.value)}
//               onKeyDown={(e) => e.key === 'Enter' && handleSave()}
//             />
//             <Button
//               onClick={handleCheckModels}
//               disabled={!key.trim() || checking}
//               variant="outline"
//               size="sm"
//               className="w-full"
//             >
//               {checking ? (
//                 <>
//                   <Loader2 className="size-4 mr-2 animate-spin" />
//                   확인 중...
//                 </>
//               ) : (
//                 '🔍 사용 가능한 모델 확인'
//               )}
//             </Button>
//             {models.length > 0 && (
//               <div className="bg-green-50 p-2 rounded text-green-800 text-sm">
//                 ✅ {models.length}개 모델 사용 가능 (콘솔 확인)
//               </div>
//             )}
//           </div>

//           <div className="bg-blue-50 p-4 rounded-lg space-y-2">
//             <p className="text-blue-900">📌 API 키 발급 방법:</p>
//             <ol className="text-blue-800 space-y-1 ml-4 list-decimal">
//               <li>
//                 <a
//                   href="https://aistudio.google.com/app/apikey"
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="underline hover:text-blue-600"
//                 >
//                   Google AI Studio
//                 </a>
//                 에 접속
//               </li>
//               <li>Google 계정으로 로그인</li>
//               <li>"Get API Key" 또는 "API 키 만들기" 클릭</li>
//               <li>생성된 키를 복사하여 위에 붙여넣기</li>
//             </ol>
//             <p className="text-blue-700 mt-2">
//               💡 무료: 하루 1,500회 요청 가능
//             </p>
//           </div>

//           <div className="bg-amber-50 p-3 rounded-lg">
//             <p className="text-amber-800">
//               ⚠️ API 키는 브라우저에만 저장됩니다. (개인용 베타테스트)
//             </p>
//           </div>
//         </div>

//         <div className="flex justify-end gap-2">
//           <Button variant="outline" onClick={() => onClose(false)}>
//             취소
//           </Button>
//           <Button onClick={handleSave} disabled={!key.trim()}>
//             저장
//           </Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }
