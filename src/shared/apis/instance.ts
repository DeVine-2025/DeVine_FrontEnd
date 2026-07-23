import axios, { AxiosInstance } from 'axios';
import { BASE_URL } from '@constants/endpoints';

type TokenGetter = () => Promise<string | null>;

let getToken: TokenGetter | null = null;

export const setTokenGetter = (fn: TokenGetter) => {
  getToken = fn;
};

export const getAuthToken = (): Promise<string | null> => {
  if (!getToken) return Promise.resolve(null);
  return getToken();
};

const createAuthenticatedInstance = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    withCredentials: true,
  });

  instance.interceptors.request.use(async (config) => {
    if (getToken) {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });

  return instance;
};

export const createAxiosInstance = (): AxiosInstance => {
  return createAuthenticatedInstance(BASE_URL);
};

export const axiosInstance = createAxiosInstance();