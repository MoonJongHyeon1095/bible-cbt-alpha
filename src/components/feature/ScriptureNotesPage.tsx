import { BookMarked, Edit2, Plus, Save, Star, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

interface ScriptureNote {
  id: string;
  reference: string;
  verse: string;
  reflection: string;
  timestamp: string;
  favorite: boolean;
}

export function ScriptureNotesPage() {
  const [notes, setNotes] = useState<ScriptureNote[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [reference, setReference] = useState("");
  const [verse, setVerse] = useState("");
  const [reflection, setReflection] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = () => {
    const saved = localStorage.getItem("scripture_notes");
    if (saved) {
      try {
        setNotes(JSON.parse(saved));
      } catch (e) {
        console.error("말씀 노트 로드 실패:", e);
      }
    }
  };

  const saveNotes = (updatedNotes: ScriptureNote[]) => {
    localStorage.setItem("scripture_notes", JSON.stringify(updatedNotes));
    setNotes(updatedNotes);
  };

  const handleCreate = () => {
    if (!reference.trim() || !verse.trim()) {
      alert("성경 구절과 말씀을 입력해주세요.");
      return;
    }

    const newNote: ScriptureNote = {
      id: Date.now().toString(),
      reference: reference.trim(),
      verse: verse.trim(),
      reflection: reflection.trim(),
      timestamp: new Date().toISOString(),
      favorite: false,
    };

    const updated = [newNote, ...notes];
    saveNotes(updated);
    resetForm();
  };

  const handleUpdate = (id: string) => {
    if (!reference.trim() || !verse.trim()) {
      alert("성경 구절과 말씀을 입력해주세요.");
      return;
    }

    const updated = notes.map((note) =>
      note.id === id
        ? {
            ...note,
            reference: reference.trim(),
            verse: verse.trim(),
            reflection: reflection.trim(),
          }
        : note
    );

    saveNotes(updated);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (!confirm("이 말씀 노트를 삭제하시겠습니까?")) return;
    const updated = notes.filter((note) => note.id !== id);
    saveNotes(updated);
  };

  const toggleFavorite = (id: string) => {
    const updated = notes.map((note) =>
      note.id === id ? { ...note, favorite: !note.favorite } : note
    );
    saveNotes(updated);
  };

  const handleEdit = (note: ScriptureNote) => {
    setEditingId(note.id);
    setReference(note.reference);
    setVerse(note.verse);
    setReflection(note.reflection);
    setIsCreating(true);
  };

  const resetForm = () => {
    setIsCreating(false);
    setEditingId(null);
    setReference("");
    setVerse("");
    setReflection("");
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const displayedNotes = showFavoritesOnly
    ? notes.filter((n) => n.favorite)
    : notes;

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-slate-900 mb-2 flex items-center gap-3">
            <BookMarked className="size-8 text-amber-600" />
            말씀 노트
          </h1>
          <p className="text-slate-600">은혜받은 말씀과 묵상을 기록하세요.</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            variant={showFavoritesOnly ? "default" : "outline"}
            className={
              showFavoritesOnly
                ? "bg-yellow-600 hover:bg-yellow-700"
                : "border-yellow-300 text-yellow-700 hover:bg-yellow-50"
            }
          >
            <Star className="size-5 mr-2" />
            즐겨찾기만
          </Button>
          {!isCreating && (
            <Button
              onClick={() => setIsCreating(true)}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
            >
              <Plus className="size-5 mr-2" />새 말씀 노트
            </Button>
          )}
        </div>
      </div>

      {/* 작성/수정 폼 */}
      {isCreating && (
        <Card className="p-6 mb-6 bg-amber-50 border-2 border-amber-200">
          <h3 className="text-lg text-slate-900 mb-4">
            {editingId ? "말씀 노트 수정" : "새 말씀 노트 작성"}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-700 mb-2 block">
                성경 구절
              </label>
              <Input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="예: 요한복음 3:16, 시편 23:1"
                className="border-amber-200"
              />
            </div>

            <div>
              <label className="text-sm text-slate-700 mb-2 block">
                말씀 본문
              </label>
              <Textarea
                value={verse}
                onChange={(e) => setVerse(e.target.value)}
                placeholder="성경 말씀 본문을 입력하세요..."
                className="min-h-[120px] border-amber-200"
              />
            </div>

            <div>
              <label className="text-sm text-slate-700 mb-2 block">
                묵상 / 적용 (선택사항)
              </label>
              <Textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="이 말씀을 통해 깨달은 점, 적용하고 싶은 내용을 자유롭게 적어보세요..."
                className="min-h-[150px] border-amber-200"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() =>
                  editingId ? handleUpdate(editingId) : handleCreate()
                }
                className="bg-amber-600 hover:bg-amber-700"
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

      {/* 노트 목록 */}
      {displayedNotes.length === 0 ? (
        <Card className="p-12 text-center">
          <BookMarked className="size-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-lg mb-2">
            {showFavoritesOnly
              ? "즐겨찾기한 말씀이 없습니다."
              : "아직 말씀 노트가 없습니다."}
          </p>
          <p className="text-slate-400">
            {showFavoritesOnly
              ? "별표를 클릭하여 말씀을 즐겨찾기해보세요."
              : "첫 번째 말씀 노트를 작성해보세요."}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {displayedNotes.map((note) => (
            <Card
              key={note.id}
              className="p-6 hover:shadow-lg transition-shadow bg-white border-amber-100"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-1">
                  <button
                    onClick={() => toggleFavorite(note.id)}
                    className={`${
                      note.favorite ? "text-yellow-500" : "text-slate-300"
                    } hover:text-yellow-600 transition-colors`}
                    title={note.favorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
                  >
                    <Star
                      className={`size-6 ${
                        note.favorite ? "fill-current" : ""
                      }`}
                    />
                  </button>
                  <h3 className="text-xl text-amber-900">{note.reference}</h3>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(note)}
                    className="text-amber-600 hover:text-amber-700 p-1"
                    title="수정"
                  >
                    <Edit2 className="size-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="text-red-600 hover:text-red-700 p-1"
                    title="삭제"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg mb-3">
                <p className="text-slate-700 italic leading-relaxed whitespace-pre-wrap">
                  "{note.verse}"
                </p>
              </div>

              {note.reflection && (
                <div className="bg-slate-50 p-4 rounded-lg mb-3">
                  <p className="text-sm text-slate-600 mb-1">💭 묵상 / 적용:</p>
                  <p className="text-slate-700 whitespace-pre-wrap">
                    {note.reflection}
                  </p>
                </div>
              )}

              <p className="text-xs text-slate-400">
                {formatDate(note.timestamp)}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
