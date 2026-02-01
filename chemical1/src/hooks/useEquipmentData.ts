import { useState, useCallback } from 'react';
import { EquipmentData, DataSummary, UploadHistory, ParsedCSV } from '@/types/equipment';
import { parseCSVFile, calculateSummary, generateSampleData } from '@/lib/csvParser';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api'; // Change to your Django backend URL
const MAX_HISTORY = 5;

export const useEquipmentData = () => {
  const [data, setData] = useState<EquipmentData[]>([]);
  const [summary, setSummary] = useState<DataSummary | null>(null);
  const [uploadHistory, setUploadHistory] = useState<UploadHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);

      // Upload to Django backend using axios
      const response = await axios.post(`${API_BASE_URL}/upload/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = response.data;

      // Parse the summary data from backend
      const summary: DataSummary = result.summary;

      // For frontend display, we still need the parsed data
      // Since backend doesn't return the full data, parse locally for display
      const localResult: ParsedCSV = await parseCSVFile(file);

      setData(localResult.data);
      setSummary(summary);

      // Add to history
      const historyEntry: UploadHistory = {
        id: `upload-${result.id}`,
        fileName: result.file_name,
        uploadedAt: new Date(result.uploaded_at),
        recordCount: result.record_count,
        summary: summary,
      };

      setUploadHistory((prev) => {
        const newHistory = [historyEntry, ...prev];
        return newHistory.slice(0, MAX_HISTORY);
      });

    } catch (err: any) {
      // Handle axios errors properly
      if (err.response) {
        // Server responded with error status
        const errorMessage = err.response.data?.error || `HTTP ${err.response.status}: ${err.response.statusText}`;
        setError(errorMessage);
      } else if (err.request) {
        // Network error
        setError('Network error - please check if the backend server is running');
      } else {
        // Other error
        setError(err.message || 'Upload failed');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadSampleData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Load sample data from Django backend API
      const response = await axios.get(`${API_BASE_URL}/load-sample/`);
      const result = response.data;

      // Parse the data from backend response
      const backendData = result.data || [];
      const equipmentData: EquipmentData[] = backendData.map((item: any, index: number) => ({
        id: String(index),
        equipmentName: item['Equipment Name'] || item.equipmentName || '',
        type: item['Type'] || item.type || '',
        flowrate: item['Flowrate'] || item.flowrate || 0,
        pressure: item['Pressure'] || item.pressure || 0,
        temperature: item['Temperature'] || item.temperature || 0,
      }));

      const summary: DataSummary = result.summary;

      setData(equipmentData);
      setSummary(summary);

      // Add to history
      const historyEntry: UploadHistory = {
        id: `sample-${Date.now()}`,
        fileName: 'sample_equipment_data.csv',
        uploadedAt: new Date(),
        recordCount: result.totalCount || equipmentData.length,
        summary: summary,
      };

      setUploadHistory((prev) => {
        const newHistory = [historyEntry, ...prev];
        return newHistory.slice(0, MAX_HISTORY);
      });

    } catch (err: any) {
      // Handle axios errors properly
      if (err.response) {
        const errorMessage = err.response.data?.error || `HTTP ${err.response.status}: ${err.response.statusText}`;
        setError(errorMessage);
      } else if (err.request) {
        setError('Network error - please check if the backend server is running');
      } else {
        setError(err.message || 'Failed to load sample data');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadFromHistory = useCallback((historyId: string) => {
    const entry = uploadHistory.find((h) => h.id === historyId);
    if (entry) {
      setSummary(entry.summary);
    }
  }, [uploadHistory]);

  const loadFromBackend = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch summary from backend using axios
      const summaryResponse = await axios.get(`${API_BASE_URL}/summary/`);
      setSummary(summaryResponse.data);

      // Fetch data from backend
      try {
        const dataResponse = await axios.get(`${API_BASE_URL}/data/`);
        const records = dataResponse.data;
        if (Array.isArray(records)) {
          const equipmentData: EquipmentData[] = records.map((item: any) => ({
            id: String(item.id),
            equipmentName: item.equipmentName || '',
            type: item.type || '',
            flowrate: item.flowrate || 0,
            pressure: item.pressure || 0,
            temperature: item.temperature || 0,
          }));
          setData(equipmentData);
        }
      } catch (dataErr) {
        console.warn('Could not fetch data from backend:', dataErr);
      }

    } catch (err: any) {
      if (err.response) {
        setError(err.response.data?.error || 'Failed to load data from backend');
      } else {
        setError(err.message || 'Failed to load data from backend');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadHistoryFromBackend = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/history/`);
      const historyData = response.data;
      // Transform backend format to frontend UploadHistory format
      const formattedHistory: UploadHistory[] = historyData.map((item: any) => ({
        id: `upload-${item.id}`,
        fileName: item.file_name,
        uploadedAt: new Date(item.uploaded_at),
        recordCount: item.record_count,
        summary: item.summary,
      }));
      setUploadHistory(formattedHistory.slice(0, MAX_HISTORY));
    } catch (err) {
      console.warn('Failed to load history from backend:', err);
    }
  }, []);

  const clearData = useCallback(() => {
    setData([]);
    setSummary(null);
    setUploadHistory([]);
    setError(null);
  }, []);

  return {
    data,
    summary,
    uploadHistory,
    isLoading,
    error,
    processFile,
    loadSampleData,
    loadFromHistory,
    loadFromBackend,
    loadHistoryFromBackend,
    clearData,
  };
};
