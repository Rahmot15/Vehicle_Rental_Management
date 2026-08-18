import knex, { type Knex } from 'knex';
import knexConfig from '../knexfile';

const database = knex(knexConfig.development as Knex.Config);

export default database;
