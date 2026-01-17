import { LogIn, LogOut, Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "../../ui/button";
import { Drawer } from "./Drawer";
import { ModePicker } from "./ModePicker";
import type { NavSharedProps } from "./types";

type WebCompactNavProps = Pick<
  NavSharedProps,
  | "currentPage"
  | "navItems"
  | "user"
  | "mode"
  | "onChangeMode"
  | "onLogout"
  | "onShowAuth"
  | "onNavigate"
  | "onHomeRefresh"
>;

export function WebCompactNav({
  currentPage,
  navItems,
  user,
  mode,
  onChangeMode,
  onLogout,
  onShowAuth,
  onNavigate,
  onHomeRefresh,
}: WebCompactNavProps) {
  const [open, setOpen] = useState(false);
  const go = (page: string) => {
    onNavigate(page);
    setOpen(false);
  };

  return (
    <>
      <div className="max-w-[1800px] mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          {/* 모바일 로고 */}
          <button
            type="button"
            onClick={() => {
              onHomeRefresh();
              setOpen(false);
            }}
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

            {/* 햄버거 */}
            <Button
              variant="outline"
              size="icon"
              aria-label="메뉴 열기"
              onClick={() => setOpen(true)}
            >
              <Menu className="size-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Drawer 본체 */}
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        side="left"
        width={360}
      >
        {/* 헤더 */}
        <div
          style={{
            padding: 16,
            borderBottom: "1px solid rgba(0,0,0,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ minWidth: 0 }}>
            {user && (
              <div style={{ marginTop: 8 }}>
                <div
                  style={{
                    fontSize: 13,
                    color: "#0f172a",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user.user_metadata?.name || "사용자"}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "rgba(15,23,42,0.6)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user.email}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setOpen(false)}
            aria-label="닫기"
            style={{
              border: "1px solid rgba(0,0,0,0.15)",
              background: "#fff",
              borderRadius: 10,
              width: 36,
              height: 36,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flex: "0 0 auto",
            }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>×</span>
          </button>
        </div>

        {/* 메뉴 리스트 */}
        <div style={{ padding: 8, overflow: "auto" }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => go(item.id)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 12px",
                  borderRadius: 14,
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  background: active
                    ? "linear-gradient(90deg, #7c3aed, #db2777)"
                    : "transparent",
                  color: active ? "#fff" : "#0f172a",
                }}
              >
                <Icon size={20} />
                <span style={{ fontSize: 14, fontWeight: active ? 700 : 600 }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* 하단 액션 */}
        <div style={{ padding: 16, borderTop: "1px solid rgba(0,0,0,0.08)" }}>
          {user ? (
            <button
              onClick={onLogout}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 14,
                border: "1px solid rgba(239,68,68,0.35)",
                background: "#fff",
                color: "#ef4444",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              로그아웃
            </button>
          ) : (
            <button
              onClick={onShowAuth}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 14,
                border: "none",
                background: "linear-gradient(90deg, #7c3aed, #db2777)",
                color: "#fff",
                cursor: "pointer",
                fontWeight: 800,
              }}
            >
              로그인
            </button>
          )}
        </div>
      </Drawer>
    </>
  );
}
