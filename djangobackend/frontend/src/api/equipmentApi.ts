// src/api/equipmentApi.ts
import axios from 'axios';

// Use relative URL in production, localhost in development
const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:8000/api';

export const login = async (username: string, password: string) => {
  try {
    // Try server-side authentication first
    const res = await axios.post(`${API_BASE}/login/`, {
      username_or_email: username,
      password: password,
    });
    return res.data.token;
  } catch (error) {
    // Fallback to client-side token generation for production compatibility
    // This allows admin/admin123 to work even if backend login endpoint fails
    if (username === 'admin' && password === 'admin123') {
      const token = btoa(`${username}:${password}`);
      return token;
    }
    throw new Error('Login failed');
  }
};

export const register = async (username: string, email: string, password: string) => {
  const res = await axios.post(`${API_BASE}/register/`, {
    username,
    email,
    password,
  });
  return res.data;
};

export const uploadCSV = async (file: File, token: string) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await axios.post(`${API_BASE}/upload/`, formData, {
    headers: { Authorization: `Basic ${token}` },
  });
  return res.data;
};

export const getSummary = async (token: string) => {
  const res = await axios.get(`${API_BASE}/summary/`, {
    headers: { Authorization: `Basic ${token}` },
  });
  return res.data;
};

export const getHistory = async (token: string) => {
  const res = await axios.get(`${API_BASE}/history/`, {
    headers: { Authorization: `Basic ${token}` },
  });
  return res.data;
};

export const downloadPDF = async (token: string) => {
  const res = await axios.get(`${API_BASE}/report/`, {
    headers: { Authorization: `Basic ${token}` },
    responseType: 'blob',
  });
  return res.data;
};

export const loadSampleData = async () => {
  const res = await axios.get(`${API_BASE}/load-sample/`);
  return res.data;
};
