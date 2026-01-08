"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({
  offset = 40,
  mobileOffset,
  ...props
}: ToasterProps) => {
  const { theme = "system" } = useTheme();
  const resolvedMobileOffset = mobileOffset ?? offset;

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group pointer-events-auto z-[9999]"
      offset={offset}
      mobileOffset={resolvedMobileOffset}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
