const BASE_URL = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL ?? '');

export type GitRepoItem = {
  gitRepoId: number;
  name: string;
  gitUrl: string;
  description: string | null;
  hasReport: boolean;
};

type GitRepoPage = {
  content: GitRepoItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

type GitRepoResponse = {
  isSuccess: boolean;
  result?: GitRepoPage;
};

/**
 * 모든 페이지를 순회하여 전체 레포 목록을 반환합니다.
 */
export async function getGitRepos(token?: string): Promise<GitRepoItem[]> {
  const all: GitRepoItem[] = [];
  let page = 1;
  const size = 30;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const res = await fetch(
      `${BASE_URL}/api/v1/members/me/git-repos?page=${page}&size=${size}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
    );

    if (!res.ok) {
      throw new Error(`git repos failed: ${res.status}`);
    }

    const data = (await res.json()) as GitRepoResponse;
    const result = data.result;
    if (!result?.content?.length) break;

    all.push(...result.content);

    if (result.last) break;
    page += 1;
  }

  return all;
}
