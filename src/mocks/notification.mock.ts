export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
}

export const NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    title: '프로젝트 제안이 들어왔어요',
    description: '[닉네임] 님이 제안한 프로젝트를 지금 확인해보세요.',
    timestamp: '14시간 전',
    isRead: false,
  },
  {
    id: '2',
    title: 'Text',
    description: 'Text',
    timestamp: '4시간 전',
    isRead: true,
  },
];

