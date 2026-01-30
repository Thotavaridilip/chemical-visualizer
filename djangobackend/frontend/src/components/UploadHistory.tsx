import React from 'react';
import { Clock, FileText, BarChart3 } from 'lucide-react';
import { UploadHistory } from '@/types/equipment';
import { formatDistanceToNow } from 'date-fns';

interface UploadHistoryListProps {
  history: UploadHistory[];
  onSelect: (id: string) => void;
}

export const UploadHistoryList: React.FC<UploadHistoryListProps> = ({ history, onSelect }) => {
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="stat-card animate-slide-up" style={{ animationDelay: '50ms' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-secondary">
          <Clock className="w-5 h-5 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Upload History</h3>
          <p className="text-sm text-muted-foreground">Last {history.length} datasets</p>
        </div>
      </div>

      <div className="space-y-2">
        {history.map((item, index) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className="w-full p-3 rounded-lg border border-border hover:border-accent/30 hover:bg-muted/30 transition-all text-left group"
            style={{ animationDelay: `${(index + 1) * 50}ms` }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-1.5 rounded bg-muted group-hover:bg-accent/10 transition-colors">
                  <FileText className="w-4 h-4 text-muted-foreground group-hover:text-accent" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-foreground truncate text-sm">
                    {item.fileName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(item.uploadedAt, { addSuffix: true })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                <BarChart3 className="w-3 h-3" />
                <span className="font-mono">{item.recordCount}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
