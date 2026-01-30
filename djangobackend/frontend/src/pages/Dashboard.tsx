import React, { useState } from 'react';
import { FileDown, Loader2, BarChart3, Table2, History, LayoutDashboard } from 'lucide-react';
import { Header } from '@/components/Header';
import { CSVUploader } from '@/components/CSVUploader';
import { SummaryCards } from '@/components/SummaryCards';
import { EquipmentTable } from '@/components/EquipmentTable';
import { EquipmentCharts } from '@/components/EquipmentCharts';
import { UploadHistoryList } from '@/components/UploadHistory';
import { useEquipmentData } from '@/hooks/useEquipmentData';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Dashboard = () => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  const {
    data,
    summary,
    uploadHistory,
    isLoading,
    error,
    processFile,
    loadSampleData,
    loadFromHistory,
    generatePDF,
  } = useEquipmentData();

  const handleGeneratePDF = async () => {
    if (!summary) return;
    
    setIsGeneratingPDF(true);
    await generatePDF();
    setIsGeneratingPDF(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8 animate-fade-in">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Equipment Parameter Dashboard
          </h2>
          <p className="text-muted-foreground max-w-2xl">
            Upload your CSV data to visualize flowrate, pressure, and temperature distributions 
            across your chemical equipment inventory.
          </p>
        </div>

        {/* Upload Section */}
        <div className="mb-8">
          <CSVUploader
            onFileSelect={processFile}
            onLoadSample={loadSampleData}
            isLoading={isLoading}
            error={error}
          />
        </div>

        {/* Data Display Section with Tabs */}
        {summary && data.length > 0 ? (
          <>
            {/* Actions Bar */}
            <div className="flex items-center justify-between mb-6 animate-slide-up">
              <h3 className="text-xl font-semibold text-foreground">Data Analysis</h3>
              <Button
                onClick={handleGeneratePDF}
                disabled={isGeneratingPDF}
                variant="outline"
                className="gap-2"
              >
                {isGeneratingPDF ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileDown className="w-4 h-4" />
                )}
                Export PDF Report
              </Button>
            </div>

            {/* Tabbed Interface */}
            <Tabs defaultValue="summary" className="animate-fade-in">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="summary" className="gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Summary</span>
                </TabsTrigger>
                <TabsTrigger value="charts" className="gap-2" disabled={!summary}>
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Charts</span>
                </TabsTrigger>
                <TabsTrigger value="table" className="gap-2" disabled={!data.length}>
                  <Table2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Table</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="gap-2">
                  <History className="w-4 h-4" />
                  <span className="hidden sm:inline">History</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-6">
                <SummaryCards summary={summary} />
              </TabsContent>

              <TabsContent value="charts" className="space-y-6">
                <EquipmentCharts data={data} summary={summary} />
              </TabsContent>

              <TabsContent value="table" className="space-y-6">
                {data.length > 0 ? (
                  <EquipmentTable data={data} />
                ) : (
                  <div className="text-center py-16">
                    <div className="inline-flex p-4 rounded-full bg-muted mb-4">
                      <Table2 className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      No Table Data Available
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Equipment data is stored securely on the server. Use the Charts tab for visualizations or History tab to load previous uploads.
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="history" className="space-y-6">
                <UploadHistoryList
                  history={uploadHistory}
                  onSelect={loadFromHistory}
                />
              </TabsContent>
            </Tabs>
          </>
        ) : (
          /* Empty State */
          !isLoading && (
            <div className="text-center py-16 animate-fade-in">
              <div className="inline-flex p-4 rounded-full bg-muted mb-4">
                <FileDown className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No Data Loaded
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Upload a CSV file or load sample data to start analyzing your chemical equipment parameters.
              </p>
            </div>
          )
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Chemical Equipment Parameter Visualizer — React Frontend Demo
            </p>
            <p className="text-xs text-muted-foreground">
              Ready to connect to Django REST API backend
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
