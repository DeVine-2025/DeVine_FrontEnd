export type CompanionMode = 'idle' | 'thinking' | 'reading' | 'success' | 'message' | 'laptop';
export const companionModeLabels: Record<CompanionMode, string> = {
  idle: '기본', thinking: '생각 중', reading: '리포트 읽기', success: '완료 축하', message: '새 메시지', laptop: '노트북 작업',
};

export function resolveCompanionMode(input: {
  pendingReports: number;
  celebrating: boolean;
  pathname: string;
  unreadRooms: number;
}): CompanionMode {
  if (input.pendingReports > 0) return 'thinking';
  if (input.celebrating || input.pathname === '/report/result' || input.pathname === '/project/create/complete') return 'success';
  if (input.pathname.startsWith('/report')) return 'reading';
  if (input.pathname.startsWith('/search')) return 'laptop';
  return input.unreadRooms > 0 ? 'message' : 'idle';
}
