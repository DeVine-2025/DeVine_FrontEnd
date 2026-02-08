type RecommendDeveloperPreviewItem = {
  nickname: string;
  image: string | null;
  body: string;
  techstacks: string[];
};

type RecommendDeveloperPreviewResponse = {
  isSuccess: boolean;
  result?: RecommendDeveloperPreviewItem[];
};

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export async function getRecommendDevelopersPreview(limit: number, token: string) {
  const res = await fetch(`${BASE_URL}/api/v1/members/recommend/preview?limit=${limit}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`recommend developers failed: ${res.status}`);
  }

  const data = (await res.json()) as RecommendDeveloperPreviewResponse;
  return data.result ?? [];
}
