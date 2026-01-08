import { useEffect, useState } from "react";

export function useIsDesktop(breakpointPx = 768) {
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
