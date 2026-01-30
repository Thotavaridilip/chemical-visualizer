// src/api/equipmentApi.ts
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

export const login = async (username: string, password: string) => {
  const token = btoa(`${username}:${password}`);
  return token;
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
