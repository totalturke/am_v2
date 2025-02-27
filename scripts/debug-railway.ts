/**
 * Debug script for Railway deployment
 * 
 * This script can be executed on Railway to help diagnose deployment issues
 */
import fs from 'fs';
import path from 'path';
import os from 'os';

// Log system environment details
function logEnvironment() {
  console.log('='.repeat(50));
  console.log('RAILWAY DEBUG INFORMATION');
  console.log('='.repeat(50));

  console.log('\n## SYSTEM INFO ##');
  console.log(`Platform: ${os.platform()}`);
  console.log(`Architecture: ${os.arch()}`);
  console.log(`OS Version: ${os.version()}`);
  console.log(`Free Memory: ${Math.round(os.freemem() / 1024 / 1024)}MB`);
  console.log(`Total Memory: ${Math.round(os.totalmem() / 1024 / 1024)}MB`);
  console.log(`CPU Cores: ${os.cpus().length}`);
  console.log(`Hostname: ${os.hostname()}`);
  console.log(`User: ${os.userInfo().username}`);
  console.log(`Home Dir: ${os.homedir()}`);
  console.log(`Temp Dir: ${os.tmpdir()}`);
  console.log(`Current Dir: ${process.cwd()}`);

  console.log('\n## NODE INFO ##');
  console.log(`Node Version: ${process.version}`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
  console.log(`Memory Usage: ${JSON.stringify(process.memoryUsage())}`);
}

// Log Railway-specific environment variables
function logRailwayEnv() {
  console.log('\n## RAILWAY ENVIRONMENT ##');
  
  // Filter only Railway-related env vars for privacy
  const railwayVars = Object.keys(process.env)
    .filter(key => key.startsWith('RAILWAY_'))
    .reduce((obj, key) => {
      obj[key] = process.env[key];
      return obj;
    }, {} as Record<string, string | undefined>);
    
  console.log(railwayVars);
}

// Check for data directory and database
function checkDataDirectory() {
  console.log('\n## DATA DIRECTORY CHECK ##');
  
  // Railway persistent storage path
  const railwayDataDir = '/data';
  
  // Check if Railway data directory exists
  console.log(`Railway data dir exists: ${fs.existsSync(railwayDataDir)}`);
  
  if (fs.existsSync(railwayDataDir)) {
    try {
      // List contents
      const files = fs.readdirSync(railwayDataDir);
      console.log(`Files in ${railwayDataDir}:`, files);
      
      // Check for database file
      const dbPath = path.join(railwayDataDir, 'sqlite.db');
      if (fs.existsSync(dbPath)) {
        const stats = fs.statSync(dbPath);
        console.log(`Database file exists: ${dbPath}`);
        console.log(`Database size: ${stats.size} bytes`);
        console.log(`Database created: ${stats.birthtime}`);
        console.log(`Database modified: ${stats.mtime}`);
      } else {
        console.log(`Database file NOT found: ${dbPath}`);
      }
      
      // Check directory permissions
      try {
        fs.accessSync(railwayDataDir, fs.constants.R_OK | fs.constants.W_OK);
        console.log(`Directory ${railwayDataDir} is readable and writable`);
      } catch (err) {
        console.log(`Directory ${railwayDataDir} permission error:`, err);
      }
    } catch (err) {
      console.log(`Error reading ${railwayDataDir}:`, err);
    }
  }
  
  // Also check the local data directory
  const localDataDir = path.join(process.cwd(), 'data');
  console.log(`Local data dir exists: ${fs.existsSync(localDataDir)}`);
  
  if (fs.existsSync(localDataDir)) {
    try {
      const files = fs.readdirSync(localDataDir);
      console.log(`Files in ${localDataDir}:`, files);
    } catch (err) {
      console.log(`Error reading ${localDataDir}:`, err);
    }
  }
}

// Check app directories and files
function checkAppDirectories() {
  console.log('\n## APP DIRECTORIES CHECK ##');
  const appDir = process.cwd();
  
  // List root directory
  try {
    const rootFiles = fs.readdirSync(appDir);
    console.log(`Root directory contains ${rootFiles.length} files/folders`);
    console.log('Root contents:', rootFiles);
  } catch (err) {
    console.log('Error reading root directory:', err);
  }
  
  // Check for dist directory
  const distDir = path.join(appDir, 'dist');
  if (fs.existsSync(distDir)) {
    try {
      const distFiles = fs.readdirSync(distDir);
      console.log(`Dist directory contains ${distFiles.length} files/folders`);
      console.log('Dist contents:', distFiles);
    } catch (err) {
      console.log('Error reading dist directory:', err);
    }
  } else {
    console.log('Dist directory not found');
  }
  
  // Check for node_modules
  const nodeModulesDir = path.join(appDir, 'node_modules');
  console.log(`node_modules exists: ${fs.existsSync(nodeModulesDir)}`);
}

// Create test file in data directory to verify write permissions
async function testDataWrite() {
  console.log('\n## DATA WRITE TEST ##');
  const railwayDataDir = '/data';
  const testFile = path.join(railwayDataDir, 'test-write.txt');
  
  try {
    if (fs.existsSync(railwayDataDir)) {
      fs.writeFileSync(testFile, `Test write at ${new Date().toISOString()}`);
      console.log(`Successfully wrote test file: ${testFile}`);
      
      const content = fs.readFileSync(testFile, 'utf8');
      console.log(`Test file content: ${content}`);
      
      // Clean up
      fs.unlinkSync(testFile);
      console.log('Test file removed successfully');
    } else {
      console.log(`Cannot test write - ${railwayDataDir} does not exist`);
    }
  } catch (err) {
    console.log('Data write test failed:', err);
  }
}

// Main function
async function main() {
  try {
    logEnvironment();
    logRailwayEnv();
    checkDataDirectory();
    checkAppDirectories();
    await testDataWrite();
    
    console.log('\n## DEBUG COMPLETE ##');
  } catch (error) {
    console.error('Debug script error:', error);
  }
}

// Run the debug script
main().catch(console.error);
