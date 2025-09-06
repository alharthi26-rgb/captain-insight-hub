import { ShipmentData } from "@/types/dashboard";

// Generate mock data for the dashboard
const companies = ["Aramco", "SABIC", "STC", "Al Rajhi Bank", "Almarai", "SAMBA", "NCB", "Mobily"];
const captains = ["Ahmed Al-Mansouri", "Khalid Al-Zahrani", "Mohammed Al-Rashid", "Faisal Al-Otaibi", "Omar Al-Sudairy", "Sultan Al-Harbi", "Nasser Al-Qasimi", "Saad Al-Dosari"];
const packageCodes = ["PKG-001", "PKG-002", "PKG-003", "PKG-004", "PKG-005", "PKG-006"];

const generateRandomDate = () => {
  const start = new Date(2024, 0, 1);
  const end = new Date(2024, 11, 31);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

export const mockShipmentData: ShipmentData[] = Array.from({ length: 500 }, (_, i) => {
  const shipments = Math.floor(Math.random() * 50) + 10;
  const deliveredShipments = Math.floor(shipments * (0.7 + Math.random() * 0.25));
  const failedShipments = shipments - deliveredShipments;
  
  return {
    id: `shipment-${i}`,
    companyName: companies[Math.floor(Math.random() * companies.length)],
    packageCode: packageCodes[Math.floor(Math.random() * packageCodes.length)],
    date: generateRandomDate().toISOString().split('T')[0],
    shipments,
    deliveredShipments,
    failedShipments,
    captain: captains[Math.floor(Math.random() * captains.length)]
  };
});