import axios, { AxiosInstance } from 'axios';
import { BASE_URL } from '@constants/endpoints';

export const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: BASE_URL,
    timeout: 15_000,
    withCredentials: true,
  });

  return instance;
};

export const axiosInstance = createAxiosInstance();