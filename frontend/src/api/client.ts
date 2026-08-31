import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://pingramm-backen.onrender.com';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to check if URL is auth-related
const isAuthEndpoint = (url: string): boolean => {
  const authEndpoints = ['/api/login/', '/api/signup/', '/api/token/refresh/'];
  return authEndpoints.some(endpoint => url.includes(endpoint));
};

// Token refresh queue to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error || !token) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access');
    if (token && config.headers && !isAuthEndpoint(config.url || '')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 and not already retried and not an auth endpoint
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint(originalRequest.url || '')
    ) {
      const refreshToken = localStorage.getItem('refresh');
      if (!refreshToken) {
        // No refresh token, clear auth and redirect to login
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        localStorage.removeItem('avatar');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue this request to be retried after refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return apiClient(originalRequest);
        }).catch((err) => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Request new access token
        const response = await axios.post(`${API_URL}/api/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('access', access);

        // Process queued requests with new token
        processQueue(null, access);

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Process queued requests with error
        processQueue(refreshError, null);

        // Refresh failed, clear auth and redirect to login
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        localStorage.removeItem('avatar');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
