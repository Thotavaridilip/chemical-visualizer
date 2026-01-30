import Papa from 'papaparse';
import { EquipmentData, DataSummary, ParsedCSV } from '@/types/equipment';

export const parseCSVFile = (file: File): Promise<ParsedCSV> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const data = results.data.map((row: Record<string, unknown>, index: number) => ({
            id: `eq-${index + 1}`,
            equipmentName: String(row['Equipment Name'] || row['equipment_name'] || row['EquipmentName'] || ''),
            type: String(row['Type'] || row['type'] || ''),
            flowrate: parseFloat(String(row['Flowrate'] || row['flowrate'] || 0)) || 0,
            pressure: parseFloat(String(row['Pressure'] || row['pressure'] || 0)) || 0,
            temperature: parseFloat(String(row['Temperature'] || row['temperature'] || 0)) || 0,
          })).filter((item: EquipmentData) => item.equipmentName);

          const summary = calculateSummary(data);
          resolve({ data, summary });
        } catch (error) {
          reject(new Error('Failed to parse CSV file'));
        }
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

export const calculateSummary = (data: EquipmentData[]): DataSummary => {
  if (data.length === 0) {
    return {
      totalCount: 0,
      avgFlowrate: 0,
      avgPressure: 0,
      avgTemperature: 0,
      typeDistribution: {},
      minFlowrate: 0,
      maxFlowrate: 0,
      minPressure: 0,
      maxPressure: 0,
      minTemperature: 0,
      maxTemperature: 0,
    };
  }

  const flowrates = data.map((d) => d.flowrate);
  const pressures = data.map((d) => d.pressure);
  const temperatures = data.map((d) => d.temperature);

  const typeDistribution: Record<string, number> = {};
  data.forEach((item) => {
    typeDistribution[item.type] = (typeDistribution[item.type] || 0) + 1;
  });

  return {
    totalCount: data.length,
    avgFlowrate: flowrates.reduce((a, b) => a + b, 0) / flowrates.length,
    avgPressure: pressures.reduce((a, b) => a + b, 0) / pressures.length,
    avgTemperature: temperatures.reduce((a, b) => a + b, 0) / temperatures.length,
    typeDistribution,
    minFlowrate: Math.min(...flowrates),
    maxFlowrate: Math.max(...flowrates),
    minPressure: Math.min(...pressures),
    maxPressure: Math.max(...pressures),
    minTemperature: Math.min(...temperatures),
    maxTemperature: Math.max(...temperatures),
  };
};

// Generate sample data for demo
export const generateSampleData = (): EquipmentData[] => {
  const equipmentTypes = ['Pump', 'Reactor', 'Heat Exchanger', 'Distillation Column', 'Compressor', 'Separator'];
  const prefixes = ['Primary', 'Secondary', 'Auxiliary', 'Main', 'Backup'];
  
  return Array.from({ length: 25 }, (_, i) => {
    const type = equipmentTypes[Math.floor(Math.random() * equipmentTypes.length)];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    
    return {
      id: `eq-${i + 1}`,
      equipmentName: `${prefix} ${type} ${String(i + 1).padStart(3, '0')}`,
      type,
      flowrate: Math.round((Math.random() * 1000 + 100) * 100) / 100,
      pressure: Math.round((Math.random() * 50 + 1) * 100) / 100,
      temperature: Math.round((Math.random() * 300 + 20) * 100) / 100,
    };
  });
};
