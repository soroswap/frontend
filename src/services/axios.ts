import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  headers: {
    'Cache-Control': 'no-cache',
  },
});

export default axiosInstance;
