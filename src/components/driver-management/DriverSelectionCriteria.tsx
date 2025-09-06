import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Users, Package, Building, AlertCircle } from "lucide-react";

export function DriverSelectionCriteria() {
  const topPerformerCriteria = [
    {
      factor: "Success Rate",
      weight: 40,
      description: "Percentage of successfully delivered shipments",
      icon: TrendingUp,
      benchmark: "≥90% Excellent | 80-89% Good | <80% Needs Improvement"
    },
    {
      factor: "Volume Handled",
      weight: 30,
      description: "Total number of shipments processed",
      icon: Package,
      benchmark: "Higher volume indicates experience and capacity"
    },
    {
      factor: "Client Diversity",
      weight: 20,
      description: "Number of different companies served",
      icon: Building,
      benchmark: "More companies = better adaptability"
    },
    {
      factor: "Package Handling",
      weight: 10,
      description: "Total packages processed efficiently",
      icon: Users,
      benchmark: "Reflects operational efficiency"
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
            <div key={criteria.factor} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <criteria.icon className="h-4 w-4 text-primary" />
                  <span className="font-medium">{criteria.factor}</span>
                </div>
                <Badge variant="secondary">{criteria.weight}% Weight</Badge>
              </div>
              <Progress value={criteria.weight} className="h-2" />
              <p className="text-sm text-muted-foreground">{criteria.description}</p>
              <div className="text-xs text-primary bg-primary/5 p-2 rounded">
                {criteria.benchmark}
              </div>
            </div>
          ))}
          
          <div className="mt-6 p-4 bg-success/5 rounded-lg border border-success/20">
            <h4 className="font-semibold text-success mb-2">Performance Score Calculation</h4>
            <p className="text-sm text-muted-foreground">
              Each driver receives a composite score from 0-100 based on normalized performance 
              across all criteria. Higher scores indicate better overall performance and reliability.
            </p>
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