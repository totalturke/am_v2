// Debug utility to check database data
import express, { Request, Response } from 'express';
import { storage } from './storage';
import { Express } from 'express';
import fs from 'fs';
import path from 'path';
import { DB } from './db';

// Utility logging function
export function log(message: string) {
  const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
  console.log(`${timestamp} [express] ${message}`);
}

export function setupDebugRoutes(app: Express, dbInfo: DB) {
  // Only include debug routes in development or when explicitly allowed
  if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_DEBUG_ROUTES === 'true') {
    
    // Endpoint to get all storage data for debugging
    app.get('/api/debug/data', async (req: Request, res: Response) => {
      try {
        const users = await storage.getUsers();
        const cities = await storage.getCities();
        const buildings = await storage.getBuildings();
        const apartments = await storage.getApartments();
        const tasks = await storage.getTasks();
        
        // Get expanded apartment data
        const expandedApartments = await Promise.all(apartments.map(async (apartment) => {
          const building = await storage.getBuilding(apartment.buildingId);
          let city;
          if (building) {
            city = await storage.getCity(building.cityId);
          }
          
          return {
            ...apartment,
            building,
            city
          };
        }));
        
        res.json({
          users,
          cities,
          buildings,
          apartments,
          expandedApartments,
          tasks
        });
      } catch (error) {
        console.error('Debug API error:', error);
        res.status(500).json({ message: "Error retrieving debug data" });
      }
    });
    
    // Endpoint to reinitialize the database with test data
    app.post('/api/debug/reset', async (req: Request, res: Response) => {
      try {
        // Reset the database
        await (storage as any).resetData();
        
        res.json({ message: "Database reset successfully" });
      } catch (error) {
        console.error('Database reset error:', error);
        res.status(500).json({ message: "Error resetting database" });
      }
    });
    
    // Basic health check endpoint
    app.get('/api/debug/health', (req, res) => {
      res.json({
        status: 'ok',
        environment: process.env.NODE_ENV || 'development',
        railway: process.env.RAILWAY_ENVIRONMENT ? true : false,
        timestamp: new Date().toISOString()
      });
    });

    // System info endpoint
    app.get('/api/debug/system', (req, res) => {
      const env = { ...process.env };
      
      // Redact sensitive info
      delete env.PATH;
      delete env.HOME;
      
      res.json({
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        cwd: process.cwd(),
        railway: process.env.RAILWAY_ENVIRONMENT ? true : false,
        env: env
      });
    });
    
    // Database connection test
    app.get('/api/debug/database', async (req, res) => {
      try {
        // Check database info
        const info = {
          inMemory: dbInfo.useMemory || false,
          location: 'unknown'
        };
        
        // Try to run a simple query to verify the connection
        let connectionTest = { success: false, error: null };
        try {
          const result = await dbInfo.db.select({ count: dbInfo.schema.users.id.count() }).from(dbInfo.schema.users);
          connectionTest = { 
            success: true, 
            userCount: result[0].count,
            error: null 
          };
        } catch (error) {
          connectionTest = { success: false, error: error.message };
        }
        
        // Check SQLite database path if we're using SQLite
        let dbPath = null;
        let dbFileExists = false;
        let dbFileSize = null;
        let dataDir = null;
        let dataDirExists = false;
        let dataDirContents = [];
        
        if (dbInfo.sqlite) {
          try {
            dbPath = dbInfo.sqlite.name;
            if (dbPath) {
              dataDir = path.dirname(dbPath);
              dataDirExists = fs.existsSync(dataDir);
              
              if (dataDirExists) {
                dataDirContents = fs.readdirSync(dataDir);
              }
              
              dbFileExists = fs.existsSync(dbPath);
              if (dbFileExists) {
                const stats = fs.statSync(dbPath);
                dbFileSize = stats.size;
              }
            }
          } catch (error) {
            console.error('Error checking database file:', error);
          }
        }
        
        res.json({
          databaseInfo: info,
          connectionTest,
          fileSystem: {
            dbPath,
            dbFileExists,
            dbFileSize,
            dataDir,
            dataDirExists,
            dataDirContents
          }
        });
      } catch (error) {
        res.status(500).json({ 
          error: 'Database connection test failed',
          message: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
      }
    });
    
    // File system check
    app.get('/api/debug/files', (req, res) => {
      try {
        const rootDir = process.cwd();
        const dataDir = process.env.RAILWAY_ENVIRONMENT 
          ? '/data' 
          : path.resolve(process.cwd(), 'data');
          
        const checkDir = (dir: string) => {
          const result = {
            path: dir,
            exists: false,
            isDirectory: false,
            readable: false,
            writable: false,
            contents: [],
            error: null
          };
          
          try {
            result.exists = fs.existsSync(dir);
            if (result.exists) {
              const stats = fs.statSync(dir);
              result.isDirectory = stats.isDirectory();
              
              try {
                fs.accessSync(dir, fs.constants.R_OK);
                result.readable = true;
              } catch (e) {}
              
              try {
                fs.accessSync(dir, fs.constants.W_OK);
                result.writable = true;
              } catch (e) {}
              
              if (result.isDirectory && result.readable) {
                result.contents = fs.readdirSync(dir);
              }
            }
          } catch (error) {
            result.error = error.message;
          }
          
          return result;
        };
        
        res.json({
          root: checkDir(rootDir),
          data: checkDir(dataDir),
          railway: process.env.RAILWAY_ENVIRONMENT ? true : false
        });
      } catch (error) {
        res.status(500).json({ 
          error: 'File system check failed',
          message: error.message
        });
      }
    });
  }
}
