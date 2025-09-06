import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Users, Package, Building, AlertCircle } from "lucide-react";

export function DriverSelectionCriteria() {
  const topPerformerCriteria = [
    {
      factor: "Success Rate",
      weight: 50,
      description: "Percentage of shipments delivered successfully",
      icon: TrendingUp,
      thresholds: [
        { range: "≥90%", label: "Excellent", color: "success" },
        { range: "85-89%", label: "Acceptable", color: "warning" },
        { range: "<85%", label: "Needs Improvement", color: "destructive" }
      ]
    },
    {
      factor: "Volume Handled",
      weight: 35,
      description: "Total number of shipments handled in the evaluation period",
      icon: Package,
      thresholds: [
        { range: "≥200 shipments", label: "Active & Reliable", color: "success" },
        { range: "<200 shipments", label: "Limited Sample", color: "warning" }
      ]
    },
    {
      factor: "Daily Consistency",
      weight: 15,
      description: "Stability of daily performance (standard deviation of daily success rates)",
      icon: Users,
      thresholds: [
        { range: "Std Dev ≤5%", label: "Consistent", color: "success" },
        { range: "5-10%", label: "Acceptable", color: "warning" },
        { range: ">10%", label: "Inconsistent", color: "destructive" }
      ]
    }
  ];

  const riskFactors = [
    {
      factor: "Low Success Rate",
      impact: "High",
      description: "Below 70% success rate indicates systematic issues",
      color: "destructive"
    },
    {
      factor: "High Failure Count",
      impact: "High", 
      description: "Absolute number of failed deliveries",
      color: "destructive"
    },
    {
      factor: "Low Activity",
      impact: "Medium",
      description: "Less than 10 shipments may indicate unreliability",
      color: "warning"
    },
    {
      factor: "Single Client Dependency",
      impact: "Medium",
      description: "Only serving 1-2 companies limits flexibility",
      color: "warning"
    }
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-success" />
            Top Performer Selection Criteria
          </CardTitle>
          <CardDescription>
            Weighted algorithm used to identify the best drivers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {topPerformerCriteria.map((criteria) => (
            <div key={criteria.factor} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <criteria.icon className="h-4 w-4 text-primary" />
                  <span className="font-medium text-lg">{criteria.factor}</span>
                </div>
                <Badge variant="default" className="text-sm font-bold">
                  {criteria.weight}% Weight
                </Badge>
              </div>
              <Progress value={criteria.weight} className="h-3" />
              <p className="text-sm text-muted-foreground">{criteria.description}</p>
              
              {/* Thresholds */}
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-foreground">Performance Thresholds:</h5>
                <div className="grid gap-2">
                  {criteria.thresholds.map((threshold, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-md bg-muted/30">
                      <span className="text-sm font-mono">{threshold.range}</span>
                      <Badge 
                        variant={
                          threshold.color === "success" ? "default" : 
                          threshold.color === "warning" ? "secondary" : 
                          "destructive"
                        }
                        className="text-xs"
                      >
                        {threshold.label}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
          
          <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <h4 className="font-semibold text-primary mb-2">Updated Performance Score Calculation</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Each driver receives a composite score from <strong>0-100</strong> based on normalized performance 
              across these <strong>3 criteria only</strong>:
            </p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center p-2 bg-background rounded">
                <div className="font-bold text-primary">50%</div>
                <div>Success Rate</div>
              </div>
              <div className="text-center p-2 bg-background rounded">
                <div className="font-bold text-primary">35%</div>
                <div>Volume</div>
              </div>
              <div className="text-center p-2 bg-background rounded">
                <div className="font-bold text-primary">15%</div>
                <div>Consistency</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-destructive" />
            Risk Assessment Factors
          </CardTitle>
          <CardDescription>
            Criteria for identifying drivers needing intervention
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {riskFactors.map((risk) => (
            <div key={risk.factor} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <span className="font-medium">{risk.factor}</span>
                </div>
                <Badge 
                  variant={risk.color === "destructive" ? "destructive" : "secondary"}
                >
                  {risk.impact} Impact
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{risk.description}</p>
            </div>
          ))}

          <div className="mt-6 space-y-4">
            <div className="p-4 bg-destructive/5 rounded-lg border border-destructive/20">
              <h4 className="font-semibold text-destructive mb-2">Risk Score &gt; 60</h4>
              <p className="text-sm text-muted-foreground">
                <strong>Recommendation:</strong> Stop account immediately and conduct full review
              </p>
            </div>
            
            <div className="p-4 bg-warning/5 rounded-lg border border-warning/20">
              <h4 className="font-semibold text-warning mb-2">Risk Score 40-60</h4>
              <p className="text-sm text-muted-foreground">
                <strong>Recommendation:</strong> Immediate retraining and close monitoring
              </p>
            </div>
            
            <div className="p-4 bg-secondary/5 rounded-lg border border-secondary/20">
              <h4 className="font-semibold text-secondary-foreground mb-2">Risk Score &lt; 40</h4>
              <p className="text-sm text-muted-foreground">
                <strong>Recommendation:</strong> Performance review and targeted coaching
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}