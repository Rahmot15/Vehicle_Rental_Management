import database from '../../config/database/knex';
import type { Knex } from 'knex';
import type { StaffAuthRecord } from './auth.types';

export class AuthRepository {
  constructor(private readonly db: Knex = database) {}

  async findStaffByEmail(email: string): Promise<StaffAuthRecord | undefined> {
    return this.db<StaffAuthRecord>('staff')
      .select('id', 'email', 'password_hash', 'name')
      .where({ email })
      .first();
  }
}
