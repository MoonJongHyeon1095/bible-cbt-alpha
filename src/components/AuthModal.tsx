import { Lock, LogIn, Mail, User, UserPlus } from "lucide-react";
import { useState } from "react";
import { authHelpers } from "../lib/supabase/auth";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AuthModal({ open, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await authHelpers.signUp(email, password, name);
        if (error) throw error;
        alert("회원가입이 완료되었습니다! 로그인해주세요.");
        setMode("signin");
      } else {
        const { error } = await authHelpers.signIn(email, password);
        if (error) throw error;
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const { error } = await authHelpers.signInWithGoogle();
      if (error) throw error;
      // OAuth 리다이렉트가 처리됨
    } catch (err: any) {
      setError(err.message || "구글 로그인 실패");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-md bg-white border-2 border-purple-200"
        aria-describedby="auth-description"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl text-purple-900 flex items-center gap-2">
            {mode === "signin" ? (
              <>
                <LogIn className="size-6 text-purple-600" />
                로그인
              </>
            ) : (
              <>
                <UserPlus className="size-6 text-purple-600" />
                회원가입
              </>
            )}
          </DialogTitle>
          <DialogDescription id="auth-description" className="text-purple-700">
            {mode === "signin"
              ? "계정에 로그인하여 데이터를 동기화하세요."
              : "새 계정을 만들어 시작하세요."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {mode === "signup" && (
            <div>
              <Label
                htmlFor="name"
                className="text-slate-700 flex items-center gap-2 mb-2"
              >
                <User className="size-4" />
                이름
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="홍길동"
                className="border-purple-200 focus:border-purple-400"
              />
            </div>
          )}

          <div>
            <Label
              htmlFor="email"
              className="text-slate-700 flex items-center gap-2 mb-2"
            >
              <Mail className="size-4" />
              이메일
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="example@email.com"
              className="border-purple-200 focus:border-purple-400"
            />
          </div>

          <div>
            <Label
              htmlFor="password"
              className="text-slate-700 flex items-center gap-2 mb-2"
            >
              <Lock className="size-4" />
              비밀번호
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              minLength={6}
              className="border-purple-200 focus:border-purple-400"
            />
            {mode === "signup" && (
              <p className="text-xs text-slate-500 mt-1">최소 6자 이상</p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {loading ? "처리 중..." : mode === "signin" ? "로그인" : "회원가입"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500">또는</span>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            variant="outline"
            className="w-full border-slate-300 hover:bg-slate-50"
          >
            <svg className="size-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google로 계속하기
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="text-sm text-purple-600 hover:text-purple-700 underline"
            >
              {mode === "signin"
                ? "계정이 없으신가요? 회원가입"
                : "이미 계정이 있으신가요? 로그인"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
