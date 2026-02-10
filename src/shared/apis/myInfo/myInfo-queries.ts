import { axiosInstance } from '@apis/instance';
import {MyProfileResponse} from '@apis/myInfo/myInfo';
import {MyReposResponse} from '@apis/myInfo/myInfo';

export const getMyProfile = async () : Promise<MyProfileResponse> => {
  const {data} = await axiosInstance.get('/api/v1/members/me');
  return data;
}

export const getMyRepo= async () : Promise<MyReposResponse> => {
  const {data} = await axiosInstance.post('/api/v1/members/me/git-repos');
  return data;
}

export const myInfoQueries = {
  profile: () => ({
    queryKey: ['member'],
    queryFn: getMyProfile,
  }),

  repos: () => ({
    queryKey: ['member/git-repos'],
    queryFn: getMyRepo,
  })
}
