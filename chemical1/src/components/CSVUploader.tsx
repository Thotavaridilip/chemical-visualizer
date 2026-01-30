import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CSVUploaderProps {
  onFileSelect: (file: File) => void;
  onLoadSample: () => void;
  isLoading: boolean;
  error: string | null;
}

export const CSVUploader: React.FC<CSVUploaderProps> = ({
  onFileSelect,
  onLoadSample,
  isLoading,
  error,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      
      const file = e.dataTransfer.files[0];
      if (file && file.name.endsWith('.csv')) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  return (
    <div className="stat-card animate-slide-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-accent/10">
          <Upload className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Upload Data</h2>
          <p className="text-sm text-muted-foreground">CSV file with equipment parameters</p>
        </div>
      </div>

      <label
        className={cn('upload-zone block', isDragging && 'dragging')}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
          disabled={isLoading}
        />
        
        <div className="flex flex-col items-center gap-4">
          <div className={cn(
            'p-4 rounded-full transition-colors',
            isDragging ? 'bg-accent/20' : 'bg-muted'
          )}>
            {isLoading ? (
              <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin" />
            ) : (
              <FileText className={cn(
                'w-8 h-8 transition-colors',
                isDragging ? 'text-accent' : 'text-muted-foreground'
              )} />
            )}
          </div>
          
          <div className="space-y-1">
            <p className="font-medium text-foreground">
              {isLoading ? 'Processing...' : 'Drop CSV file here'}
            </p>
            <p className="text-sm text-muted-foreground">
              or click to browse files
            </p>
          </div>
          
          <p className="text-xs text-muted-foreground font-mono">
            Columns: Equipment Name, Type, Flowrate, Pressure, Temperature
          </p>
        </div>
      </label>

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="mt-4 text-center">
        <button
          onClick={onLoadSample}
          disabled={isLoading}
          className="text-sm text-accent hover:text-accent/80 underline-offset-4 hover:underline transition-colors disabled:opacity-50"
        >
          Load sample data for demo
        </button>
      </div>
    </div>
  );
};
