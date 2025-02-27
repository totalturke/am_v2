import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { setupDatabase } from "./db";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

(async () => {
  try {
    log(`Starting server in ${process.env.NODE_ENV || 'development'} mode`);
    log(`Current working directory: ${process.cwd()}`);
    
    // Setup database connection
    const dbInfo = await setupDatabase();
    log(`Database setup complete. Using ${dbInfo.useMemory ? "in-memory storage" : "PostgreSQL database"}`);
    
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
    } else {
      log('Setting up static file serving for production mode');
      serveStatic(app);
    }

    // Use PORT environment variable if available, otherwise use 5000
    const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`Server started successfully and is listening on port ${port}`);
    });
  } catch (error) {
    log(`Fatal error during server startup: ${error}`);
    if (error instanceof Error) {
      log(`Error stack: ${error.stack}`);
    }
    process.exit(1);
  }
})();
