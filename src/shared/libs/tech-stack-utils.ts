/**
 * 기술스택 배지 조회 유틸리티
 *
 * 기존에 6곳(RecommendDeveloperCard, BookmarkDeveloperCard, ProfileBase,
 * TechStackChips, position-tech-stack, project-create-page)에
 * 복사-붙여넣기 되어 있던 normalizeTechKey / findBadge / ALL_TECH_STACK_BADGES 코드를
 * 하나로 통합한 모듈입니다.
 */
import {
  BACKEND_DATABASE,
  BACKEND_FRAMEWORK,
  BACKEND_LANGUAGE,
  FRONTEND_LANGUAGE_FRAMEWORK,
  FRONTEND_MOBILE,
  INFRA_CLOUD,
  INFRA_CONTAINER,
  type TechStackChip,
} from '@constants/position-tech-stack';

// ─── 타입 ──────────────────────────────────────────────────
export type TechBadge = Extract<TechStackChip, { off: string; on: string }>;

// ─── 정규화 ────────────────────────────────────────────────
/**
 * 기술스택 이름을 정규화합니다.
 * 공백, 마침표, 하이픈, 언더스코어를 제거하고 소문자로 변환합니다.
 *
 * @example normalizeTechKey('React.js') → 'reactjs'
 * @example normalizeTechKey('Spring Boot') → 'springboot'
 */
export const normalizeTechKey = (v: unknown): string => {
  const s = typeof v === 'string' ? v : v != null ? String(v) : '';
  return s
    .trim()
    .toLowerCase()
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(/-/g, '')
    .replace(/_/g, '');
};

// ─── 전역 배지 맵 (모듈 로드 시 1회만 생성) ───────────────
export const ALL_TECH_STACK_BADGES: TechBadge[] = [
  ...FRONTEND_LANGUAGE_FRAMEWORK,
  ...FRONTEND_MOBILE,
  ...BACKEND_LANGUAGE,
  ...BACKEND_FRAMEWORK,
  ...BACKEND_DATABASE,
  ...INFRA_CLOUD,
  ...INFRA_CONTAINER,
].filter((b): b is TechBadge => 'off' in b && 'on' in b);

const TECH_BADGE_BY_NAME = new Map<string, TechBadge>(
  ALL_TECH_STACK_BADGES.flatMap((b) => [
    [normalizeTechKey(b.key), b],
    [normalizeTechKey(b.label), b],
  ]),
);

// ─── 배지 검색 ─────────────────────────────────────────────
/**
 * 기술스택 이름으로 배지를 찾습니다.
 * Spring → Springboot 등의 alias 처리를 포함합니다.
 */
export const findTechBadge = (name: unknown): TechBadge | null => {
  const normalized = normalizeTechKey(name);
  const alias = normalized
    .replace(/^spring$/g, 'springboot')
    .replace(/typescript/g, 'typescript')
    .replace(/nextjs/g, 'nextjs')
    .replace(/nodejs/g, 'nodejs')
    .replace(/reactnative/g, 'reactnative');
  return TECH_BADGE_BY_NAME.get(alias) ?? TECH_BADGE_BY_NAME.get(normalized) ?? null;
};

// ─── 필터용 상수 ───────────────────────────────────────────
/** 포지션 이름이라 기술스택 칩에 표시하지 않을 이름들 */
export const SKIP_TECH_NAMES = new Set([
  'backend',
  'frontend',
  'infra',
  '백엔드',
  '프론트엔드',
  '프런트엔드',
  '인프라',
]);
