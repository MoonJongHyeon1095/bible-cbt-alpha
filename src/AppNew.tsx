import { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { AuthModal } from './components/AuthModal';
import { CBTSessionPage } from './components/CBTSessionPage';
import { DashboardPage } from './components/DashboardPage';
import { AIChatPage } from './components/AIChatPage';
import { PrayerNotesPage } from './components/PrayerNotesPage';
import { ScriptureNotesPage } from './components/ScriptureNotesPage';
import { PatternsPage } from './components/PatternsPage';
import { CommunityPage } from './components/CommunityPage';
import { VoicePage } from './components/VoicePage';
import { HelplinePage } from './components/HelplinePage';
import { CommentSection } from './components/CommentSection';
import { authHelpers } from './lib/supabase';

export default function App() {
  const [currentPage, setCurrentPage] = useState('cbt');
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { user: currentUser } = await authHelpers.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  };

  const handleLogout = async () => {
    await authHelpers.signOut();
    setUser(null);
    alert('로그아웃되었습니다.');
  };

  const handleAuthSuccess = () => {
    checkUser();
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'cbt':
        return <CBTSessionPage />;
      case 'dashboard':
        return <DashboardPage />;
      case 'ai-chat':
        return <AIChatPage />;
      case 'prayer-notes':
        return <PrayerNotesPage />;
      case 'scripture-notes':
        return <ScriptureNotesPage />;
      case 'patterns':
        return <PatternsPage />;
      case 'community':
        return <CommunityPage />;
      case 'voice':
        return <VoicePage />;
      case 'helpline':
        return <HelplinePage />;
      default:
        return <CBTSessionPage />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="size-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navigation
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        user={user}
        onLogout={handleLogout}
        onShowAuth={() => setShowAuthModal(true)}
      />

      <main className="pb-16">
        {renderPage()}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/80 backdrop-blur-md py-8 mt-16">
        <div className="max-w-[1800px] mx-auto px-8">
          <div className="text-center mb-8">
            <div className="inline-block bg-white border border-slate-200 shadow-sm rounded-2xl px-10 py-5 mb-6">
              <p className="text-slate-500 text-sm mb-1">Copyright © 2025</p>
              <p className="text-slate-800 text-lg tracking-wide">617ALLIANCE</p>
            </div>
          </div>

          {/* 댓글 섹션 */}
          <CommentSection />
        </div>
      </footer>

      {/* 인증 모달 */}
      <AuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
