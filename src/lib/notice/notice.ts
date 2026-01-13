// src/lib/notice/notice.ts
export type NoticeLevel = "info" | "warning" | "critical";

export type NoticeItem = {
  id: string; // 사용자가 “다시 안 보기” 눌렀을 때 기억하는 키
  title: string;
  body: string;
  level: NoticeLevel;
  startAt?: string; // 공지 노출 기간
  endAt?: string; // 공지 노출 기간
  minAppVersion?: string; // 특정 버전 이상/이하 조건 걸고 싶을 때
  force?: boolean; // 강제 공지(닫아도 계속 띄우기 같은 거)
  link?: string; // 공지에서 “자세히 보기” 눌렀을 때 열릴 URL
};

export type NoticePayload = {
  updatedAt: string;
  items: NoticeItem[];
};

const CACHE_KEY = "notice_cache_v1";
const DISMISSED_KEY = "notice_dismissed_v1";
const DISMISSED_TODAY_KEY = "notice_dismissed_today_v1";

// 너의 gist raw URL
const NOTICE_URL = import.meta.env.VITE_NOTICE_URL as string | undefined;

// 앱 버전(원하면 빌드 때 주입)
const APP_VERSION = import.meta.env.VITE_APP_VERSION as string | undefined;

function nowMs() {
  return Date.now();
}

function isWithinWindow(n: NoticeItem) {
  const t = nowMs();
  const start = n.startAt ? Date.parse(n.startAt) : -Infinity;
  const end = n.endAt ? Date.parse(n.endAt) : Infinity;
  return t >= start && t <= end;
}

// 버전 파싱 및 비교
function gteVersion(a?: string, b?: string) {
  if (!a || !b) return true;
  const pa = a.split(".").map((x) => parseInt(x, 10) || 0);
  const pb = b.split(".").map((x) => parseInt(x, 10) || 0);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] ?? 0) > (pb[i] ?? 0)) return true;
    if ((pa[i] ?? 0) < (pb[i] ?? 0)) return false;
  }
  return true;
}

// “다시 안 보기” 기억
export function getDismissedSet(): Set<string> {
  try {
    const arr = JSON.parse(localStorage.getItem(DISMISSED_KEY) || "[]");
    return new Set<string>(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

//“다시 안 보기” 기억
export function dismissNotice(id: string) {
  const s = getDismissedSet();
  s.add(id);
  localStorage.setItem(DISMISSED_KEY, JSON.stringify([...s]));
}

function todayKey() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function dismissNoticeToday(id: string) {
  try {
    const raw = localStorage.getItem(DISMISSED_TODAY_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    parsed[id] = todayKey();
    localStorage.setItem(DISMISSED_TODAY_KEY, JSON.stringify(parsed));
  } catch {
    // ignore
  }
}

function isDismissedToday(id: string) {
  try {
    const raw = localStorage.getItem(DISMISSED_TODAY_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as Record<string, string>;
    return parsed[id] === todayKey();
  } catch {
    return false;
  }
}

// 원격 공지 로드 + 실패 시 캐시 fallback
export async function loadNotices(): Promise<NoticePayload | null> {
  if (!NOTICE_URL) return null;

  // 1) 네트워크 우선
  try {
    const res = await fetch(NOTICE_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`notice fetch failed: ${res.status}`);
    const data = (await res.json()) as NoticePayload;
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    return data;
  } catch {
    // 2) 실패하면 캐시 사용
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? (JSON.parse(cached) as NoticePayload) : null;
    } catch {
      return null;
    }
  }
}

// 지금 보여줄 공지 1개 선택(기간/버전/우선순위/force/닫힘 여부)
export function pickActiveNotice(payload: NoticePayload | null): NoticeItem | null {
  if (!payload?.items?.length) return null;

  const dismissed = getDismissedSet();

  // 우선순위: critical > warning > info, 그리고 force 우선
  const rank = (l: NoticeLevel) => (l === "critical" ? 3 : l === "warning" ? 2 : 1);

  const candidates = payload.items
    .filter(isWithinWindow)
    .filter((n) => !n.minAppVersion || gteVersion(APP_VERSION, n.minAppVersion))
    .sort((a, b) => (rank(b.level) - rank(a.level)) || (Number(!!b.force) - Number(!!a.force)));

  // force면 dismissed 무시하고 계속 띄움
  const forceOne = candidates.find((n) => n.force);
  if (forceOne) return forceOne;

  // 아니면 사용자가 닫은 건 제외(오늘 닫기 포함)
  const notDismissed = candidates.find(
    (n) => !dismissed.has(n.id) && !isDismissedToday(n.id),
  );
  return notDismissed || null;
}
