import app from './app';
import config from './config';

async function main() {
  const server = app.listen(config.port, () => {
    console.log(`Vehicle Rental Management API listening on port ${config.port}`);
  });

  server.on('error', (error: Error) => {
    console.error('Unable to start the server:', error.message);
    process.exit(1);
  });
}

main();
