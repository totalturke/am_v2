import express, { type Express } from "express";
import fs from "fs";
import path, { dirname, join } from "path";
import { createServer as createViteServer, createLogger } from "vite";
const rootDir = process.cwd();
const __dirname = rootDir;
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        __dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(process.cwd(), "dist", "public");
  
  log(`Attempting to serve static files from: ${distPath}`);
  
  if (!fs.existsSync(distPath)) {
    log(`WARNING: Static build directory not found at: ${distPath}`);
    log(`This may cause the application to fail. Make sure to run 'npm run build' before starting.`);
    
    // Create an empty directory to prevent crashes
    try {
      fs.mkdirSync(distPath, { recursive: true });
      log(`Created empty directory at: ${distPath}`);
    } catch (err) {
      log(`Failed to create directory: ${err}`);
    }
  } else {
    log(`Static build directory found at: ${distPath}`);
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      log(`WARNING: index.html not found at: ${indexPath}`);
      res.status(500).send('Server configuration error: index.html not found. Please check the build process.');
    }
  });
}
