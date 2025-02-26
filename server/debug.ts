// Debug utility to check database data
import express, { Request, Response } from 'express';
import { storage } from './storage';

export function setupDebugRoutes(app: express.Express) {
  // Endpoint to get all storage data for debugging
  app.get('/api/debug/data', async (req: Request, res: Response) => {
    try {
      const users = await storage.getUsers();
      const cities = await storage.getCities();
      const buildings = await storage.getBuildings();
      const apartments = await storage.getApartments();
      const tasks = await storage.getTasks();
      
      // Get expanded apartment data
      const expandedApartments = await Promise.all(apartments.map(async (apartment) => {
        const building = await storage.getBuilding(apartment.buildingId);
        let city;
        if (building) {
          city = await storage.getCity(building.cityId);
        }
        
        return {
          ...apartment,
          building,
          city
        };
      }));
      
      res.json({
        users,
        cities,
        buildings,
        apartments,
        expandedApartments,
        tasks
      });
    } catch (error) {
      console.error('Debug API error:', error);
      res.status(500).json({ message: "Error retrieving debug data" });
    }
  });
  
  // Endpoint to reinitialize the database with test data
  app.post('/api/debug/reset', async (req: Request, res: Response) => {
    try {
      // Reset the database
      await (storage as any).resetData();
      
      res.json({ message: "Database reset successfully" });
    } catch (error) {
      console.error('Database reset error:', error);
      res.status(500).json({ message: "Error resetting database" });
    }
  });
}
