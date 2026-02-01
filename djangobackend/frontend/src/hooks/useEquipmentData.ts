import { useState, useCallback } from 'react';
import { EquipmentData, DataSummary, UploadHistory } from '@/types/equipment';
import { uploadCSV, uploadCSVAnonymous, getSummary, getHistory, getHistoryAnonymous, downloadPDF, loadSampleData as loadSampleDataApi } from '@/api/equipmentApi';
import { useAuth } from '@/contexts/AuthContext';

export const useEquipmentData = () => {
  const { token } = useAuth();
  const [data, setData] = useState<EquipmentData[]>([]);
  const [summary, setSummary] = useState<DataSummary | null>(null);
  const [uploadHistory, setUploadHistory] = useState<UploadHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      let result;
      if (token) {
        // Use authenticated upload if token available
        result = await uploadCSV(file, token);
      } else {
        // Use anonymous upload if no token
        result = await uploadCSVAnonymous(file);
      }
      setSummary(result.summary ?? null);
      await loadHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const loadSummary = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const result = await getSummary(token);
      setSummary(result ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load summary');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const loadHistory = useCallback(async () => {
    try {
      let result;
      if (token) {
        result = await getHistory(token);
      } else {
        result = await getHistoryAnonymous();
      }
      setUploadHistory(result.map((item: any) => ({
        id: item.id?.toString() ?? String(Math.random()),
        fileName: item.file_name,
        uploadedAt: new Date(item.uploaded_at),
        recordCount: item.record_count,
        summary: item.summary,
      })));
    } catch (err) {
      console.warn('Failed to load history:', err);
    }
  }, [token]);

  const loadFromHistory = useCallback(async (historyItem: UploadHistory) => {
    setSummary(historyItem.summary as DataSummary);
  }, []);

  const generatePDF = useCallback(async () => {
    if (!token) return;
    try {
      const blob = await downloadPDF(token);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'equipment-report.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download PDF');
    }
  }, [token]);

  const loadSampleData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await loadSampleDataApi();
      
      // Parse the data from backend response
      const backendData = result.data || [];
      const equipmentData: EquipmentData[] = backendData.map((item: any, index: number) => ({
        id: String(index),
        equipmentName: item['Equipment Name'] || '',
        type: item['Type'] || '',
        flowrate: item['Flowrate'] || 0,
        pressure: item['Pressure'] || 0,
        temperature: item['Temperature'] || 0,
      }));

      setData(equipmentData);
      setSummary(result.summary);

      // Add to local history
      const historyEntry: UploadHistory = {
        id: `sample-${Date.now()}`,
        fileName: 'sample_equipment_data.csv',
        uploadedAt: new Date(),
        recordCount: result.totalCount || equipmentData.length,
        summary: result.summary,
      };

      setUploadHistory((prev) => [historyEntry, ...prev].slice(0, 5));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sample data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearData = useCallback(() => {
    setData([]);
    setSummary(null);
    setError(null);
  }, []);

  return {
    data,
    summary,
    uploadHistory,
    isLoading,
    error,
    processFile,
    loadSummary,
    loadHistory,
    loadFromHistory,
    generatePDF,
    loadSampleData,
    clearData,
  };
};
