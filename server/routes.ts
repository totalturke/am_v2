import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertCitySchema, 
  insertBuildingSchema, 
  insertApartmentSchema, 
  insertTaskSchema, 
  insertMaterialSchema, 
  insertTaskMaterialSchema, 
  insertPurchaseOrderSchema, 
  insertPurchaseOrderItemSchema 
} from "@shared/schema";
import { setupDebugRoutes } from "./debug";

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      // For production (like Railway), use a temp directory that's writable
      const uploadDir = process.env.NODE_ENV === 'production' 
        ? path.join(process.cwd(), 'tmp', 'uploads')
        : path.join(__dirname, "../uploads");
        
      // Create uploads directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed"));
    }
  },
});

export async function registerRoutes(app: Express, dbInfo: any): Promise<Server> {
  // Add a basic root route for Railway health checks
  app.get("/", (req: Request, res: Response) => {
    res.status(200).send("App is running");
  });

  // Add a health check endpoint for monitoring
  app.get("/health", (req: Request, res: Response) => {
    // Check database connectivity
    let dbStatus = 'unknown';
    let dbDetails = {};
    
    try {
      if (dbInfo) {
        // Execute a simple query to verify database connection
        if (storage === 'sqlite') {
          const result = dbInfo.select({ count: sql`count(*)` }).from(users).all();
          dbStatus = 'connected';
          dbDetails = { 
            type: 'sqlite',
            location: process.env.RAILWAY_ENVIRONMENT ? '/data/sqlite.db' : './data/sqlite.db',
            userCount: result[0]?.count || 0
          };
        } else {
          // Memory storage check
          dbStatus = 'memory';
          dbDetails = { type: 'memory' };
        }
      } else {
        dbStatus = 'disconnected';
      }
    } catch (error) {
      dbStatus = 'error';
      dbDetails = { error: error.message };
    }

    // Return comprehensive health information
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: dbStatus,
        details: dbDetails
      },
      uptime: Math.floor(process.uptime())
    });
  });
  
  // Set up debug routes
  setupDebugRoutes(app);
  
  // Auth routes
  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "An error occurred during login" });
    }
  });
  
  // User routes
  app.get("/api/users", async (req: Request, res: Response) => {
    try {
      const users = await storage.getUsers();
      // Remove passwords
      const usersWithoutPasswords = users.map(({ password, ...rest }) => rest);
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  
  app.get("/api/users/role/:role", async (req: Request, res: Response) => {
    try {
      const { role } = req.params;
      const users = await storage.getUsersByRole(role);
      // Remove passwords
      const usersWithoutPasswords = users.map(({ password, ...rest }) => rest);
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users by role" });
    }
  });
  
  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });
  
  // City routes
  app.get("/api/cities", async (req: Request, res: Response) => {
    try {
      const cities = await storage.getCities();
      res.json(cities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cities" });
    }
  });
  
  app.post("/api/cities", async (req: Request, res: Response) => {
    try {
      const cityData = insertCitySchema.parse(req.body);
      const city = await storage.createCity(cityData);
      res.status(201).json(city);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid city data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create city" });
    }
  });
  
  // Building routes
  app.get("/api/buildings", async (req: Request, res: Response) => {
    try {
      const cityId = req.query.cityId ? Number(req.query.cityId) : undefined;
      
      let buildings;
      if (cityId) {
        buildings = await storage.getBuildingsByCityId(cityId);
      } else {
        buildings = await storage.getBuildings();
      }
      
      res.json(buildings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch buildings" });
    }
  });
  
  app.post("/api/buildings", async (req: Request, res: Response) => {
    try {
      const buildingData = insertBuildingSchema.parse(req.body);
      const building = await storage.createBuilding(buildingData);
      res.status(201).json(building);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid building data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create building" });
    }
  });
  
  // Apartment routes
  app.get("/api/apartments", async (req: Request, res: Response) => {
    try {
      const buildingId = req.query.buildingId ? Number(req.query.buildingId) : undefined;
      
      let apartments;
      if (buildingId) {
        apartments = await storage.getApartmentsByBuildingId(buildingId);
      } else {
        apartments = await storage.getApartments();
      }
      
      // Expand building and city data
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
      
      res.json(expandedApartments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch apartments" });
    }
  });
  
  app.get("/api/apartments/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const apartment = await storage.getApartment(id);
      
      if (!apartment) {
        return res.status(404).json({ message: "Apartment not found" });
      }
      
      // Expand building and city data
      const building = await storage.getBuilding(apartment.buildingId);
      let city;
      if (building) {
        city = await storage.getCity(building.cityId);
      }
      
      // Get tasks for this apartment
      const tasks = await storage.getTasksByApartmentId(id);
      
      res.json({
        ...apartment,
        building,
        city,
        tasks
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch apartment" });
    }
  });
  
  app.post("/api/apartments", async (req: Request, res: Response) => {
    try {
      const apartmentData = insertApartmentSchema.parse(req.body);
      const apartment = await storage.createApartment(apartmentData);
      res.status(201).json(apartment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid apartment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create apartment" });
    }
  });
  
  app.patch("/api/apartments/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const apartment = await storage.getApartment(id);
      
      if (!apartment) {
        return res.status(404).json({ message: "Apartment not found" });
      }
      
      const updatedApartment = await storage.updateApartment(id, req.body);
      res.json(updatedApartment);
    } catch (error) {
      res.status(500).json({ message: "Failed to update apartment" });
    }
  });
  
  // Task routes
  app.get("/api/tasks", async (req: Request, res: Response) => {
    try {
      const apartmentId = req.query.apartmentId ? Number(req.query.apartmentId) : undefined;
      const status = req.query.status as string | undefined;
      const type = req.query.type as string | undefined;
      const assignedTo = req.query.assignedTo ? Number(req.query.assignedTo) : undefined;
      
      let tasks;
      if (apartmentId) {
        tasks = await storage.getTasksByApartmentId(apartmentId);
      } else if (status) {
        tasks = await storage.getTasksByStatus(status);
      } else if (type) {
        tasks = await storage.getTasksByType(type);
      } else if (assignedTo) {
        tasks = await storage.getTasksByAssignedTo(assignedTo);
      } else {
        tasks = await storage.getTasks();
      }
      
      // Expand apartment, building, city, and assigned user data
      const expandedTasks = await Promise.all(tasks.map(async (task) => {
        const apartment = await storage.getApartment(task.apartmentId);
        let building, city;
        if (apartment) {
          building = await storage.getBuilding(apartment.buildingId);
          if (building) {
            city = await storage.getCity(building.cityId);
          }
        }
        
        let assignedUser;
        if (task.assignedTo) {
          assignedUser = await storage.getUser(task.assignedTo);
          if (assignedUser) {
            // Remove password
            const { password, ...userWithoutPassword } = assignedUser;
            assignedUser = userWithoutPassword;
          }
        }
        
        // Get materials for this task
        const taskMaterials = await storage.getTaskMaterials(task.id);
        const materials = await Promise.all(
          taskMaterials.map(async (tm) => {
            const material = await storage.getMaterial(tm.materialId);
            return material ? { ...tm, material } : tm;
          })
        );
        
        return {
          ...task,
          apartment,
          building,
          city,
          assignedUser,
          materials
        };
      }));
      
      res.json(expandedTasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });
  
  app.get("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const task = await storage.getTask(id);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Expand apartment, building, city, and assigned user data
      const apartment = await storage.getApartment(task.apartmentId);
      let building, city;
      if (apartment) {
        building = await storage.getBuilding(apartment.buildingId);
        if (building) {
          city = await storage.getCity(building.cityId);
        }
      }
      
      let assignedUser;
      if (task.assignedTo) {
        assignedUser = await storage.getUser(task.assignedTo);
        if (assignedUser) {
          // Remove password
          const { password, ...userWithoutPassword } = assignedUser;
          assignedUser = userWithoutPassword;
        }
      }
      
      // Get materials for this task
      const taskMaterials = await storage.getTaskMaterials(task.id);
      const materials = await Promise.all(
        taskMaterials.map(async (tm) => {
          const material = await storage.getMaterial(tm.materialId);
          return material ? { ...tm, material } : tm;
        })
      );
      
      res.json({
        ...task,
        apartment,
        building,
        city,
        assignedUser,
        materials
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch task" });
    }
  });
  
  app.post("/api/tasks", async (req: Request, res: Response) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create task" });
    }
  });
  
  app.patch("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const task = await storage.getTask(id);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      const updatedTask = await storage.updateTask(id, req.body);
      res.json(updatedTask);
    } catch (error) {
      res.status(500).json({ message: "Failed to update task" });
    }
  });
  
  // Evidence upload
  app.post("/api/tasks/:id/evidence", upload.array("photos", 5), async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const task = await storage.getTask(id);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }
      
      // Create array of relative paths to uploaded files
      const fileUrls = files.map(file => `/uploads/${file.filename}`);
      
      // Add to existing evidence photos
      const existingPhotos = task.evidencePhotos as string[] || [];
      const updatedTask = await storage.updateTask(id, {
        evidencePhotos: [...existingPhotos, ...fileUrls]
      });
      
      res.json(updatedTask);
    } catch (error) {
      res.status(500).json({ message: "Failed to upload evidence" });
    }
  });
  
  // Material routes
  app.get("/api/materials", async (req: Request, res: Response) => {
    try {
      const materials = await storage.getMaterials();
      res.json(materials);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch materials" });
    }
  });
  
  app.post("/api/materials", async (req: Request, res: Response) => {
    try {
      const materialData = insertMaterialSchema.parse(req.body);
      const material = await storage.createMaterial(materialData);
      res.status(201).json(material);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid material data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create material" });
    }
  });
  
  app.patch("/api/materials/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const material = await storage.getMaterial(id);
      
      if (!material) {
        return res.status(404).json({ message: "Material not found" });
      }
      
      const updatedMaterial = await storage.updateMaterial(id, req.body);
      res.json(updatedMaterial);
    } catch (error) {
      res.status(500).json({ message: "Failed to update material" });
    }
  });
  
  // Task Material routes
  app.get("/api/tasks/:taskId/materials", async (req: Request, res: Response) => {
    try {
      const taskId = Number(req.params.taskId);
      const taskMaterials = await storage.getTaskMaterials(taskId);
      
      // Expand material data
      const expandedTaskMaterials = await Promise.all(
        taskMaterials.map(async (tm) => {
          const material = await storage.getMaterial(tm.materialId);
          return { ...tm, material };
        })
      );
      
      res.json(expandedTaskMaterials);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch task materials" });
    }
  });
  
  app.post("/api/tasks/:taskId/materials", async (req: Request, res: Response) => {
    try {
      const taskId = Number(req.params.taskId);
      const taskMaterialData = insertTaskMaterialSchema.parse({
        ...req.body,
        taskId
      });
      
      const taskMaterial = await storage.createTaskMaterial(taskMaterialData);
      res.status(201).json(taskMaterial);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task material data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create task material" });
    }
  });
  
  app.patch("/api/task-materials/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const taskMaterial = await storage.taskMaterials.get(id);
      
      if (!taskMaterial) {
        return res.status(404).json({ message: "Task material not found" });
      }
      
      const updatedTaskMaterial = await storage.updateTaskMaterial(id, req.body);
      res.json(updatedTaskMaterial);
    } catch (error) {
      res.status(500).json({ message: "Failed to update task material" });
    }
  });
  
  // Purchase Order routes
  app.get("/api/purchase-orders", async (req: Request, res: Response) => {
    try {
      const purchaseOrders = await storage.getPurchaseOrders();
      
      // Expand created by user
      const expandedPurchaseOrders = await Promise.all(
        purchaseOrders.map(async (po) => {
          const createdByUser = await storage.getUser(po.createdBy);
          let user;
          if (createdByUser) {
            // Remove password
            const { password, ...userWithoutPassword } = createdByUser;
            user = userWithoutPassword;
          }
          
          // Get purchase order items
          const items = await storage.getPurchaseOrderItems(po.id);
          const expandedItems = await Promise.all(
            items.map(async (item) => {
              const material = await storage.getMaterial(item.materialId);
              return { ...item, material };
            })
          );
          
          return {
            ...po,
            createdByUser: user,
            items: expandedItems
          };
        })
      );
      
      res.json(expandedPurchaseOrders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch purchase orders" });
    }
  });
  
  app.get("/api/purchase-orders/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const purchaseOrder = await storage.getPurchaseOrder(id);
      
      if (!purchaseOrder) {
        return res.status(404).json({ message: "Purchase order not found" });
      }
      
      // Expand created by user
      const createdByUser = await storage.getUser(purchaseOrder.createdBy);
      let user;
      if (createdByUser) {
        // Remove password
        const { password, ...userWithoutPassword } = createdByUser;
        user = userWithoutPassword;
      }
      
      // Get purchase order items
      const items = await storage.getPurchaseOrderItems(purchaseOrder.id);
      const expandedItems = await Promise.all(
        items.map(async (item) => {
          const material = await storage.getMaterial(item.materialId);
          return { ...item, material };
        })
      );
      
      res.json({
        ...purchaseOrder,
        createdByUser: user,
        items: expandedItems
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch purchase order" });
    }
  });
  
  app.post("/api/purchase-orders", async (req: Request, res: Response) => {
    try {
      const purchaseOrderData = insertPurchaseOrderSchema.parse(req.body);
      const purchaseOrder = await storage.createPurchaseOrder(purchaseOrderData);
      res.status(201).json(purchaseOrder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid purchase order data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create purchase order" });
    }
  });
  
  app.patch("/api/purchase-orders/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const purchaseOrder = await storage.getPurchaseOrder(id);
      
      if (!purchaseOrder) {
        return res.status(404).json({ message: "Purchase order not found" });
      }
      
      const updatedPurchaseOrder = await storage.updatePurchaseOrder(id, req.body);
      res.json(updatedPurchaseOrder);
    } catch (error) {
      res.status(500).json({ message: "Failed to update purchase order" });
    }
  });
  
  // Purchase Order Item routes
  app.post("/api/purchase-orders/:poId/items", async (req: Request, res: Response) => {
    try {
      const poId = Number(req.params.poId);
      const purchaseOrderItemData = insertPurchaseOrderItemSchema.parse({
        ...req.body,
        purchaseOrderId: poId
      });
      
      const purchaseOrderItem = await storage.createPurchaseOrderItem(purchaseOrderItemData);
      
      // Update the total amount of the purchase order
      const items = await storage.getPurchaseOrderItems(poId);
      const totalAmount = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
      await storage.updatePurchaseOrder(poId, { totalAmount });
      
      res.status(201).json(purchaseOrderItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid purchase order item data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create purchase order item" });
    }
  });
  
  // Dashboard stats route
  app.get("/api/dashboard/stats", async (req: Request, res: Response) => {
    try {
      const tasks = await storage.getTasks();
      const apartments = await storage.getApartments();
      
      const pendingTasks = tasks.filter(task => ['pending', 'in_progress', 'scheduled'].includes(task.status)).length;
      const correctiveTasks = tasks.filter(task => task.type === 'corrective').length;
      const preventiveTasks = tasks.filter(task => task.type === 'preventive').length;
      const activeApartments = apartments.filter(apt => apt.status === 'active').length;
      
      // Tasks breakdown by status
      const tasksByStatus = {
        pending: tasks.filter(task => task.status === 'pending').length,
        inProgress: tasks.filter(task => task.status === 'in_progress').length,
        scheduled: tasks.filter(task => task.status === 'scheduled').length,
        complete: tasks.filter(task => task.status === 'complete').length,
        verified: tasks.filter(task => task.status === 'verified').length,
      };
      
      // Tasks breakdown by city
      const citiesMap = new Map();
      for (const city of await storage.getCities()) {
        citiesMap.set(city.id, { id: city.id, name: city.name, count: 0 });
      }
      
      for (const task of tasks) {
        const apartment = await storage.getApartment(task.apartmentId);
        if (apartment) {
          const building = await storage.getBuilding(apartment.buildingId);
          if (building && citiesMap.has(building.cityId)) {
            const cityData = citiesMap.get(building.cityId);
            cityData.count++;
            citiesMap.set(building.cityId, cityData);
          }
        }
      }
      
      const tasksByCity = Array.from(citiesMap.values());
      
      // Recent tasks
      const recentTasks = tasks
        .sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime())
        .slice(0, 5);
      
      const expandedRecentTasks = await Promise.all(
        recentTasks.map(async (task) => {
          const apartment = await storage.getApartment(task.apartmentId);
          let building, city;
          if (apartment) {
            building = await storage.getBuilding(apartment.buildingId);
            if (building) {
              city = await storage.getCity(building.cityId);
            }
          }
          
          let assignedUser;
          if (task.assignedTo) {
            assignedUser = await storage.getUser(task.assignedTo);
            if (assignedUser) {
              // Remove password
              const { password, ...userWithoutPassword } = assignedUser;
              assignedUser = userWithoutPassword;
            }
          }
          
          return {
            ...task,
            apartment,
            building,
            city,
            assignedUser
          };
        })
      );
      
      // Recent maintained apartments
      const recentlyMaintainedApartments = apartments
        .filter(apt => apt.lastMaintenance)
        .sort((a, b) => {
          const dateA = a.lastMaintenance ? new Date(a.lastMaintenance).getTime() : 0;
          const dateB = b.lastMaintenance ? new Date(b.lastMaintenance).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, 3);
      
      const expandedRecentApartments = await Promise.all(
        recentlyMaintainedApartments.map(async (apartment) => {
          const building = await storage.getBuilding(apartment.buildingId);
          let city;
          if (building) {
            city = await storage.getCity(building.cityId);
          }
          
          // Get recent task for this apartment
          const apartmentTasks = await storage.getTasksByApartmentId(apartment.id);
          const recentTask = apartmentTasks
            .sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime())[0];
          
          return {
            ...apartment,
            building,
            city,
            recentTask
          };
        })
      );
      
      res.json({
        pendingTasks,
        correctiveTasks,
        preventiveTasks,
        activeApartments,
        tasksByStatus,
        tasksByCity,
        recentTasks: expandedRecentTasks,
        recentApartments: expandedRecentApartments
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}
