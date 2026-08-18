import type { Knex } from 'knex';
import path from 'path';
import config from './index';

const knexConfig: Record<string, Knex.Config> = {
  development: {
    client: 'pg',
    connection: config.databaseUrl,
    pool: config.dbPool,
    migrations: {
      directory: path.resolve(process.cwd(), 'src/database/migrations'),
      extension: 'ts',
    },
    seeds: {
      directory: path.resolve(process.cwd(), 'src/database/seeds'),
      extension: 'ts',
    },
  },
};

export default knexConfig;
