// Debug utility to check database data
import { Express, Request, Response } from 'express';
import path from 'path';
import { storage } from './storage.js';
import fs from 'fs';
import os from 'os';
import util from 'util';
import { DB } from './db.js';

// Utility logging function
function log(message: string) {
  const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
  console.log(`${timestamp} [express] ${message}`);
}

export async function setupDebugRoutes(app: Express) {
  if (process.env.ENABLE_DEBUG_ROUTES === 'true') {
    app.get('/debug', async (req: Request, res: Response) => {
      const startTime = Date.now();
      
      // Basic system info
      const systemInfo = {
        hostname: os.hostname(),
        platform: os.platform(),
        arch: os.arch(),
        release: os.release(),
        uptime: os.uptime(),
        loadAvg: os.loadavg(),
        totalmem: os.totalmem(),
        freemem: os.freemem(),
        cpus: os.cpus().length,
      };
      
      // Environment variables (filtered for security)
      const envVars = {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
        DATABASE_URL: process.env.DATABASE_URL ? '[REDACTED]' : undefined,
        RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT,
        RAILWAY_PROJECT_ID: process.env.RAILWAY_PROJECT_ID,
      };
      
      // Process info
      const processInfo = {
        pid: process.pid,
        ppid: process.ppid,
        title: process.title,
        version: process.version,
        versions: process.versions,
        arch: process.arch,
        platform: process.platform,
        argv: process.argv,
        execPath: process.execPath,
        execArgv: process.execArgv,
        cwd: process.cwd(),
        memoryUsage: process.memoryUsage(),
      };
      
      // Important paths
      const pathInfo = {
        cwd: process.cwd(),
        __dirname: path.resolve(),
        homedir: os.homedir(),
        tmpdir: os.tmpdir(),
      };
      
      // Database connection test
      let connectionTest: { 
        success: boolean; 
        error: string | null;
        userCount?: number;
      } = { 
        success: false, 
        error: null 
      };
      
      try {
        const result = await DB.db.select({
          count: DB.sql<number>`count(*)`
        }).from(DB.schema.users);
        
        connectionTest = { 
          success: true, 
          error: null,
          userCount: result.length > 0 ? result[0].count : 0
        };
      } catch (error: any) {
        connectionTest = { success: false, error: error.message };
      }
      
      // Database file information
      const dbInfo: {
        dbPath: string | null;
        exists: boolean;
        dataDir: string | null;
        dataDirExists: boolean | null;
        dataDirContents: string[] | null;
        dbFileSize: number | null;
      } = {
        dbPath: DB.dbPath || null,
        exists: DB.dbPath ? fs.existsSync(DB.dbPath) : false,
        dataDir: null,
        dataDirExists: null,
        dataDirContents: null,
        dbFileSize: null
      };
      
      // Additional database file diagnostics
      if (DB.dbPath && fs.existsSync(DB.dbPath)) {
        try {
          dbInfo.dataDir = path.dirname(DB.dbPath);
          dbInfo.dataDirExists = fs.existsSync(dbInfo.dataDir);
          
          if (dbInfo.dataDirExists) {
            dbInfo.dataDirContents = fs.readdirSync(dbInfo.dataDir);
          }
          
          const stats = fs.statSync(DB.dbPath);
          dbInfo.dbFileSize = stats.size;
        } catch (error: any) {
          console.error('Error getting DB file info:', error);
        }
      }
      
      // Storage diagnostics
      const storageInfo = {
        type: storage.constructor.name,
        users: await storage.getUsers().then(users => users.length).catch(() => 'error'),
        cities: await storage.getCities().then(cities => cities.length).catch(() => 'error'),
        buildings: await storage.getBuildings().then(buildings => buildings.length).catch(() => 'error'),
        apartments: await storage.getApartments().then(apartments => apartments.length).catch(() => 'error'),
        tasks: await storage.getTasks().then(tasks => tasks.length).catch(() => 'error')
      };
      
      const endTime = Date.now();
      
      res.json({
        timestamp: new Date().toISOString(),
        executionTime: `${endTime - startTime}ms`,
        systemInfo,
        envVars,
        processInfo,
        pathInfo,
        dbInfo,
        connectionTest,
        storageInfo
      });
    });
    
    console.log('Debug routes enabled');
  }
}
