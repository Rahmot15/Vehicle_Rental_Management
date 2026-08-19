import type { RequestHandler, Response } from 'express';
import type { ApiResponse } from '../../types/api.types';
import type { ReportService } from './report.service';
import type { RentalReportQuery, RentalReportResponse } from './report.types';

export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  getRentals: RequestHandler = async (_req, res): Promise<void> => {
    const query = res.locals.validatedQuery as RentalReportQuery;
    const response = res as Response<ApiResponse<RentalReportResponse>>;
    const report = await this.reportService.getRentalReport(query);

    response.status(200).json({
      success: true,
      message: 'Rental report retrieved successfully.',
      data: report,
    });
  };
}
