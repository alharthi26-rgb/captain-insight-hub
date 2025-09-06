import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { CaptainStats } from "@/types/dashboard";

interface ChartSectionProps {
  captains: CaptainStats[];
}

export function ChartSection({ captains }: ChartSectionProps) {
  // Top 10 captains by shipments
  const topCaptains = captains
    .sort((a, b) => b.totalShipments - a.totalShipments)
    .slice(0, 10)
    .map(captain => ({
      name: captain.captain.split(' ')[0], // First name only for chart
      shipments: captain.totalShipments,
      delivered: captain.delivered,
      failed: captain.failed
    }));

  // Captains with highest failure rate (min 200 shipments)
  const highFailureCaptains = captains
    .filter(captain => captain.totalShipments >= 200)
    .sort((a, b) => b.failureRate - a.failureRate)
    .slice(0, 8)
    .map(captain => ({
      name: captain.captain.split(' ')[0],
      failureRate: captain.failureRate,
      totalShipments: captain.totalShipments
    }));

  // Success rate distribution
  const successRateData = [
    { range: "90%+", count: captains.filter(c => c.successRate >= 90).length, fill: "hsl(var(--success))" },
    { range: "80-89%", count: captains.filter(c => c.successRate >= 80 && c.successRate < 90).length, fill: "hsl(var(--warning))" },
    { range: "70-79%", count: captains.filter(c => c.successRate >= 70 && c.successRate < 80).length, fill: "hsl(var(--chart-4))" },
    { range: "<70%", count: captains.filter(c => c.successRate < 70).length, fill: "hsl(var(--destructive))" }
  ];

  const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Captains by Volume</CardTitle>
          <CardDescription>Captains with highest shipment volumes</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topCaptains}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="name" 
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
              <Bar dataKey="shipments" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Highest Failure Rates</CardTitle>
          <CardDescription>Captains with highest failure rates (min 200 shipments)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={highFailureCaptains}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="name" 
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
                formatter={(value: number) => [`${value.toFixed(1)}%`, "Failure Rate"]}
              />
              <Bar dataKey="failureRate" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Success Rate Distribution</CardTitle>
          <CardDescription>Distribution of captains by success rate ranges</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={successRateData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ range, count, percent }) => `${range}: ${count} (${(percent || 0).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {successRateData.map((entry, index) => (
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

      <Card>
        <CardHeader>
          <CardTitle>Performance Correlation</CardTitle>
          <CardDescription>Shipment volume vs Success rate</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={topCaptains}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="name" 
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
              <Line 
                type="monotone" 
                dataKey="delivered" 
                stroke="hsl(var(--success))" 
                strokeWidth={2}
                dot={{ fill: "hsl(var(--success))" }}
              />
              <Line 
                type="monotone" 
                dataKey="failed" 
                stroke="hsl(var(--destructive))" 
                strokeWidth={2}
                dot={{ fill: "hsl(var(--destructive))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}