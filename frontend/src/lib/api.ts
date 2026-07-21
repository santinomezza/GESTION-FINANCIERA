import axios from 'axios';
import Cookies from 'js-cookie';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Interceptor para inyectar token y workspace
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const workspaceId = document.cookie.split('; ').find(row => row.startsWith('workspace_id='))?.split('=')[1];
    if (workspaceId && config.headers) {
      config.headers['X-Workspace-Id'] = workspaceId;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar 401 y refrescar token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = Cookies.get('refresh_token');
        const userId = Cookies.get('user_id');
        if (refreshToken && userId) {
          const res = await axios.post(`${API_URL}/auth/refresh`, {
            userId,
            refreshToken,
          });
          Cookies.set('access_token', res.data.accessToken);
          Cookies.set('refresh_token', res.data.refreshToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${res.data.accessToken}`;
          return api(originalRequest);
        }
      } catch (err) {
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        Cookies.remove('user_id');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
