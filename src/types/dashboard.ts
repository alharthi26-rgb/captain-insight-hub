export interface ShipmentData {
  id: string;
  companyName: string;
  packageCode: string;
  date: string;
  shipments: number;
  packageFare: number;
  deliveredShipments: number;
  failedShipments: number;
  captain: string;
}

export interface CaptainStats {
  captain: string;
  totalShipments: number;
  delivered: number;
  failed: number;
  successRate: number;
  failureRate: number;
  costPerDelivered: number;
  companiesServed: number;
  packagesHandled: number;
}

export interface GlobalKPIs {
  totalShipments: number;
  totalDelivered: number;
  totalFailed: number;
  successRate: number;
  avgCostPerDelivered: number;
}

export interface DateRange {
  from?: Date;
  to?: Date;
}