import type { Knex } from 'knex';
import database from '../../config/database/knex';
import { activeRentalStatuses } from './rental.types';
import type {
  CreateRentalRecord,
  RentalListQuery,
  RentalRow,
  UpdateRentalInput,
} from './rental.types';

export class RentalRepository {
  constructor(private readonly db: Knex = database) {}

  async findById(id: number): Promise<RentalRow | undefined> {
    return this.db<RentalRow>('rentals').where({ id }).first();
  }

  async findActiveRentalOverlap(
    vehicleId: number,
    startDate: string,
    endDate: string,
    excludedRentalId?: number,
    transaction?: Knex.Transaction,
  ): Promise<RentalRow | undefined> {
    const databaseConnection = transaction ?? this.db;
    const rentalQuery = databaseConnection<RentalRow>('rentals')
      .where('vehicle_id', vehicleId)
      .whereIn('status', activeRentalStatuses)
      .where('start_date', '<=', endDate)
      .where('end_date', '>=', startDate);

    if (excludedRentalId) {
      rentalQuery.whereNot('id', excludedRentalId);
    }

    return rentalQuery.first();
  }

  async create(input: CreateRentalRecord): Promise<RentalRow> {
    const [rental] = await this.db<RentalRow>('rentals').insert(input).returning('*');
    return rental;
  }

  async createInTransaction(
    input: CreateRentalRecord,
    transaction: Knex.Transaction,
  ): Promise<RentalRow> {
    const [rental] = await transaction<RentalRow>('rentals').insert(input).returning('*');
    return rental;
  }

  async runInTransaction<T>(callback: (transaction: Knex.Transaction) => Promise<T>): Promise<T> {
    return this.db.transaction(callback);
  }

  async update(
    id: number,
    input: UpdateRentalInput & { total_amount?: number },
  ): Promise<RentalRow | undefined> {
    const [rental] = await this.db<RentalRow>('rentals')
      .where({ id })
      .update({ ...input, updated_at: this.db.fn.now() })
      .returning('*');

    return rental;
  }

  async delete(id: number): Promise<RentalRow | undefined> {
    const [rental] = await this.db<RentalRow>('rentals').where({ id }).delete().returning('*');
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
