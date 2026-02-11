import { axiosInstance } from '@apis/instance';
import { GitRepoRequest, MyProfileResponse, MyReposResponse, MyContributionsResponse, UpdateProfileRequest } from '@apis/myInfo/myInfo';

export const getMyProfile = async (): Promise<MyProfileResponse> => {
  const { data } = await axiosInstance.get('/api/v1/members/me');
  return data;
};

export const updateMyProfile = async (profileData: UpdateProfileRequest): Promise<MyProfileResponse> => {
  const { data } = await axiosInstance.patch('/api/v1/members/me', profileData);
  return data;
};

export const getMyRepo = async (
  params?: GitRepoRequest
): Promise<MyReposResponse> => {
  const { data } = await axiosInstance.post(
    '/api/v1/members/me/git-repos',
    null,
    { params }
  );
  return data;
};

export const getMyTechStacks = async () => {
  const { data } = await axiosInstance.get('/api/v1/members/me/techstacks');
  return data;
}

export const getMyGitContributions = async (
  from: string,
  to: string
): Promise<MyContributionsResponse> => {
  const { data } = await axiosInstance.get('/api/v1/members/me/contributions', {
    params: { from, to }
  });
  return data;
}

export const myInfoQueries = {
  profile: () => ({
    queryKey: ['member'],
    queryFn: getMyProfile,
  }),

  getMyTechStacks: () => ({
    queryKey: ['member/techstacks'],
    queryFn: getMyTechStacks,
  }),

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
    queryFn: ({ pageParam = 1 }: { pageParam?: number }) =>
      getMyRepo({ page: pageParam, size: 10 }),

    initialPageParam: 1,


    getNextPageParam: (lastPage: MyReposResponse) => {
      const currentPage = lastPage.result.page;
      const totalPages = lastPage.result.totalPages;
      const isLast = lastPage.result.last;

      if (isLast) return undefined;
      return currentPage + 1;
    },
  }),
};
