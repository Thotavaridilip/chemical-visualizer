import React, { useState } from 'react';
import { ArrowUpDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { EquipmentData } from '@/types/equipment';
import { Input } from '@/components/ui/input';

interface EquipmentTableProps {
  data: EquipmentData[];
}

type SortKey = keyof EquipmentData;
type SortDirection = 'asc' | 'desc';

const ITEMS_PER_PAGE = 10;

export const EquipmentTable: React.FC<EquipmentTableProps> = ({ data }) => {
  const [sortKey, setSortKey] = useState<SortKey>('equipmentName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const filteredData = data.filter((item) =>
    item.equipmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedData = [...filteredData].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }
    
    const aStr = String(aVal).toLowerCase();
    const bStr = String(bVal).toLowerCase();
    return sortDirection === 'asc' 
      ? aStr.localeCompare(bStr) 
      : bStr.localeCompare(aStr);
  });

  const totalPages = Math.ceil(sortedData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = sortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const SortHeader: React.FC<{ label: string; sortKeyValue: SortKey; className?: string }> = ({
    label,
    sortKeyValue,
    className = '',
  }) => (
    <th
      className={`cursor-pointer hover:bg-muted/70 transition-colors ${className}`}
      onClick={() => handleSort(sortKeyValue)}
    >
      <div className="flex items-center gap-1">
        {label}
        <ArrowUpDown className={`w-3.5 h-3.5 ${sortKey === sortKeyValue ? 'text-accent' : 'opacity-40'}`} />
      </div>
    </th>
  );

  return (
    <div className="chart-container animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Equipment Data</h3>
          <p className="text-sm text-muted-foreground">
            {filteredData.length} of {data.length} records
          </p>
        </div>
        
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search equipment..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="data-table">
          <thead>
            <tr>
              <SortHeader label="Equipment Name" sortKeyValue="equipmentName" />
              <SortHeader label="Type" sortKeyValue="type" />
              <SortHeader label="Flowrate (m³/h)" sortKeyValue="flowrate" className="text-right" />
              <SortHeader label="Pressure (bar)" sortKeyValue="pressure" className="text-right" />
              <SortHeader label="Temp (°C)" sortKeyValue="temperature" className="text-right" />
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item) => (
              <tr key={item.id}>
                <td className="font-medium">{item.equipmentName}</td>
                <td>
                  <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-secondary text-secondary-foreground">
                    {item.type}
                  </span>
                </td>
                <td className="text-right font-mono text-sm">{item.flowrate.toFixed(2)}</td>
                <td className="text-right font-mono text-sm">{item.pressure.toFixed(2)}</td>
                <td className="text-right font-mono text-sm">{item.temperature.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
