import {axiosInstance} from '@apis/instance';
export const getMYProjectInprogress = async () => {
  const {data} = await axiosInstance.get('/api/v1/projects/my/in-progress');
  return data;
}

export const getMYProjectCompleted = async () => {
  const {data} = await axiosInstance.get('/api/v1/projects/my/completed');
  return data;
}

export const projectQueries =  {
  getMYProjectInprogress: () => ({
    queryKey: ['project_id'],
    queryFn: getMYProjectInprogress
  }),

  getMYProjectCompleted: () => ({
    queryKey: ['project_id/completed'],
    queryFn: getMYProjectCompleted
  })
}