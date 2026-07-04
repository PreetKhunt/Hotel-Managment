import axios from 'axios';

const baseURL = typeof window !== 'undefined' 
  ? '/api/v1' 
  : (process.env.NEXT_PUBLIC_API_URL || '/api/v1');

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
api.interceptors.request.use((config) => {
  console.log(`[AXIOS REQUEST] ${config.method?.toUpperCase()} ${config.url}`);
  console.log(`[AXIOS REQUEST] Headers:`, config.headers);
  console.log(`[AXIOS REQUEST] withCredentials: ${config.withCredentials}`);
  try {
      console.log(`[AXIOS REQUEST] Caller Stack:`, new Error().stack);
  } catch(e) {}
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response Interceptor
api.interceptors.response.use((response) => {
  console.log(`[AXIOS RESPONSE] ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
  return response;
}, (error) => {
  console.error(`[AXIOS ERROR] ${error.config?.method?.toUpperCase()} ${error.config?.url} - Status: ${error.response?.status}`);
  return Promise.reject(error);
});

export default api;
