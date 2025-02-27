/**
 * Railway deployment setup script
 * This script runs during the build process on Railway
 * to ensure the database is properly initialized and seeded
 */
import path from 'path';
import fs from 'fs';
import { initializeSQLiteSchema } from './init-sqlite';

// Railroad setup function specifically for running in Railway environment
async function setupRailwayDatabase() {
  console.log('Setting up Railway database...');

  // Determine the data directory path
  const dataDir = process.env.RAILWAY_ENVIRONMENT ? '/data' : path.resolve(process.cwd(), 'data');
  
  // Create the data directory if it doesn't exist
  if (!fs.existsSync(dataDir)) {
    console.log(`WARNING: Data directory not found on Railway`);
    try {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log(`Successfully created data directory: ${dataDir}`);
    } catch (err) {
      console.error(`ERROR: Failed to create data directory: ${err}`);
      console.log('Will attempt to proceed anyway...');
    }
  } else {
    console.log(`Data directory found at: ${dataDir}`);
  }

  // Database path
  const dbPath = path.join(dataDir, 'sqlite.db');
  
  // Check if database already exists
  const dbExists = fs.existsSync(dbPath);
  if (dbExists) {
    console.log(`Database already exists at: ${dbPath}`);
    console.log('Skipping database initialization');
    return;
  }
  
  // Initialize the database schema
  try {
    console.log(`Initializing database at: ${dbPath}`);
    await initializeSQLiteSchema(dbPath);
    console.log('Database initialization successful!');
  } catch (error) {
    console.error(`ERROR: Failed to initialize database: ${error}`);
    // Don't throw - let the application handle any database issues at runtime
  }
}

setupRailwayDatabase().catch(error => {
  console.error('Railway setup failed:', error);
  process.exit(1);
});
