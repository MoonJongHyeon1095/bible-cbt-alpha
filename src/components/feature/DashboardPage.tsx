import type { User } from "@supabase/supabase-js";
import { Brain, Calendar, Heart, LayoutDashboard, Target } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { supabase } from "../../lib/supabase/client";
import type { SessionHistory } from "../../types/sessionHistory";
import { normalizeSelectedCognitiveErrors } from "../../lib/normalizeSelectedCognitiveErrors";
import { Card } from "../ui/card";
import { HistoryModal } from "./HistoryModal";

export function DashboardPage({ user }: { user: User | null }) {
  const [histories, setHistories] = useState<SessionHistory[]>([]);
  const [emotionTrends, setEmotionTrends] = useState<any[]>([]);
  const [topEmotions, setTopEmotions] = useState<any[]>([]);
  const [cognitiveErrorStats, setCognitiveErrorStats] = useState<any[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = () => {
    if (user) {
      void loadFromSupabase();
      return;
    }

    const saved = localStorage.getItem("cbt_history");
    if (!saved) return;

    try {
      const parsed = (JSON.parse(saved) as SessionHistory[]).map(
        (item: any) => ({
          ...item,
          selectedCognitiveErrors: normalizeSelectedCognitiveErrors(
            item.selectedCognitiveErrors
          ),
          userInput: item.userInput ?? "",
          selectedAlternativeThought: item.selectedAlternativeThought ?? "",
          positiveReframes: item.positiveReframes ?? {},
          bibleVerse: item.bibleVerse ?? null,
        })
      );
      setHistories(parsed);
      processEmotionTrends(parsed);
      processTopEmotions(parsed);
      processCognitiveErrors(parsed);
    } catch (e) {
      console.error("데이터 로드 실패:", e);
    }
  };

  const loadFromSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from("session_history")
        .select(
          "id, timestamp, user_input, emotion_thought_pairs, selected_cognitive_errors, selected_alternative_thought, positive_reframes, bible_verse"
        )
        .eq("user_id", user?.id)
        .order("timestamp", { ascending: false })
        .limit(200);

      if (error) throw error;

      const mapped: SessionHistory[] =
        data?.map((row: any) => ({
          id: String(row.id),
          timestamp: row.timestamp,
          emotionThoughtPairs: Array.isArray(row.emotion_thought_pairs)
            ? row.emotion_thought_pairs.map((p: any) => ({
                emotion: p.emotion,
                intensity: typeof p.intensity === "number" ? p.intensity : null,
                thought: p.thought,
              }))
            : [],
          selectedCognitiveErrors: normalizeSelectedCognitiveErrors(
            row.selected_cognitive_errors
          ),
          userInput: row.user_input ?? "",
          selectedAlternativeThought: row.selected_alternative_thought ?? "",
          positiveReframes:
            (row.positive_reframes as Record<string, string>) ?? {},
          bibleVerse: row.bible_verse ?? null,
        })) ?? [];

      setHistories(mapped);
      processEmotionTrends(mapped);
      processTopEmotions(mapped);
      processCognitiveErrors(mapped);
    } catch (e) {
      console.error("Supabase 데이터 로드 실패:", e);
    }
  };

  const processEmotionTrends = (data: SessionHistory[]) => {
    // 최근 10개 세션 중 강도 정보가 있는 것만 평균 계산
    const recentSessions = data.slice(0, 10).reverse();
    const trends: any[] = [];

    recentSessions.forEach((session) => {
      const pairsWithIntensity = session.emotionThoughtPairs.filter(
        (p) => typeof p.intensity === "number"
      );
      if (pairsWithIntensity.length === 0) return;

      const avgIntensity =
        pairsWithIntensity.reduce(
          (sum, pair) => sum + (pair.intensity as number),
          0
        ) / pairsWithIntensity.length;

      const date = new Date(session.timestamp);
      trends.push({
        session: `세션 ${trends.length + 1}`,
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        평균강도: Math.round(avgIntensity),
      });
    });

    setEmotionTrends(trends);
  };

  const processTopEmotions = (data: SessionHistory[]) => {
    const emotionCount: { [key: string]: number } = {};

    data.forEach((session) => {
      session.emotionThoughtPairs.forEach((pair) => {
        emotionCount[pair.emotion] = (emotionCount[pair.emotion] || 0) + 1;
      });
    });

    const sorted = Object.entries(emotionCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    setTopEmotions(sorted);
  };

  const processCognitiveErrors = (data: SessionHistory[]) => {
    const errorCount: { [key: string]: number } = {};

    data.forEach((session) => {
      session.selectedCognitiveErrors.forEach((error) => {
        const shortName = error.title.split(":")[0].trim();
        errorCount[shortName] = (errorCount[shortName] || 0) + 1;
      });
    });

    const sorted = Object.entries(errorCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setCognitiveErrorStats(sorted);
  };

  const COLORS = ["#9333ea", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"];

  return (
    <div className="max-w-[1800px] mx-auto px-8 py-8">
      <div className="mb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl text-slate-900 mb-2 flex items-center gap-3">
              <LayoutDashboard className="size-8 text-purple-600" />
              나의 감정 대시보드
            </h1>
            <p className="text-slate-600">
              당신의 감정 여정을 한눈에 확인하세요.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowHistoryModal(true)}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700"
          >
            세션 기록 보기
          </button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-700 text-sm mb-1">총 세션 수</p>
              <p className="text-3xl text-purple-900">{histories.length}</p>
            </div>
            <div className="bg-purple-600 rounded-full p-3">
              <Brain className="size-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-700 text-sm mb-1">기록된 감정</p>
              <p className="text-3xl text-pink-900">
                {histories.reduce(
                  (sum, h) => sum + h.emotionThoughtPairs.length,
                  0
                )}
              </p>
            </div>
            <div className="bg-pink-600 rounded-full p-3">
              <Heart className="size-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-700 text-sm mb-1">발견된 인지오류</p>
              <p className="text-3xl text-amber-900">
                {histories.reduce(
                  (sum, h) => sum + h.selectedCognitiveErrors.length,
                  0
                )}
              </p>
            </div>
            <div className="bg-amber-600 rounded-full p-3">
              <Target className="size-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-700 text-sm mb-1">활동 일수</p>
              <p className="text-3xl text-indigo-900">
                {
                  new Set(
                    histories.map((h) => new Date(h.timestamp).toDateString())
                  ).size
                }
              </p>
            </div>
            <div className="bg-indigo-600 rounded-full p-3">
              <Calendar className="size-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {histories.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-slate-500 text-lg mb-4">아직 데이터가 없습니다.</p>
          <p className="text-slate-400">
            마음생각고쳐쓰기를 완료하면 통계가 표시됩니다.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 감정 강도 추이 */}
          <Card className="p-6">
            <h3 className="text-lg text-slate-900 mb-4">
              📈 감정 강도 추이 (최근 10개 세션)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={emotionTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" />
                <YAxis stroke="#64748b" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="평균강도"
                  stroke="#9333ea"
                  strokeWidth={3}
                  dot={{ fill: "#9333ea", r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* 가장 많이 느낀 감정 */}
          <Card className="p-6">
            <h3 className="text-lg text-slate-900 mb-4">
              💭 가장 많이 느낀 감정 Top 5
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={topEmotions}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} (${value})`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {topEmotions.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* 인지오류 분석 */}
          <Card className="p-6 lg:col-span-2">
            <h3 className="text-lg text-slate-900 mb-4">
              ⚠️ 자주 나타나는 인지오류 Top 5
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cognitiveErrorStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="count"
                  fill="#ec4899"
                  name="발생 횟수"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* 인사이트 카드 */}
          <Card className="p-6 lg:col-span-2 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <h3 className="text-lg text-slate-900 mb-3 flex items-center gap-2">
              💡 나를 위한 인사이트
            </h3>
            <div className="space-y-3">
              {topEmotions.length > 0 && (
                <p className="text-slate-700">
                  • 당신은 주로{" "}
                  <strong className="text-purple-700">
                    {topEmotions[0].name}
                  </strong>{" "}
                  감정을 경험하고 있습니다.
                </p>
              )}
              {cognitiveErrorStats.length > 0 && (
                <p className="text-slate-700">
                  •{" "}
                  <strong className="text-pink-700">
                    {cognitiveErrorStats[0].name}
                  </strong>{" "}
                  패턴이 가장 자주 나타납니다. 이 부분에 주의를 기울여보세요.
                </p>
              )}
              {emotionTrends.length >= 2 && (
                <p className="text-slate-700">
                  • 최근 감정 강도가{" "}
                  {emotionTrends[emotionTrends.length - 1].평균강도 <
                  emotionTrends[0].평균강도 ? (
                    <strong className="text-green-700">
                      감소하고 있습니다! 좋은 진전이에요. 👏
                    </strong>
                  ) : (
                    <strong className="text-amber-700">
                      증가하는 경향이 있습니다. 더 자주 돌아보세요.
                    </strong>
                  )}
                </p>
              )}
              <p className="text-slate-700">
                • 총{" "}
                <strong className="text-indigo-700">
                  {histories.length}번
                </strong>
                의 세션을 완료했습니다. 꾸준한 자기 성찰이 변화를 만듭니다! 🌟
              </p>
            </div>
          </Card>
        </div>
      )}

      <HistoryModal
        open={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        user={user}
      />
    </div>
  );
}
