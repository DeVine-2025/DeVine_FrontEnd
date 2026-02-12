import axios, { AxiosInstance } from 'axios';
import { BASE_URL } from '@constants/endpoints';

type TokenGetter = () => Promise<string | null>;

let getToken: TokenGetter | null = null;

export const setTokenGetter = (fn: TokenGetter) => {
  getToken = fn;
};

export const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: BASE_URL,
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

export const axiosInstance = createAxiosInstance();