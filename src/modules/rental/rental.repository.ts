import type { Knex } from 'knex';
import database from '../../config/database/knex';
import type { CreateRentalRecord, RentalListQuery, RentalRow } from './rental.types';

export class RentalRepository {
  constructor(private readonly db: Knex = database) {}

  async findById(id: number): Promise<RentalRow | undefined> {
    return this.db<RentalRow>('rentals').where({ id }).first();
  }

  async hasActiveRentalOverlap(
    vehicleId: number,
    startDate: string,
    endDate: string,
  ): Promise<boolean> {
    const conflictingRental = await this.db<RentalRow>('rentals')
      .where('vehicle_id', vehicleId)
      .whereIn('status', ['booked', 'ongoing'])
      .where('start_date', '<=', endDate)
      .where('end_date', '>=', startDate)
      .first('id');

    return Boolean(conflictingRental);
  }

  async create(input: CreateRentalRecord): Promise<RentalRow> {
    const [rental] = await this.db<RentalRow>('rentals').insert(input).returning('*');
    return rental;
  }

  async findAll(query: RentalListQuery): Promise<{ rentals: RentalRow[]; total: number }> {
    const rentalQuery = this.db<RentalRow>('rentals');

    if (query.vehicle_id) {
      rentalQuery.where('vehicle_id', query.vehicle_id);
    }

    if (query.status) {
      rentalQuery.where('status', query.status);
    }

    if (query.start_date) {
      rentalQuery.where('end_date', '>=', query.start_date);
    }

    if (query.end_date) {
      rentalQuery.where('start_date', '<=', query.end_date);
    }

    const totalResult = await rentalQuery.clone().count<{ count: string }>({ count: 'id' }).first();
    const rentals = await rentalQuery
      .clone()
      .select('*')
      .orderBy('start_date', 'desc')
      .orderBy('id', 'desc')
      .limit(query.limit)
      .offset((query.page - 1) * query.limit);

    return {
      rentals,
      total: Number(totalResult?.count ?? 0),
    };
  }
}
