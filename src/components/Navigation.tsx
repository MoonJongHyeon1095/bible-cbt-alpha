import { Button } from './ui/button';
import { 
  Brain, 
  LayoutDashboard, 
  MessageSquare, 
  BookOpen, 
  BookMarked, 
  TrendingUp,
  LifeBuoy,
  LogOut,
  LogIn,
  Mic
} from 'lucide-react';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  user: any;
  onLogout: () => void;
  onShowAuth: () => void;
}

export function Navigation({ currentPage, onNavigate, user, onLogout, onShowAuth }: NavigationProps) {
  const navItems = [
    { id: 'cbt', label: '마음생각고쳐쓰기', icon: Brain },
    { id: 'dashboard', label: '대시보드', icon: LayoutDashboard },
    { id: 'ai-chat', label: 'AI 상담', icon: MessageSquare },
    { id: 'prayer-notes', label: '기도 노트', icon: BookOpen },
    { id: 'scripture-notes', label: '말씀 노트', icon: BookMarked },
    { id: 'patterns', label: '나의 패턴', icon: TrendingUp },
    { id: 'community', label: '커뮤니티', icon: MessageSquare },
    { id: 'voice', label: '음성 입력', icon: Mic },
    { id: 'helpline', label: '헬프라인', icon: LifeBuoy },
  ];

  return (
    <nav className="bg-white border-b-2 border-purple-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-[1800px] mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-2 rounded-xl">
              <Brain className="size-6" />
            </div>
            <div>
              <h1 className="text-lg text-slate-900">마음생각고쳐쓰기</h1>
              <p className="text-xs text-slate-500">by 617ALLIANCE</p>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center gap-2 flex-wrap">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  variant={currentPage === item.id ? 'default' : 'ghost'}
                  size="sm"
                  className={
                    currentPage === item.id
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-purple-50'
                  }
                >
                  <Icon className="size-4 mr-1.5" />
                  {item.label}
                </Button>
              );
            })}
          </div>

          {/* User Section */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <div className="text-right mr-2">
                  <p className="text-sm text-slate-900">{user.user_metadata?.name || '사용자'}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
                <Button
                  onClick={onLogout}
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <LogOut className="size-4 mr-1.5" />
                  로그아웃
                </Button>
              </>
            ) : (
              <Button
                onClick={onShowAuth}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                size="sm"
              >
                <LogIn className="size-4 mr-1.5" />
                로그인
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}