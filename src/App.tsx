// src/App.tsx
import { LoadingScreen } from "./components/layout/LoadingScreen";
import { PageContent } from "./components/layout/PageContent";
import { SessionLayout } from "./components/layout/SessionLayout";
import { useAppState } from "./hooks/useAppState";

export default function App() {
  const {
    cbtResetKey,
    cbtSessionKind,
    cbtStep,
    currentPage,
    handleAuthSuccess,
    handleEnteranceComplete,
    handleEnteranceLater,
    handleHomeRefresh,
    handleLogout,
    handleMinimalComplete,
    handleStartMinimalFromLite,
    hideChrome,
    isDesktop,
    isMinimalExiting,
    isNativeMobile,
    loading,
    mode,
    setCbtSessionKind,
    setCbtStep,
    setCurrentPage,
    setMode,
    setShowAuthModal,
    showAuthModal,
    showEnterance,
    showLiteGradient,
    showMinimalCbt,
    user,
  } = useAppState();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <SessionLayout
      authModalOpen={showAuthModal}
      cbtStep={cbtStep}
      currentPage={currentPage}
      hideChrome={hideChrome}
      isDesktop={isDesktop}
      isNativeMobile={isNativeMobile}
      mode={mode}
      showLiteGradient={showLiteGradient}
      user={user}
      onAuthSuccess={handleAuthSuccess}
      onCloseAuthModal={() => setShowAuthModal(false)}
      onHomeRefresh={handleHomeRefresh}
      onLogout={handleLogout}
      onNavigate={setCurrentPage}
      onShowAuth={() => setShowAuthModal(true)}
      onChangeMode={(next) => setMode(next)}
    >
      <PageContent
        cbtResetKey={cbtResetKey}
        cbtSessionKind={cbtSessionKind}
        currentPage={currentPage}
        isMinimalExiting={isMinimalExiting}
        mode={mode}
        showEnterance={showEnterance}
        showMinimalCbt={showMinimalCbt}
        user={user}
        onCbtStepChange={setCbtStep}
        onEnteranceComplete={handleEnteranceComplete}
        onEnteranceLater={handleEnteranceLater}
        onMinimalComplete={handleMinimalComplete}
        onSessionKindChange={setCbtSessionKind}
        onStartMinimalFromLite={handleStartMinimalFromLite}
      />
    </SessionLayout>
  );
}
