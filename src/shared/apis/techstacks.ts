import { axiosInstance } from '@apis/instance';

export type TechstackItem = {
  techstackId: number;
  name: string;
  genre: string;
};

export type TechstackGroup = {
  techstackId: number;
  name: string;
  list: TechstackItem[];
};

type GetTechstacksResponse = {
  isSuccess: boolean;
  code: string;
  message: string;
  result?: {
    techstacks?: TechstackGroup[];
  };
};

export const normalizeTechstackName = (value: string) =>
  value.trim().toUpperCase().replace(/[^A-Z0-9_]+/g, '_');

export const formatTechstackKey = (name: string) => {
  const normalized = normalizeTechstackName(name);
  const alias: Record<string, string> = {
    MONGODB: 'MongoDB',
    MYSQL: 'MySQL',
    AWS: 'AWS',
    PHP: 'Php',
    GO: 'Go',
    C: 'C',
    REACT_NATIVE: 'ReactNative',
  };
  if (alias[normalized]) return alias[normalized];

  return normalized
    .split('_')
    .filter(Boolean)
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join('');
};

export const formatTechstackLabel = (name: string) => {
  const key = formatTechstackKey(name);
  const labelAlias: Record<string, string> = {
    Php: 'PHP',
    Aws: 'AWS',
  };
  return labelAlias[key] ?? key;
};

export const buildTechstackNameByIdMap = (groups: TechstackGroup[]) => {
  const map = new Map<string, string>();
  groups.forEach((group) => {
    group.list.forEach((item) => {
      map.set(String(item.techstackId), item.name);
    });
  });
  return map;
};

export async function getTechstacks() {
  const { data } = await axiosInstance.get<GetTechstacksResponse>('/api/v1/techstacks');
  return data.result?.techstacks ?? [];
}

