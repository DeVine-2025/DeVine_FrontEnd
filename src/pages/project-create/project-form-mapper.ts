import type { getProjectDetail } from '@apis/project-detail';
import type { CreateProjectBody } from '@apis/projects';
import { getKeysByPosition, type PositionKey } from '@constants/position-tech-stack';
import { TECHSTACK_KEY_TO_NAME } from '@mappers/projectFilters';
import { joinProjectFeatures, splitProjectFeatures } from '../project-detail/project-features';
import type { ProjectDraftState, RecruitmentItem, SlotImage } from './project-draft.store';

const projectFieldMap: Record<string, string> = {
  웹: 'WEB',
  '모바일/앱': 'MOBILE',
  게임: 'GAME',
  블록체인: 'BLOCKCHAIN',
  기타: 'ETC',
};
const modeMap: Record<string, string> = {
  온라인: 'ONLINE',
  오프라인: 'OFFLINE',
  '온/오프라인': 'HYBRID',
};
const positionMap: Record<string, string> = {
  프론트엔드: 'FRONTEND',
  백엔드: 'BACKEND',
  인프라: 'INFRA',
};
const durationMonthsMap: Record<string, number> = {
  '1개월 이하': 1,
  '1-3개월': 2,
  '3-6개월': 4,
  '6개월 이상': 6,
};
const durationRangeMap: Record<string, string> = {
  '1개월 이하': 'UNDER_ONE',
  '1-3개월': 'ONE_TO_THREE',
  '3-6개월': 'THREE_TO_SIX',
  '6개월 이상': 'SIX_PLUS',
};
const domainToCategory: Record<string, string> = {
  헬스케어: 'HEALTHCARE',
  핀테크: 'FINTECH',
  이커머스: 'ECOMMERCE',
  교육: 'EDUCATION',
  '소셜/커뮤니티': 'SOCIAL',
  엔터테인먼트: 'ENTERTAINMENT',
  'AI/데이터': 'AI_DATA',
  기타: 'ETC',
};
const reverseProjectFieldMap: Record<string, string> = Object.fromEntries(
  Object.entries(projectFieldMap).map(([k, v]) => [v, k]),
);
const reverseModeMap: Record<string, string> = Object.fromEntries(
  Object.entries(modeMap).map(([k, v]) => [v, k]),
);
const reverseDurationRangeMap: Record<string, string> = Object.fromEntries(
  Object.entries(durationRangeMap).map(([k, v]) => [v, k]),
);
const reverseDomainToCategory: Record<string, string> = Object.fromEntries(
  Object.entries(domainToCategory).map(([k, v]) => [v, k]),
);
const reversePositionMap: Record<string, string> = Object.fromEntries(
  Object.entries(positionMap).map(([k, v]) => [v, k]),
);

const normalizeTechKey = (k: string) =>
  k
    .trim()
    .replace(/\s+/g, '')
    .replace(/[^0-9a-zA-Z]/g, '')
    .toUpperCase();

/** API에서 오는 값(JAVASCRIPT 등) → UI 옵션 키(Javascript 등)로 변환. 수정 모드 복원 시 사용 */
const BACKEND_NAME_TO_UI_KEY: Record<string, string> = (() => {
  const positionKeys: PositionKey[] = ['frontend', 'backend', 'infra'];
  const acc: Record<string, string> = {};
  positionKeys.forEach((pos) => {
    getKeysByPosition(pos).forEach((uiKey) => {
      acc[normalizeTechKey(uiKey)] = uiKey;
    });
  });
  acc['REACT_NATIVE'] = 'ReactNative';
  return acc;
})();

const UI_KEY_TO_BACKEND_TECHSTACK: Record<string, string> = {
  ...TECHSTACK_KEY_TO_NAME,
  SPRINGBOOT: 'SPRINGBOOT',
  SPRINGW: 'SPRINGBOOT',
  SPRINGBOOTW: 'SPRINGBOOT',
  SPRING: 'SPRINGBOOT',
  REACTNATIVE: 'REACT_NATIVE',
  MONGODB: 'MONGODB',
  MYSQL: 'MYSQL',
};

function toTechStacksEnum(keys: string[]): string[] {
  return keys
    .map((k) => {
      const normalized = normalizeTechKey(k);
      return UI_KEY_TO_BACKEND_TECHSTACK[normalized] ?? normalized;
    })
    .filter(Boolean);
}

export function toProjectRequest({
  projectType,
  domain,
  progressType,
  progressPeriod,
  locationText,
  deadlineText,
  recruitments,
  projectTitle,
  projectContent,
  projectFeatures,
  slotImages,
}: Pick<ProjectDraftState,
  | 'projectType'
  | 'domain'
  | 'progressType'
  | 'progressPeriod'
  | 'locationText'
  | 'deadlineText'
  | 'recruitments'
  | 'projectTitle'
  | 'projectContent'
  | 'projectFeatures'
  | 'slotImages'
>): CreateProjectBody {
  const raw = deadlineText.trim();
  let recruitmentDeadline = '2026-12-31';
  if (raw) {
    const normalized = raw.replace(/\./g, '-');
    const d = new Date(normalized);
    if (!Number.isNaN(d.getTime())) recruitmentDeadline = d.toISOString().slice(0, 10);
  }
  const recruitmentsPayload = recruitments.map((r) => {
    const position = positionMap[r.positionLabel] ?? 'BACKEND';
    const techStacksSent =
      r.techStackKeys.length > 0
        ? toTechStacksEnum(r.techStackKeys)
        : position === 'INFRA'
          ? []
          : ['BACKEND'];
    return {
      position,
      count: parseInt(r.countLabel, 10) || 1,
      techStacks: techStacksSent,
    };
  });
  return {
    projectField: projectFieldMap[projectType ?? ''] ?? 'WEB',
    category: domainToCategory[domain ?? ''] ?? 'ETC',
    mode: modeMap[progressType ?? ''] ?? 'ONLINE',
    durationMonths: durationMonthsMap[progressPeriod ?? ''] ?? 1,
    durationRange: durationRangeMap[progressPeriod ?? ''] ?? 'ONE_TO_THREE',
    location: locationText.trim() || '미정',
    recruitmentDeadline,
    recruitments: recruitmentsPayload,
    title: projectTitle.trim(),
    content: joinProjectFeatures(projectContent || '', projectFeatures.split('\n')),
    imageIds: slotImages
      .map((s) => s?.imageId)
      .filter((id): id is number => id != null && id > 0)
      .slice(0, 3),
  };
}

export function fromProjectResponse(
  project: NonNullable<Awaited<ReturnType<typeof getProjectDetail>>>,
  makeId: () => string,
) {
  const { summary, features } = splitProjectFeatures(project.content ?? '');
  const rawRecruitments = project.recruitments ?? project.positions ?? [];
  const recruitments = rawRecruitments.length > 0
    ? rawRecruitments.map((r): RecruitmentItem => {
        const posLabel = reversePositionMap[r.position] ?? r.positionName ?? String(r.position);
        const techKeys = Array.isArray(r.techStacks)
          ? r.techStacks
              .map((ts) => {
                const name = (ts.techStackName ?? (ts as any).techStack ?? '').trim();
                if (!name) return '';
                const normalized = normalizeTechKey(name);
                return BACKEND_NAME_TO_UI_KEY[normalized] ?? normalized;
              })
              .filter(Boolean)
          : [];
        return {
          id: makeId(),
          positionLabel: posLabel,
          countLabel: `${r.count ?? 1}명`,
          techStackKeys: techKeys,
        };
      })
    : undefined;

  const imgUrls =
    project.imageUrls ??
    project.images?.map((i) => i.imageUrl ?? i.url).filter(Boolean) ??
    [];
  let slotImages: [SlotImage, SlotImage, SlotImage] | undefined;
  if (imgUrls.length > 0) {
    const slots: [SlotImage, SlotImage, SlotImage] = [null, null, null];
    imgUrls.slice(0, 3).forEach((url, i) => {
      if (url) slots[i] = { imageId: 0, imageUrl: url };
    });
    slotImages = slots;
  }

  return {
    title: project.title ?? '',
    summary,
    features: features.join('\n'),
    location: project.location ?? '',
    deadline: project.recruitmentDeadline ?? '',
    projectType: project.projectField
      ? reverseProjectFieldMap[project.projectField] ?? project.projectFieldName ?? null
      : undefined,
    domain: project.category
      ? reverseDomainToCategory[project.category] ?? project.categoryName ?? null
      : undefined,
    progressType: project.mode
      ? reverseModeMap[project.mode] ?? project.modeName ?? null
      : undefined,
    progressPeriod: project.durationRange
      ? reverseDurationRangeMap[project.durationRange] ?? project.durationRangeName ?? null
      : undefined,
    recruitments,
    slotImages,
  };
}
