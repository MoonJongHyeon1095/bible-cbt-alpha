import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Star, Trash2, Plus, X } from 'lucide-react';

interface FavoritesModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (text: string) => void;
}

interface Favorite {
  id: string;
  text: string;
  createdAt: number;
}

const STORAGE_KEY = 'cbt-favorites';
const MAX_FAVORITES = 10;

export function FavoritesModal({ open, onClose, onSelect }: FavoritesModalProps) {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newFavoriteText, setNewFavoriteText] = useState('');

  // 로컬스토리지에서 즐겨찾기 불러오기
  useEffect(() => {
    if (open) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setFavorites(JSON.parse(stored));
        } catch (e) {
          console.error('즐겨찾기 로드 실패:', e);
        }
      }
    }
  }, [open]);

  // 즐겨찾기 저장
  const saveFavorites = (newFavorites: Favorite[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newFavorites));
    setFavorites(newFavorites);
  };

  // 새 즐겨찾기 추가
  const handleAdd = () => {
    if (!newFavoriteText.trim()) return;

    if (favorites.length >= MAX_FAVORITES) {
      alert(`최대 ${MAX_FAVORITES}개까지 저장할 수 있습니다.`);
      return;
    }

    const newFavorite: Favorite = {
      id: Date.now().toString(),
      text: newFavoriteText.trim(),
      createdAt: Date.now(),
    };

    const updated = [newFavorite, ...favorites];
    saveFavorites(updated);
    setNewFavoriteText('');
    setIsAdding(false);
  };

  // 즐겨찾기 삭제
  const handleDelete = (id: string) => {
    if (confirm('이 항목을 삭제하시겠습니까?')) {
      const updated = favorites.filter(f => f.id !== id);
      saveFavorites(updated);
    }
  };

  // 즐겨찾기 선택
  const handleSelect = (text: string) => {
    onSelect(text);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
        aria-describedby="favorites-description"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Star className="size-6 text-yellow-500 fill-yellow-500" />
            나의 즐겨찾기
          </DialogTitle>
          <DialogDescription id="favorites-description" className="text-slate-600 text-sm mt-2">
            자주 겪는 상황을 저장해두고 빠르게 불러올 수 있습니다. (최대 {MAX_FAVORITES}개)
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {/* 새 항목 추가 */}
          {isAdding ? (
            <div className="bg-indigo-50 border-2 border-indigo-300 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-indigo-900">새 즐겨찾기 추가</p>
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setNewFavoriteText('');
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="size-5" />
                </button>
              </div>
              <Textarea
                value={newFavoriteText}
                onChange={(e) => setNewFavoriteText(e.target.value)}
                placeholder="내가 자주 겪는 상황을 적어주세요..."
                className="min-h-[100px] resize-none"
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleAdd}
                  disabled={!newFavoriteText.trim()}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                >
                  저장
                </Button>
                <Button
                  onClick={() => {
                    setIsAdding(false);
                    setNewFavoriteText('');
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  취소
                </Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={() => setIsAdding(true)}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 gap-2"
              disabled={favorites.length >= MAX_FAVORITES}
            >
              <Plus className="size-5" />
              새 즐겨찾기 추가
            </Button>
          )}

          {/* 즐겨찾기 목록 */}
          {favorites.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Star className="size-12 mx-auto mb-4 text-slate-300" />
              <p className="mb-2">아직 저장된 즐겨찾기가 없습니다.</p>
              <p className="text-sm">위 버튼을 눌러 자주 겪는 상황을 추가해보세요.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {favorites.map((favorite) => (
                <div
                  key={favorite.id}
                  className="bg-white border-2 border-slate-200 hover:border-indigo-300 rounded-lg p-4 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <Star className="size-5 text-yellow-500 fill-yellow-500 flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-800 mb-3 break-words">{favorite.text}</p>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleSelect(favorite.text)}
                          size="sm"
                          className="bg-indigo-600 hover:bg-indigo-700"
                        >
                          이 상황 사용하기
                        </Button>
                        <Button
                          onClick={() => handleDelete(favorite.id)}
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="size-4 mr-1" />
                          삭제
                        </Button>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">
                        {new Date(favorite.createdAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t pt-4">
          <Button onClick={onClose} variant="outline" className="w-full">
            닫기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}