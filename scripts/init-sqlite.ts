import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import * as schema from '../shared/schema';

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
console.log(`Initializing SQLite database at: ${dbPath}`);

// Initialize the database connection
const sqlite = new Database(dbPath);

// Enable foreign keys
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

// Create the Drizzle client
const db = drizzle(sqlite, { schema });

// Create database schema
console.log('Creating database schema...');

try {
  // Create all tables from our schema definitions
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
  
  console.log('Database schema created successfully!');
} catch (error) {
  console.error('Error creating database schema:', error);
  process.exit(1);
}

// Close the database connection
sqlite.close();
