import type { ReportRepository } from './report.repository';
import type { RentalReportQuery, RentalReportResponse } from './report.types';

export class ReportService {
  constructor(private readonly reportRepository: ReportRepository) {}

  async getRentalReport(query: RentalReportQuery): Promise<RentalReportResponse> {
    return {
      month: query.month,
      vehicles: [],
      highest_revenue_vehicle: null,
    };
  }
}
