import { AuthModal } from "../AuthModal";
import { Toaster } from "../ui/sonner";

type OverlayLayerProps = {
  authModalOpen: boolean;
  onAuthSuccess: () => void;
  onCloseAuthModal: () => void;
};

export function OverlayLayer({
  authModalOpen,
  onAuthSuccess,
  onCloseAuthModal,
}: OverlayLayerProps) {
  return (
    <>
      <AuthModal
        open={authModalOpen}
        onClose={onCloseAuthModal}
        onSuccess={onAuthSuccess}
      />
      <Toaster position="top-center" richColors closeButton />
    </>
  );
}
