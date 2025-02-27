import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import * as schema from '@shared/schema';
import { MemStorage, storage } from './storage';

// Database setup function that checks for DATABASE_URL
export async function setupDatabase() {
  if (process.env.DATABASE_URL) {
    try {
      console.log("Connecting to PostgreSQL database...");
      
      // Add connection retry logic
      let sql;
      let retries = 5;
      
      while (retries > 0) {
        try {
          // Setup PostgreSQL connection
          sql = neon(process.env.DATABASE_URL);
          // Test connection with timeout
          const result = await Promise.race([
            sql`SELECT NOW()`,
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Database connection timeout')), 10000)
            )
          ]);
          
          console.log("Database connection successful:", result);
          break;
        } catch (err) {
          retries--;
          if (retries === 0) throw err;
          
          console.log(`Database connection failed, retrying... (${retries} attempts left)`);
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, (5 - retries) * 1000));
        }
      }
      
      if (!sql) throw new Error("Failed to establish database connection after retries");
      
      const db = drizzle(sql, { schema });
      return { db, useMemory: false };
    } catch (error) {
      console.error("Failed to connect to PostgreSQL database:", error);
      
      if (process.env.NODE_ENV === 'production') {
        console.error("DATABASE CONNECTION FAILURE IN PRODUCTION MODE");
        console.error("This is a critical error that should be addressed immediately.");
        console.error("Check your DATABASE_URL environment variable in Railway.");
        
        // In production, we might want to exit instead of fallback
        if (process.env.FORCE_EXIT_ON_DB_FAILURE === 'true') {
          console.error("Exiting due to FORCE_EXIT_ON_DB_FAILURE=true");
          process.exit(1);
        }
      }
      
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
