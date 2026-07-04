import axios from 'axios';

const baseURL = process.env.NODE_ENV === 'production' 
  ? 'https://hotel-managment-production-8824.up.railway.app/api/v1' 
  : (process.env.NEXT_PUBLIC_API_URL || '/api/v1');

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
