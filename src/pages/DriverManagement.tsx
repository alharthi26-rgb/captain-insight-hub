import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Users, UserCheck, UserX, AlertTriangle, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { TopDriversSelection } from "@/components/driver-management/TopDriversSelection";
import { WorstDriversSelection } from "@/components/driver-management/WorstDriversSelection"; 
import { DriverSelectionCriteria } from "@/components/driver-management/DriverSelectionCriteria";
import { useDashboardData } from "@/hooks/useDashboardData";
import { mockShipmentData } from "@/data/mockData";

export default function DriverManagement() {
  const [uploadedData, setUploadedData] = useState(null);
  const [filters, setFilters] = useState({
    company: "all",
    captain: "all", 
    packageCode: "all",
    dateRange: { from: undefined, to: undefined }
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const storedData = localStorage.getItem('dashboardData');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log('Loaded data from localStorage:', parsedData?.length || 0, 'records');
        setUploadedData(parsedData);
      } catch (error) {
        console.error('Failed to parse stored data:', error);
        localStorage.removeItem('dashboardData');
      }
    } else {
      console.log('No stored data found, using mock data');
    }
  }, []);

  const currentData = uploadedData || mockShipmentData;
  console.log('Current data for processing:', currentData?.length || 0, 'records');

  const { captainStats } = useDashboardData(currentData, filters);
  console.log('Captain stats calculated:', captainStats?.length || 0, 'captains');

  // Show empty state when no data
  if (!uploadedData || uploadedData.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Driver Management</h1>
                <p className="text-muted-foreground">Optimize your driver roster for maximum performance</p>
              </div>
            </div>
          </div>
        </header>
        
        <main className="container mx-auto p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <Users className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
              <div>
                <h3 className="text-xl font-semibold mb-2">No Driver Data Available</h3>
                <p className="text-muted-foreground mb-6">
                  Please upload data from the main dashboard to manage drivers
                </p>
                <Link to="/">
                  <Button>Go to Dashboard</Button>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Driver Management</h1>
                <p className="text-muted-foreground">Optimize your driver roster for maximum performance</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-2">
                <Users className="h-4 w-4" />
                {captainStats.length} Total Drivers
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6">
        <div className="grid gap-6 mb-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
                <TrendingUp className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">
                  {captainStats.filter(c => c.successRate >= 90).length}
                </div>
                <p className="text-xs text-muted-foreground">≥90% Success Rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Good Performers</CardTitle>
                <UserCheck className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">
                  {captainStats.filter(c => c.successRate >= 80 && c.successRate < 90).length}
                </div>
                <p className="text-xs text-muted-foreground">80-89% Success Rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Need Training</CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {captainStats.filter(c => c.successRate < 80).length}
                </div>
                <p className="text-xs text-muted-foreground">&lt;80% Success Rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inactive</CardTitle>
                <UserX className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-muted-foreground">
                  {captainStats.filter(c => c.totalShipments === 0).length}
                </div>
                <p className="text-xs text-muted-foreground">No Shipments</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="selection" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="selection">Driver Selection</TabsTrigger>
            <TabsTrigger value="criteria">Selection Criteria</TabsTrigger>
          </TabsList>

          <TabsContent value="selection" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <TopDriversSelection captains={captainStats} />
              <WorstDriversSelection captains={captainStats} />
            </div>
          </TabsContent>

          <TabsContent value="criteria">
            <DriverSelectionCriteria />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}