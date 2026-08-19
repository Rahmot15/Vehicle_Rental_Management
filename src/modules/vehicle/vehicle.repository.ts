import database from '../../config/database/knex';
import type { Knex } from 'knex';
import type {
  CreateVehicleInput,
  UpdateVehicleInput,
  VehicleListQuery,
  VehicleRow,
} from './vehicle.types';

export class VehicleRepository {
  constructor(private readonly db: Knex = database) {}

  async create(input: CreateVehicleInput & { photo_path: string | null }): Promise<VehicleRow> {
    const [vehicle] = await this.db<VehicleRow>('vehicles').insert(input).returning('*');
    return vehicle;
  }

  async findById(id: number): Promise<VehicleRow | undefined> {
    return this.db<VehicleRow>('vehicles').where({ id }).whereNull('deleted_at').first();
  }

  async findByPlateNumber(plateNumber: string): Promise<VehicleRow | undefined> {
    return this.db<VehicleRow>('vehicles').where({ plate_number: plateNumber }).first();
  }

  async findAll(query: VehicleListQuery): Promise<{ vehicles: VehicleRow[]; total: number }> {
    const vehicleQuery = this.db<VehicleRow>('vehicles').whereNull('deleted_at');

    if (query.category) {
      vehicleQuery.where('category', query.category);
    }

    if (query.search) {
      vehicleQuery.whereILike('name', `%${query.search}%`);
    }

    const totalResult = await vehicleQuery
      .clone()
      .count<{ count: string }>({ count: 'id' })
      .first();
    const vehicles = await vehicleQuery
      .clone()
      .select('*')
      .orderBy('created_at', 'desc')
      .limit(query.limit)
      .offset((query.page - 1) * query.limit);

    return {
      vehicles,
      total: Number(totalResult?.count ?? 0),
    };
  }

  async update(
    id: number,
    input: UpdateVehicleInput & { photo_path?: string },
  ): Promise<VehicleRow | undefined> {
    const [vehicle] = await this.db<VehicleRow>('vehicles')
      .where({ id })
      .whereNull('deleted_at')
      .update({ ...input, updated_at: this.db.fn.now() })
      .returning('*');

    return vehicle;
  }

  async softDelete(id: number): Promise<VehicleRow | undefined> {
    const [vehicle] = await this.db<VehicleRow>('vehicles')
      .where({ id })
      .whereNull('deleted_at')
      .update({
        deleted_at: this.db.fn.now(),
        updated_at: this.db.fn.now(),
      })
      .returning('*');

    return vehicle;
  }
}
