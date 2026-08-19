export interface RentalReportQuery {
  month: string;
  vehicle_id?: number;
}

export interface VehicleRentalReport {
  vehicle_id: number;
  vehicle_name: string;
  total_bookings: number;
  days_rented: number;
  revenue: number;
}

export interface VehicleRentalReportRow {
  vehicle_id: number;
  vehicle_name: string;
  total_bookings: string | number;
  days_rented: string | number;
  revenue: string | number;
}

export interface RentalReportResponse {
  month: string;
  vehicles: VehicleRentalReport[];
  highest_revenue_vehicle: VehicleRentalReport | null;
}
