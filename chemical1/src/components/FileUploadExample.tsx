import React, { useState } from 'react';
import { uploadCSVFile, UploadResponse } from '@/lib/api';

const FileUploadExample: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const response = await uploadCSVFile(file);
      setResult(response);
      console.log('Upload successful:', response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Upload CSV File</h2>

      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        disabled={isUploading}
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100"
      />

      {isUploading && (
        <div className="mt-4 text-blue-600">
          Uploading... Please wait.
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      {result && (
        <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          <h3 className="font-bold">Upload Successful!</h3>
          <p>File: {result.file_name}</p>
          <p>Records: {result.record_count}</p>
          <p>Uploaded: {new Date(result.uploaded_at).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
};

export default FileUploadExample;