import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), '.env') });

function getRequiredEnv(name: 'DATABASE_URL' | 'JWT_SECRET'): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} must be set in the .env file.`);
  }

  return value;
}

function getPositiveIntegerEnv(name: 'DB_POOL_MIN' | 'DB_POOL_MAX', fallback: number): number {
  const value = Number(process.env[name] ?? fallback);

  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${name} must be a non-negative integer.`);
  }

  return value;
}

const port = Number(process.env.PORT ?? 5000);
const dbPoolMin = getPositiveIntegerEnv('DB_POOL_MIN', 2);
const dbPoolMax = getPositiveIntegerEnv('DB_POOL_MAX', 10);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be a valid port number.');
}

if (dbPoolMin > dbPoolMax) {
  throw new Error('DB_POOL_MIN cannot be greater than DB_POOL_MAX.');
}

const config = {
  port,
  databaseUrl: getRequiredEnv('DATABASE_URL'),
  dbPool: {
    min: dbPoolMin,
    max: dbPoolMax,
  },
  jwtSecret: getRequiredEnv('JWT_SECRET'),
  uploadPath: path.resolve(process.cwd(), process.env.UPLOAD_PATH ?? 'src/uploads'),
} as const;

export default config;
