#!/usr/bin/env node

// This script helps push the current database schema to Railway 
// or any other PostgreSQL database specified by DATABASE_URL

import { exec } from 'child_process';
import { readFileSync } from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('Error: DATABASE_URL environment variable is not set.');
  console.error('Please set it to your Railway PostgreSQL connection string before running this script.');
  process.exit(1);
}

console.log('Starting database migration...');
console.log('Target: PostgreSQL database at Railway');

// Run drizzle-kit push
exec('npx drizzle-kit push', { cwd: projectRoot }, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error running migration: ${error.message}`);
    process.exit(1);
  }
  
  console.log(stdout);
  
  if (stderr) {
    console.error(`Migration warnings/errors: ${stderr}`);
  }
  
  console.log('Migration completed successfully!');
});
