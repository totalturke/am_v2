import { 
  users, type User, type InsertUser,
  cities, type City, type InsertCity,
  buildings, type Building, type InsertBuilding,
  apartments, type Apartment, type InsertApartment,
  tasks, type Task, type InsertTask,
  materials, type Material, type InsertMaterial,
  taskMaterials, type TaskMaterial, type InsertTaskMaterial,
  purchaseOrders, type PurchaseOrder, type InsertPurchaseOrder,
  purchaseOrderItems, type PurchaseOrderItem, type InsertPurchaseOrderItem
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;
  getUsersByRole(role: string): Promise<User[]>;
  
  // City operations
  getCity(id: number): Promise<City | undefined>;
  getCities(): Promise<City[]>;
  createCity(city: InsertCity): Promise<City>;
  
  // Building operations
  getBuilding(id: number): Promise<Building | undefined>;
  getBuildings(): Promise<Building[]>;
  getBuildingsByCityId(cityId: number): Promise<Building[]>;
  createBuilding(building: InsertBuilding): Promise<Building>;
  
  // Apartment operations
  getApartment(id: number): Promise<Apartment | undefined>;
  getApartments(): Promise<Apartment[]>;
  getApartmentsByBuildingId(buildingId: number): Promise<Apartment[]>;
  createApartment(apartment: InsertApartment): Promise<Apartment>;
  updateApartment(id: number, data: Partial<Apartment>): Promise<Apartment>;
  
  // Task operations
  getTask(id: number): Promise<Task | undefined>;
  getTaskByTaskId(taskId: string): Promise<Task | undefined>;
  getTasks(): Promise<Task[]>;
  getTasksByApartmentId(apartmentId: number): Promise<Task[]>;
  getTasksByStatus(status: string): Promise<Task[]>;
  getTasksByType(type: string): Promise<Task[]>;
  getTasksByAssignedTo(userId: number): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, data: Partial<Task>): Promise<Task>;
  
  // Material operations
  getMaterial(id: number): Promise<Material | undefined>;
  getMaterials(): Promise<Material[]>;
  createMaterial(material: InsertMaterial): Promise<Material>;
  updateMaterial(id: number, data: Partial<Material>): Promise<Material>;
  
  // Task Material operations
  getTaskMaterials(taskId: number): Promise<TaskMaterial[]>;
  createTaskMaterial(taskMaterial: InsertTaskMaterial): Promise<TaskMaterial>;
  updateTaskMaterial(id: number, data: Partial<TaskMaterial>): Promise<TaskMaterial>;
  
  // Purchase Order operations
  getPurchaseOrder(id: number): Promise<PurchaseOrder | undefined>;
  getPurchaseOrders(): Promise<PurchaseOrder[]>;
  createPurchaseOrder(purchaseOrder: InsertPurchaseOrder): Promise<PurchaseOrder>;
  updatePurchaseOrder(id: number, data: Partial<PurchaseOrder>): Promise<PurchaseOrder>;
  
  // Purchase Order Item operations
  getPurchaseOrderItems(purchaseOrderId: number): Promise<PurchaseOrderItem[]>;
  createPurchaseOrderItem(purchaseOrderItem: InsertPurchaseOrderItem): Promise<PurchaseOrderItem>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private cities: Map<number, City>;
  private buildings: Map<number, Building>;
  private apartments: Map<number, Apartment>;
  private tasks: Map<number, Task>;
  private materials: Map<number, Material>;
  private taskMaterials: Map<number, TaskMaterial>;
  private purchaseOrders: Map<number, PurchaseOrder>;
  private purchaseOrderItems: Map<number, PurchaseOrderItem>;
  
  private userIdCounter: number = 1;
  private cityIdCounter: number = 1;
  private buildingIdCounter: number = 1;
  private apartmentIdCounter: number = 1;
  private taskIdCounter: number = 1;
  private materialIdCounter: number = 1;
  private taskMaterialIdCounter: number = 1;
  private purchaseOrderIdCounter: number = 1;
  private purchaseOrderItemIdCounter: number = 1;

  constructor() {
    this.users = new Map();
    this.cities = new Map();
    this.buildings = new Map();
    this.apartments = new Map();
    this.tasks = new Map();
    this.materials = new Map();
    this.taskMaterials = new Map();
    this.purchaseOrders = new Map();
    this.purchaseOrderItems = new Map();
    
    // Initialize with sample data
    this.initializeData();
  }

  private initializeData() {
    // Create demo users
    const users = [
      { username: 'miguel', password: 'password', name: 'Miguel Rodriguez', role: 'control_center', email: 'miguel@airmaint.com', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
      { username: 'carlos', password: 'password', name: 'Carlos Ortiz', role: 'maintenance_agent', email: 'carlos@airmaint.com', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
      { username: 'ana', password: 'password', name: 'Ana Morales', role: 'maintenance_agent', email: 'ana@airmaint.com', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
      { username: 'roberto', password: 'password', name: 'Roberto Vega', role: 'maintenance_agent', email: 'roberto@airmaint.com', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
      { username: 'maria', password: 'password', name: 'Maria Jimenez', role: 'maintenance_agent', email: 'maria@airmaint.com', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
      { username: 'pedro', password: 'password', name: 'Pedro Sanchez', role: 'purchasing_agent', email: 'pedro@airmaint.com' }
    ];
    
    users.forEach(user => this.createUser(user as InsertUser));
    
    // Create cities
    const cities = [
      { name: 'Mexico City', state: 'CDMX', country: 'Mexico' },
      { name: 'Cancún', state: 'Quintana Roo', country: 'Mexico' },
      { name: 'Guadalajara', state: 'Jalisco', country: 'Mexico' },
      { name: 'Monterrey', state: 'Nuevo Leon', country: 'Mexico' }
    ];
    
    const cityIds = cities.map(city => this.createCity(city as InsertCity).id);
    
    // Create buildings
    const buildings = [
      { name: 'Torre Blanca', address: 'Av. Reforma 123', cityId: cityIds[0], totalUnits: 50 },
      { name: 'Vista del Mar', address: 'Blvd. Kukulcán 45', cityId: cityIds[1], totalUnits: 80 },
      { name: 'Jardines', address: 'Av. Chapultepec 789', cityId: cityIds[2], totalUnits: 40 },
      { name: 'Bosques', address: 'Paseo de los Robles 567', cityId: cityIds[3], totalUnits: 60 },
      { name: 'Sol y Playa', address: 'Zona Hotelera 234', cityId: cityIds[1], totalUnits: 70 }
    ];
    
    const buildingIds = buildings.map(building => this.createBuilding(building as InsertBuilding).id);
    
    // Create apartments
    const apartments = [
      { 
        apartmentNumber: '203', buildingId: buildingIds[0], status: 'active', 
        bedroomCount: 2, bathroomCount: 2, squareMeters: 75, 
        imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'
      },
      { 
        apartmentNumber: '310', buildingId: buildingIds[1], status: 'active', 
        bedroomCount: 1, bathroomCount: 1, squareMeters: 60, 
        imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'
      },
      { 
        apartmentNumber: '512', buildingId: buildingIds[2], status: 'maintenance', 
        bedroomCount: 3, bathroomCount: 2, squareMeters: 95, 
        imageUrl: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'
      },
      { 
        apartmentNumber: '721', buildingId: buildingIds[3], status: 'active', 
        bedroomCount: 2, bathroomCount: 2, squareMeters: 80
      },
      { 
        apartmentNumber: '118', buildingId: buildingIds[4], status: 'active', 
        bedroomCount: 1, bathroomCount: 1, squareMeters: 55
      }
    ];
    
    const apartmentIds = apartments.map(apartment => this.createApartment(apartment as InsertApartment).id);
    
    // Create tasks
    const tasksData = [
      {
        taskId: 'MT-2023', type: 'corrective', apartmentId: apartmentIds[0], issue: 'No hot water',
        description: 'Guest reported no hot water in the bathroom. Issue appeared this morning.',
        reportedBy: 'Guest (Maria Lopez)', assignedTo: 2, priority: 'high',
        status: 'in_progress', scheduledFor: new Date(2023, 5, 12, 14, 0)
      },
      {
        taskId: 'MT-2022', type: 'preventive', apartmentId: apartmentIds[1], issue: '6-month review',
        description: 'Regular 6-month maintenance review',
        reportedBy: 'System', assignedTo: 3, priority: 'medium',
        status: 'complete', scheduledFor: new Date(2023, 5, 10, 10, 0),
        completedAt: new Date(2023, 5, 10, 12, 30)
      },
      {
        taskId: 'MT-2021', type: 'corrective', apartmentId: apartmentIds[2], issue: 'Broken AC',
        description: 'Air conditioner is not cooling properly',
        reportedBy: 'Staff', assignedTo: 4, priority: 'high',
        status: 'complete', scheduledFor: new Date(2023, 5, 9, 9, 0),
        completedAt: new Date(2023, 5, 9, 11, 45)
      },
      {
        taskId: 'MT-2020', type: 'corrective', apartmentId: apartmentIds[3], issue: 'Electrical failure',
        description: 'Power outlets in living room not working',
        reportedBy: 'Guest', priority: 'high',
        status: 'pending', scheduledFor: new Date(2023, 5, 8, 13, 0)
      },
      {
        taskId: 'MT-2019', type: 'preventive', apartmentId: apartmentIds[4], issue: 'Annual maintenance',
        description: 'Annual maintenance check of all systems',
        reportedBy: 'System', assignedTo: 5, priority: 'low',
        status: 'scheduled', scheduledFor: new Date(2023, 5, 15, 10, 0)
      }
    ];
    
    tasksData.forEach(task => this.createTask(task as InsertTask));
    
    // Create materials
    const materialsData = [
      { name: 'Light bulb (LED)', quantity: 50, unit: 'each' },
      { name: 'Water heater thermostat', quantity: 5, unit: 'each' },
      { name: 'Paint (white, 4L)', quantity: 20, unit: 'each' },
      { name: 'AC filter', quantity: 30, unit: 'each' },
      { name: 'Electrical outlet', quantity: 25, unit: 'each' },
      { name: 'Pipe sealant', quantity: 10, unit: 'each' },
      { name: 'Connection valve', quantity: 8, unit: 'each' }
    ];
    
    materialsData.forEach(material => this.createMaterial(material as InsertMaterial));
    
    // Create task materials
    const taskMaterialsData = [
      { taskId: 1, materialId: 2, quantity: 1, status: 'needed' },
      { taskId: 1, materialId: 6, quantity: 1, status: 'needed' },
      { taskId: 1, materialId: 7, quantity: 1, status: 'needed' },
      { taskId: 2, materialId: 1, quantity: 4, status: 'received' },
      { taskId: 2, materialId: 3, quantity: 1, status: 'received' },
      { taskId: 3, materialId: 4, quantity: 1, status: 'received' },
      { taskId: 5, materialId: 1, quantity: 2, status: 'ordered' },
      { taskId: 5, materialId: 3, quantity: 1, status: 'ordered' },
      { taskId: 5, materialId: 4, quantity: 1, status: 'ordered' }
    ];
    
    taskMaterialsData.forEach(taskMaterial => this.createTaskMaterial(taskMaterial as InsertTaskMaterial));
    
    // Create purchase orders
    const purchaseOrdersData = [
      { 
        poNumber: 'PO-001', createdBy: 6, status: 'submitted', 
        totalAmount: 250.75, notes: 'Emergency order for water heater parts' 
      },
      { 
        poNumber: 'PO-002', createdBy: 6, status: 'received', 
        totalAmount: 580.25, notes: 'Monthly supply order' 
      }
    ];
    
    const poIds = purchaseOrdersData.map(po => this.createPurchaseOrder(po as InsertPurchaseOrder).id);
    
    // Create purchase order items
    const poItemsData = [
      { purchaseOrderId: poIds[0], materialId: 2, quantity: 2, unitPrice: 85.5, totalPrice: 171.0 },
      { purchaseOrderId: poIds[0], materialId: 6, quantity: 3, unitPrice: 12.25, totalPrice: 36.75 },
      { purchaseOrderId: poIds[0], materialId: 7, quantity: 3, unitPrice: 14.33, totalPrice: 43.0 },
      { purchaseOrderId: poIds[1], materialId: 1, quantity: 20, unitPrice: 4.75, totalPrice: 95.0 },
      { purchaseOrderId: poIds[1], materialId: 3, quantity: 8, unitPrice: 29.50, totalPrice: 236.0 },
      { purchaseOrderId: poIds[1], materialId: 4, quantity: 15, unitPrice: 16.75, totalPrice: 251.25 }
    ];
    
    poItemsData.forEach(poItem => this.createPurchaseOrderItem(poItem as InsertPurchaseOrderItem));
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const newUser: User = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === role);
  }

  // City operations
  async getCity(id: number): Promise<City | undefined> {
    return this.cities.get(id);
  }

  async getCities(): Promise<City[]> {
    return Array.from(this.cities.values());
  }

  async createCity(city: InsertCity): Promise<City> {
    const id = this.cityIdCounter++;
    const newCity: City = { ...city, id };
    this.cities.set(id, newCity);
    return newCity;
  }

  // Building operations
  async getBuilding(id: number): Promise<Building | undefined> {
    return this.buildings.get(id);
  }

  async getBuildings(): Promise<Building[]> {
    return Array.from(this.buildings.values());
  }

  async getBuildingsByCityId(cityId: number): Promise<Building[]> {
    return Array.from(this.buildings.values()).filter(building => building.cityId === cityId);
  }

  async createBuilding(building: InsertBuilding): Promise<Building> {
    const id = this.buildingIdCounter++;
    const newBuilding: Building = { ...building, id };
    this.buildings.set(id, newBuilding);
    return newBuilding;
  }

  // Apartment operations
  async getApartment(id: number): Promise<Apartment | undefined> {
    return this.apartments.get(id);
  }

  async getApartments(): Promise<Apartment[]> {
    return Array.from(this.apartments.values());
  }

  async getApartmentsByBuildingId(buildingId: number): Promise<Apartment[]> {
    return Array.from(this.apartments.values()).filter(apartment => apartment.buildingId === buildingId);
  }

  async createApartment(apartment: InsertApartment): Promise<Apartment> {
    const id = this.apartmentIdCounter++;
    const now = new Date();
    const sixMonthsFromNow = new Date(now);
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
    
    const newApartment: Apartment = { 
      ...apartment, 
      id, 
      lastMaintenance: apartment.lastMaintenance || now,
      nextMaintenance: apartment.nextMaintenance || sixMonthsFromNow
    };
    
    this.apartments.set(id, newApartment);
    return newApartment;
  }

  async updateApartment(id: number, data: Partial<Apartment>): Promise<Apartment> {
    const apartment = await this.getApartment(id);
    if (!apartment) {
      throw new Error(`Apartment with id ${id} not found`);
    }
    
    const updatedApartment = { ...apartment, ...data };
    this.apartments.set(id, updatedApartment);
    return updatedApartment;
  }

  // Task operations
  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async getTaskByTaskId(taskId: string): Promise<Task | undefined> {
    return Array.from(this.tasks.values()).find(task => task.taskId === taskId);
  }

  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async getTasksByApartmentId(apartmentId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => task.apartmentId === apartmentId);
  }

  async getTasksByStatus(status: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => task.status === status);
  }

  async getTasksByType(type: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => task.type === type);
  }

  async getTasksByAssignedTo(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => task.assignedTo === userId);
  }

  async createTask(task: InsertTask): Promise<Task> {
    const id = this.taskIdCounter++;
    const newTask: Task = { ...task, id, reportedAt: task.reportedAt || new Date() };
    this.tasks.set(id, newTask);
    return newTask;
  }

  async updateTask(id: number, data: Partial<Task>): Promise<Task> {
    const task = await this.getTask(id);
    if (!task) {
      throw new Error(`Task with id ${id} not found`);
    }
    
    const updatedTask = { ...task, ...data };
    this.tasks.set(id, updatedTask);
    
    // If task is marked as complete, update apartment's lastMaintenance
    if (data.status === 'complete' && !task.completedAt) {
      const apartment = await this.getApartment(task.apartmentId);
      if (apartment) {
        const completedAt = data.completedAt || new Date();
        await this.updateApartment(apartment.id, { lastMaintenance: completedAt });
        updatedTask.completedAt = completedAt;
      }
    }
    
    return updatedTask;
  }

  // Material operations
  async getMaterial(id: number): Promise<Material | undefined> {
    return this.materials.get(id);
  }

  async getMaterials(): Promise<Material[]> {
    return Array.from(this.materials.values());
  }

  async createMaterial(material: InsertMaterial): Promise<Material> {
    const id = this.materialIdCounter++;
    const newMaterial: Material = { ...material, id };
    this.materials.set(id, newMaterial);
    return newMaterial;
  }

  async updateMaterial(id: number, data: Partial<Material>): Promise<Material> {
    const material = await this.getMaterial(id);
    if (!material) {
      throw new Error(`Material with id ${id} not found`);
    }
    
    const updatedMaterial = { ...material, ...data };
    this.materials.set(id, updatedMaterial);
    return updatedMaterial;
  }

  // Task Material operations
  async getTaskMaterials(taskId: number): Promise<TaskMaterial[]> {
    return Array.from(this.taskMaterials.values()).filter(tm => tm.taskId === taskId);
  }

  async createTaskMaterial(taskMaterial: InsertTaskMaterial): Promise<TaskMaterial> {
    const id = this.taskMaterialIdCounter++;
    const newTaskMaterial: TaskMaterial = { ...taskMaterial, id };
    this.taskMaterials.set(id, newTaskMaterial);
    return newTaskMaterial;
  }

  async updateTaskMaterial(id: number, data: Partial<TaskMaterial>): Promise<TaskMaterial> {
    const taskMaterial = this.taskMaterials.get(id);
    if (!taskMaterial) {
      throw new Error(`Task material with id ${id} not found`);
    }
    
    const updatedTaskMaterial = { ...taskMaterial, ...data };
    this.taskMaterials.set(id, updatedTaskMaterial);
    return updatedTaskMaterial;
  }

  // Purchase Order operations
  async getPurchaseOrder(id: number): Promise<PurchaseOrder | undefined> {
    return this.purchaseOrders.get(id);
  }

  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    return Array.from(this.purchaseOrders.values());
  }

  async createPurchaseOrder(purchaseOrder: InsertPurchaseOrder): Promise<PurchaseOrder> {
    const id = this.purchaseOrderIdCounter++;
    const newPurchaseOrder: PurchaseOrder = { 
      ...purchaseOrder, 
      id, 
      createdAt: purchaseOrder.createdAt || new Date() 
    };
    this.purchaseOrders.set(id, newPurchaseOrder);
    return newPurchaseOrder;
  }

  async updatePurchaseOrder(id: number, data: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    const purchaseOrder = await this.getPurchaseOrder(id);
    if (!purchaseOrder) {
      throw new Error(`Purchase order with id ${id} not found`);
    }
    
    const updatedPurchaseOrder = { ...purchaseOrder, ...data };
    this.purchaseOrders.set(id, updatedPurchaseOrder);
    return updatedPurchaseOrder;
  }

  // Purchase Order Item operations
  async getPurchaseOrderItems(purchaseOrderId: number): Promise<PurchaseOrderItem[]> {
    return Array.from(this.purchaseOrderItems.values())
      .filter(item => item.purchaseOrderId === purchaseOrderId);
  }

  async createPurchaseOrderItem(purchaseOrderItem: InsertPurchaseOrderItem): Promise<PurchaseOrderItem> {
    const id = this.purchaseOrderItemIdCounter++;
    const newPurchaseOrderItem: PurchaseOrderItem = { ...purchaseOrderItem, id };
    this.purchaseOrderItems.set(id, newPurchaseOrderItem);
    return newPurchaseOrderItem;
  }
}

export const storage = new MemStorage();
