import { ApiResponse } from '@apis/base/api';

export interface MyProfile {
  member: {
    /** 채팅 등 Clerk 연동 시 서버가 내려줄 수 있음 */
    clerkId?: string;
    name: string;
    nickname: string;
    address: string;
    disclosure: boolean;
    mainType: 'DEVELOPER' | string;
    imageUrl: string;
    body: string;
    used: 'ACTIVE' | string;
    createdAt: string;
  };
  domains: string[];
  contacts: {
    type: 'EMAIL' | string;
    value: string;
    link: string;
  }[];
  techstacks?: string[];
  techStacks?: string[];
}

export interface GitRepoRequest{
  page: number;
  size: number;
}

export interface GitRepo {
  gitRepoId: number;
  name: string;
  gitUrl: string;
  description: string;
  hasReport?: boolean;
}

export interface Contribution {
  date: string;
  count: number;
}

export interface UpdateProfileRequest {
  nickname: string;
  imageUrl?: string;
  address: string;
  body: string;
  domains: string[];
  contacts: {
    type: string;
    value: string;
    link: string;
  }[];
  mainType: 'DEVELOPER' | 'PM';
  disclosure: boolean;
}

export interface MyProfileResponse extends ApiResponse<MyProfile> {}
export interface MyReposResponse extends ApiResponse<{
  content: GitRepo[];
  page: number;
  totalPages: number;
  last: boolean;
}> { }
export interface MyContributionsResponse extends ApiResponse<Contribution[]> { }
