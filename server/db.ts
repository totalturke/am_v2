import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '@shared/schema';
import path from 'path';
import fs from 'fs';
import { MemStorage, storage } from './storage';

// Database setup function that checks for SQLite DB
export async function setupDatabase() {
  try {
    console.log("Setting up SQLite database...");
    
    // Data directory path - use /data for Railway persistence
    const dataDir = process.env.RAILWAY_ENVIRONMENT 
      ? '/data' 
      : path.resolve(process.cwd(), 'data');
    
    // Ensure data directory exists if not in Railway (Railway's /data already exists)
    if (!process.env.RAILWAY_ENVIRONMENT && !fs.existsSync(dataDir)) {
      console.log(`Creating data directory: ${dataDir}`);
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Database file path
    const dbPath = path.join(dataDir, 'sqlite.db');
    console.log(`Using SQLite database at: ${dbPath}`);
    
    // Initialize the database connection
    const sqlite = new Database(dbPath);
    
    // Enable foreign keys
    sqlite.pragma('journal_mode = WAL');
    sqlite.pragma('foreign_keys = ON');
    
    // Create the Drizzle client
    const db = drizzle(sqlite, { schema });
    
    console.log("SQLite database connection successful");
    return { db, sqlite, useMemory: false };
  } catch (error) {
    console.error("Failed to connect to SQLite database:", error);
    console.warn("Falling back to in-memory storage");
    return { useMemory: true, storage };
  }
}

// Export the memory storage for use when SQLite is not available
export { storage };
