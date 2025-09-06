import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCheck, Download, Star } from "lucide-react";
import { CaptainStats } from "@/types/dashboard";
import { useToast } from "@/hooks/use-toast";

interface TopDriversSelectionProps {
  captains: CaptainStats[];
}

export function TopDriversSelection({ captains }: TopDriversSelectionProps) {
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>([]);
  const [targetCount, setTargetCount] = useState(80);
  const { toast } = useToast();

  // Sort drivers by performance score (updated weighted algorithm)
  const topDrivers = useMemo(() => {
    return [...captains]
      .map(captain => {
        // Calculate normalized scores for each criterion
        const maxShipments = Math.max(...captains.map(c => c.totalShipments));
        
        // Success Rate Score (50% weight) - Direct percentage
        const successRateScore = captain.successRate;
        
        // Volume Handled Score (35% weight) - Normalized to 0-100
        const volumeScore = maxShipments > 0 ? (captain.totalShipments / maxShipments) * 100 : 0;
        
        // Daily Consistency Score (15% weight) - Simulated based on success rate
        // Higher success rate = more consistent (simplified for demo)
        const consistencyScore = captain.successRate >= 90 ? 95 : 
                               captain.successRate >= 85 ? 80 : 
                               captain.successRate >= 80 ? 65 : 50;
        
        // Calculate weighted performance score
        const performanceScore = (
          successRateScore * 0.5 +      // 50% weight
          volumeScore * 0.35 +          // 35% weight  
          consistencyScore * 0.15       // 15% weight
        );

        return {
          ...captain,
          performanceScore,
          volumeScore,
          consistencyScore
        };
      })
      .sort((a, b) => b.performanceScore - a.performanceScore)
      .slice(0, Math.min(targetCount * 2, captains.length)); // Show more options than target
  }, [captains, targetCount]);

  const handleSelectAll = () => {
    const topIds = topDrivers.slice(0, targetCount).map(d => d.captain);
    setSelectedDrivers(topIds);
  };

  const handleDriverToggle = (driverId: string) => {
    setSelectedDrivers(prev => 
      prev.includes(driverId)
        ? prev.filter(id => id !== driverId)
        : [...prev, driverId]
    );
  };

  const handleExport = () => {
    const selectedData = topDrivers.filter(d => selectedDrivers.includes(d.captain));
    const csvContent = [
      'Captain,Success Rate,Total Shipments,Volume Score,Consistency Score,Performance Score,Delivered,Failed',
      ...selectedData.map(d => 
        `${d.captain},${d.successRate.toFixed(1)}%,${d.totalShipments},${d.volumeScore.toFixed(1)},${d.consistencyScore.toFixed(1)},${d.performanceScore.toFixed(1)},${d.delivered},${d.failed}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `top-${selectedDrivers.length}-drivers.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: `Exported ${selectedDrivers.length} top performing drivers`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-success" />
              Top Performing Drivers
            </CardTitle>
            <CardDescription>
              Select the best {targetCount} drivers to maintain next week
            </CardDescription>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Star className="h-3 w-3" />
            {selectedDrivers.length} Selected
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="target-count">Target Count:</Label>
            <Input
              id="target-count"
              type="number"
              value={targetCount}
              onChange={(e) => setTargetCount(Number(e.target.value))}
              className="w-20"
              min="1"
              max="200"
            />
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSelectAll}
          >
            Select Top {targetCount}
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleExport}
            disabled={selectedDrivers.length === 0}
            className="ml-auto"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Selected
          </Button>
        </div>

        <ScrollArea className="h-96">
          <div className="space-y-2">
            {topDrivers.map((driver, index) => (
              <div
                key={driver.captain}
                className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                  selectedDrivers.includes(driver.captain)
                    ? 'bg-primary/5 border-primary/20'
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
                      {index < 10 && (
                        <Badge variant="secondary" className="text-xs">Top 10</Badge>
                      )}
                    </div>
                    <Badge 
                      variant={driver.successRate >= 90 ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {driver.performanceScore.toFixed(1)} Score
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Success: {driver.successRate.toFixed(1)}%</span>
                      <span>Volume: {driver.totalShipments.toLocaleString()}</span>
                      <span>Consistency: {driver.consistencyScore.toFixed(0)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Score: {driver.performanceScore.toFixed(1)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}