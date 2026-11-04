import type { RecommendDeveloperListItem } from '@apis/members';

export const sampleTeamProjects = [
  { projectId: -101, title: '플로우업' },
  { projectId: -102, title: '그린로그' },
  { projectId: -103, title: '커넥트업' },
  { projectId: -104, title: '링크노트' },
];
const people = [
  ['김민준', '프론트엔드', '복잡한 협업 화면을 명확하고 빠르게 만드는 데 관심이 있어요.', ['React', 'TypeScript', 'Next.js']],
  ['이서연', '백엔드', '안정적인 API와 데이터 구조를 설계합니다.', ['Java', 'Spring Boot', 'MySQL']],
  ['박지우', '프론트엔드', '일상에서 자주 쓰이는 모바일 웹을 만들고 싶어요.', ['Vue.js', 'TypeScript']],
  ['정유진', '백엔드', '작은 서비스의 시작부터 운영까지 함께하고 싶어요.', ['Node.js', 'PostgreSQL']],
  ['최하린', '프론트엔드', '접근성과 사용자 경험을 고민하며 화면을 구현해요.', ['React', 'TypeScript']],
  ['윤도현', '백엔드', '검색과 추천 기능을 만드는 프로젝트에 관심이 있어요.', ['Python', 'Django']],
  ['한소윤', '프론트엔드', '콘텐츠를 읽고 정리하는 편안한 인터페이스를 만듭니다.', ['Next.js', 'React']],
  ['서지민', '인프라', '배포 자동화와 서비스 운영 환경을 설계합니다.', ['Docker', 'Kubernetes', 'AWS']],
  ['임준서', '백엔드', '실시간 소통과 알림 시스템을 개발해 보고 싶어요.', ['Java']],
] as const;
const developers: RecommendDeveloperListItem[] = people.map(([nickname, role, introduction, skills], index) => ({ id: `sample-developer-${index}`, nickname, role, introduction, roleTone: 'blue', techStack: skills.map(name => ({ id: name, name })) }));
const groups: Record<number, number[]> = { [-101]: [0, 1, 4, 8, 7], [-102]: [2, 3, 4, 5, 7], [-103]: [0, 3, 6, 8, 7], [-104]: [1, 5, 6, 2, 7] };
export const getSampleTeamDevelopers = (id: number) => (groups[id] ?? []).map(index => developers[index]);
