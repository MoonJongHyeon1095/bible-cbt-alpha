import { useState } from "react";

export function useAuthModalState() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  return { setShowAuthModal, showAuthModal };
}
