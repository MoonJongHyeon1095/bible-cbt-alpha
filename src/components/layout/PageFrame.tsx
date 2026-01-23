import type { ReactNode } from "react";

import { Footer } from "../footer/Footer";

type PageFrameProps = {
  children: ReactNode;
  cbtStep: number;
  currentPage: string;
  hideChrome: boolean;
  isDesktop: boolean;
  isNativeMobile: boolean;
  showLiteGradient: boolean;
};

export function PageFrame({
  children,
  cbtStep,
  currentPage,
  hideChrome,
  isDesktop,
  isNativeMobile,
  showLiteGradient,
}: PageFrameProps) {
  const mainClassName = hideChrome ? undefined : isNativeMobile ? undefined : "pb-8";
  const mainStyle =
    hideChrome || !isNativeMobile
      ? undefined
      : { paddingBottom: "var(--mobile-tabbar-height, 96px)" };

  return (
    <div
      className={
        hideChrome
          ? "min-h-screen bg-white"
          : showLiteGradient
          ? "min-h-screen bg-[linear-gradient(120deg,#efe9df_0%,#f7f3ee_30%,#dfe8e6_100%)] sm:bg-gradient-to-br sm:from-[#efe9df] sm:via-[#f7f3ee] sm:to-[#dfe8e6] sm:via-[65%] sm:to-[100%]"
          : "min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50"
      }
    >
      <main className={mainClassName} style={mainStyle}>
        {children}
      </main>

      {!hideChrome && isDesktop && (currentPage !== "cbt" || cbtStep === 1) && (
        <Footer />
      )}
    </div>
  );
}
