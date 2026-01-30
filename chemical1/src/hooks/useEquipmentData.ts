import { useState, useCallback } from 'react';
import { EquipmentData, DataSummary, UploadHistory, ParsedCSV } from '@/types/equipment';
import { parseCSVFile, calculateSummary, generateSampleData } from '@/lib/csvParser';

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
      const result: ParsedCSV = await parseCSVFile(file);
      
      setData(result.data);
      setSummary(result.summary);

      // Add to history
      const historyEntry: UploadHistory = {
        id: `upload-${Date.now()}`,
        fileName: file.name,
        uploadedAt: new Date(),
        recordCount: result.data.length,
        summary: result.summary,
      };

      setUploadHistory((prev) => {
        const newHistory = [historyEntry, ...prev];
        return newHistory.slice(0, MAX_HISTORY);
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadSampleData = useCallback(() => {
    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      const sampleData = generateSampleData();
      const sampleSummary = calculateSummary(sampleData);

      setData(sampleData);
      setSummary(sampleSummary);

      const historyEntry: UploadHistory = {
        id: `upload-${Date.now()}`,
        fileName: 'sample_equipment_data.csv',
        uploadedAt: new Date(),
        recordCount: sampleData.length,
        summary: sampleSummary,
      };

      setUploadHistory((prev) => {
        const newHistory = [historyEntry, ...prev];
        return newHistory.slice(0, MAX_HISTORY);
      });

      setIsLoading(false);
    }, 500);
  }, []);

  const loadFromHistory = useCallback((historyId: string) => {
    const entry = uploadHistory.find((h) => h.id === historyId);
    if (entry) {
      setSummary(entry.summary);
    }
  }, [uploadHistory]);

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
    loadSampleData,
    loadFromHistory,
    clearData,
  };
};
