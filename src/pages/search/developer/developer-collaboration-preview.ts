/** UI mock fixtures only; replace with member report data when the API is connected. */
export type CollaborationPreview = {
  repository: string;
  project: string;
  description: string;
  schedule: string;
  method: string;
};

const previews: CollaborationPreview[] = [
  {
    repository: 'locally-web', project: '로컬리 — 취향으로 찾는 공간',
    description: '관심 지역의 카페와 작업 공간을 지도에서 탐색하고, 나만의 장소 컬렉션을 만드는 서비스입니다.',
    schedule: '주말 중심', method: '온·오프라인 협업',
  },
  {
    repository: 'flowup-app', project: '플로우업 — 팀을 위한 협업 도구',
    description: '팀의 업무와 일정을 한곳에서 관리하고, 변경 사항을 실시간으로 공유하는 협업 서비스입니다.',
    schedule: '평일 저녁', method: '온라인 협업',
  },
  {
    repository: 'papertrail-api', project: '페이퍼트레일 — 지식 기록 플랫폼',
    description: '흩어진 문서를 프로젝트별로 정리하고 검색하며, 팀의 의사결정 과정을 기록하는 플랫폼입니다.',
    schedule: '일정 협의', method: '온라인 협업',
  },
  {
    repository: 'meettime', project: '밋타임 — 편리한 모임 일정 조율',
    description: '참여자들의 가능한 시간을 모아 모임 일정을 정하고, 캘린더로 결과를 공유하는 서비스입니다.',
    schedule: '주말 중심', method: '온라인 협업',
  },
  {
    repository: 'codenote-web', project: '코드노트 — 개발 지식 공유 공간',
    description: '개발 중 해결한 문제와 코드 조각을 기록하고, 관심 기술별로 지식을 나누는 커뮤니티입니다.',
    schedule: '평일 저녁', method: '온·오프라인 협업',
  },
  {
    repository: 'routine-mate', project: '루틴메이트 — 함께 만드는 습관',
    description: '개인 목표를 기록하고 같은 목표를 가진 사람들과 작은 도전을 이어가는 루틴 관리 서비스입니다.',
    schedule: '일정 협의', method: '온라인 협업',
  },
  {
    repository: 'lunchpick', project: '런치픽 — 팀 점심 메뉴 추천',
    description: '팀원들의 음식 취향과 식사 조건을 바탕으로 주변 식당을 찾고 메뉴를 투표로 결정하는 서비스입니다.',
    schedule: '평일 저녁', method: '온라인 협업',
  },
  {
    repository: 'greenlog-app', project: '그린로그 — 지속 가능한 소비 기록',
    description: '일상의 소비 습관을 돌아보고, 친환경적인 선택을 기록하며 실천을 이어가는 라이프스타일 서비스입니다.',
    schedule: '주말 중심', method: '온·오프라인 협업',
  },
  {
    repository: 'bookbridge', project: '북브릿지 — 독서 모임 연결',
    description: '관심 있는 책을 중심으로 독서 모임을 찾고, 함께 읽은 문장과 생각을 나누는 플랫폼입니다.',
    schedule: '평일 저녁', method: '온라인 협업',
  },
  {
    repository: 'stageon', project: '스테이지온 — 작은 공연 발견',
    description: '독립 공연과 소규모 전시를 지역과 날짜별로 찾아보고 관심 일정을 저장하는 문화 탐색 서비스입니다.',
    schedule: '일정 협의', method: '온·오프라인 협업',
  },
  {
    repository: 'travelfit-web', project: '트래블핏 — 함께 짜는 여행 계획',
    description: '동행자와 함께 장소를 모으고 날짜별 동선을 편집하며 여행 계획을 완성하는 서비스입니다.',
    schedule: '주말 중심', method: '온라인 협업',
  },
  {
    repository: 'devcheck', project: '데브체크 — 개발 환경 상태 모니터링',
    description: '개발 중인 서비스의 배포 상태와 장애 알림을 한곳에서 확인하는 개발팀용 모니터링 도구입니다.',
    schedule: '평일 저녁', method: '온라인 협업',
  },
];

// Explicit fixture assignments keep the initial results varied and stable after sorting/filtering.
const previewAssignments: Record<string, number> = {
  '노승민일': 0,
  'devine-master': 1,
  '블러드오': 2,
  'heo': 3,
  'LeeJuSeok': 4,
  'strfunctionk': 5,
  '경수부계정': 6,
  '경수': 7,
  'dlwntjr': 8,
  '선민2': 9,
};

export function getCollaborationPreview(nickname: string): CollaborationPreview {
  const hash = Array.from(nickname).reduce((value, character) => ((value * 31) + (character.codePointAt(0) ?? 0)) >>> 0, 0);
  const index = Object.hasOwn(previewAssignments, nickname) ? previewAssignments[nickname] : hash % previews.length;
  return previews[index];
}

