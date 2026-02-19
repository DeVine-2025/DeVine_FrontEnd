import {axiosInstance} from '@apis/instance';

export type MemberProjectStatus = 'RECRUITING' | 'IN_PROGRESS' | 'COMPLETED';

export const getMemberProjects = async (
  nickname: string,
  status: MemberProjectStatus,
  page = 1,
  size = 10
) => {
  const { data } = await axiosInstance.get(`/api/v1/members/${nickname}/projects`, {
    params: { statuses: [status], page, size },
  });
  return data;
};

export const getMYProjectInprogress = async () => {
  const {data} = await axiosInstance.get('/api/v1/projects/my/in-progress');
  return data;
}

export const getMYProjectRecruiting = async () => {
  const {data} = await axiosInstance.get('/api/v1/projects/my/recruiting');
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

  getMYProjectRecruiting: () => ({
    queryKey: ['project_id/recruiting'],
    queryFn: getMYProjectRecruiting
  }),

  getMYProjectCompleted: () => ({
    queryKey: ['project_id/completed'],
    queryFn: getMYProjectCompleted
  }),

  getMemberProjectInprogress: (memberNick: string) => ({
    queryKey: ['member/projects', memberNick, 'IN_PROGRESS'],
    queryFn: () => getMemberProjects(memberNick, 'IN_PROGRESS'),
    enabled: Boolean(memberNick)
  }),

  getMemberProjectRecruiting: (memberNick: string) => ({
    queryKey: ['member/projects', memberNick, 'RECRUITING'],
    queryFn: () => getMemberProjects(memberNick, 'RECRUITING'),
    enabled: Boolean(memberNick)
  }),

  getMemberProjectCompleted: (memberNick: string) => ({
    queryKey: ['member/projects', memberNick, 'COMPLETED'],
    queryFn: () => getMemberProjects(memberNick, 'COMPLETED'),
    enabled: Boolean(memberNick)
  })
}