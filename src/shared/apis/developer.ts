import { buildQuery } from '@libs/queryString';
import type {
  DeveloperSearchPage,
  DeveloperSearchResponse,
  GetDevelopersParams,
} from '@t/profileCard.types';

const BASE_URL = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL ?? '');

export async function getDevelopers(
  params: GetDevelopersParams | string,
  token: string,
  signal?: AbortSignal,
): Promise<DeveloperSearchPage> {
  const qs =
    typeof params === 'string'
      ? params
      : buildQuery({
          categories: params.categories?.length ? params.categories : undefined,
          techNames: params.techstackNames?.length ? params.techstackNames : undefined,
          page: params.page ?? 1,
          size: params.size ?? 10,
        });

  const queryString = qs.startsWith('?') ? qs : `?${qs}`;
  console.log('REQUEST =>', `${BASE_URL}/api/v1/members/search${queryString}`);

  const res = await fetch(`${BASE_URL}/api/v1/members/search${queryString}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    signal,
  });

  const json = (await res.json().catch(() => null)) as DeveloperSearchResponse | null;

  if (!res.ok) throw new Error(json?.message ?? '개발자 목록을 불러오지 못했어요.');
  if (!json?.isSuccess || !json.result) {
    return {
      content: [],
      page: typeof params === 'string' ? 1 : (params.page ?? 1),
      size: typeof params === 'string' ? 10 : (params.size ?? 10),
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
    };
  }

  return json.result;
}
