// vercel dev --listen 3333
// npm run dev

// src/main.tsx
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

import { App as CapApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { supabase } from "./lib/supabase/client";

function registerOAuthDeepLinkHandler() {
  // 웹에서는 필요 없음 (앱에서만)
  if (!Capacitor.isNativePlatform()) return;

  CapApp.addListener("appUrlOpen", async ({ url }) => {
    // ✅ 여기 로그가 핵심 (딥링크가 들어오는지 확인)
    console.log("[oauth] appUrlOpen:", url);

    // 우리가 설정한 딥링크만 처리
    if (!url.startsWith("com.example.cbt://auth-callback")) return;

    try {
      const u = new URL(url);

      // Supabase PKCE: ?code=...
      const code = u.searchParams.get("code");
      console.log("[oauth] code:", code);

      if (!code) {
        console.log("[oauth] no code param. url:", url);
        return;
      }

      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.log("[oauth] exchangeCodeForSession error:", error);
      } else {
        console.log("[oauth] exchangeCodeForSession ok:", {
          user: data?.user?.id,
          session: Boolean(data?.session),
        });
      }
    } catch (e) {
      console.log("[oauth] callback parse error:", e);
    }
  });
}

// ✅ 앱 시작 시 1번만 등록
registerOAuthDeepLinkHandler();

createRoot(document.getElementById("root")!).render(<App />);
