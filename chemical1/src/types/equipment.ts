export interface EquipmentData {
  id: string;
  equipmentName: string;
  type: string;
  flowrate: number;
  pressure: number;
  temperature: number;
}

export interface DataSummary {
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
}

export interface UploadHistory {
  id: string;
  fileName: string;
  uploadedAt: Date;
  recordCount: number;
  summary: DataSummary;
}

export interface ParsedCSV {
  data: EquipmentData[];
  summary: DataSummary;
}
