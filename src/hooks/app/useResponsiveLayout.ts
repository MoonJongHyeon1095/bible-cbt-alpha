import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { useEffect, useState } from "react";

const getIsDesktop = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(min-width: 768px)").matches;

export function useResponsiveLayout() {
  const [isDesktop, setIsDesktop] = useState<boolean>(getIsDesktop);
  const isNativeMobile = !isDesktop && Capacitor.isNativePlatform();

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const handleChange = (event: MediaQueryListEvent) =>
      setIsDesktop(event.matches);

    setIsDesktop(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (!isNativeMobile || Capacitor.getPlatform() !== "ios") return;

    const applyStatusBarStyle = async () => {
      try {
        await StatusBar.setOverlaysWebView({ overlay: false });
        await StatusBar.setBackgroundColor({ color: "#ffffff" });
        await StatusBar.setStyle({ style: Style.Dark });
      } catch {
        // ignore
      }
    };

    applyStatusBarStyle();
  }, [isNativeMobile]);

  return { isDesktop, isNativeMobile };
}
