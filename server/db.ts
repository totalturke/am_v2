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
    
    // Ensure data directory exists
    const dataDir = path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      console.log(`Creating data directory: ${dataDir}`);
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Use the SQLite database file path
    const dbPath = path.resolve(dataDir, 'sqlite.db');
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
