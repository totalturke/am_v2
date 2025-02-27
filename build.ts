/**
 * Server build script for ApartmentMaster 
 * This script simply copies necessary files to the dist directory
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
    
    // Copy server files directly (we'll use ts-node in production)
    console.log('Copying server files to dist...');
    const serverFiles = [
      'server',
      'shared',
      'scripts',
      '.env',
      'package.json',
      'package-lock.json',
      'tsconfig.json',
      'tsconfig.server.json'
    ];
    
    for (const file of serverFiles) {
      const src = path.resolve(process.cwd(), file);
      const dest = path.resolve(distDir, file);
      
      if (fs.existsSync(src)) {
        if (fs.statSync(src).isDirectory()) {
          console.log(`Copying directory: ${file}`);
          execSync(`cp -R ${src} ${dest}`);
        } else {
          console.log(`Copying file: ${file}`);
          fs.copyFileSync(src, dest);
        }
      }
    }
    
    // Create a simple starter script
    console.log('Creating starter script...');
    fs.writeFileSync(
      path.join(distDir, 'index.js'), 
      `// Production starter script
require('tsx/dist/cli').main(['', '', './server/index.ts']);
`
    );
    
    console.log('Server build completed successfully!');
  } catch (error) {
    console.error('Error building server:', error);
    process.exit(1);
  }
}

buildServer();
