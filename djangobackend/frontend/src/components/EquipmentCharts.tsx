import React from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';
import { EquipmentData, DataSummary } from '@/types/equipment';

interface EquipmentChartsProps {
  data: EquipmentData[];
  summary: DataSummary;
}

const CHART_COLORS = [
  'hsl(175, 60%, 45%)', // Teal - flowrate
  'hsl(215, 65%, 55%)', // Blue - pressure
  'hsl(15, 80%, 55%)',  // Orange - temperature
  'hsl(260, 50%, 55%)', // Purple - equipment
  'hsl(145, 60%, 40%)', // Green
  'hsl(38, 90%, 50%)',  // Yellow
];

export const EquipmentCharts: React.FC<EquipmentChartsProps> = ({ data, summary }) => {
  // Prepare data for pie chart
  const pieData = Object.entries(summary.typeDistribution).map(([name, value]) => ({
    name,
    value,
  }));

  // Prepare data for bar chart - averages by type
  const typeAverages = Object.keys(summary.typeDistribution).map((type) => {
    const typeData = data.filter((d) => d.type === type);
    return {
      type,
      avgFlowrate: typeData.reduce((sum, d) => sum + d.flowrate, 0) / typeData.length,
      avgPressure: typeData.reduce((sum, d) => sum + d.pressure, 0) / typeData.length,
      avgTemperature: typeData.reduce((sum, d) => sum + d.temperature, 0) / typeData.length,
    };
  });

  // Scatter data for correlation
  const scatterData = data.map((d) => ({
    x: d.flowrate,
    y: d.pressure,
    z: d.temperature,
    name: d.equipmentName,
    type: d.type,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Equipment Type Distribution */}
      <div className="chart-container animate-slide-up" style={{ animationDelay: '100ms' }}>
        <h3 className="text-lg font-semibold text-foreground mb-2">Equipment Distribution</h3>
        <p className="text-sm text-muted-foreground mb-4">By equipment type</p>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {pieData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Average Parameters by Type */}
      <div className="chart-container animate-slide-up" style={{ animationDelay: '150ms' }}>
        <h3 className="text-lg font-semibold text-foreground mb-2">Average Flowrate by Type</h3>
        <p className="text-sm text-muted-foreground mb-4">m³/h comparison</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={typeAverages} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis 
              dataKey="type" 
              type="category" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
              width={100}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [`${value.toFixed(2)} m³/h`, 'Avg Flowrate']}
            />
            <Bar dataKey="avgFlowrate" fill={CHART_COLORS[0]} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Temperature Distribution */}
      <div className="chart-container animate-slide-up" style={{ animationDelay: '200ms' }}>
        <h3 className="text-lg font-semibold text-foreground mb-2">Pressure by Type</h3>
        <p className="text-sm text-muted-foreground mb-4">bar comparison</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={typeAverages}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="type" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={11}
              angle={-20}
              textAnchor="end"
              height={60}
            />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [`${value.toFixed(2)} bar`, 'Avg Pressure']}
            />
            <Bar dataKey="avgPressure" fill={CHART_COLORS[1]} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Flowrate vs Pressure Scatter */}
      <div className="chart-container animate-slide-up" style={{ animationDelay: '250ms' }}>
        <h3 className="text-lg font-semibold text-foreground mb-2">Flowrate vs Pressure</h3>
        <p className="text-sm text-muted-foreground mb-4">Correlation analysis</p>
        <ResponsiveContainer width="100%" height={280}>
          <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              type="number" 
              dataKey="x" 
              name="Flowrate" 
              unit=" m³/h"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              type="number" 
              dataKey="y" 
              name="Pressure" 
              unit=" bar"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <ZAxis type="number" dataKey="z" range={[50, 200]} />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number, name: string) => [
                `${value.toFixed(2)}`,
                name === 'x' ? 'Flowrate' : name === 'y' ? 'Pressure' : 'Temperature'
              ]}
            />
            <Legend />
            <Scatter name="Equipment" data={scatterData} fill={CHART_COLORS[3]} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
