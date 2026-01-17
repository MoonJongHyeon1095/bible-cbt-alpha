import { LogIn, LogOut } from "lucide-react";
import { Button } from "../../ui/button";
import { ModePicker } from "../navigation/ModePicker";
import type { NavSharedProps } from "../navigation/types";

type MobileTopBarProps = Pick<
  NavSharedProps,
  "user" | "mode" | "onChangeMode" | "onLogout" | "onShowAuth" | "onNavigate"
>;

export function MobileTopBar({
  user,
  mode,
  onChangeMode,
  onLogout,
  onShowAuth,
  onNavigate,
}: MobileTopBarProps) {
  return (
    <div
      className="max-w-[1800px] mx-auto px-4 pb-3"
      style={{ paddingTop: "calc(env(safe-area-inset-top) + 40px)" }}
    >
      <div className="flex items-center justify-between gap-2">
        {/* 모바일 로고 */}
        <button
          type="button"
          onClick={() => onNavigate("cbt")}
          className="flex items-center gap-2 min-w-0 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded-xl"
        >
          <div className="shrink-0">
            <img
              src="/logo.png"
              alt="마음생각 다시 쓰기 로고"
              className="size-10 object-contain"
            />
          </div>
          <div className="min-w-0">
            <div className="text-sm text-slate-900 truncate">
              마음생각 다시 쓰기
            </div>
          </div>
        </button>

        <div className="flex items-center gap-2">
          {/* ✅ 모드 설정 (controlled) */}
          <ModePicker value={mode} onChange={onChangeMode} />

          {/* 모바일 로그인 */}
          {user ? (
            <Button
              onClick={onLogout}
              variant="outline"
              size="sm"
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              <LogOut className="size-4 mr-1.5" />
            </Button>
          ) : (
            <Button
              onClick={onShowAuth}
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <LogIn className="size-4 mr-1.5" />
              로그인
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
