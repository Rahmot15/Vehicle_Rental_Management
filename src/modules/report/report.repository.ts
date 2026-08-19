import database from '../../config/database/knex';
import type { Knex } from 'knex';

export class ReportRepository {
  constructor(protected readonly db: Knex = database) {}
}
