import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import * as schema from '@shared/schema';
import { MemStorage, storage } from './storage';

// Database setup function that checks for DATABASE_URL
export async function setupDatabase() {
  if (process.env.DATABASE_URL) {
    try {
      console.log("Connecting to PostgreSQL database...");
      // Setup PostgreSQL connection
      const sql = neon(process.env.DATABASE_URL);
      const db = drizzle(sql, { schema });
      
      // Test connection
      const result = await sql`SELECT NOW()`;
      console.log("Database connection successful:", result);
      
      return { db, useMemory: false };
    } catch (error) {
      console.error("Failed to connect to PostgreSQL database:", error);
      console.warn("Falling back to in-memory storage");
      return { useMemory: true, storage };
    }
  } else {
    console.log("No DATABASE_URL provided, using in-memory storage");
    return { useMemory: true, storage };
  }
}

// Export the memory storage for use when DATABASE_URL is not available
export { storage };
