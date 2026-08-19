import type { ReportRepository } from './report.repository';
import type {
  RentalReportQuery,
  RentalReportResponse,
  VehicleRentalReport,
  VehicleRentalReportRow,
} from './report.types';

export class ReportService {
  constructor(private readonly reportRepository: ReportRepository) {}

  async getRentalReport(query: RentalReportQuery): Promise<RentalReportResponse> {
    const { monthStart, monthEnd } = this.getMonthBounds(query.month);
    const reportRows = await this.reportRepository.getVehicleRentalReport(
      query,
      monthStart,
      monthEnd,
    );
    const vehicles = reportRows.map((row) => this.toVehicleRentalReport(row));

    return {
      month: query.month,
      vehicles,
      highest_revenue_vehicle: vehicles[0] ?? null,
    };
  }

  private getMonthBounds(month: string): { monthStart: string; monthEnd: string } {
    const [year, monthNumber] = month.split('-').map(Number);
    const monthStart = `${year}-${String(monthNumber).padStart(2, '0')}-01`;
    const lastDay = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
    const monthEnd = `${year}-${String(monthNumber).padStart(2, '0')}-${lastDay}`;

    return { monthStart, monthEnd };
  }

  private toVehicleRentalReport(row: VehicleRentalReportRow): VehicleRentalReport {
    return {
      vehicle_id: row.vehicle_id,
      vehicle_name: row.vehicle_name,
      total_bookings: Number(row.total_bookings),
      days_rented: Number(row.days_rented),
      revenue: Math.round(Number(row.revenue) * 100) / 100,
    };
  }
}
