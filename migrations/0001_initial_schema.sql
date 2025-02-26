-- Create users table
CREATE TABLE IF NOT EXISTS "users" (
  "id" SERIAL PRIMARY KEY,
  "username" TEXT NOT NULL UNIQUE,
  "password" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "email" TEXT,
  "phone" TEXT,
  "avatar" TEXT
);

-- Create cities table
CREATE TABLE IF NOT EXISTS "cities" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "country" TEXT NOT NULL DEFAULT 'Mexico'
);

-- Create buildings table
CREATE TABLE IF NOT EXISTS "buildings" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "city_id" INTEGER NOT NULL,
  "total_units" INTEGER NOT NULL
);

-- Create apartments table
CREATE TABLE IF NOT EXISTS "apartments" (
  "id" SERIAL PRIMARY KEY,
  "apartment_number" TEXT NOT NULL,
  "building_id" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'active',
  "last_maintenance" TIMESTAMP,
  "next_maintenance" TIMESTAMP,
  "bedroom_count" INTEGER NOT NULL,
  "bathroom_count" INTEGER NOT NULL,
  "square_meters" REAL,
  "notes" TEXT,
  "image_url" TEXT
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS "tasks" (
  "id" SERIAL PRIMARY KEY,
  "task_id" TEXT NOT NULL UNIQUE,
  "type" TEXT NOT NULL,
  "apartment_id" INTEGER NOT NULL,
  "issue" TEXT NOT NULL,
  "description" TEXT,
  "reported_by" TEXT,
  "reported_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "scheduled_for" TIMESTAMP,
  "assigned_to" INTEGER,
  "priority" TEXT NOT NULL DEFAULT 'medium',
  "status" TEXT NOT NULL DEFAULT 'pending',
  "estimated_duration" TEXT,
  "completed_at" TIMESTAMP,
  "verified_by" INTEGER,
  "verified_at" TIMESTAMP,
  "evidence_photos" JSON DEFAULT '[]'
);

-- Create materials table
CREATE TABLE IF NOT EXISTS "materials" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 0,
  "unit" TEXT NOT NULL,
  "notes" TEXT
);

-- Create task_materials table
CREATE TABLE IF NOT EXISTS "task_materials" (
  "id" SERIAL PRIMARY KEY,
  "task_id" INTEGER NOT NULL,
  "material_id" INTEGER NOT NULL,
  "quantity" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'needed'
);

-- Create purchase_orders table
CREATE TABLE IF NOT EXISTS "purchase_orders" (
  "id" SERIAL PRIMARY KEY,
  "po_number" TEXT NOT NULL UNIQUE,
  "created_by" INTEGER NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "status" TEXT NOT NULL DEFAULT 'draft',
  "submitted_at" TIMESTAMP,
  "approved_by" INTEGER,
  "approved_at" TIMESTAMP,
  "received_at" TIMESTAMP,
  "total_amount" REAL,
  "notes" TEXT
);

-- Create purchase_order_items table
CREATE TABLE IF NOT EXISTS "purchase_order_items" (
  "id" SERIAL PRIMARY KEY,
  "purchase_order_id" INTEGER NOT NULL,
  "material_id" INTEGER NOT NULL,
  "quantity" INTEGER NOT NULL,
  "unit_price" REAL NOT NULL,
  "total_price" REAL NOT NULL
);

-- Create session table for login
CREATE TABLE IF NOT EXISTS "session" (
  "sid" VARCHAR NOT NULL PRIMARY KEY,
  "sess" JSON NOT NULL,
  "expire" TIMESTAMP(6) NOT NULL
);
