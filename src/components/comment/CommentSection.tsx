// src/components/CommentSection.tsx
import { Loader2, Send, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ENV } from "../../config/env"; // 경로 프로젝트에 맞게 조정 (예: "../../config/env")
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Textarea } from "../ui/textarea";

interface Comment {
  id: string;
  rating: number;
  comment: string;
  timestamp: number;
  nickname?: string;
}

const API_BASE = ENV.API_BASE || ""; // same-origin이면 ""

export function CommentSection() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [nickname, setNickname] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  const fetchComments = async () => {
    try {
      setFetchLoading(true);

      const res = await fetch(`${API_BASE}/api/comments`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // (선택) 남용 방지용
          // "x-api-key": import.meta.env.VITE_APP_API_KEY,
        },
      });

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok) {
        console.error("댓글 불러오기 실패:", data);
        return;
      }

      setComments(Array.isArray(data?.comments) ? data.comments : []);
    } catch (error) {
      console.error("댓글 불러오기 오류:", error);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handleSubmit = async () => {
    const trimmed = comment.trim();
    const nick = nickname.trim() || "익명";

    if (rating < 1 || rating > 5) {
      alert("별점을 선택해주세요!");
      return;
    }
    if (!trimmed) {
      alert("댓글 내용을 입력해주세요!");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/api/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // (선택) 남용 방지용
          // "x-api-key": import.meta.env.VITE_APP_API_KEY,
        },
        body: JSON.stringify({
          rating,
          comment: trimmed,
          nickname: nick,
        }),
      });

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok) {
        const msg = data?.error || "댓글 등록에 실패했습니다.";
        alert(msg);
        console.error("댓글 제출 실패:", data);
        return;
      }

      // ✅ 성공: UI 초기화 + 목록 갱신
      setRating(0);
      setHoverRating(0);
      setComment("");
      setNickname("");

      await fetchComments();
      alert("댓글이 등록되었습니다! 감사합니다 🙏");
    } catch (error) {
      console.error("댓글 제출 오류:", error);
      alert("댓글 등록 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const averageRating = useMemo(() => {
    if (comments.length === 0) return "0.0";
    const avg =
      comments.reduce((sum, c) => sum + (Number(c.rating) || 0), 0) /
      comments.length;
    return avg.toFixed(1);
  }, [comments]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "방금 전";
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;

    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 space-y-6">
      {/* 통계 */}
      <div className="text-center">
        <div className="inline-flex items-center gap-4 bg-white/90 border border-slate-200 rounded-2xl px-8 py-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Star className="size-6 fill-yellow-400 text-yellow-400" />
            <span className="text-slate-900 text-2xl">{averageRating}</span>
          </div>
          <div className="h-8 w-px bg-slate-300"></div>
          <span className="text-slate-600">총 {comments.length}개의 후기</span>
        </div>
      </div>

      {/* 댓글 작성 폼 */}
      <Card className="bg-white/90 border-slate-200 shadow-sm p-6">
        <h3 className="text-slate-900 mb-4">후기 작성하기</h3>

        {/* 별점 선택 */}
        <div className="mb-4">
          <p className="text-slate-600 text-sm mb-2">별점을 선택해주세요</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-110"
                type="button"
              >
                <Star
                  className={`size-8 ${
                    star <= (hoverRating || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-slate-300"
                  }`}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 text-slate-600 flex items-center">
                {rating}점
              </span>
            )}
          </div>
        </div>

        {/* 닉네임 입력 */}
        <div className="mb-4">
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임 (선택사항, 미입력시 '익명')"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
            maxLength={30} // ✅ 서버 검증과 동일
          />
        </div>

        {/* 댓글 입력 */}
        <div className="mb-4">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="어떤 점이 좋았나요? 솔직한 후기를 남겨주세요 😊"
            className="min-h-[120px] bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 resize-none"
            maxLength={1000} // ✅ 서버 검증과 동일
          />
          <div className="text-right text-slate-500 text-sm mt-1">
            {comment.length}/1000
          </div>
        </div>

        {/* 제출 버튼 */}
        <Button
          onClick={handleSubmit}
          disabled={loading || rating === 0 || !comment.trim()}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              등록 중...
            </>
          ) : (
            <>
              <Send className="size-4" />
              후기 등록하기
            </>
          )}
        </Button>
      </Card>

      {/* 댓글 목록 */}
      <div className="space-y-4">
        <h3 className="text-slate-900 text-lg">후기 목록</h3>

        {fetchLoading ? (
          <Card className="bg-white/90 border-slate-200 shadow-sm p-8 text-center">
            <Loader2 className="size-8 animate-spin text-indigo-500 mx-auto mb-2" />
            <p className="text-slate-600">후기를 불러오는 중...</p>
          </Card>
        ) : comments.length === 0 ? (
          <Card className="bg-white/90 border-slate-200 shadow-sm p-8 text-center">
            <p className="text-slate-600">아직 등록된 후기가 없습니다.</p>
            <p className="text-slate-500 text-sm mt-2">
              첫 번째 후기를 남겨주세요! 🎉
            </p>
          </Card>
        ) : (
          comments.map((c) => (
            <Card
              key={c.id}
              className="bg-white/90 border-slate-200 shadow-sm p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-slate-900">
                      {c.nickname || "익명"}
                    </span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`size-4 ${
                            i < (Number(c.rating) || 0)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-slate-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-500 text-sm">
                    {formatDate(c.timestamp)}
                  </p>
                </div>
              </div>
              <p className="text-slate-700 whitespace-pre-wrap">{c.comment}</p>
            </Card>
          ))
        )}
      </div>

      {/* 면책 조항 */}
      <div className="text-center mt-8">
        <p className="text-slate-400 text-xs">
          이 치료기법은 일반적인 인지행동치료 원리를 기반으로 AI를 활용하여
          생성되었음을 알려드립니다.
        </p>
      </div>
    </div>
  );
}
