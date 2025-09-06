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
import { Input } from "@/components/ui/input";
import { ArrowUpDown, ChevronUp, ChevronDown, Filter } from "lucide-react";
import { CaptainStats } from "@/types/dashboard";
import { cn } from "@/lib/utils";

interface CaptainLeaderboardProps {
  captains: CaptainStats[];
}

type SortField = keyof CaptainStats;
type SortDirection = "asc" | "desc";

interface Filters {
  captain: string;
  totalShipments: { min: string; max: string };
  delivered: { min: string; max: string };
  failed: { min: string; max: string };
  successRate: { min: string; max: string };
  companiesServed: { min: string; max: string };
  packagesHandled: { min: string; max: string };
}

export function CaptainLeaderboard({ captains }: CaptainLeaderboardProps) {
  const [sortField, setSortField] = useState<SortField>("totalShipments");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [filters, setFilters] = useState<Filters>({
    captain: "",
    totalShipments: { min: "", max: "" },
    delivered: { min: "", max: "" },
    failed: { min: "", max: "" },
    successRate: { min: "", max: "" },
    companiesServed: { min: "", max: "" },
    packagesHandled: { min: "", max: "" },
  });
  const [showFilters, setShowFilters] = useState(false);

  const filteredAndSortedCaptains = useMemo(() => {
    // Apply filters first
    let filtered = captains.filter((captain) => {
      // Captain name filter
      if (filters.captain && !captain.captain.toLowerCase().includes(filters.captain.toLowerCase())) {
        return false;
      }

      // Numeric filters
      const numericFields: Array<keyof Omit<Filters, 'captain'>> = [
        'totalShipments', 'delivered', 'failed', 'successRate', 'companiesServed', 'packagesHandled'
      ];

      for (const field of numericFields) {
        const filter = filters[field];
        const value = captain[field];
        
        if (filter.min && parseFloat(filter.min) > value) return false;
        if (filter.max && parseFloat(filter.max) < value) return false;
      }

      return true;
    });

    // Then sort
    return filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [captains, sortField, sortDirection, filters]);

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

  const handleFilterChange = (field: keyof Filters, value: string | { min: string; max: string }) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      captain: "",
      totalShipments: { min: "", max: "" },
      delivered: { min: "", max: "" },
      failed: { min: "", max: "" },
      successRate: { min: "", max: "" },
      companiesServed: { min: "", max: "" },
      packagesHandled: { min: "", max: "" },
    });
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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? "Hide" : "Show"} Filters
            </Button>
            {showFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <div className="space-y-2">
                    <SortButton field="captain">Captain</SortButton>
                    {showFilters && (
                      <Input
                        placeholder="Filter captain..."
                        value={filters.captain}
                        onChange={(e) => handleFilterChange("captain", e.target.value)}
                        className="h-8"
                      />
                    )}
                  </div>
                </TableHead>
                <TableHead>
                  <div className="space-y-2">
                    <SortButton field="totalShipments">Shipments</SortButton>
                    {showFilters && (
                      <div className="flex gap-1">
                        <Input
                          placeholder="Min"
                          value={filters.totalShipments.min}
                          onChange={(e) => handleFilterChange("totalShipments", { ...filters.totalShipments, min: e.target.value })}
                          className="h-8 text-xs"
                          type="number"
                        />
                        <Input
                          placeholder="Max"
                          value={filters.totalShipments.max}
                          onChange={(e) => handleFilterChange("totalShipments", { ...filters.totalShipments, max: e.target.value })}
                          className="h-8 text-xs"
                          type="number"
                        />
                      </div>
                    )}
                  </div>
                </TableHead>
                <TableHead>
                  <div className="space-y-2">
                    <SortButton field="delivered">Delivered</SortButton>
                    {showFilters && (
                      <div className="flex gap-1">
                        <Input
                          placeholder="Min"
                          value={filters.delivered.min}
                          onChange={(e) => handleFilterChange("delivered", { ...filters.delivered, min: e.target.value })}
                          className="h-8 text-xs"
                          type="number"
                        />
                        <Input
                          placeholder="Max"
                          value={filters.delivered.max}
                          onChange={(e) => handleFilterChange("delivered", { ...filters.delivered, max: e.target.value })}
                          className="h-8 text-xs"
                          type="number"
                        />
                      </div>
                    )}
                  </div>
                </TableHead>
                <TableHead>
                  <div className="space-y-2">
                    <SortButton field="failed">Failed</SortButton>
                    {showFilters && (
                      <div className="flex gap-1">
                        <Input
                          placeholder="Min"
                          value={filters.failed.min}
                          onChange={(e) => handleFilterChange("failed", { ...filters.failed, min: e.target.value })}
                          className="h-8 text-xs"
                          type="number"
                        />
                        <Input
                          placeholder="Max"
                          value={filters.failed.max}
                          onChange={(e) => handleFilterChange("failed", { ...filters.failed, max: e.target.value })}
                          className="h-8 text-xs"
                          type="number"
                        />
                      </div>
                    )}
                  </div>
                </TableHead>
                <TableHead>
                  <div className="space-y-2">
                    <SortButton field="successRate">Success Rate</SortButton>
                    {showFilters && (
                      <div className="flex gap-1">
                        <Input
                          placeholder="Min %"
                          value={filters.successRate.min}
                          onChange={(e) => handleFilterChange("successRate", { ...filters.successRate, min: e.target.value })}
                          className="h-8 text-xs"
                          type="number"
                        />
                        <Input
                          placeholder="Max %"
                          value={filters.successRate.max}
                          onChange={(e) => handleFilterChange("successRate", { ...filters.successRate, max: e.target.value })}
                          className="h-8 text-xs"
                          type="number"
                        />
                      </div>
                    )}
                  </div>
                </TableHead>
                <TableHead>
                  <div className="space-y-2">
                    <SortButton field="companiesServed">Companies</SortButton>
                    {showFilters && (
                      <div className="flex gap-1">
                        <Input
                          placeholder="Min"
                          value={filters.companiesServed.min}
                          onChange={(e) => handleFilterChange("companiesServed", { ...filters.companiesServed, min: e.target.value })}
                          className="h-8 text-xs"
                          type="number"
                        />
                        <Input
                          placeholder="Max"
                          value={filters.companiesServed.max}
                          onChange={(e) => handleFilterChange("companiesServed", { ...filters.companiesServed, max: e.target.value })}
                          className="h-8 text-xs"
                          type="number"
                        />
                      </div>
                    )}
                  </div>
                </TableHead>
                <TableHead>
                  <div className="space-y-2">
                    <SortButton field="packagesHandled">Packages</SortButton>
                    {showFilters && (
                      <div className="flex gap-1">
                        <Input
                          placeholder="Min"
                          value={filters.packagesHandled.min}
                          onChange={(e) => handleFilterChange("packagesHandled", { ...filters.packagesHandled, min: e.target.value })}
                          className="h-8 text-xs"
                          type="number"
                        />
                        <Input
                          placeholder="Max"
                          value={filters.packagesHandled.max}
                          onChange={(e) => handleFilterChange("packagesHandled", { ...filters.packagesHandled, max: e.target.value })}
                          className="h-8 text-xs"
                          type="number"
                        />
                      </div>
                    )}
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedCaptains.map((captain, index) => (
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