import { pgTable, text, serial, integer, boolean, timestamp, real, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(), // "maintenance_agent", "control_center", "purchasing_agent"
  email: text("email"),
  phone: text("phone"),
  avatar: text("avatar"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

// City schema
export const cities = pgTable("cities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  state: text("state").notNull(),
  country: text("country").notNull().default("Mexico"),
});

export const insertCitySchema = createInsertSchema(cities).omit({
  id: true,
});

// Building schema
export const buildings = pgTable("buildings", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  cityId: integer("city_id").notNull(),
  totalUnits: integer("total_units").notNull(),
});

export const insertBuildingSchema = createInsertSchema(buildings).omit({
  id: true,
});

// Apartment schema
export const apartments = pgTable("apartments", {
  id: serial("id").primaryKey(),
  apartmentNumber: text("apartment_number").notNull(),
  buildingId: integer("building_id").notNull(),
  status: text("status").notNull().default("active"), // active, maintenance, inactive
  lastMaintenance: timestamp("last_maintenance"),
  nextMaintenance: timestamp("next_maintenance"),
  bedroomCount: integer("bedroom_count").notNull(),
  bathroomCount: integer("bathroom_count").notNull(),
  squareMeters: real("square_meters"),
  notes: text("notes"),
  imageUrl: text("image_url"),
});

export const insertApartmentSchema = createInsertSchema(apartments).omit({
  id: true,
});

// Task schema
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  taskId: text("task_id").notNull().unique(), // MT-XXXX
  type: text("type").notNull(), // corrective, preventive
  apartmentId: integer("apartment_id").notNull(),
  issue: text("issue").notNull(),
  description: text("description"),
  reportedBy: text("reported_by"),
  reportedAt: timestamp("reported_at").notNull().defaultNow(),
  scheduledFor: timestamp("scheduled_for"),
  assignedTo: integer("assigned_to"),
  priority: text("priority").notNull().default("medium"), // low, medium, high
  status: text("status").notNull().default("pending"), // pending, in_progress, complete, verified
  estimatedDuration: text("estimated_duration"),
  completedAt: timestamp("completed_at"),
  verifiedBy: integer("verified_by"),
  verifiedAt: timestamp("verified_at"),
  evidencePhotos: json("evidence_photos").default([]),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  reportedAt: true,
  completedAt: true,
  verifiedAt: true,
});

// Material schema
export const materials = pgTable("materials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  quantity: integer("quantity").notNull().default(0),
  unit: text("unit").notNull(), // each, kg, liter
  notes: text("notes"),
});

export const insertMaterialSchema = createInsertSchema(materials).omit({
  id: true,
});

// Task Materials schema (for tracking materials needed for tasks)
export const taskMaterials = pgTable("task_materials", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").notNull(),
  materialId: integer("material_id").notNull(),
  quantity: integer("quantity").notNull(),
  status: text("status").notNull().default("needed"), // needed, ordered, received
});

export const insertTaskMaterialSchema = createInsertSchema(taskMaterials).omit({
  id: true,
});

// Purchase Order schema
export const purchaseOrders = pgTable("purchase_orders", {
  id: serial("id").primaryKey(),
  poNumber: text("po_number").notNull().unique(),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  status: text("status").notNull().default("draft"), // draft, submitted, received
  totalAmount: real("total_amount"),
  notes: text("notes"),
});

export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders).omit({
  id: true,
  createdAt: true,
});

// Purchase Order Items schema
export const purchaseOrderItems = pgTable("purchase_order_items", {
  id: serial("id").primaryKey(),
  purchaseOrderId: integer("purchase_order_id").notNull(),
  materialId: integer("material_id").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: real("unit_price"),
  totalPrice: real("total_price"),
});

export const insertPurchaseOrderItemSchema = createInsertSchema(purchaseOrderItems).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type City = typeof cities.$inferSelect;
export type InsertCity = z.infer<typeof insertCitySchema>;

export type Building = typeof buildings.$inferSelect;
export type InsertBuilding = z.infer<typeof insertBuildingSchema>;

export type Apartment = typeof apartments.$inferSelect;
export type InsertApartment = z.infer<typeof insertApartmentSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type Material = typeof materials.$inferSelect;
export type InsertMaterial = z.infer<typeof insertMaterialSchema>;

export type TaskMaterial = typeof taskMaterials.$inferSelect;
export type InsertTaskMaterial = z.infer<typeof insertTaskMaterialSchema>;

export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;

export type PurchaseOrderItem = typeof purchaseOrderItems.$inferSelect;
export type InsertPurchaseOrderItem = z.infer<typeof insertPurchaseOrderItemSchema>;
