import React from 'react';
import { Activity, Gauge, Thermometer, Box } from 'lucide-react';
import { DataSummary } from '@/types/equipment';

interface SummaryCardsProps {
  summary: DataSummary;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
  colorClass: string;
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, subValue, colorClass, delay = 0 }) => (
  <div 
    className="stat-card animate-slide-up"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex items-start justify-between">
      <div className={`p-2.5 rounded-lg ${colorClass}`}>
        {icon}
      </div>
    </div>
    <div className="mt-4">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold text-foreground mt-1 font-mono">{value}</p>
      {subValue && (
        <p className="text-xs text-muted-foreground mt-1">{subValue}</p>
      )}
    </div>
  </div>
);

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary }) => {
  const stats = [
    {
      icon: <Box className="w-5 h-5 text-chart-equipment" />,
      label: 'Total Equipment',
      value: summary.totalCount.toString(),
      subValue: `${Object.keys(summary.typeDistribution).length} types`,
      colorClass: 'bg-purple-100',
    },
    {
      icon: <Activity className="w-5 h-5 text-chart-flowrate" />,
      label: 'Avg Flowrate',
      value: `${summary.avgFlowrate.toFixed(1)}`,
      subValue: `${summary.minFlowrate.toFixed(0)} - ${summary.maxFlowrate.toFixed(0)} m³/h`,
      colorClass: 'bg-teal-100',
    },
    {
      icon: <Gauge className="w-5 h-5 text-chart-pressure" />,
      label: 'Avg Pressure',
      value: `${summary.avgPressure.toFixed(1)}`,
      subValue: `${summary.minPressure.toFixed(0)} - ${summary.maxPressure.toFixed(0)} bar`,
      colorClass: 'bg-blue-100',
    },
    {
      icon: <Thermometer className="w-5 h-5 text-chart-temperature" />,
      label: 'Avg Temperature',
      value: `${summary.avgTemperature.toFixed(1)}`,
      subValue: `${summary.minTemperature.toFixed(0)} - ${summary.maxTemperature.toFixed(0)} °C`,
      colorClass: 'bg-orange-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <StatCard key={stat.label} {...stat} delay={index * 50} />
      ))}
    </div>
  );
};
