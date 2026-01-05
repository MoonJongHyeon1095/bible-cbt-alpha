import { AlertCircle, Heart, MessageSquare, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Textarea } from "../ui/textarea";

interface CommunityPost {
  id: string;
  content: string;
  timestamp: string;
  empathyCount: number;
  category: string;
}

export function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("일반");
  const [myEmpathies, setMyEmpathies] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadPosts();
    loadMyEmpathies();
  }, []);

  const loadPosts = () => {
    const saved = localStorage.getItem("community_posts");
    if (saved) {
      try {
        setPosts(JSON.parse(saved));
      } catch (e) {
        console.error("커뮤니티 글 로드 실패:", e);
      }
    }
  };

  const loadMyEmpathies = () => {
    const saved = localStorage.getItem("my_empathies");
    if (saved) {
      try {
        setMyEmpathies(new Set(JSON.parse(saved)));
      } catch (e) {
        console.error("공감 정보 로드 실패:", e);
      }
    }
  };

  const savePosts = (updatedPosts: CommunityPost[]) => {
    localStorage.setItem("community_posts", JSON.stringify(updatedPosts));
    setPosts(updatedPosts);
  };

  const saveMyEmpathies = (empathies: Set<string>) => {
    localStorage.setItem("my_empathies", JSON.stringify(Array.from(empathies)));
    setMyEmpathies(empathies);
  };

  const handleCreate = () => {
    if (!content.trim()) {
      toast.error("내용을 입력해주세요.");
      return;
    }

    const newPost: CommunityPost = {
      id: Date.now().toString(),
      content: content.trim(),
      timestamp: new Date().toISOString(),
      empathyCount: 0,
      category,
    };

    const updated = [newPost, ...posts];
    savePosts(updated);
    setContent("");
    setCategory("일반");
    setIsCreating(false);
  };

  const toggleEmpathy = (postId: string) => {
    const newEmpathies = new Set(myEmpathies);
    const updated = posts.map((post) => {
      if (post.id === postId) {
        if (myEmpathies.has(postId)) {
          newEmpathies.delete(postId);
          return { ...post, empathyCount: post.empathyCount - 1 };
        } else {
          newEmpathies.add(postId);
          return { ...post, empathyCount: post.empathyCount + 1 };
        }
      }
      return post;
    });

    savePosts(updated);
    saveMyEmpathies(newEmpathies);
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}일 전`;
    if (hours > 0) return `${hours}시간 전`;
    if (minutes > 0) return `${minutes}분 전`;
    return "방금 전";
  };

  const categories = ["일반", "불안", "우울", "관계", "감사", "기도제목"];

  return (
    <div className="max-w-[1000px] mx-auto px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-slate-900 mb-2 flex items-center gap-3">
            <MessageSquare className="size-8 text-green-600" />
            익명 커뮤니티
          </h1>
          <p className="text-slate-600">
            비슷한 경험을 나누고 공감을 나눠보세요.
          </p>
        </div>
        {!isCreating && (
          <Button
            onClick={() => setIsCreating(true)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            <Plus className="size-5 mr-2" />글 작성
          </Button>
        )}
      </div>

      {/* 안내 메시지 */}
      <Card className="p-4 mb-6 bg-yellow-50 border-yellow-200">
        <div className="flex gap-3">
          <AlertCircle className="size-5 text-yellow-700 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="mb-1">
              <strong>익명 커뮤니티 이용 안내:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>모든 글은 익명으로 게시됩니다.</li>
              <li>개인정보나 민감한 정보는 포함하지 마세요.</li>
              <li>서로 존중하고 공감하는 태도를 유지해주세요.</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* 글 작성 폼 */}
      {isCreating && (
        <Card className="p-6 mb-6 bg-green-50 border-2 border-green-200">
          <h3 className="text-lg text-slate-900 mb-4">
            익명으로 경험 공유하기
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-700 mb-2 block">
                카테고리
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      category === cat
                        ? "bg-green-600 text-white"
                        : "bg-white border border-green-300 text-green-700 hover:bg-green-50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-700 mb-2 block">내용</label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="당신의 경험이나 고민을 편하게 나눠주세요..."
                className="min-h-[150px] border-green-200"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleCreate}
                className="bg-green-600 hover:bg-green-700"
              >
                익명으로 게시
              </Button>
              <Button onClick={() => setIsCreating(false)} variant="outline">
                취소
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* 글 목록 */}
      {posts.length === 0 ? (
        <Card className="p-12 text-center">
          <MessageSquare className="size-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-lg mb-2">
            아직 게시된 글이 없습니다.
          </p>
          <p className="text-slate-400">첫 번째 글을 작성해보세요!</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card
              key={post.id}
              className="p-5 hover:shadow-md transition-shadow bg-white"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="bg-gradient-to-r from-green-400 to-emerald-400 rounded-full size-10 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm">익명</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      {post.category}
                    </span>
                    <span className="text-xs text-slate-400">
                      {formatDate(post.timestamp)}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-slate-700 mb-4 whitespace-pre-wrap leading-relaxed">
                {post.content}
              </p>

              <div className="flex items-center gap-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => toggleEmpathy(post.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    myEmpathies.has(post.id)
                      ? "bg-red-50 text-red-600"
                      : "bg-slate-50 text-slate-600 hover:bg-red-50 hover:text-red-600"
                  }`}
                >
                  <Heart
                    className={`size-5 ${
                      myEmpathies.has(post.id) ? "fill-current" : ""
                    }`}
                  />
                  <span className="text-sm">
                    {post.empathyCount > 0
                      ? `공감 ${post.empathyCount}`
                      : "공감하기"}
                  </span>
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
