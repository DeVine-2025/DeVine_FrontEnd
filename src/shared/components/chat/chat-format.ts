export const formatTime = (iso?: string | null): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
};

export const formatDateLabel = (iso?: string | null): string => {
  if (!iso) return '오늘';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '오늘';
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
};

/* 목록 우측 메타: 마지막 메시지가 도착한 뒤 지난 시간 */
export const formatListLastContactLabel = (iso?: string | null, now = Date.now()): string => {
  if (!iso) return '';
  const sentAt = new Date(iso).getTime();
  if (Number.isNaN(sentAt)) return '';
  const elapsedMinutes = Math.max(0, Math.floor((now - sentAt) / 60_000));
  if (elapsedMinutes < 1) return '방금';
  if (elapsedMinutes < 60) return `${elapsedMinutes}분`;
  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return `${elapsedHours}시간`;
  return `${Math.floor(elapsedHours / 24)}일`;
};
