import axios from 'axios';
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const login = (email: string, password: string) =>
  axios.post(`${API}/auth/login`, { email, password }).then(r => r.data);

export const signup = (data: any) =>
  axios.post(`${API}/auth/signup`, data).then(r => r.data);

export const getMe = (token: string) =>
  axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data);
