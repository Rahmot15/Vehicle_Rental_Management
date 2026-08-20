import database from '../../config/database/knex';
import type { Knex } from 'knex';
import type { RentalReportQuery, VehicleRentalReportRow } from './report.types';

export class ReportRepository {
  constructor(protected readonly db: Knex = database) {}

  async getVehicleRentalReport(
    query: RentalReportQuery,
    monthStart: string,
    monthEnd: string,
  ): Promise<VehicleRentalReportRow[]> {
    const reportQuery = this.db('rentals as r')
      .join('vehicles as v', 'v.id', 'r.vehicle_id')
      .whereNot('r.status', 'cancelled')
      .where('r.start_date', '<=', monthEnd)
      // A soft-deleted vehicle is hidden from vehicle APIs, but its rental
      // history must remain visible in monthly reports.
      .where('r.end_date', '>=', monthStart);

    if (query.vehicle_id) {
      reportQuery.where('r.vehicle_id', query.vehicle_id);
    }

    return reportQuery
      .groupBy('v.id', 'v.name')
      .select<VehicleRentalReportRow[]>([
        'v.id as vehicle_id',
        'v.name as vehicle_name',
        this.db.raw('COUNT(r.id)::integer as total_bookings'),
        this.db.raw(
          `SUM((LEAST(r.end_date, ?::date) - GREATEST(r.start_date, ?::date) + 1))::integer as days_rented`,
          [monthEnd, monthStart],
        ),
        this.db.raw(
          `SUM(
            r.total_amount
            * (LEAST(r.end_date, ?::date) - GREATEST(r.start_date, ?::date) + 1)
            / (r.end_date - r.start_date + 1)
          )::numeric(14, 2) as revenue`,
          [monthEnd, monthStart],
        ),
      ])
      .orderBy('revenue', 'desc')
      .orderBy('v.id', 'asc');
  }
}
