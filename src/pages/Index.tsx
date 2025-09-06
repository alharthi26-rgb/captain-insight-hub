import { useState } from "react";
import { Package, TrendingUp, TrendingDown, DollarSign, AlertTriangle } from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { CaptainLeaderboard } from "@/components/dashboard/CaptainLeaderboard";
import { ChartSection } from "@/components/dashboard/ChartSection";
import { FilterPanel } from "@/components/dashboard/FilterPanel";
import { CaptainAnalysis } from "@/components/dashboard/CaptainAnalysis";
import { ExcelUpload } from "@/components/dashboard/ExcelUpload";
import { useDashboardData } from "@/hooks/useDashboardData";
import { mockShipmentData } from "@/data/mockData";
import { DateRange, ShipmentData } from "@/types/dashboard";

const Index = () => {
  const [selectedCompany, setSelectedCompany] = useState("all");
  const [selectedCaptain, setSelectedCaptain] = useState("all");
  const [selectedPackageCode, setSelectedPackageCode] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange>({});
  const [selectedCaptainForAnalysis, setSelectedCaptainForAnalysis] = useState<string | null>(null);
  const [uploadedData, setUploadedData] = useState<ShipmentData[] | null>(null);

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
  };

  if (selectedCaptainForAnalysis) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          <CaptainAnalysis
            captain={selectedCaptainForAnalysis}
            data={filteredData}
            onBack={() => setSelectedCaptainForAnalysis(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Captain Performance Dashboard</h1>
          <p className="text-xl text-muted-foreground">
            Monitor and analyze delivery captain performance across all operations
          </p>
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
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
          <KPICard
            title="Avg Cost per Delivery"
            value={`${globalKPIs.avgCostPerDelivered.toFixed(2)} SAR`}
            icon={DollarSign}
            variant="default"
          />
        </div>

        {/* Charts Section */}
        <div className="mb-8">
          <ChartSection captains={captainStats} />
        </div>

        {/* Captain Leaderboard */}
        <CaptainLeaderboard
          captains={captainStats}
          onCaptainSelect={setSelectedCaptainForAnalysis}
        />
      </div>
    </div>
  );
};

export default Index;
