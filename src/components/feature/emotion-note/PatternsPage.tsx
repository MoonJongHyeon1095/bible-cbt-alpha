import type { User } from "@supabase/supabase-js";
import {
  AlertCircle,
  Edit2,
  HeartPulse,
  Lightbulb,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../../../lib/supabase/client";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";

interface Pattern {
  id: string;
  title: string;
  trigger: string;
  automaticThought: string;
  emotion: string;
  behavior: string;
  alternative: string;
  timestamp: string;
  frequency: number;
}

interface PatternsPageProps {
  user: User | null;
}

export function PatternsPage({ user }: PatternsPageProps) {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [trigger, setTrigger] = useState("");
  const [automaticThought, setAutomaticThought] = useState("");
  const [emotion, setEmotion] = useState("");
  const [behavior, setBehavior] = useState("");
  const [alternative, setAlternative] = useState("");
  const titleRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    loadPatterns();
  }, [user]);

  useEffect(() => {
    if (isCreating && editingId && titleRef.current) {
      titleRef.current.focus();
    }
  }, [isCreating, editingId]);

  const loadPatterns = async () => {
    setLoading(true);

    // 로그인 상태: Supabase에서 로드
    if (user) {
      try {
        const { data, error } = await supabase
          .from("emotion_notes")
          .select(
            "id, title, trigger_text, automatic_thought, emotion, behavior, alternative, frequency, created_at"
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const mapped =
          data?.map((row) => ({
            id: String(row.id),
            title: row.title ?? "",
            trigger: row.trigger_text ?? "",
            automaticThought: row.automatic_thought ?? "",
            emotion: row.emotion ?? "",
            behavior: row.behavior ?? "",
            alternative: row.alternative ?? "",
            frequency: Number(row.frequency) || 1,
            timestamp: row.created_at ?? "",
          })) ?? [];

        setPatterns(mapped);
        return;
      } catch (e) {
        console.error("패턴 로드 실패:", e);
        alert("감정 노트를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    }

    // 비로그인: 로컬 저장소
    try {
      const saved = localStorage.getItem("cbt_patterns");
      setPatterns(saved ? JSON.parse(saved) : []);
    } catch (e) {
      console.error("패턴 로드 실패:", e);
      setPatterns([]);
    } finally {
      setLoading(false);
    }
  };

  const savePatternsLocally = (updatedPatterns: Pattern[]) => {
    localStorage.setItem("cbt_patterns", JSON.stringify(updatedPatterns));
    setPatterns(updatedPatterns);
  };

  const handleCreate = async () => {
    if (!title.trim() || !trigger.trim()) {
      alert("제목과 트리거를 입력해주세요.");
      return;
    }

    // 로그인 상태: Supabase에 저장
    if (user) {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("emotion_notes")
          .insert({
            user_id: user.id,
            title: title.trim(),
            trigger_text: trigger.trim(),
            automatic_thought: automaticThought.trim(),
            emotion: emotion.trim(),
            behavior: behavior.trim(),
            alternative: alternative.trim(),
          })
          .select(
            "id, title, trigger_text, automatic_thought, emotion, behavior, alternative, frequency, created_at"
          )
          .single();

        if (error) throw error;
        if (data) {
          const newPattern: Pattern = {
            id: String(data.id),
            title: data.title ?? "",
            trigger: data.trigger_text ?? "",
            automaticThought: data.automatic_thought ?? "",
            emotion: data.emotion ?? "",
            behavior: data.behavior ?? "",
            alternative: data.alternative ?? "",
            frequency: Number(data.frequency) || 1,
            timestamp: data.created_at ?? new Date().toISOString(),
          };
          setPatterns((prev) => [newPattern, ...prev]);
        }
      } catch (e) {
        console.error("패턴 저장 실패:", e);
        alert("감정 노트를 저장하지 못했습니다.");
        return;
      } finally {
        setLoading(false);
        resetForm();
      }
      return;
    }

    const newPattern: Pattern = {
      id: Date.now().toString(),
      title: title.trim(),
      trigger: trigger.trim(),
      automaticThought: automaticThought.trim(),
      emotion: emotion.trim(),
      behavior: behavior.trim(),
      alternative: alternative.trim(),
      timestamp: new Date().toISOString(),
      frequency: 1,
    };

    const updated = [newPattern, ...patterns];
    savePatternsLocally(updated);
    resetForm();
  };

  const handleUpdate = async (id: string) => {
    if (!title.trim() || !trigger.trim()) {
      alert("제목과 트리거를 입력해주세요.");
      return;
    }

    // 로그인 상태: Supabase 업데이트
    if (user) {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("emotion_notes")
          .update({
            title: title.trim(),
            trigger_text: trigger.trim(),
            automatic_thought: automaticThought.trim(),
            emotion: emotion.trim(),
            behavior: behavior.trim(),
            alternative: alternative.trim(),
          })
          .eq("id", id)
          .eq("user_id", user.id)
          .select(
            "id, title, trigger_text, automatic_thought, emotion, behavior, alternative, frequency, created_at"
          )
          .single();

        if (error) throw error;
        if (data) {
          const updated = patterns.map((pattern) =>
            pattern.id === id
              ? {
                  id: String(data.id),
                  title: data.title ?? "",
                  trigger: data.trigger_text ?? "",
                  automaticThought: data.automatic_thought ?? "",
                  emotion: data.emotion ?? "",
                  behavior: data.behavior ?? "",
                  alternative: data.alternative ?? "",
                  frequency: Number(data.frequency) || 1,
                  timestamp: data.created_at ?? pattern.timestamp,
                }
              : pattern
          );
          setPatterns(updated);
        }
      } catch (e) {
        console.error("패턴 수정 실패:", e);
        alert("감정 노트를 수정하지 못했습니다.");
        return;
      } finally {
        setLoading(false);
        resetForm();
      }
      return;
    }

    const updated = patterns.map((pattern) =>
      pattern.id === id
        ? {
            ...pattern,
            title: title.trim(),
            trigger: trigger.trim(),
            automaticThought: automaticThought.trim(),
            emotion: emotion.trim(),
            behavior: behavior.trim(),
            alternative: alternative.trim(),
          }
        : pattern
    );

    savePatternsLocally(updated);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("이 패턴을 삭제하시겠습니까?")) return;

    if (user) {
      try {
        setLoading(true);
        const { error } = await supabase
          .from("emotion_notes")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);
        if (error) throw error;
      } catch (e) {
        console.error("패턴 삭제 실패:", e);
        alert("감정 노트를 삭제하지 못했습니다.");
        return;
      } finally {
        setLoading(false);
      }
    }

    const updated = patterns.filter((pattern) => pattern.id !== id);
    if (user) {
      setPatterns(updated);
    } else {
      savePatternsLocally(updated);
    }
  };

  const incrementFrequency = async (id: string) => {
    const target = patterns.find((p) => p.id === id);
    if (!target) return;

    if (user) {
      try {
        setLoading(true);
        const nextFrequency = (Number(target.frequency) || 1) + 1;
        const { data, error } = await supabase
          .from("emotion_notes")
          .update({ frequency: nextFrequency })
          .eq("id", id)
          .eq("user_id", user.id)
          .select(
            "id, title, trigger_text, automatic_thought, emotion, behavior, alternative, frequency, created_at"
          )
          .single();

        if (error) throw error;
        if (data) {
          setPatterns((prev) =>
            prev.map((pattern) =>
              pattern.id === id
                ? {
                    id: String(data.id),
                    title: data.title ?? "",
                    trigger: data.trigger_text ?? "",
                    automaticThought: data.automatic_thought ?? "",
                    emotion: data.emotion ?? "",
                    behavior: data.behavior ?? "",
                    alternative: data.alternative ?? "",
                    frequency: Number(data.frequency) || nextFrequency,
                    timestamp: data.created_at ?? pattern.timestamp,
                  }
                : pattern
            )
          );
        }
      } catch (e) {
        console.error("발생 횟수 증가 실패:", e);
        alert("발생 횟수를 업데이트하지 못했습니다.");
      } finally {
        setLoading(false);
      }
      return;
    }

    const updated = patterns.map((pattern) =>
      pattern.id === id
        ? { ...pattern, frequency: pattern.frequency + 1 }
        : pattern
    );
    savePatternsLocally(updated);
  };

  const handleEdit = (pattern: Pattern) => {
    setEditingId(pattern.id);
    setTitle(pattern.title);
    setTrigger(pattern.trigger);
    setAutomaticThought(pattern.automaticThought);
    setEmotion(pattern.emotion);
    setBehavior(pattern.behavior);
    setAlternative(pattern.alternative);
    setIsCreating(true);
  };

  const resetForm = () => {
    setIsCreating(false);
    setEditingId(null);
    setTitle("");
    setTrigger("");
    setAutomaticThought("");
    setEmotion("");
    setBehavior("");
    setAlternative("");
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // 가장 빈번한 패턴 정렬
  const sortedPatterns = [...patterns].sort(
    (a, b) => b.frequency - a.frequency
  );

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-slate-900 mb-2 flex items-center gap-3">
            <HeartPulse className="size-8 text-indigo-600" />
            감정 노트
          </h1>
          <p className="text-slate-600">반복되는 감정 패턴을 기록하세요.</p>
        </div>
        {!isCreating && (
          <Button
            onClick={() => setIsCreating(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            <Plus className="size-5 mr-2" />새 감정패턴 추가
          </Button>
        )}
      </div>

      {/* 작성/수정 폼 */}
      {isCreating && (
        <Card className="p-6 mb-6 bg-indigo-50 border-2 border-indigo-200">
          <h3 className="text-lg text-slate-900 mb-4">
            {editingId ? "감정패턴 수정" : "새 감정패턴 추가"}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-700 mb-2 block flex items-center gap-2">
                <AlertCircle className="size-4" />
                감정패턴 제목 (간단하게)
              </label>
              <Input
                ref={titleRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 사람들 앞에서 발표할 때"
                className="border-indigo-200"
              />
            </div>

            <div>
              <label className="text-sm text-slate-700 mb-2 block">
                🎯 트리거 (촉발 상황)
              </label>
              <Input
                value={trigger}
                onChange={(e) => setTrigger(e.target.value)}
                placeholder="어떤 상황에서 이 패턴이 나타나나요?"
                className="border-indigo-200"
              />
            </div>

            <div>
              <label className="text-sm text-slate-700 mb-2 block">
                💭 자동적 사고
              </label>
              <Textarea
                value={automaticThought}
                onChange={(e) => setAutomaticThought(e.target.value)}
                placeholder="그 상황에서 자동으로 떠오르는 생각은?"
                className="min-h-[80px] border-indigo-200"
              />
            </div>

            <div>
              <label className="text-sm text-slate-700 mb-2 block">
                😟 느끼는 감정
              </label>
              <Input
                value={emotion}
                onChange={(e) => setEmotion(e.target.value)}
                placeholder="어떤 감정을 느끼나요?"
                className="border-indigo-200"
              />
            </div>

            <div>
              <label className="text-sm text-slate-700 mb-2 block">
                🏃 행동 반응
              </label>
              <Textarea
                value={behavior}
                onChange={(e) => setBehavior(e.target.value)}
                placeholder="그 감정 때문에 어떻게 행동하나요?"
                className="min-h-[80px] border-indigo-200"
              />
            </div>

            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <label className="text-sm text-green-800 mb-2 block flex items-center gap-2">
                <Lightbulb className="size-4" />
                대안적 접근 (더 건강한 방법)
              </label>
              <Textarea
                value={alternative}
                onChange={(e) => setAlternative(e.target.value)}
                placeholder="이 상황을 더 건강하게 다루는 방법은?"
                className="min-h-[100px] border-green-300 bg-white"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() =>
                  editingId ? handleUpdate(editingId) : handleCreate()
                }
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Save className="size-4 mr-2" />
                {editingId ? "수정 완료" : "저장"}
              </Button>
              <Button onClick={resetForm} variant="outline">
                <X className="size-4 mr-2" />
                취소
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* 패턴 통계 */}
      {patterns.length > 0 && (
        <Card className="p-6 mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <h3 className="text-lg text-slate-900 mb-3 flex items-center gap-2">
            📊 패턴 요약
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-indigo-200">
              <p className="text-sm text-slate-600 mb-1">총 패턴 수</p>
              <p className="text-3xl text-indigo-700">{patterns.length}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <p className="text-sm text-slate-600 mb-1">가장 빈번한 패턴</p>
              <p className="text-lg text-purple-700 truncate">
                {sortedPatterns[0]?.title || "-"}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-pink-200">
              <p className="text-sm text-slate-600 mb-1">총 발생 횟수</p>
              <p className="text-3xl text-pink-700">
                {patterns.reduce((sum, p) => sum + p.frequency, 0)}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* 패턴 목록 */}
      {loading ? (
        <Card className="p-12 text-center">
          <HeartPulse className="size-16 text-slate-300 mx-auto mb-4 animate-pulse" />
          <p className="text-slate-500 text-lg mb-2">
            감정 노트를 불러오는 중입니다...
          </p>
        </Card>
      ) : patterns.length === 0 ? (
        <Card className="p-12 text-center">
          <HeartPulse className="size-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-lg mb-2">
            아직 저장된 패턴이 없습니다.
          </p>
          <p className="text-slate-400">반복되는 감정 패턴을 기록해보세요.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedPatterns.map((pattern) => (
            <Card
              key={pattern.id}
              className="p-6 hover:shadow-lg transition-shadow bg-white border-indigo-100"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl text-slate-900 mb-2 flex items-center gap-2">
                    {pattern.title}
                    <span className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
                      {pattern.frequency}회 발생
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    최초 기록: {formatDate(pattern.timestamp)}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => incrementFrequency(pattern.id)}
                    className="text-green-600 hover:text-green-700 px-3 py-1 bg-green-50 rounded text-sm"
                    disabled={loading}
                    title="발생 횟수 +1"
                  >
                    +1회
                  </button>
                  <button
                    onClick={() => handleEdit(pattern)}
                    className="text-indigo-600 hover:text-indigo-700 p-1"
                    title="수정"
                  >
                    <Edit2 className="size-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(pattern.id)}
                    className="text-red-600 hover:text-red-700 p-1"
                    title="삭제"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">🎯 트리거</p>
                    <p className="text-slate-700 bg-slate-50 p-2 rounded">
                      {pattern.trigger}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">
                      💭 자동적 사고
                    </p>
                    <p className="text-slate-700 bg-slate-50 p-2 rounded whitespace-pre-wrap">
                      {pattern.automaticThought || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">😟 감정</p>
                    <p className="text-slate-700 bg-slate-50 p-2 rounded">
                      {pattern.emotion || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">🏃 행동</p>
                    <p className="text-slate-700 bg-slate-50 p-2 rounded whitespace-pre-wrap">
                      {pattern.behavior || "-"}
                    </p>
                  </div>
                </div>

                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                  <p className="text-xs text-green-700 mb-2 flex items-center gap-1">
                    <Lightbulb className="size-4" /> 대안적 접근
                  </p>
                  <p className="text-slate-700 whitespace-pre-wrap">
                    {pattern.alternative || "아직 대안이 작성되지 않았습니다."}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
