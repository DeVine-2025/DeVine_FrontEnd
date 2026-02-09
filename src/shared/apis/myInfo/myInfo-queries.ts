import { axiosInstance } from '@apis/instance';
import {MyProfileResponse} from '@apis/myInfo/myInfo';

export const getMyProfile = async () : Promise<MyProfileResponse> => {
  const {data} = await axiosInstance.get('/members/me');
  return data;
}

export const myInfoQueries = {
  profile: () => ({
    queryKey: ['member'],
    queryFn: getMyProfile,
  })
}