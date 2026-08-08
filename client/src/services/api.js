import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach token & dev logging
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        endpoint: config.url,
        payload: config.data,
        headers: config.headers,
      });
    }

    return config;
  },
  (error) => {
    if (import.meta.env.DEV) {
      console.error('[API Request Error]', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor: dev logging & enhanced error extraction
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.status} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const errorMsg =
      error.response?.data?.message || error.message || 'An unexpected error occurred';

    if (import.meta.env.DEV) {
      console.error(`[API Error] Status ${status || 'NET_ERR'} - ${error.config?.url}`, {
        endpoint: error.config?.url,
        payload: error.config?.data,
        status: status,
        errorResponse: error.response?.data,
        message: errorMsg,
      });
    }

    const customError = new Error(errorMsg);
    customError.status = status;
    customError.responseData = error.response?.data;
    return Promise.reject(customError);
  }
);

export default api;
