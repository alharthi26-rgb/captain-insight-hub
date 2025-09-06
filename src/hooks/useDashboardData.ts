import { useMemo } from "react";
import { ShipmentData, CaptainStats, GlobalKPIs, DateRange } from "@/types/dashboard";

export function useDashboardData(
  data: ShipmentData[],
  filters: {
    company: string;
    captain: string;
    packageCode: string;
    dateRange: DateRange;
  }
) {
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (filters.company !== "all" && item.companyName !== filters.company) {
        return false;
      }
      if (filters.captain !== "all" && item.captain !== filters.captain) {
        return false;
      }
      if (filters.packageCode !== "all" && item.packageCode !== filters.packageCode) {
        return false;
      }
      
      if (filters.dateRange.from || filters.dateRange.to) {
        const itemDate = new Date(item.date);
        if (filters.dateRange.from && itemDate < filters.dateRange.from) {
          return false;
        }
        if (filters.dateRange.to && itemDate > filters.dateRange.to) {
          return false;
        }
      }
      
      return true;
    });
  }, [data, filters]);

  const globalKPIs = useMemo((): GlobalKPIs => {
    const totalShipments = filteredData.reduce((sum, item) => sum + item.shipments, 0);
    const totalDelivered = filteredData.reduce((sum, item) => sum + item.deliveredShipments, 0);
    const totalFailed = filteredData.reduce((sum, item) => sum + item.failedShipments, 0);
    const totalCost = filteredData.reduce((sum, item) => sum + (item.packageFare * item.deliveredShipments), 0);
    
    return {
      totalShipments,
      totalDelivered,
      totalFailed,
      successRate: totalShipments > 0 ? (totalDelivered / totalShipments) * 100 : 0,
      avgCostPerDelivered: totalDelivered > 0 ? totalCost / totalDelivered : 0,
    };
  }, [filteredData]);

  const captainStats = useMemo((): CaptainStats[] => {
    const captainMap = new Map<string, {
      totalShipments: number;
      delivered: number;
      failed: number;
      totalCost: number;
      companies: Set<string>;
      packages: Set<string>;
    }>();

    filteredData.forEach((item) => {
      if (!captainMap.has(item.captain)) {
        captainMap.set(item.captain, {
          totalShipments: 0,
          delivered: 0,
          failed: 0,
          totalCost: 0,
          companies: new Set(),
          packages: new Set(),
        });
      }

      const stats = captainMap.get(item.captain)!;
      stats.totalShipments += item.shipments;
      stats.delivered += item.deliveredShipments;
      stats.failed += item.failedShipments;
      stats.totalCost += item.packageFare * item.deliveredShipments;
      stats.companies.add(item.companyName);
      stats.packages.add(item.packageCode);
    });

    return Array.from(captainMap.entries()).map(([captain, stats]) => ({
      captain,
      totalShipments: stats.totalShipments,
      delivered: stats.delivered,
      failed: stats.failed,
      successRate: stats.totalShipments > 0 ? (stats.delivered / stats.totalShipments) * 100 : 0,
      failureRate: stats.totalShipments > 0 ? (stats.failed / stats.totalShipments) * 100 : 0,
      costPerDelivered: stats.delivered > 0 ? stats.totalCost / stats.delivered : 0,
      companiesServed: stats.companies.size,
      packagesHandled: stats.packages.size,
    }));
  }, [filteredData]);

  const uniqueCompanies = useMemo(() => {
    return Array.from(new Set(data.map(item => item.companyName))).sort();
  }, [data]);

  const uniqueCaptains = useMemo(() => {
    return Array.from(new Set(data.map(item => item.captain))).sort();
  }, [data]);

  const uniquePackageCodes = useMemo(() => {
    return Array.from(new Set(data.map(item => item.packageCode))).sort();
  }, [data]);

  return {
    filteredData,
    globalKPIs,
    captainStats,
    uniqueCompanies,
    uniqueCaptains,
    uniquePackageCodes,
  };
}