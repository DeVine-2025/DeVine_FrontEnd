export type MemberTermsItem = {
  termsId: number;
  title: string;
  content: string;
  required: boolean;
};

type MemberTermsResponse = {
  isSuccess?: boolean;
  code?: string;
  message?: string;
  result?: {
    terms?: MemberTermsItem[];
  };
};

const BASE_URL = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL ?? '');

export async function getMemberTerms(signal?: AbortSignal): Promise<MemberTermsItem[]> {
  const url = `${BASE_URL}/api/v1/members/terms`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      accept: '*/*',
    },
    signal,
  });

  const json = (await res.json().catch(() => null)) as MemberTermsResponse | null;
  if (!res.ok) {
    throw new Error(json?.message ?? `terms fetch failed: ${res.status}`);
  }

  return Array.isArray(json?.result?.terms) ? json.result.terms : [];
}
