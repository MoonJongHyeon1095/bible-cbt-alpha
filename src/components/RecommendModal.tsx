import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { ThumbsUp, MessageCircle } from 'lucide-react';
import { Textarea } from './ui/textarea';

interface Recommendation {
  id: string;
  timestamp: string;
  comment: string;
}

interface RecommendModalProps {
  open: boolean;
  onClose: () => void;
  onRecommend: () => void;
  recommendCount: number;
  hasRecommended: boolean;
}

export function RecommendModal({ open, onClose, onRecommend, recommendCount, hasRecommended }: RecommendModalProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    if (open) {
      loadRecommendations();
    }
  }, [open]);

  const loadRecommendations = () => {
    const saved = localStorage.getItem('cbt-recommendations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setRecommendations(parsed);
      } catch (e) {
        console.error('추천 로드 실패:', e);
      }
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-3xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200"
        aria-describedby="recommend-description"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl text-purple-900 flex items-center gap-2">
            <ThumbsUp className="size-6 text-purple-600" />
            사용자 추천 리뷰
          </DialogTitle>
          <DialogDescription id="recommend-description" className="text-purple-700">
            다른 사용자들이 남긴 추천 한마디를 확인해보세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {recommendations.length === 0 ? (
            <div className="text-center py-12 text-purple-600">
              <p className="text-lg mb-2">아직 추천이 없습니다.</p>
              <p className="text-sm">첫 번째 추천을 남겨보세요!</p>
            </div>
          ) : (
            <>
              <div className="bg-white/80 backdrop-blur-sm border-2 border-purple-300 rounded-xl p-4 mb-4">
                <p className="text-purple-900 text-center">
                  총 <span className="text-2xl font-bold text-purple-600">{recommendations.length}</span>명이 추천했습니다! 🎉
                </p>
              </div>
              
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-white/90 backdrop-blur-md border border-purple-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-gradient-to-br from-purple-400 to-pink-400 rounded-full p-2 flex-shrink-0">
                      <MessageCircle className="size-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-700 mb-2 leading-relaxed">"{rec.comment}"</p>
                      <p className="text-xs text-purple-600">{formatDate(rec.timestamp)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <Button 
            onClick={onClose} 
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
          >
            닫기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}