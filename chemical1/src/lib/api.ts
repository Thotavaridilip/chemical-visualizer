// API upload functions for Django backend
const API_BASE_URL = 'http://localhost:8000/api'; // Change to your Django backend URL

export interface UploadResponse {
  id: number;
  file_name: string;
  record_count: number;
  summary: {
    totalCount: number;
    avgFlowrate: number;
    avgPressure: number;
    avgTemperature: number;
    typeDistribution: Record<string, number>;
    minFlowrate: number;
    maxFlowrate: number;
    minPressure: number;
    maxPressure: number;
    minTemperature: number;
    maxTemperature: number;
  };
  uploaded_at: string;
}

export interface ApiError {
  error: string;
}

// Upload CSV file to Django backend
export const uploadCSVFile = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/upload/`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({
      error: `HTTP ${response.status}: ${response.statusText}`
    }));
    throw new Error(errorData.error);
  }

  return await response.json();
};

// Load summary from backend
export const loadSummary = async () => {
  const response = await fetch(`${API_BASE_URL}/summary/`);
  if (!response.ok) {
    throw new Error('Failed to load summary');
  }
  return await response.json();
};

// Load upload history from backend
export const loadUploadHistory = async () => {
  const response = await fetch(`${API_BASE_URL}/history/`);
  if (!response.ok) {
    throw new Error('Failed to load history');
  }
  return await response.json();
};

// Health check
export const healthCheck = async () => {
  const response = await fetch(`${API_BASE_URL}/health/`);
  if (!response.ok) {
    throw new Error('Backend health check failed');
  }
  return await response.json();
};

// Axios version (if you prefer axios over fetch)
export const uploadCSVFileAxios = async (file: File): Promise<UploadResponse> => {
  const axios = (await import('axios')).default;

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post(`${API_BASE_URL}/upload/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error(error.message || 'Upload failed');
  }
};