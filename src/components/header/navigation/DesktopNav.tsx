import { LogIn, LogOut } from "lucide-react";
import { Button } from "../../ui/button";
import { ModePicker } from "./ModePicker";
import type { NavSharedProps } from "./types";

type DesktopNavProps = Pick<
  NavSharedProps,
  | "currentPage"
  | "navItems"
  | "user"
  | "mode"
  | "onChangeMode"
  | "onLogout"
  | "onShowAuth"
  | "onNavigate"
>;

export function DesktopNav({
  currentPage,
  navItems,
  user,
  mode,
  onChangeMode,
  onLogout,
  onShowAuth,
  onNavigate,
}: DesktopNavProps) {
  return (
    <div className="max-w-[1800px] mx-auto px-8 py-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <button
          type="button"
          onClick={() => onNavigate("cbt")}
          className="flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded-xl"
        >
          <div className="shrink-0">
            <img
              src="/logo.png"
              alt="마음생각 다시 쓰기 로고"
              className="size-12 object-contain"
            />
          </div>
          <div>
            <h1 className="text-lg text-slate-900">마음생각 다시 쓰기</h1>
            <p className="text-xs text-slate-500">by 617ALLIANCE</p>
          </div>
        </button>

        <div className="w-6" />

        {/* Navigation Items */}
        <div className="flex items-center gap-2 flex-wrap">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                variant={currentPage === item.id ? "default" : "ghost"}
                size="sm"
                className={
                  currentPage === item.id
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                    : "text-slate-700 hover:text-slate-900 hover:bg-purple-50"
                }
              >
                <Icon className="size-4 mr-1.5" />
                {item.label}
              </Button>
            );
          })}
        </div>

        {/* User Section */}
        <div className="flex items-center gap-2">
          {/* ✅ 모드 설정 (controlled) */}
          <ModePicker value={mode} onChange={onChangeMode} />

          {user ? (
            <>
              <div className="text-right mr-2">
                <p className="text-sm text-slate-900">
                  {user.user_metadata?.name || "사용자"}
                </p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
              <Button
                onClick={onLogout}
                variant="outline"
                size="sm"
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <LogOut className="size-4 mr-1.5" />
                로그아웃
              </Button>
            </>
          ) : (
            <Button
              onClick={onShowAuth}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              size="sm"
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
