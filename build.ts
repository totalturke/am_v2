/**
 * Server build script for ApartmentMaster 
 * This script compiles the server-side TypeScript code
 */
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

async function buildServer() {
  console.log('Building server-side code...');
  
  try {
    // Ensure dist directory exists
    const distDir = path.resolve(process.cwd(), 'dist');
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }
    
    // Use tsc directly instead of esbuild to avoid complex dependency issues
    console.log('Compiling server TypeScript files...');
    execSync('npx tsc --project tsconfig.server.json', { stdio: 'inherit' });
    
    // Copy package.json to dist for production dependencies
    console.log('Copying necessary files to dist directory...');
    
    // Create a simplified package.json for production
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const prodPkg = {
      name: pkg.name,
      version: pkg.version,
      description: pkg.description,
      main: 'index.js',
      dependencies: {
        'better-sqlite3': pkg.dependencies['better-sqlite3'],
        'drizzle-orm': pkg.dependencies['drizzle-orm'],
        'express': pkg.dependencies['express'],
        'cors': pkg.dependencies['cors']
      }
    };
    fs.writeFileSync(path.join(distDir, 'package.json'), JSON.stringify(prodPkg, null, 2));
    
    console.log('Server build completed successfully!');
  } catch (error) {
    console.error('Error building server:', error);
    process.exit(1);
  }
}

buildServer();
