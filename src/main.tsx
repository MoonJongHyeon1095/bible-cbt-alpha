// vercel dev --listen 3333
// npm run dev

// src/main.tsx
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

import { Capacitor } from "@capacitor/core";
import { supabase } from "./lib/supabase/client";

async function registerOAuthDeepLinkHandler() {
  // ✅ 웹에서는 아예 @capacitor/app을 로드하지 않음 (완전 안전)
  if (!Capacitor.isNativePlatform()) return;

  try {
    const mod = await import("@capacitor/app");
    const CapApp = mod.App;

    CapApp.addListener("appUrlOpen", async ({ url }) => {
      console.log("[oauth] appUrlOpen:", url);

      if (!url.startsWith("com.example.cbt://auth-callback")) return;

      try {
        const u = new URL(url);
        const code = u.searchParams.get("code");

        console.log("[oauth] code:", code);

        if (!code) {
          console.log("[oauth] no code param. url:", url);
          return;
        }

        const { data, error } = await supabase.auth.exchangeCodeForSession(
          code
        );

        if (error) {
          console.log("[oauth] exchangeCodeForSession error:", error);
          return;
        }

        console.log("[oauth] exchangeCodeForSession ok:", {
          user: data?.user?.id,
          session: Boolean(data?.session),
        });
      } catch (e) {
        console.log("[oauth] callback parse error:", e);
      }
    });
  } catch (e) {
    // ✅ 혹시라도 네이티브 환경인데 플러그인 로딩이 실패한 경우
    console.log("[oauth] failed to load @capacitor/app:", e);
  }
}

// ✅ 앱 시작 시 1번만 등록
registerOAuthDeepLinkHandler();

createRoot(document.getElementById("root")!).render(<App />);
