import { ApiResponse } from '@apis/base/api';

export interface MyProfile {
  member: {
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
}

export interface MyProfileResponse extends ApiResponse<MyProfile> {}
export interface MyReposResponse extends ApiResponse<{ 
  repos: GitRepo[];
  page: number;
  totalPages: number;
  last: boolean;
}> {}
