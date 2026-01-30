import jsPDF from 'jspdf';
import { EquipmentData, DataSummary } from '@/types/equipment';

export const generatePDFReport = (
  data: EquipmentData[],
  summary: DataSummary,
  fileName: string = 'equipment-report'
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFillColor(30, 58, 95); // Primary navy
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Chemical Equipment Report', 20, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 35);
  
  // Reset text color
  doc.setTextColor(30, 40, 50);
  
  // Summary Section
  let yPos = 55;
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary Statistics', 20, yPos);
  
  yPos += 15;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const summaryItems = [
    ['Total Equipment Count', summary.totalCount.toString()],
    ['Average Flowrate', `${summary.avgFlowrate.toFixed(2)} m³/h`],
    ['Average Pressure', `${summary.avgPressure.toFixed(2)} bar`],
    ['Average Temperature', `${summary.avgTemperature.toFixed(2)} °C`],
    ['Flowrate Range', `${summary.minFlowrate.toFixed(2)} - ${summary.maxFlowrate.toFixed(2)} m³/h`],
    ['Pressure Range', `${summary.minPressure.toFixed(2)} - ${summary.maxPressure.toFixed(2)} bar`],
    ['Temperature Range', `${summary.minTemperature.toFixed(2)} - ${summary.maxTemperature.toFixed(2)} °C`],
  ];
  
  summaryItems.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label + ':', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 90, yPos);
    yPos += 8;
  });
  
  // Equipment Type Distribution
  yPos += 10;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Equipment Type Distribution', 20, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  Object.entries(summary.typeDistribution).forEach(([type, count]) => {
    const percentage = ((count / summary.totalCount) * 100).toFixed(1);
    doc.text(`${type}: ${count} units (${percentage}%)`, 25, yPos);
    yPos += 7;
  });
  
  // Equipment Data Table
  yPos += 15;
  
  if (yPos > 230) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Equipment Data (First 20 Records)', 20, yPos);
  
  yPos += 10;
  
  // Table header
  doc.setFillColor(240, 242, 245);
  doc.rect(15, yPos - 5, pageWidth - 30, 10, 'F');
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Equipment Name', 20, yPos);
  doc.text('Type', 80, yPos);
  doc.text('Flowrate', 120, yPos);
  doc.text('Pressure', 150, yPos);
  doc.text('Temp', 180, yPos);
  
  yPos += 8;
  doc.setFont('helvetica', 'normal');
  
  const displayData = data.slice(0, 20);
  
  displayData.forEach((item, index) => {
    if (yPos > 280) {
      doc.addPage();
      yPos = 20;
    }
    
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(15, yPos - 4, pageWidth - 30, 7, 'F');
    }
    
    doc.text(item.equipmentName.substring(0, 25), 20, yPos);
    doc.text(item.type.substring(0, 15), 80, yPos);
    doc.text(item.flowrate.toFixed(2), 120, yPos);
    doc.text(item.pressure.toFixed(2), 150, yPos);
    doc.text(item.temperature.toFixed(2), 180, yPos);
    
    yPos += 7;
  });
  
  // Footer
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${pageCount} | Chemical Equipment Parameter Visualizer`,
      pageWidth / 2,
      290,
      { align: 'center' }
    );
  }
  
  doc.save(`${fileName}.pdf`);
};
