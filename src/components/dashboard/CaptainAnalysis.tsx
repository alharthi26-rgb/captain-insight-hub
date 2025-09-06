import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, TrendingDown, Award, AlertTriangle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { ShipmentData } from "@/types/dashboard";
import { KPICard } from "./KPICard";

interface CaptainAnalysisProps {
  captain: string;
  data: ShipmentData[];
  onBack: () => void;
}

export function CaptainAnalysis({ captain, data, onBack }: CaptainAnalysisProps) {
  const captainData = useMemo(() => {
    return data.filter(item => item.captain === captain);
  }, [data, captain]);

  const captainKPIs = useMemo(() => {
    const totalShipments = captainData.reduce((sum, item) => sum + item.shipments, 0);
    const totalDelivered = captainData.reduce((sum, item) => sum + item.deliveredShipments, 0);
    const totalFailed = captainData.reduce((sum, item) => sum + item.failedShipments, 0);
    
    return {
      totalShipments,
      totalDelivered,
      totalFailed,
      successRate: totalShipments > 0 ? (totalDelivered / totalShipments) * 100 : 0,
    };
  }, [captainData]);

  const weeklyData = useMemo(() => {
    const weeklyMap = new Map();
    
    captainData.forEach(item => {
      const date = new Date(item.date);
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyMap.has(weekKey)) {
        weeklyMap.set(weekKey, {
          week: weekKey,
          shipments: 0,
          delivered: 0,
          failed: 0,
        });
      }
      
      const weekData = weeklyMap.get(weekKey);
      weekData.shipments += item.shipments;
      weekData.delivered += item.deliveredShipments;
      weekData.failed += item.failedShipments;
    });
    
    return Array.from(weeklyMap.values())
      .sort((a, b) => a.week.localeCompare(b.week))
      .map(item => ({
        ...item,
        successRate: item.shipments > 0 ? (item.delivered / item.shipments) * 100 : 0,
        week: new Date(item.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }));
  }, [captainData]);

  const overallAverage = useMemo(() => {
    const allData = data.length > 0 ? data : [];
    const totalShipments = allData.reduce((sum, item) => sum + item.shipments, 0);
    const totalDelivered = allData.reduce((sum, item) => sum + item.deliveredShipments, 0);
    const totalFailed = allData.reduce((sum, item) => sum + item.failedShipments, 0);
    
    return {
      successRate: totalShipments > 0 ? (totalDelivered / totalShipments) * 100 : 0,
      failureRate: totalShipments > 0 ? (totalFailed / totalShipments) * 100 : 0,
      avgShipmentsPerEntry: allData.length > 0 ? totalShipments / allData.length : 0,
    };
  }, [data]);

  const monthlyData = useMemo(() => {
    const monthlyMap = new Map();
    
    captainData.forEach(item => {
      const date = new Date(item.date);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, {
          month: monthKey,
          shipments: 0,
          delivered: 0,
          failed: 0,
        });
      }
      
      const monthData = monthlyMap.get(monthKey);
      monthData.shipments += item.shipments;
      monthData.delivered += item.deliveredShipments;
      monthData.failed += item.failedShipments;
    });
    
    return Array.from(monthlyMap.values())
      .sort((a, b) => a.month.localeCompare(b.month))
      .map(item => ({
        ...item,
        successRate: item.shipments > 0 ? (item.delivered / item.shipments) * 100 : 0,
        efficiency: item.shipments > 0 ? (item.delivered / item.shipments) - (overallAverage.successRate / 100) : 0,
        monthName: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      }));
  }, [captainData, overallAverage.successRate]);

  const companyDistribution = useMemo(() => {
    const companyMap = new Map();
    
    captainData.forEach(item => {
      if (!companyMap.has(item.companyName)) {
        companyMap.set(item.companyName, 0);
      }
      companyMap.set(item.companyName, companyMap.get(item.companyName) + item.shipments);
    });
    
    const colors = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];
    
    return Array.from(companyMap.entries())
      .map(([company, shipments], index) => ({
        company,
        shipments,
        fill: colors[index % colors.length]
      }))
      .sort((a, b) => b.shipments - a.shipments);
  }, [captainData]);

  const packagePerformance = useMemo(() => {
    const packageMap = new Map();
    
    captainData.forEach(item => {
      if (!packageMap.has(item.packageCode)) {
        packageMap.set(item.packageCode, {
          code: item.packageCode,
          shipments: 0,
          delivered: 0,
          failed: 0,
        });
      }
      
      const pkg = packageMap.get(item.packageCode);
      pkg.shipments += item.shipments;
      pkg.delivered += item.deliveredShipments;
      pkg.failed += item.failedShipments;
    });
    
    return Array.from(packageMap.values())
      .map(pkg => ({
        ...pkg,
        successRate: pkg.shipments > 0 ? (pkg.delivered / pkg.shipments) * 100 : 0,
        failureRate: pkg.shipments > 0 ? (pkg.failed / pkg.shipments) * 100 : 0,
      }))
      .sort((a, b) => b.shipments - a.shipments);
  }, [captainData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack} size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{captain} - Performance Analysis</h1>
          <p className="text-muted-foreground">Detailed performance metrics and trends</p>
        </div>
      </div>

      {/* Captain KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Shipments"
          value={captainKPIs.totalShipments.toLocaleString()}
          icon={Award}
          variant="default"
        />
        <KPICard
          title="Success Rate"
          value={`${captainKPIs.successRate.toFixed(1)}%`}
          icon={captainKPIs.successRate >= overallAverage.successRate ? TrendingUp : TrendingDown}
          variant={captainKPIs.successRate >= overallAverage.successRate ? "success" : "warning"}
          trend={{
            value: parseFloat((captainKPIs.successRate - overallAverage.successRate).toFixed(1)),
            isPositive: captainKPIs.successRate >= overallAverage.successRate
          }}
        />
        <KPICard
          title="Failed Shipments"
          value={captainKPIs.totalFailed.toLocaleString()}
          icon={AlertTriangle}
          variant="destructive"
        />
        <KPICard
          title="Efficiency vs Average"
          value={`${captainKPIs.successRate >= overallAverage.successRate ? '+' : ''}${(captainKPIs.successRate - overallAverage.successRate).toFixed(1)}%`}
          icon={captainKPIs.successRate >= overallAverage.successRate ? TrendingUp : TrendingDown}
          variant={captainKPIs.successRate >= overallAverage.successRate ? "success" : "warning"}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Historical Performance Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Performance History</CardTitle>
            <CardDescription>Captain performance vs overall average over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="monthName" 
                  className="text-muted-foreground text-xs"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis className="text-muted-foreground text-xs" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Bar dataKey="shipments" fill="hsl(var(--primary))" name="Shipments" />
                <Bar dataKey="delivered" fill="hsl(var(--success))" name="Delivered" />
                <Bar dataKey="failed" fill="hsl(var(--destructive))" name="Failed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance vs Average Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Performance vs Average</CardTitle>
            <CardDescription>
              How this captain performs compared to overall average ({overallAverage.successRate.toFixed(1)}%)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="monthName" 
                  className="text-muted-foreground text-xs"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  className="text-muted-foreground text-xs"
                  domain={['dataMin - 5', 'dataMax + 5']}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)}%`, "Success Rate"]}
                />
                <Line 
                  type="monotone" 
                  dataKey="successRate" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                  name="Captain Performance"
                />
                {/* Benchmark line */}
                <Line 
                  type="monotone" 
                  dataKey={() => overallAverage.successRate}
                  stroke="hsl(var(--muted-foreground))" 
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  dot={false}
                  name="Overall Average"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Performance Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Performance Trend</CardTitle>
            <CardDescription>Recent shipments, deliveries, and failures</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="week" 
                  className="text-muted-foreground text-xs"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis className="text-muted-foreground text-xs" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Line type="monotone" dataKey="shipments" stroke="hsl(var(--primary))" strokeWidth={2} name="Shipments" />
                <Line type="monotone" dataKey="delivered" stroke="hsl(var(--success))" strokeWidth={2} name="Delivered" />
                <Line type="monotone" dataKey="failed" stroke="hsl(var(--destructive))" strokeWidth={2} name="Failed" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Company Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Companies Served</CardTitle>
            <CardDescription>Distribution of shipments by company</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={companyDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ company, percent }) => `${company}: ${(percent || 0).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="shipments"
                >
                  {companyDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Package Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Package Code Performance</CardTitle>
            <CardDescription>Success rate by package type handled</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {packagePerformance.map((pkg) => (
                <div key={pkg.code} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <code className="text-sm font-mono bg-background px-2 py-1 rounded">
                      {pkg.code}
                    </code>
                    <span className="text-sm text-muted-foreground">
                      {pkg.shipments} shipments
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={pkg.successRate >= 90 ? "default" : pkg.successRate >= 80 ? "secondary" : "destructive"}
                    >
                      {pkg.successRate.toFixed(1)}% success
                    </Badge>
                    {pkg.failureRate > 20 && (
                      <Badge variant="destructive">
                        High failure rate
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}