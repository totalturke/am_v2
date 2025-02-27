import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cors from 'cors';
import fs from 'fs';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Setup CORS
app.use(cors());

// Simple logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} [${req.method}] ${req.path}`);
  next();
});

// Basic API routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    railway: process.env.RAILWAY_ENVIRONMENT ? true : false,
    timestamp: new Date().toISOString()
  });
});

// Sample data
const sampleUsers = [
  { id: 1, username: "admin", name: "Admin User", role: "admin" },
  { id: 2, username: "manager", name: "Manager User", role: "manager" }
];

const sampleBuildings = [
  { id: 1, name: "Main Tower", cityId: 1, address: "123 Main St" },
  { id: 2, name: "West Wing", cityId: 1, address: "456 West Ave" }
];

const sampleApartments = [
  { id: 1, buildingId: 1, unit: "101", floor: 1, roomCount: 2, sqm: 75 },
  { id: 2, buildingId: 1, unit: "102", floor: 1, roomCount: 3, sqm: 90 }
];

// API endpoints
app.get('/api/users', (req, res) => {
  res.json(sampleUsers);
});

app.get('/api/buildings', (req, res) => {
  res.json(sampleBuildings);
});

app.get('/api/apartments', (req, res) => {
  res.json(sampleApartments);
});

// Authentication endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  
  // Simple authentication
  if (username === 'admin' && password === 'admin123') {
    return res.json({
      id: 1,
      username: 'admin',
      name: 'Admin User',
      role: 'admin'
    });
  }
  
  return res.status(401).json({ message: "Invalid credentials" });
});

// In production, serve the static files
if (process.env.NODE_ENV === 'production') {
  // Check if dist/public directory exists
  const publicDir = path.join(__dirname, 'dist/public');
  if (fs.existsSync(publicDir)) {
    console.log(`Serving static files from ${publicDir}`);
    app.use(express.static(publicDir));
    
    // For any other request, send the index.html file
    app.get('*', (req, res) => {
      res.sendFile(path.join(publicDir, 'index.html'));
    });
  } else {
    console.warn(`Static directory ${publicDir} does not exist`);
  }
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
