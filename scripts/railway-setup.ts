/**
 * Railway deployment setup script
 * This script runs during the build process on Railway
 * to ensure the database is properly initialized and seeded
 */
import path from 'path';
import fs from 'fs';
import Database from 'better-sqlite3';
import { log } from '../server/vite';

// Initialize Railway database
async function setupRailwayDatabase() {
  try {
    log('Setting up Railway database...');
    
    // Data directory path - use /data for Railway persistence
    const dataDir = '/data';
    
    // Check if /data exists on Railway
    if (!fs.existsSync(dataDir)) {
      log('WARNING: Data directory not found on Railway');
      return;
    }
    
    // Database file path
    const dbPath = path.join(dataDir, 'sqlite.db');
    
    // Check if database file already exists
    const dbExists = fs.existsSync(dbPath);
    if (dbExists) {
      log('Database already exists, skipping initialization');
      return;
    }
    
    log(`Creating new database at: ${dbPath}`);
    
    // Initialize the database connection
    const sqlite = new Database(dbPath);
    
    // Enable WAL mode and foreign keys
    sqlite.pragma('journal_mode = WAL');
    sqlite.pragma('foreign_keys = ON');
    
    // Create the schema
    log('Initializing database schema...');
    initializeSchema(sqlite);
    
    // Seed with initial data
    log('Seeding database with initial data...');
    seedDatabase(sqlite);
    
    log('Railway database setup completed successfully');
  } catch (error) {
    log(`Error setting up Railway database: ${error}`);
    process.exit(1);
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
    
    log('Database schema created successfully');
  } catch (error) {
    log(`Error initializing database schema: ${error}`);
    throw error;
  }
}

// Seed database with initial data
function seedDatabase(sqlite: Database.Database) {
  try {
    // Add default admin user
    sqlite.exec(`
      INSERT OR IGNORE INTO users (username, password, name, role) 
      VALUES ('admin', 'admin123', 'System Administrator', 'control_center');
    `);
    
    // Add sample cities
    sqlite.exec(`
      INSERT OR IGNORE INTO cities (name, state, country) VALUES 
      ('Ciudad de México', 'CDMX', 'Mexico'),
      ('Guadalajara', 'Jalisco', 'Mexico'),
      ('Monterrey', 'Nuevo León', 'Mexico');
    `);
    
    // Add sample buildings
    sqlite.exec(`
      INSERT OR IGNORE INTO buildings (name, address, city_id, total_units) VALUES
      ('Edificio Central', 'Av. Reforma 123', 1, 20),
      ('Torre Norte', 'Calle Álamo 45', 2, 15);
    `);
    
    // Add sample apartments
    sqlite.exec(`
      INSERT OR IGNORE INTO apartments (apartment_number, building_id, bedroom_count, bathroom_count, square_meters) VALUES
      ('101', 1, 2, 1, 75),
      ('102', 1, 3, 2, 95),
      ('201', 1, 1, 1, 55),
      ('101', 2, 2, 2, 80),
      ('102', 2, 3, 2, 100);
    `);
    
    // Add sample materials
    sqlite.exec(`
      INSERT OR IGNORE INTO materials (name, quantity, unit, notes) VALUES
      ('Pintura blanca', 25, 'liters', 'Marca Sayer'),
      ('Focos LED', 50, 'pieces', '9W equivalente a 60W'),
      ('Tornillos 1 pulgada', 200, 'pieces', 'Caja de 200 unidades');
    `);
    
    log('Database seeded successfully');
  } catch (error) {
    log(`Error seeding database: ${error}`);
    throw error;
  }
}

// Run setup if this is on Railway
if (process.env.RAILWAY_ENVIRONMENT) {
  setupRailwayDatabase();
} else {
  log('Not running on Railway, skipping Railway-specific setup');
}
