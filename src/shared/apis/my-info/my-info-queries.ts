import { axiosInstance } from '@apis/instance';
import {
  GitRepoRequest,
  MyProfileResponse,
  MyReposResponse,
  MyContributionsResponse,
  UpdateProfileRequest,
} from '@apis/my-info/my-info';

export const getMyProfile = async (): Promise<MyProfileResponse> => {
  const { data } = await axiosInstance.get('/api/v1/members/me');
  return data;
};

export const getMemberProfile = async (nickname: string) => {
  const { data } = await axiosInstance.get(`/api/v1/members/${nickname}`);
  return data;
};
export const updateMyProfile = async (
  profileData: UpdateProfileRequest,
): Promise<MyProfileResponse> => {
  const { data } = await axiosInstance.patch('/api/v1/members/me', profileData);
  return data;
};

// 보유 기술 추가
export const addMyTechStacks = async (techstackIds: number[]) => {
  const { data } = await axiosInstance.post('/api/v1/members/me/techstacks', {
    techstackIds,
  });
  return data;
};

// 보유 기술 삭제
export const deleteMyTechStacks = async (techstackIds: number[], source?: 'AUTO' | 'MANUAL') => {
  const { data } = await axiosInstance.delete('/api/v1/members/me/techstacks', {
    data: {
      techstackIds,
      ...(source && { source }),
    },
  });
  return data;
};

export const getMyRepo = async (params?: GitRepoRequest): Promise<MyReposResponse> => {
  const { data } = await axiosInstance.post('/api/v1/members/me/git-repos', null, { params });
  return data;
};

export const getMemberRepo = async (
  nickname: string,
  params?: GitRepoRequest,
): Promise<MyReposResponse> => {
  const { data } = await axiosInstance.get(`/api/v1/members/${nickname}/git-repos`, {
    params,
  });
  return data;
};

export const getMyTechStacks = async () => {
  const { data } = await axiosInstance.get('/api/v1/members/me/techstacks');
  return data;
};

export const getMemberTechStacks = async (nickname: string) => {
  const { data } = await axiosInstance.get(`/api/v1/members/${nickname}/techstacks`);
  return data;
};
export const getMyGitContributions = async (
  from: string,
  to: string,
): Promise<MyContributionsResponse> => {
  const { data } = await axiosInstance.get('/api/v1/members/me/contributions', {
    params: { from, to },
  });
  return data;
};
export const getMemberGitContributions = async (
  nickname: string,
  from: string,
  to: string,
): Promise<MyContributionsResponse> => {
  const { data } = await axiosInstance.get(`/api/v1/members/${nickname}/contributions`, {
    params: { from, to },
  });
  return data;
};

export const myInfoQueries = {
  profile: () => ({
    queryKey: ['member'],
    queryFn: getMyProfile,
  }),

  memberProfile: (memberNick: string) => ({
    queryKey: ['member/profile', memberNick],
    queryFn: () => getMemberProfile(memberNick),
  }),

  getMyTechStacks: () => ({
    queryKey: ['member/techstacks'],
    queryFn: getMyTechStacks,
  }),

  getMemberTechStacks: (memberNick: string) => ({
    queryKey: ['member/other/techstacks', memberNick],
    queryFn: () => getMemberTechStacks(memberNick),
  }),

  getMemberGitContributions: (memberNick: string, year: number) => {
    const from = `${year}-01-01`;
    const to = `${year}-12-31`;
    return {
      queryKey: ['member/other/contributions', memberNick, year],
      queryFn: () => getMemberGitContributions(memberNick, from, to),
    };
  },

  getMyContributions: (year: number) => {
    const from = `${year}-01-01`;
    const to = `${year}-12-31`;
    return {
      queryKey: ['member/contributions', year],
      queryFn: () => getMyGitContributions(from, to),
    };
  },

  reposInfinite: () => ({
    queryKey: ['repos'],
    queryFn: ({ pageParam = 1 }: { pageParam?: number }) => getMyRepo({ page: pageParam, size: 10 }),

    initialPageParam: 1,

    getNextPageParam: (lastPage: MyReposResponse) => {
      const currentPage = lastPage.result.page;
      const isLast = lastPage.result.last;

      if (isLast) return undefined;
      return currentPage + 1;
    },
  }),

  memberReposInfinite: (memberNick: string) => ({
    queryKey: ['member/repos', memberNick],
    queryFn: ({ pageParam = 1 }: { pageParam?: number }) =>
      getMemberRepo(memberNick, { page: pageParam, size: 10 }),
    enabled: Boolean(memberNick),
    initialPageParam: 1,
    getNextPageParam: (lastPage: MyReposResponse) => {
      const currentPage = lastPage.result.page;
      const isLast = lastPage.result.last;

      if (isLast) return undefined;
      return currentPage + 1;
    },
  }),
};
