type GitRepoItem = {
  gitRepoId: number;
  name: string;
  gitUrl: string;
  description: string | null;
};

type GitRepoResponse = {
  isSuccess: boolean;
  result?: {
    repos?: GitRepoItem[];
  };
};

export async function getGitRepos(token?: string) {
  const res = await fetch('https://api.devine.kr/api/v1/members/me/git-repos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    throw new Error(`git repos failed: ${res.status}`);
  }

  const data = (await res.json()) as GitRepoResponse;
  return data.result?.repos ?? [];
}
