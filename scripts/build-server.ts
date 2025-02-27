import { exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

// Get the root directory
const rootDir = path.resolve(process.cwd());
const serverDir = path.resolve(rootDir, 'server');
const outDir = path.resolve(rootDir, 'dist/server');

// Create the output directory if it doesn't exist
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Run the TypeScript compiler
const command = `tsc --project ${path.resolve(rootDir, 'tsconfig.server.json')}`;

console.log(`Running: ${command}`);

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
    return;
  }
  
  console.log(`Server build completed successfully`);
  
  // After compilation, rename .js files to .cjs if needed for CommonJS
  // Or keep as .js for ESM (depends on your module system)
  console.log('Server TypeScript files compiled to JavaScript');
});
