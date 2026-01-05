import { CheckCircle, Mail, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase/client";
import type { SessionHistory } from "../../types/sessionHistory";
import { toast } from "sonner";

interface EmailModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  sessionData: {
    userInput: string;
    emotionThoughtPairs: Array<{
      emotion: string;
      intensity: number | null;
      thought: string;
    }>;
    selectedCognitiveErrors: string[];
    selectedAlternativeThought: string;
    positiveReframes: { [emotion: string]: string };
  };
}

export function EmailModal({ open, onClose, user, sessionData }: EmailModalProps) {
  const [email, setEmail] = useState("");
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSendEmail = async () => {
    if (!email || !agreedToPrivacy) {
      toast.error("이메일을 입력하고 개인정보 처리방침에 동의해주세요.");
      return;
    }

    setIsSending(true);

    // 이메일 본문 생성
    const emailBody = `
=== 🧠 인지치료 심리테스트 결과 ===

📝 경험:
${sessionData.userInput || "(없음)"}

💭 감정 & 자동사고:
${
  sessionData.emotionThoughtPairs
    .map((p) => {
      const intensityText =
        typeof p.intensity === "number" ? ` (강도: ${p.intensity}/100)` : "";
      return `• ${p.emotion}${intensityText}\n  → ${p.thought}`;
    })
    .join("\n") || "(없음)"
}

✨ 긍정적 재구성:
${
  Object.entries(sessionData.positiveReframes)
    .map(([emotion, reframe]) => `• ${emotion}: ${reframe}`)
    .join("\n") || "(없음)"
}

⚠️ 인지오류:
${
  sessionData.selectedCognitiveErrors.map((e) => `• ${e}`).join("\n") ||
  "(없음)"
}

💡 대안사고:
${sessionData.selectedAlternativeThought || "(없음)"}

---
이 결과는 ${new Date().toLocaleString("ko-KR")}에 생성되었습니다.
617ALLIANCE | 마음밭을 정돈하기 위한 말씀기도 훈련
    `.trim();

    // mailto 링크 생성
    const subject = encodeURIComponent("인지치료 심리테스트 결과");
    const body = encodeURIComponent(emailBody);
    const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`;

    // 기록 저장 (로그인 시 Supabase, 아니면 로컬)
    const historyItem: SessionHistory = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...sessionData,
    };

    if (user) {
      try {
        const { error } = await supabase.from("session_history").insert({
          user_id: user.id,
          timestamp: historyItem.timestamp,
          user_input: historyItem.userInput,
          emotion_thought_pairs: historyItem.emotionThoughtPairs,
          selected_cognitive_errors: historyItem.selectedCognitiveErrors,
          selected_alternative_thought: historyItem.selectedAlternativeThought,
          positive_reframes: historyItem.positiveReframes,
          bible_verse: historyItem.bibleVerse,
        });
        if (error) throw error;
      } catch (e) {
        console.error("히스토리 저장 실패:", e);
      }
    } else {
      try {
        const existing = localStorage.getItem("cbt_history");
        const histories = existing ? JSON.parse(existing) : [];
        histories.unshift(historyItem);

        // 최대 20개까지만 저장
        if (histories.length > 20) {
          histories.pop();
        }

        localStorage.setItem("cbt_history", JSON.stringify(histories));
      } catch (e) {
        console.error("히스토리 저장 실패:", e);
      }
    }

    // mailto 링크 열기
    window.open(mailtoLink, "_blank");

    setTimeout(() => {
      setIsSending(false);
      setIsSent(true);

      setTimeout(() => {
        setIsSent(false);
        onClose();
      }, 2000);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-xl bg-slate-900 border-slate-700 text-slate-100"
        aria-describedby="email-description"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl text-white flex items-center gap-2">
            <Mail className="size-6 text-purple-400" />
            메일로 받기
          </DialogTitle>
          <DialogDescription id="email-description" className="text-slate-400">
            현재까지의 치료 과정을 이메일로 받아보세요.
          </DialogDescription>
        </DialogHeader>

        {isSent ? (
          <div className="py-12 text-center">
            <CheckCircle className="size-16 text-green-400 mx-auto mb-4" />
            <p className="text-xl text-green-400 mb-2">메일 앱이 열렸습니다!</p>
            <p className="text-sm text-slate-400">
              메일 앱에서 전송을 완료해주세요.
            </p>
          </div>
        ) : (
          <div className="space-y-6 mt-4">
            {/* 이메일 입력 */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm text-slate-300">
                이메일 주소
              </label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
              />
            </div>

            {/* 개인정보 동의 */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-3">
              <p className="text-sm text-slate-300">📋 개인정보 처리방침</p>
              <div className="text-xs text-slate-400 space-y-1 max-h-32 overflow-y-auto">
                <p>• 수집하는 정보: 이메일 주소, 치료 과정 데이터</p>
                <p>• 이용 목적: 사용자가 요청한 결과 전송 및 기록 저장</p>
                <p>
                  • 보관 기간: 브라우저 로컬스토리지에 저장되며, 사용자가 직접
                  삭제할 수 있습니다
                </p>
                <p>
                  • 본 서비스는 외부 서버로 데이터를 전송하지 않으며, 모든
                  데이터는 사용자의 브라우저에 저장됩니다
                </p>
                <p>
                  • 본 서비스는 의료 서비스가 아니며, 심각한 정신건강 문제가
                  있는 경우 전문가의 상담을 받으시기 바랍니다
                </p>
              </div>

              <div className="flex items-start gap-3 pt-2">
                <Checkbox
                  id="privacy"
                  checked={agreedToPrivacy}
                  onCheckedChange={(checked) =>
                    setAgreedToPrivacy(checked as boolean)
                  }
                  className="mt-1"
                />
                <label
                  htmlFor="privacy"
                  className="text-sm text-slate-300 cursor-pointer flex-1"
                >
                  개인정보 처리방침에 동의합니다
                </label>
              </div>
            </div>

            {/* 전송 버튼 */}
            <div className="flex gap-3">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                취소
              </Button>
              <Button
                onClick={handleSendEmail}
                disabled={!email || !agreedToPrivacy || isSending}
                className="flex-1 bg-purple-600 hover:bg-purple-700 gap-2"
              >
                {isSending ? (
                  <>
                    <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>준비 중...</span>
                  </>
                ) : (
                  <>
                    <Send className="size-4" />
                    <span>메일 앱 열기</span>
                  </>
                )}
              </Button>
            </div>

            <p className="text-xs text-slate-500 text-center">
              💡 이 기능은 기본 메일 앱을 사용합니다. 메일 앱이 열리면 전송을
              완료해주세요.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
