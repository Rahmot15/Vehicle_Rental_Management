import database from '../config/database/knex';

async function checkDatabaseConnection(): Promise<void> {
  try {
    await database.raw('SELECT 1');
    console.log('Database connection successful.');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown database error.';
    console.error(`Database connection failed: ${message}`);
    process.exitCode = 1;
  } finally {
    await database.destroy();
  }
}

void checkDatabaseConnection();
