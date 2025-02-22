import axios from 'axios';
import { TokenPair } from '../types/auth';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          // Specify that the response data is of type TokenPair.
          const response = await axios.post<TokenPair>(`${BASE_URL}/users/refresh`, { refresh_token: refreshToken });
          const newTokens: TokenPair = response.data; // Now TypeScript knows the type.
          localStorage.setItem('accessToken', newTokens.access_token);
          localStorage.setItem('refreshToken', newTokens.refresh_token);
          if (originalRequest.headers) {
            originalRequest.headers['Authorization'] = `Bearer ${newTokens.access_token}`;
          }
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
