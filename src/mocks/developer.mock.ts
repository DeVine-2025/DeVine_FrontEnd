import type { ReactNode } from 'react';

export type BadgeTone = 'blue' | 'green' | 'pink' | 'orange';

export type ProfileCardProps = {
  id: string;
  role: string;
  roleTone: BadgeTone;
  nickname: string;
  profileImageUrl: string;

  introduction: string;

  badges: {
    label: string;
    tone: BadgeTone;
  }[];

  techStack: {
    id: string;
    name: string;
    icon?: ReactNode;
  }[];

  bookmarked?: boolean;
};

export const PROFILE_CARD_LIST: ProfileCardProps[] = [
  {
    id: 'u-1',
    role: '백엔드',
    roleTone: 'green',
    nickname: '닉네임',
    profileImageUrl:
      'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=240&h=240&fit=crop',
    introduction: '한줄 소개가 들어가는 자리입니다.',
    badges: [
      { label: '핀테크', tone: 'blue' },
      { label: '이커머스', tone: 'pink' },
    ],
    techStack: [
      { id: 't1', name: 'Python', icon: '' },
      { id: 't2', name: 'Springboot', icon: '' },
      { id: 't3', name: 'Nestjs', icon: '' },
    ],
    bookmarked: false,
  },
  {
    id: 'u-2',
    role: '프론트엔드',
    roleTone: 'blue',
    nickname: '프론티',
    profileImageUrl:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=240&h=240&fit=crop',
    introduction: '사용자 경험을 중요하게 생각합니다.',
    badges: [
      { label: '플랫폼', tone: 'blue' },
      { label: '디자인시스템', tone: 'green' },
    ],
    techStack: [
      { id: 't4', name: 'React', icon: '' },
      { id: 't5', name: 'TypeScript', icon: '' },
      { id: 't6', name: 'Next.js', icon: '' },
    ],
    bookmarked: false,
  },
  {
    id: 'u-3',
    role: '디자이너',
    roleTone: 'pink',
    nickname: '디자인러버',
    profileImageUrl:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=240&h=240&fit=crop',
    introduction: '디자인 시스템과 일관성을 중요하게 생각합니다.',
    badges: [
      { label: 'UX', tone: 'pink' },
      { label: 'UI', tone: 'orange' },
    ],
    techStack: [
      { id: 't7', name: 'Figma', icon: '' },
      { id: 't8', name: 'Framer', icon: '' },
    ],
    bookmarked: false,
  },
  {
    id: 'u-4',
    role: '풀스택',
    roleTone: 'orange',
    nickname: '올라운더',
    profileImageUrl:
      'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=240&h=240&fit=crop',
    introduction: '프론트부터 서버까지 모두 다룹니다.',
    badges: [
      { label: '스타트업', tone: 'orange' },
      { label: '프로덕트', tone: 'blue' },
    ],
    techStack: [
      { id: 't9', name: 'Node.js', icon: '' },
      { id: 't10', name: 'React', icon: '' },
      { id: 't11', name: 'PostgreSQL', icon: '' },
    ],
    bookmarked: false,
  },
];
