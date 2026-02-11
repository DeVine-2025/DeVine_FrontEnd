import { axiosInstance } from '@apis/instance';
import { GitRepoRequest, MyProfileResponse, MyReposResponse } from '@apis/myInfo/myInfo';

export const getMyProfile = async (): Promise<MyProfileResponse> => {
  const { data } = await axiosInstance.get('/api/v1/members/me');
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

export const myInfoQueries = {
  profile: () => ({
    queryKey: ['member'],
    queryFn: getMyProfile,
  }),

  reposInfinite: () => ({
    queryKey: ['repos'],
    queryFn: ({ pageParam = 1 }: { pageParam?: number }) =>
      getMyRepo({ page: pageParam, size: 10 }),

    initialPageParam: 1,


    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.result.page;
      const totalPages = lastPage.result.totalPages;
      const isLast = lastPage.result.last;

      if (isLast) return undefined;
      return currentPage + 1;
    },
  }),
};
