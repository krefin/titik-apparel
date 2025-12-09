// lib/axios.ts
import axios, { AxiosInstance } from "axios";

const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // <--- gunakan /api supaya request lewat Next proxy
  withCredentials: true, // penting supaya browser kirim cookie httpOnly
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      // optional: global handling (redirect/logout)
    }
    return Promise.reject(error);
  }
);

export default api;
