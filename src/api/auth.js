// src/api/auth.js
import axios from 'axios';

const API_URL = 'http://localhost:3000'; // backend URL (keyin .env ga o‘tkazamiz)

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// JWT token ni header ga qo‘shish (interceptor)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const signup = async (data) => {
  const response = await api.post('/auth/signup', data);
  if (response.data.access_token) {
    localStorage.setItem('token', response.data.access_token);
  }
  return response.data;
};

export const login = async (data) => {
  const response = await api.post('/auth/login', data);
  if (response.data.access_token) {
    localStorage.setItem('token', response.data.access_token);
  }
  return response.data;
};

export const getCurrentUser = async () => {
  return api.get('/auth/me');
};

export const logout = () => {
  localStorage.removeItem('token');
};

export default api;