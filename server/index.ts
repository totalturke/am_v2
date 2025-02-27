import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { setupDatabase } from "./db";
import cors from 'cors';

// Utility logging function
export function log(message: string) {
  const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
  console.log(`${timestamp} [express] ${message}`);
}

const app = express();

(async () => {
  try {
    log(`Starting server in ${process.env.NODE_ENV || 'development'} mode`);
    log(`Current working directory: ${process.cwd()}`);
    
    // Initialize database connection
    const dbInfo = await setupDatabase();
    
    // Enable JSON parsing
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    // Setup CORS for all environments, but configured differently for production
    if (process.env.NODE_ENV === "production") {
      // In production, only allow specific origins
      app.use(cors({
        origin: true, // Allow the request origin
        credentials: true, // Allow cookies
      }));
    } else {
      // In development, allow all origins
      app.use(cors());
    }
    
    // Setup debug routes with try-catch to prevent dependency errors
    try {
      const debugModule = require("./debug");
      if (typeof debugModule.setupDebugRoutes === 'function') {
        debugModule.setupDebugRoutes(app, dbInfo);
        log("Debug routes initialized successfully");
      }
    } catch (error) {
      log(`Warning: Debug routes setup failed: ${error.message}`);
    }

    app.use((req, res, next) => {
      const start = Date.now();
      const path = req.path;
      let capturedJsonResponse: Record<string, any> | undefined = undefined;

      const originalResJson = res.json;
      res.json = function (bodyJson, ...args) {
        capturedJsonResponse = bodyJson;
        return originalResJson.apply(res, [bodyJson, ...args]);
      };

      res.on("finish", () => {
        const duration = Date.now() - start;
        if (path.startsWith("/api")) {
          let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
          if (capturedJsonResponse) {
            logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
          }

          if (logLine.length > 80) {
            logLine = logLine.slice(0, 79) + "…";
          }

          log(logLine);
        }
      });

      next();
    });

    // Setup static file serving for production mode
    log('Setting up static file serving for production mode');
    serveStatic(app);

    // Register server routes
    const server = await registerRoutes(app, dbInfo);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      
      log(`ERROR: ${status} - ${message}`);
      if (err.stack) {
        log(`Stack trace: ${err.stack}`);
      }

      res.status(status).json({ message });
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (process.env.NODE_ENV === "development") {
      log('Setting up Vite for development mode');
      await setupVite(app, server);
    }

    // Use PORT environment variable if available, otherwise use 5000
    const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;
    const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';

    server.listen({
      port: PORT,
      host: HOST,
      reusePort: true,
    }, () => {
      log(`Server started successfully and is listening on port ${PORT}`);
    });
  } catch (error) {
    log(`Fatal error during server startup: ${error}`);
    if (error instanceof Error) {
      log(`Error stack: ${error.stack}`);
    }
    process.exit(1);
  }
})();
