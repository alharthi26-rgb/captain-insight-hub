import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserX, Download, AlertTriangle, GraduationCap } from "lucide-react";
import { CaptainStats } from "@/types/dashboard";
import { useToast } from "@/hooks/use-toast";

interface WorstDriversSelectionProps {
  captains: CaptainStats[];
}

export function WorstDriversSelection({ captains }: WorstDriversSelectionProps) {
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>([]);
  const [maxSuccessRate, setMaxSuccessRate] = useState(70);
  const { toast } = useToast();

  // Sort drivers by worst performance (lowest success rate, highest failure rate)
  const worstDrivers = useMemo(() => {
    return [...captains]
      .filter(captain => captain.successRate <= maxSuccessRate && captain.totalShipments > 0)
      .map(captain => ({
        ...captain,
        riskScore: (
          (100 - captain.successRate) * 0.5 +
          (captain.failed / Math.max(captain.totalShipments, 1)) * 100 * 0.3 +
          (captain.totalShipments < 10 ? 20 : 0) * 0.2 // Penalty for low activity
        )
      }))
      .sort((a, b) => b.riskScore - a.riskScore);
  }, [captains, maxSuccessRate]);

  const handleSelectAll = () => {
    const allIds = worstDrivers.map(d => d.captain);
    setSelectedDrivers(allIds);
  };

  const handleDriverToggle = (driverId: string) => {
    setSelectedDrivers(prev => 
      prev.includes(driverId)
        ? prev.filter(id => id !== driverId)
        : [...prev, driverId]
    );
  };

  const handleExportForRetraining = () => {
    const selectedData = worstDrivers.filter(d => selectedDrivers.includes(d.captain));
    const csvContent = [
      'Captain,Success Rate,Failure Rate,Total Shipments,Failed,Risk Score,Recommended Action',
      ...selectedData.map(d => 
        `${d.captain},${d.successRate.toFixed(1)}%,${d.failureRate.toFixed(1)}%,${d.totalShipments},${d.failed},${d.riskScore.toFixed(1)},${d.riskScore > 50 ? 'Stop Account' : 'Retraining Required'}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `underperforming-drivers-${selectedDrivers.length}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: `Exported ${selectedDrivers.length} underperforming drivers for review`,
    });
  };

  const getActionRecommendation = (driver: any) => {
    if (driver.riskScore > 60) return { action: "Stop Account", variant: "destructive" as const };
    if (driver.riskScore > 40) return { action: "Immediate Retraining", variant: "destructive" as const };
    return { action: "Performance Review", variant: "secondary" as const };
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UserX className="h-5 w-5 text-destructive" />
              Underperforming Drivers
            </CardTitle>
            <CardDescription>
              Identify drivers for retraining or account suspension
            </CardDescription>
          </div>
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            {selectedDrivers.length} Selected
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="max-success-rate">Max Success Rate:</Label>
            <Input
              id="max-success-rate"
              type="number"
              value={maxSuccessRate}
              onChange={(e) => setMaxSuccessRate(Number(e.target.value))}
              className="w-20"
              min="0"
              max="100"
            />
            <span className="text-sm text-muted-foreground">%</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSelectAll}
          >
            Select All ({worstDrivers.length})
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleExportForRetraining}
            disabled={selectedDrivers.length === 0}
            className="ml-auto"
          >
            <Download className="h-4 w-4 mr-2" />
            Export for Review
          </Button>
        </div>

        <ScrollArea className="h-96">
          <div className="space-y-2">
            {worstDrivers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <GraduationCap className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No drivers found below {maxSuccessRate}% success rate</p>
                <p className="text-sm">All drivers are performing well!</p>
              </div>
            ) : (
              worstDrivers.map((driver, index) => {
                const recommendation = getActionRecommendation(driver);
                return (
                  <div
                    key={driver.captain}
                    className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                      selectedDrivers.includes(driver.captain)
                        ? 'bg-destructive/5 border-destructive/20'
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <Checkbox
                      checked={selectedDrivers.includes(driver.captain)}
                      onCheckedChange={() => handleDriverToggle(driver.captain)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">#{index + 1}</span>
                          <span className="font-semibold">{driver.captain}</span>
                          {driver.riskScore > 60 && (
                            <Badge variant="destructive" className="text-xs">High Risk</Badge>
                          )}
                        </div>
                        <Badge 
                          variant={recommendation.variant}
                          className="text-xs"
                        >
                          Risk: {driver.riskScore.toFixed(1)}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Success: {driver.successRate.toFixed(1)}%</span>
                          <span>Failed: {driver.failed}</span>
                          <span>Total: {driver.totalShipments}</span>
                        </div>
                        <Badge variant={recommendation.variant} className="text-xs">
                          {recommendation.action}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}