import { Bot, MessageSquare, Send, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { Textarea } from "../../ui/textarea";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      role: "assistant",
      content:
        "안녕하세요! 저는 마음생각 다시 쓰기 상담 도우미입니다. 😊\n\n오늘 당신의 마음은 어떤가요? 무엇이든 편하게 이야기해주세요. 함께 감정을 탐색하고, 생각의 패턴을 이해하며, 더 나은 대안을 찾아갈 수 있습니다.",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // 시스템 프롬프트로 역할 정의
      const systemPrompt = `당신은 기독교 기반 마음생각 다시 쓰기(CBT) 전문 상담사입니다. 
공감적이고 따뜻하게 대화하며, 사용자의 감정을 이해하고 인지적 왜곡을 찾아내어 건강한 대안을 제시합니다. 
필요시 성경적 관점도 포함합니다. 항상 200자 이내로 간결하고 따뜻하게 응답하세요.`;

      // 대화 이력 구성
      const conversationHistory = messages
        .slice(-5)
        .map((m) => `${m.role === "user" ? "사용자" : "AI"}: ${m.content}`)
        .join("\n");

      const prompt = `대화 이력:
${conversationHistory}
사용자: ${userMessage.content}`;

      //const response = await callGeminiAPI(prompt, systemPrompt);

      const response = "미구현이니 기다려주길 바람 - 문종현";

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("AI 응답 오류:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          error instanceof Error
            ? error.message
            : "죄송합니다. 응답 생성 중 오류가 발생했습니다. 다시 시도해주세요.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="max-w-[1800px] mx-auto px-8 py-8 h-[calc(100vh-200px)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl text-slate-900 mb-2 flex items-center gap-3">
          <MessageSquare className="size-8 text-blue-600" />
          AI 상담 채팅
        </h1>
        <p className="text-slate-600">
          AI와 대화하며 감정을 탐색하고 통찰을 얻으세요.
        </p>
      </div>

      {/* 메시지 영역 */}
      <Card className="flex-1 p-4 overflow-y-auto mb-4 bg-slate-50">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              {/* 아바타 */}
              <div
                className={`flex-shrink-0 size-10 rounded-full flex items-center justify-center ${
                  message.role === "user"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600"
                    : "bg-gradient-to-r from-blue-600 to-cyan-600"
                }`}
              >
                {message.role === "user" ? (
                  <User className="size-6 text-white" />
                ) : (
                  <Bot className="size-6 text-white" />
                )}
              </div>

              {/* 메시지 */}
              <div
                className={`flex-1 max-w-[70%] ${
                  message.role === "user" ? "text-right" : ""
                }`}
              >
                <div
                  className={`inline-block p-4 rounded-2xl ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                      : "bg-white border border-slate-200 text-slate-800"
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString("ko-KR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 size-10 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center">
                <Bot className="size-6 text-white" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-4">
                <div className="flex gap-2">
                  <div className="size-2 bg-slate-400 rounded-full animate-bounce" />
                  <div
                    className="size-2 bg-slate-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                  <div
                    className="size-2 bg-slate-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </Card>

      {/* 입력 영역 */}
      <div className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="메시지를 입력하세요... (Shift+Enter로 줄바꿈)"
          className="flex-1 min-h-[60px] max-h-[120px] resize-none"
          disabled={loading}
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 px-6"
        >
          <Send className="size-5" />
        </Button>
      </div>
    </div>
  );
}
