// src/components/Notice.tsx
import { useEffect, useState } from "react";
import {
  dismissNoticeToday,
  loadNotices,
  pickActiveNotice,
  type NoticeItem,
} from "../lib/notice/notice";
import "./Notice.css";

export function Notice() {
  const [notice, setNotice] = useState<NoticeItem | null>(null);

  useEffect(() => {
    (async () => {
      const payload = await loadNotices();
      setNotice(pickActiveNotice(payload));
    })();
  }, []);

  if (!notice) return null;

  return (
    <div className="notice-overlay" role="dialog" aria-modal="true">
      <div className="notice-card">
        <div className={`notice-badge notice-${notice.level}`}>
          {notice.level === "critical" && "긴급 공지"}
          {notice.level === "warning" && "중요 안내"}
          {notice.level === "info" && "알림"}
        </div>
        <h2 className="notice-title">{notice.title}</h2>
        <div className="notice-body">{notice.body}</div>

        <div className="notice-actions">
          {notice.link && (
            <a
              className="notice-button notice-button-soft"
              href={notice.link}
              target="_blank"
              rel="noreferrer"
            >
              자세히 보기
            </a>
          )}

          {!notice.force && (
            <button
              className="notice-button notice-button-ghost"
              onClick={() => {
                setNotice(null);
              }}
            >
              닫기
            </button>
          )}

          {!notice.force && (
            <button
              className="notice-button notice-button-outline"
              onClick={() => {
                dismissNoticeToday(notice.id);
                setNotice(null);
              }}
            >
              오늘 다시 보지 않기
            </button>
          )}

          {notice.force && (
            <button
              className="notice-button notice-button-primary"
              onClick={() => setNotice(null)}
            >
              확인
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
