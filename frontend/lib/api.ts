import axios from 'axios';

const baseURL = '/api/v1';

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
api.interceptors.request.use((config) => {
  const debugRequestId = crypto.randomUUID();
  config.headers['X-Debug-Request-ID'] = debugRequestId;

  console.log(`[AXIOS REQUEST] ${config.method?.toUpperCase()} ${config.url}`);
  console.log(`[AXIOS REQUEST] Final URL: ${config.baseURL}${config.url}`);
  console.log(`[AXIOS REQUEST] withCredentials: ${config.withCredentials}`);
  console.log(`[AXIOS REQUEST] Headers:`, config.headers);
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
