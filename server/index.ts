import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import cors from "cors";
import { registerRoutes } from "./routes.js";
import { setupDebugRoutes } from "./debug.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Enable JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Setup CORS for all environments, allow all origins in development
app.use(cors());

// Add logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  const method = req.method;

  res.on("finish", () => {
    const duration = Date.now() - start;
    const status = res.statusCode;

    // Only log if the response is 4xx or 5xx or taking more than 1s
    if (duration > 500 || status >= 400) {
      let logLine = `${method} ${path} ${status} ${duration}ms`;

      // Include body for non-GET requests
      if (method !== "GET" && req.body && Object.keys(req.body).length > 0) {
        logLine += ` ${JSON.stringify(req.body)}`;
      }

      // Truncate long log lines
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

// Setup debug routes
setupDebugRoutes(app);

// Register API routes
registerRoutes(app);

// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({ message });
  console.error(err);
});

// For production, serve the static files
if (process.env.NODE_ENV === "production") {
  // Determine the directory of the current file
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  
  // Serve static files from the dist directory
  app.use(express.static(path.join(__dirname, "../../dist/public")));
  
  // For any other request, send the index.html file
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../../dist/public/index.html"));
  });
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
