import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import path from 'path';
import * as schema from '../shared/schema';

// Use the SQLite database file path
const dbPath = path.resolve(process.cwd(), 'data', 'sqlite.db');
console.log(`Seeding SQLite database at: ${dbPath}`);

// Initialize the database connection
const sqlite = new Database(dbPath);
const db = drizzle(sqlite, { schema });

async function seedDatabase() {
  console.log('Seeding database with initial data...');
  
  try {
    // Insert users
    const users = [
      {
        username: 'maintenance1',
        password: 'password123',
        name: 'Juan Pérez',
        role: 'maintenance_agent',
        email: 'jperez@example.com',
        phone: '555-123-4567',
      },
      {
        username: 'control1',
        password: 'password123',
        name: 'María González',
        role: 'control_center',
        email: 'mgonzalez@example.com',
        phone: '555-234-5678',
      },
      {
        username: 'purchasing1',
        password: 'password123',
        name: 'Carlos Rodríguez',
        role: 'purchasing_agent',
        email: 'crodriguez@example.com',
        phone: '555-345-6789',
      }
    ];
    
    for (const user of users) {
      const result = await db.insert(schema.users).values(user).onConflictDoNothing().returning();
      console.log(`User added: ${user.name} (${user.role})`);
    }
    
    // Insert cities
    const cities = [
      { name: 'Ciudad de México', state: 'CDMX', country: 'Mexico' },
      { name: 'Guadalajara', state: 'Jalisco', country: 'Mexico' },
      { name: 'Monterrey', state: 'Nuevo León', country: 'Mexico' }
    ];
    
    for (const city of cities) {
      const result = await db.insert(schema.cities).values(city).onConflictDoNothing().returning();
      console.log(`City added: ${city.name}, ${city.state}`);
    }
    
    // Get inserted cities for reference
    const insertedCities = await db.select().from(schema.cities);
    
    // Insert buildings
    const buildings = [
      { name: 'Edificio Reforma', address: 'Paseo de la Reforma 123', cityId: insertedCities[0].id, totalUnits: 50 },
      { name: 'Torre Chapultepec', address: 'Av. Chapultepec 456', cityId: insertedCities[0].id, totalUnits: 30 },
      { name: 'Residencial Providencia', address: 'Av. Providencia 789', cityId: insertedCities[1].id, totalUnits: 25 },
      { name: 'Torres San Pedro', address: 'Av. San Pedro 101', cityId: insertedCities[2].id, totalUnits: 40 }
    ];
    
    for (const building of buildings) {
      const result = await db.insert(schema.buildings).values(building).onConflictDoNothing().returning();
      console.log(`Building added: ${building.name}`);
    }
    
    // Get inserted buildings for reference
    const insertedBuildings = await db.select().from(schema.buildings);
    
    // Insert apartments
    const apartments = [];
    
    // Building 1 apartments
    for (let i = 1; i <= 5; i++) {
      apartments.push({
        apartmentNumber: `${i}01`,
        buildingId: insertedBuildings[0].id,
        status: 'active',
        bedroomCount: 2,
        bathroomCount: 2,
        squareMeters: 85,
        tenantName: `Tenant ${i}01`,
        tenantContact: `555-111-${1000 + i}`
      });
    }
    
    // Building 2 apartments
    for (let i = 1; i <= 3; i++) {
      apartments.push({
        apartmentNumber: `${i}02`,
        buildingId: insertedBuildings[1].id,
        status: 'active',
        bedroomCount: 3,
        bathroomCount: 2,
        squareMeters: 110,
        tenantName: `Tenant ${i}02`,
        tenantContact: `555-222-${1000 + i}`
      });
    }
    
    // Building 3 apartments
    for (let i = 1; i <= 3; i++) {
      apartments.push({
        apartmentNumber: `${i}03`,
        buildingId: insertedBuildings[2].id,
        status: i === 1 ? 'maintenance' : 'active',
        bedroomCount: 1,
        bathroomCount: 1,
        squareMeters: 65,
        tenantName: i === 1 ? null : `Tenant ${i}03`,
        tenantContact: i === 1 ? null : `555-333-${1000 + i}`
      });
    }
    
    // Building 4 apartments
    for (let i = 1; i <= 4; i++) {
      apartments.push({
        apartmentNumber: `${i}04`,
        buildingId: insertedBuildings[3].id,
        status: i === 4 ? 'inactive' : 'active',
        bedroomCount: 2,
        bathroomCount: 1,
        squareMeters: 75,
        tenantName: i === 4 ? null : `Tenant ${i}04`,
        tenantContact: i === 4 ? null : `555-444-${1000 + i}`
      });
    }
    
    for (const apartment of apartments) {
      const result = await db.insert(schema.apartments).values(apartment).onConflictDoNothing().returning();
      console.log(`Apartment added: ${apartment.apartmentNumber}`);
    }
    
    // Get inserted apartments for reference
    const insertedApartments = await db.select().from(schema.apartments);
    
    // Insert tasks
    const tasks = [
      {
        taskId: 'MT-001',
        type: 'corrective',
        apartmentId: insertedApartments[0].id,
        issue: 'Plumbing Problem',
        description: 'Fuga de agua en baño principal',
        reportedBy: 'Tenant',
        reportedAt: new Date().toISOString(),
        priority: 'high',
        status: 'pending'
      },
      {
        taskId: 'MT-002',
        type: 'preventive',
        apartmentId: insertedApartments[1].id,
        issue: 'Routine Maintenance',
        description: 'Mantenimiento rutinario de aire acondicionado',
        reportedBy: 'System',
        reportedAt: new Date().toISOString(),
        priority: 'medium',
        status: 'in_progress',
        assignedTo: 1 // maintenance1
      },
      {
        taskId: 'MT-003',
        type: 'corrective',
        apartmentId: insertedApartments[7].id,
        issue: 'Door Problem',
        description: 'Puerta de entrada no cierra correctamente',
        reportedBy: 'Tenant',
        reportedAt: new Date().toISOString(),
        priority: 'medium',
        status: 'complete',
        assignedTo: 1, // maintenance1
        completedAt: new Date().toISOString()
      }
    ];
    
    for (const task of tasks) {
      const result = await db.insert(schema.tasks).values(task).onConflictDoNothing().returning();
      console.log(`Task added: ${task.taskId}`);
    }
    
    // Insert materials
    const materials = [
      { name: 'Tubería PVC 1/2"', quantity: 50, unit: 'metros', minStock: 20, price: 15.5, supplier: 'Construrama' },
      { name: 'Cinta de teflón', quantity: 30, unit: 'rollo', minStock: 10, price: 8.0, supplier: 'Construrama' },
      { name: 'Focos LED', quantity: 45, unit: 'pieza', minStock: 15, price: 35.0, supplier: 'Home Depot' },
      { name: 'Filtro de aire', quantity: 12, unit: 'pieza', minStock: 5, price: 120.0, supplier: 'RefriMax' }
    ];
    
    for (const material of materials) {
      const result = await db.insert(schema.materials).values(material).onConflictDoNothing().returning();
      console.log(`Material added: ${material.name}`);
    }
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close the database connection
    sqlite.close();
  }
}

seedDatabase();
