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

const port = Number(process.env.PORT ?? 5000);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be a valid port number.');
}

const config = {
  port,
  databaseUrl: getRequiredEnv('DATABASE_URL'),
  jwtSecret: getRequiredEnv('JWT_SECRET'),
  uploadPath: path.resolve(process.cwd(), process.env.UPLOAD_PATH ?? 'uploads'),
} as const;

export default config;
