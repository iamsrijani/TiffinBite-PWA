import { MongoMemoryServer } from 'mongodb-memory-server';
import fs from 'fs';
import path from 'path';

// Ensure db_data directory exists for persistent storage
const dbPath = path.resolve('./db_data');
if (!fs.existsSync(dbPath)) {
  fs.mkdirSync(dbPath, { recursive: true });
}

console.log('Starting MongoDB Memory Server with persistent dbPath:', dbPath);

try {
  const mongod = await MongoMemoryServer.create({
    instance: {
      port: 27017,
      dbPath: dbPath,
      storageEngine: 'wiredTiger',
    },
  });

  console.log(`✅ MongoDB Memory Server is running!`);
  console.log(`URI: ${mongod.getUri()}`);
  console.log(`Port: 27017`);
  console.log(`Data directory: ${dbPath}`);

  // Handle termination signals to stop cleanly
  process.on('SIGTERM', async () => {
    console.log('Stopping MongoDB Memory Server...');
    await mongod.stop();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('Stopping MongoDB Memory Server...');
    await mongod.stop();
    process.exit(0);
  });
} catch (error) {
  console.error('❌ Failed to start MongoDB Memory Server:', error);
  process.exit(1);
}
