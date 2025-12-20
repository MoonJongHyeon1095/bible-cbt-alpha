// import {
//   BookMarked,
//   BookOpen,
//   Brain,
//   LayoutDashboard,
//   LifeBuoy,
//   LogIn,
//   LogOut,
//   MessageSquare,
//   Mic,
//   TrendingUp,
// } from "lucide-react";
// import { Button } from "./ui/button";

// interface NavigationProps {
//   currentPage: string;
//   onNavigate: (page: string) => void;
//   user: any;
//   onLogout: () => void;
//   onShowAuth: () => void;
// }

// export function Navigation({
//   currentPage,
//   onNavigate,
//   user,
//   onLogout,
//   onShowAuth,
// }: NavigationProps) {
//   const navItems = [
//     { id: "dashboard", label: "대시보드", icon: LayoutDashboard },
//     { id: "ai-chat", label: "AI 상담", icon: MessageSquare },
//     { id: "prayer-notes", label: "기도 노트", icon: BookOpen },
//     { id: "scripture-notes", label: "말씀 노트", icon: BookMarked },
//     { id: "patterns", label: "나의 패턴", icon: TrendingUp },
//     { id: "community", label: "커뮤니티", icon: MessageSquare },
//     { id: "voice", label: "음성 입력", icon: Mic },
//     { id: "helpline", label: "헬프라인", icon: LifeBuoy },
//   ];

//   return (
//     <nav className="bg-white border-b-2 border-purple-100 shadow-sm sticky top-0 z-50">
//       <div className="max-w-[1800px] mx-auto px-8 py-4">
//         <div className="flex items-center justify-between">
//           {/* Logo */}
//           <div className="flex items-center gap-3">
//             <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-2 rounded-xl">
//               <Brain className="size-6" />
//             </div>
//             <div>
//               <h1 className="text-lg text-slate-900">마음생각고쳐쓰기</h1>
//               <p className="text-xs text-slate-500">by 617ALLIANCE</p>
//             </div>
//           </div>

//           {/* Navigation Items */}
//           <div className="flex items-center gap-2 flex-wrap">
//             {navItems.map((item) => {
//               const Icon = item.icon;
//               return (
//                 <Button
//                   key={item.id}
//                   onClick={() => onNavigate(item.id)}
//                   variant={currentPage === item.id ? "default" : "ghost"}
//                   size="sm"
//                   className={
//                     currentPage === item.id
//                       ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
//                       : "text-slate-700 hover:text-slate-900 hover:bg-purple-50"
//                   }
//                 >
//                   <Icon className="size-4 mr-1.5" />
//                   {item.label}
//                 </Button>
//               );
//             })}
//           </div>

//           {/* User Section */}
//           <div className="flex items-center gap-2">
//             {user ? (
//               <>
//                 <div className="text-right mr-2">
//                   <p className="text-sm text-slate-900">
//                     {user.user_metadata?.name || "사용자"}
//                   </p>
//                   <p className="text-xs text-slate-500">{user.email}</p>
//                 </div>
//                 <Button
//                   onClick={onLogout}
//                   variant="outline"
//                   size="sm"
//                   className="border-red-200 text-red-600 hover:bg-red-50"
//                 >
//                   <LogOut className="size-4 mr-1.5" />
//                   로그아웃
//                 </Button>
//               </>
//             ) : (
//               <Button
//                 onClick={onShowAuth}
//                 className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
//                 size="sm"
//               >
//                 <LogIn className="size-4 mr-1.5" />
//                 로그인
//               </Button>
//             )}
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// }

// src/components/Navigation.tsx
import {
  BookMarked,
  BookOpen,
  Brain,
  LayoutDashboard,
  LifeBuoy,
  LogIn,
  LogOut,
  Menu,
  MessageSquare,
  Mic,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Drawer } from "./header/Drawer";
import { Button } from "./ui/button";

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  user: any;
  onLogout: () => void;
  onShowAuth: () => void;
}

/**
 * ✅ Tailwind md 분기( CSS )가 꼬여도 "절대 동시에 뜨지 않게" JS matchMedia로 분기
 * - desktop 기준: min-width 768px (Tailwind md 기본과 동일)
 */
function useIsDesktop(breakpointPx = 768) {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia(`(min-width: ${breakpointPx}px)`).matches;
  });

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${breakpointPx}px)`);
    const onChange = () => setIsDesktop(mq.matches);
    onChange();

    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else mq.addListener(onChange);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onChange);
      else mq.removeListener(onChange);
    };
  }, [breakpointPx]);

  return isDesktop;
}

export function Navigation({
  currentPage,
  onNavigate,
  user,
  onLogout,
  onShowAuth,
}: NavigationProps) {
  const isDesktop = useIsDesktop(768);
  const [open, setOpen] = useState(false);

  const navItems = useMemo(
    () => [
      { id: "dashboard", label: "대시보드", icon: LayoutDashboard },
      { id: "ai-chat", label: "AI 상담", icon: MessageSquare },
      { id: "prayer-notes", label: "기도 노트", icon: BookOpen },
      { id: "scripture-notes", label: "말씀 노트", icon: BookMarked },
      { id: "patterns", label: "나의 패턴", icon: TrendingUp },
      { id: "community", label: "커뮤니티", icon: MessageSquare },
      { id: "voice", label: "음성 입력", icon: Mic },
      { id: "helpline", label: "헬프라인", icon: LifeBuoy },
    ],
    []
  );

  const go = (page: string) => {
    onNavigate(page);
    setOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav className="bg-white border-b-2 border-purple-100 shadow-sm sticky top-0 z-50">
      {isDesktop ? (
        // =========================
        // ✅ 데스크탑: 예전 그대로
        // =========================
        <div className="max-w-[1800px] mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-2 rounded-xl">
                <Brain className="size-6" />
              </div>
              <div>
                <h1 className="text-lg text-slate-900">마음생각고쳐쓰기</h1>
                <p className="text-xs text-slate-500">by 617ALLIANCE</p>
              </div>
            </div>

            {/* Navigation Items */}
            <div className="flex items-center gap-2 flex-wrap">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    onClick={() => go(item.id)}
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
      ) : (
        // =========================
        // ✅ 모바일: Drawer (CSS 의존 최소화)
        // =========================
        <div className="max-w-[1800px] mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            {/* 모바일 로고 */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-2 rounded-xl shrink-0">
                <Brain className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm text-slate-900 truncate">
                  마음생각고쳐쓰기
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  by 617ALLIANCE
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* 모바일 로그인 */}
              {user ? (
                <Button
                  onClick={onLogout}
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <LogOut className="size-4 mr-1.5" />
                  로그아웃
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
                <div style={{ fontWeight: 800, fontSize: 16 }}>메뉴</div>
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
                    <span
                      style={{ fontSize: 14, fontWeight: active ? 700 : 600 }}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 하단 액션 */}
            <div
              style={{
                padding: 16,
                borderTop: "1px solid rgba(0,0,0,0.08)",
              }}
            >
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
        </div>
      )}
    </nav>
  );
}
