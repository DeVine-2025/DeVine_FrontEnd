const BASE_URL = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL ?? '');

export type RecommendMemberPreviewItem = {
  member: {
    nickname: string;
    address: string | null;
    disclosure: boolean;
    mainType: string; // "PM" 등
    imageUrl: string | null;
    body: string | null;
    used: 'ACTIVE' | string;
    createdAt: string;
  };
  domains: string[];
  techstacks: {
    techstackId: number;
    name: string; // "JAVA", "SPRINGBOOT" ...
    genre: string | null; // "LANGUAGE" ...
    source: string; // "AUTO"
  }[];
  totalScore: number;
  similarityScorePercent: number;
  techstackScorePercent: number;
  domainMatch: boolean;
  matchedTechstacks: string[];
};

type RecommendMemberPreviewResponse = {
  isSuccess: boolean;
  code: string;
  message: string;
  result: RecommendMemberPreviewItem[];
};

export async function getRecommendMembersPreview(
  projectId: number,
  limit: number,
  token: string,
  signal?: AbortSignal,
) {
  const qs = new URLSearchParams({
    projectId: String(projectId),
    limit: String(limit),
  });

  const res = await fetch(`${BASE_URL}/api/v1/members/recommend/preview?${qs.toString()}`, {
    method: 'GET',
    headers: {
      accept: '*/*',
      Authorization: `Bearer ${token}`,
    },
    signal,
  });

  if (!res.ok) throw new Error(`recommend members preview failed: ${res.status}`);
  const data = (await res.json()) as RecommendMemberPreviewResponse;

  return data.result ?? [];
}
