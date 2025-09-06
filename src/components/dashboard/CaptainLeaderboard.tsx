import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { CaptainStats } from "@/types/dashboard";
import { cn } from "@/lib/utils";

interface CaptainLeaderboardProps {
  captains: CaptainStats[];
}

type SortField = keyof CaptainStats;
type SortDirection = "asc" | "desc";

export function CaptainLeaderboard({ captains }: CaptainLeaderboardProps) {
  const [sortField, setSortField] = useState<SortField>("totalShipments");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const sortedCaptains = useMemo(() => {
    return [...captains].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [captains, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleCaptainClick = (captainName: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('captain', encodeURIComponent(captainName));
    window.open(url.toString(), '_blank');
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-auto p-0 hover:bg-transparent"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field ? (
          sortDirection === "desc" ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronUp className="h-3 w-3" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-50" />
        )}
      </div>
    </Button>
  );

  const getSuccessRateBadge = (rate: number) => {
    if (rate >= 90) return "success";
    if (rate >= 80) return "secondary";
    return "destructive";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Captain Performance Leaderboard</CardTitle>
        <CardDescription>
          Performance metrics for all captains - click to view detailed analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <SortButton field="captain">Captain</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton field="totalShipments">Shipments</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton field="delivered">Delivered</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton field="failed">Failed</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton field="successRate">Success Rate</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton field="companiesServed">Companies</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton field="packagesHandled">Packages</SortButton>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedCaptains.map((captain, index) => (
                <TableRow
                  key={captain.captain}
                  className={cn(
                    "cursor-pointer transition-colors hover:bg-muted/50",
                    index < 3 && "bg-primary/5"
                  )}
                  onClick={() => handleCaptainClick(captain.captain)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {index < 3 && (
                        <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 text-xs">
                          {index + 1}
                        </Badge>
                      )}
                      {captain.captain}
                    </div>
                  </TableCell>
                  <TableCell>{captain.totalShipments.toLocaleString()}</TableCell>
                  <TableCell className="text-success">{captain.delivered.toLocaleString()}</TableCell>
                  <TableCell className="text-destructive">{captain.failed.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={getSuccessRateBadge(captain.successRate)}>
                      {captain.successRate.toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell>{captain.companiesServed}</TableCell>
                  <TableCell>{captain.packagesHandled}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}