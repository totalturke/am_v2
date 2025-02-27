import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '../shared/schema.js';
import path from 'path';
import fs from 'fs';
import { MemStorage, storage } from './storage.js';

// Database setup function that checks for SQLite DB
export async function setupDatabase() {
  try {
    console.log("Setting up SQLite database...");
    
    // Data directory path - use /data for Railway persistence
    const dataDir = process.env.RAILWAY_ENVIRONMENT 
      ? '/data' 
      : path.resolve(process.cwd(), 'data');
    
    // Ensure data directory exists, try to create it even on Railway
    if (!fs.existsSync(dataDir)) {
      console.log(`Data directory not found. Attempting to create: ${dataDir}`);
      try {
        fs.mkdirSync(dataDir, { recursive: true });
        console.log(`Successfully created data directory: ${dataDir}`);
      } catch (err) {
        console.error(`Failed to create data directory: ${err}`);
        console.log('Will try to proceed anyway...');
      }
    }

    // Database file path
    const dbPath = path.join(dataDir, 'sqlite.db');
    console.log(`Using SQLite database at: ${dbPath}`);
    
    // Check if database file exists, if not initialize it
    const dbExists = fs.existsSync(dbPath);
    
    // Initialize the database connection
    const sqlite = new Database(dbPath);
    
    // Enable foreign keys
    sqlite.pragma('journal_mode = WAL');
    sqlite.pragma('foreign_keys = ON');
    
    // Create the Drizzle client
    const db = drizzle(sqlite, { schema });
    
    // If database was just created, initialize the schema
    if (!dbExists) {
      console.log("Database file not found. Initializing schema...");
      initializeSchema(sqlite);
    }
    
    console.log("SQLite database connection successful");
    return { db, sqlite, useMemory: false };
  } catch (error) {
    console.error("Failed to connect to SQLite database:", error);
    console.warn("Falling back to in-memory storage");
    return { useMemory: true, storage };
  }
}

// Initialize database schema
function initializeSchema(sqlite: Database.Database) {
  try {
    // Create all tables
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        avatar TEXT
      );

      CREATE TABLE IF NOT EXISTS cities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        state TEXT NOT NULL,
        country TEXT NOT NULL DEFAULT 'Mexico'
      );

      CREATE TABLE IF NOT EXISTS buildings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        city_id INTEGER NOT NULL,
        total_units INTEGER NOT NULL,
        FOREIGN KEY (city_id) REFERENCES cities(id)
      );

      CREATE TABLE IF NOT EXISTS apartments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        apartment_number TEXT NOT NULL,
        building_id INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        last_maintenance TEXT,
        next_maintenance TEXT,
        bedroom_count INTEGER NOT NULL,
        bathroom_count INTEGER NOT NULL,
        square_meters REAL,
        notes TEXT,
        image_url TEXT,
        FOREIGN KEY (building_id) REFERENCES buildings(id)
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id TEXT NOT NULL UNIQUE,
        type TEXT NOT NULL,
        apartment_id INTEGER NOT NULL,
        issue TEXT NOT NULL,
        description TEXT,
        reported_by TEXT,
        reported_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        scheduled_for TEXT,
        assigned_to INTEGER,
        priority TEXT NOT NULL DEFAULT 'medium',
        status TEXT NOT NULL DEFAULT 'pending',
        estimated_duration TEXT,
        completed_at TEXT,
        verified_by INTEGER,
        verified_at TEXT,
        evidence_photos TEXT DEFAULT '[]',
        FOREIGN KEY (apartment_id) REFERENCES apartments(id),
        FOREIGN KEY (assigned_to) REFERENCES users(id),
        FOREIGN KEY (verified_by) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS materials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 0,
        unit TEXT NOT NULL,
        notes TEXT
      );

      CREATE TABLE IF NOT EXISTS task_materials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id INTEGER NOT NULL,
        material_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'needed',
        FOREIGN KEY (task_id) REFERENCES tasks(id),
        FOREIGN KEY (material_id) REFERENCES materials(id)
      );

      CREATE TABLE IF NOT EXISTS purchase_orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        po_number TEXT NOT NULL UNIQUE,
        created_by INTEGER NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        status TEXT NOT NULL DEFAULT 'draft',
        total_amount REAL,
        notes TEXT,
        FOREIGN KEY (created_by) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS purchase_order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        purchase_order_id INTEGER NOT NULL,
        material_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price REAL,
        total_price REAL,
        FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id),
        FOREIGN KEY (material_id) REFERENCES materials(id)
      );
    `);
    
    console.log("Database schema created successfully!");
    
    // Add default admin user if none exists
    sqlite.exec(`
      INSERT OR IGNORE INTO users (username, password, name, role) 
      VALUES ('admin', 'admin123', 'System Administrator', 'control_center');
    `);
    
    console.log("Added default admin user");
  } catch (error) {
    console.error(`Error initializing database schema: ${error}`);
    throw error;
  }
}

// Export the memory storage for use when SQLite is not available
export { storage };
