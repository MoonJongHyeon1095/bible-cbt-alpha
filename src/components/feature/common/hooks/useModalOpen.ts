import { useEffect, useState } from "react";

const MODAL_OVERLAY_SELECTOR =
  "[data-slot='dialog-overlay'][data-state='open'], [data-slot='alert-dialog-overlay'][data-state='open']";

export function useModalOpen() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const update = () => {
      setIsModalOpen(Boolean(document.querySelector(MODAL_OVERLAY_SELECTOR)));
    };

    update();
    const observer = new MutationObserver(update);
    observer.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ["data-state", "data-slot", "class", "style"],
    });

    return () => observer.disconnect();
  }, []);

  return isModalOpen;
}
