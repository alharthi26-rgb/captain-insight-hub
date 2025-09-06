import { useState } from "react";
import { Package, TrendingUp, TrendingDown, AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KPICard } from "@/components/dashboard/KPICard";
import { CaptainLeaderboard } from "@/components/dashboard/CaptainLeaderboard";
import { ChartSection } from "@/components/dashboard/ChartSection";
import { FilterPanel } from "@/components/dashboard/FilterPanel";
import { CaptainAnalysis } from "@/components/dashboard/CaptainAnalysis";
import { ExcelUpload } from "@/components/dashboard/ExcelUpload";
import { useDashboardData } from "@/hooks/useDashboardData";
import { mockShipmentData } from "@/data/mockData";
import { DateRange, ShipmentData } from "@/types/dashboard";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Index = () => {
  const [selectedCompany, setSelectedCompany] = useState("all");
  const [selectedCaptain, setSelectedCaptain] = useState("all");
  const [selectedPackageCode, setSelectedPackageCode] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange>({});
  const [uploadedData, setUploadedData] = useState<ShipmentData[] | null>(null);
  const { toast } = useToast();

  // Check URL parameters for captain analysis
  const urlParams = new URLSearchParams(window.location.search);
  const captainFromUrl = urlParams.get('captain');
  const selectedCaptainForAnalysis = captainFromUrl ? decodeURIComponent(captainFromUrl) : null;

  const currentData = uploadedData || mockShipmentData;

  const {
    globalKPIs,
    captainStats,
    uniqueCompanies,
    uniqueCaptains,
    uniquePackageCodes,
    filteredData
  } = useDashboardData(currentData, {
    company: selectedCompany,
    captain: selectedCaptain,
    packageCode: selectedPackageCode,
    dateRange
  });

  const handleResetFilters = () => {
    setSelectedCompany("all");
    setSelectedCaptain("all");
    setSelectedPackageCode("all");
    setDateRange({});
  };

  const handleDataUpload = (data: ShipmentData[]) => {
    setUploadedData(data);
    handleResetFilters(); // Reset filters when new data is uploaded
  };

  const handleClearData = () => {
    setUploadedData(null);
    handleResetFilters();
    toast({
      title: "Data Cleared",
      description: "All data has been reset to default mock data",
      variant: "default",
    });
  };

  if (selectedCaptainForAnalysis) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          <CaptainAnalysis
            captain={selectedCaptainForAnalysis}
            data={filteredData}
            onBack={() => window.close()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Captain Performance Dashboard</h1>
              <p className="text-xl text-muted-foreground">
                Monitor and analyze delivery captain performance across all operations
              </p>
            </div>
            {uploadedData && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-destructive hover:text-destructive">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset All Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reset All Data</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all uploaded data and reset the dashboard to default mock data. 
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleClearData}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Reset Everything
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        <ExcelUpload 
          onDataLoaded={handleDataUpload}
          hasData={uploadedData !== null}
          onClearData={handleClearData}
        />

        <FilterPanel
          companies={uniqueCompanies}
          captains={uniqueCaptains}
          packageCodes={uniquePackageCodes}
          selectedCompany={selectedCompany}
          selectedCaptain={selectedCaptain}
          selectedPackageCode={selectedPackageCode}
          dateRange={dateRange}
          onCompanyChange={setSelectedCompany}
          onCaptainChange={setSelectedCaptain}
          onPackageCodeChange={setSelectedPackageCode}
          onDateRangeChange={setDateRange}
          onResetFilters={handleResetFilters}
        />

        {/* Global KPIs */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <KPICard
            title="Total Shipments"
            value={globalKPIs.totalShipments.toLocaleString()}
            icon={Package}
            variant="default"
          />
          <KPICard
            title="Total Delivered"
            value={globalKPIs.totalDelivered.toLocaleString()}
            icon={TrendingUp}
            variant="success"
          />
          <KPICard
            title="Total Failed"
            value={globalKPIs.totalFailed.toLocaleString()}
            icon={AlertTriangle}
            variant="destructive"
          />
          <KPICard
            title="Success Rate"
            value={`${globalKPIs.successRate.toFixed(1)}%`}
            icon={globalKPIs.successRate >= 85 ? TrendingUp : TrendingDown}
            variant={globalKPIs.successRate >= 85 ? "success" : "warning"}
          />
        </div>

        {/* Charts Section */}
        <div className="mb-8">
          <ChartSection captains={captainStats} />
        </div>

        {/* Captain Leaderboard */}
        <CaptainLeaderboard
          captains={captainStats}
        />
      </div>
    </div>
  );
};

export default Index;
