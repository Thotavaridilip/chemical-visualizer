import { useState, useCallback } from 'react';
import { EquipmentData, DataSummary, UploadHistory } from '@/types/equipment';
import { uploadCSV, getSummary, getHistory, downloadPDF } from '@/api/equipmentApi';
import { useAuth } from '@/contexts/AuthContext';

export const useEquipmentData = () => {
  const { token } = useAuth();
  const [data, setData] = useState<EquipmentData[]>([]);
  const [summary, setSummary] = useState<DataSummary | null>(null);
  const [uploadHistory, setUploadHistory] = useState<UploadHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback(async (file: File) => {
    if (!token) {
      setError('Not authenticated');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await uploadCSV(file, token);
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
    if (!token) return;
    try {
      const result = await getHistory(token);
      setUploadHistory(result.map((item: any) => ({
        id: item.id?.toString() ?? String(Math.random()),
        fileName: item.file_name,
        uploadedAt: new Date(item.uploaded_at),
        recordCount: item.record_count,
        summary: item.summary,
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
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

  const loadSampleData = useCallback(() => {
    setError('Sample data loading not implemented with API');
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
