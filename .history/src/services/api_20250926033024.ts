import axios from 'axios';
const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const API = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const saveOnboarding = (step: number, data: any, token: string) =>
  axios.post(`${API}/onboarding`, { step, data }, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data);

export const createReport = (payload: any, token: string) =>
  axios.post(`${API}/reports`, payload, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data);

export const getReports = (token: string) =>
  axios.get(`${API}/reports`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data);
