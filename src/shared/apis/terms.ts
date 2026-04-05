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
const TERMS_BASE_URL = import.meta.env.VITE_TERMS_API_BASE_URL ?? 'https://api.devine.kr';

export async function getMemberTerms(signal?: AbortSignal): Promise<MemberTermsItem[]> {
  const url = import.meta.env.DEV
    ? `${TERMS_BASE_URL}/api/v1/members/terms`
    : `${BASE_URL}/api/v1/members/terms`;

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
