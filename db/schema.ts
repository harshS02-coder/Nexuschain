import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  bigint,
  int,
  decimal,
  json,
  boolean,
  index,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }).unique(),
  passwordHash: varchar("passwordHash", { length: 255 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const warehouses = mysqlTable("warehouses", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  location: varchar("location", { length: 255 }).notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 6 }),
  longitude: decimal("longitude", { precision: 10, scale: 6 }),
  capacity: int("capacity"),
  currentUtilization: int("current_utilization").default(0),
  type: mysqlEnum("type", ["distribution", "fulfillment", "manufacturing", "cold_storage"]).default("distribution").notNull(),
  status: mysqlEnum("status", ["active", "inactive", "maintenance"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Warehouse = typeof warehouses.$inferSelect;

export const suppliers = mysqlTable("suppliers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  location: varchar("location", { length: 255 }).notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 6 }),
  longitude: decimal("longitude", { precision: 10, scale: 6 }),
  riskScore: decimal("risk_score", { precision: 4, scale: 2 }).default("5.00"),
  reliability: decimal("reliability", { precision: 4, scale: 2 }).default("85.00"),
  leadTimeDays: int("lead_time_days").default(7),
  status: mysqlEnum("status", ["active", "inactive", "suspended"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Supplier = typeof suppliers.$inferSelect;

export const carriers = mysqlTable("carriers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  vehicleType: mysqlEnum("vehicle_type", ["truck", "ship", "air", "rail"]).default("truck").notNull(),
  capacity: int("capacity").default(1000),
  currentLoad: int("current_load").default(0),
  status: mysqlEnum("status", ["available", "in_transit", "maintenance", "offline"]).default("available").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 6 }),
  longitude: decimal("longitude", { precision: 10, scale: 6 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Carrier = typeof carriers.$inferSelect;

export const shipments = mysqlTable("shipments", {
  id: serial("id").primaryKey(),
  trackingNumber: varchar("tracking_number", { length: 100 }).notNull().unique(),
  originWarehouseId: bigint("origin_warehouse_id", { mode: "number", unsigned: true }).notNull(),
  destinationWarehouseId: bigint("destination_warehouse_id", { mode: "number", unsigned: true }).notNull(),
  supplierId: bigint("supplier_id", { mode: "number", unsigned: true }),
  carrierId: bigint("carrier_id", { mode: "number", unsigned: true }),
  status: mysqlEnum("status", ["pending", "in_transit", "at_hub", "out_for_delivery", "delivered", "delayed", "cancelled"]).default("pending").notNull(),
  priority: mysqlEnum("priority", ["low", "normal", "high", "critical"]).default("normal").notNull(),
  weight: decimal("weight", { precision: 10, scale: 2 }),
  volume: decimal("volume", { precision: 10, scale: 2 }),
  value: decimal("value", { precision: 12, scale: 2 }),
  eta: timestamp("eta"),
  actualDelivery: timestamp("actual_delivery"),
  routeData: json("route_data"),
  disruptionRisk: decimal("disruption_risk", { precision: 4, scale: 2 }).default("0.00"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => ({
  statusIdx: index("status_idx").on(table.status),
  trackingIdx: index("tracking_idx").on(table.trackingNumber),
}));

export type Shipment = typeof shipments.$inferSelect;

export const shipmentEvents = mysqlTable("shipment_events", {
  id: serial("id").primaryKey(),
  shipmentId: bigint("shipment_id", { mode: "number", unsigned: true }).notNull(),
  eventType: mysqlEnum("event_type", ["departed", "arrived", "delayed", "rerouted", "weather_alert", "customs_hold", "delivered", "exception"]).notNull(),
  location: varchar("location", { length: 255 }),
  latitude: decimal("latitude", { precision: 10, scale: 6 }),
  longitude: decimal("longitude", { precision: 10, scale: 6 }),
  description: text("description"),
  metadata: json("metadata"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
  shipmentIdx: index("shipment_event_idx").on(table.shipmentId),
  timestampIdx: index("timestamp_idx").on(table.timestamp),
}));

export type ShipmentEvent = typeof shipmentEvents.$inferSelect;

export const routes = mysqlTable("routes", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  originId: bigint("origin_id", { mode: "number", unsigned: true }).notNull(),
  destinationId: bigint("destination_id", { mode: "number", unsigned: true }).notNull(),
  distanceKm: decimal("distance_km", { precision: 10, scale: 2 }),
  estimatedDurationHours: int("estimated_duration_hours"),
  averageTransitTime: decimal("average_transit_time", { precision: 8, scale: 2 }),
  costPerKm: decimal("cost_per_km", { precision: 8, scale: 2 }),
  riskScore: decimal("risk_score", { precision: 4, scale: 2 }).default("5.00"),
  congestionLevel: mysqlEnum("congestion_level", ["low", "medium", "high", "severe"]).default("low").notNull(),
  weatherRisk: mysqlEnum("weather_risk", ["clear", "moderate", "severe"]).default("clear").notNull(),
  status: mysqlEnum("status", ["active", "inactive", "disrupted"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Route = typeof routes.$inferSelect;

export const disruptionEvents = mysqlTable("disruption_events", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["weather", "traffic", "port_congestion", "supplier_issue", "equipment_failure", "customs_delay", "geopolitical", "pandemic", "other"]).notNull(),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  affectedRouteIds: json("affected_route_ids"),
  affectedShipmentIds: json("affected_shipment_ids"),
  location: varchar("location", { length: 255 }),
  latitude: decimal("latitude", { precision: 10, scale: 6 }),
  longitude: decimal("longitude", { precision: 10, scale: 6 }),
  predictedImpact: text("predicted_impact"),
  recommendedAction: text("recommended_action"),
  isResolved: boolean("is_resolved").default(false),
  resolvedAt: timestamp("resolved_at"),
  detectedAt: timestamp("detected_at").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  severityIdx: index("severity_idx").on(table.severity),
  resolvedIdx: index("resolved_idx").on(table.isResolved),
}));

export type DisruptionEvent = typeof disruptionEvents.$inferSelect;

export const predictions = mysqlTable("predictions", {
  id: serial("id").primaryKey(),
  shipmentId: bigint("shipment_id", { mode: "number", unsigned: true }),
  routeId: bigint("route_id", { mode: "number", unsigned: true }),
  predictionType: mysqlEnum("prediction_type", ["delay", "disruption", "demand_surge", "route_optimization", "inventory_risk"]).notNull(),
  confidence: decimal("confidence", { precision: 4, scale: 2 }),
  predictedValue: decimal("predicted_value", { precision: 10, scale: 2 }),
  actualValue: decimal("actual_value", { precision: 10, scale: 2 }),
  features: json("features"),
  modelVersion: varchar("model_version", { length: 50 }).default("v1.0"),
  isAccurate: boolean("is_accurate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Prediction = typeof predictions.$inferSelect;

export const alerts = mysqlTable("alerts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  severity: mysqlEnum("severity", ["info", "warning", "critical"]).default("info").notNull(),
  category: mysqlEnum("category", ["shipment", "route", "inventory", "supplier", "system"]).default("system").notNull(),
  relatedShipmentId: bigint("related_shipment_id", { mode: "number", unsigned: true }),
  relatedRouteId: bigint("related_route_id", { mode: "number", unsigned: true }),
  isRead: boolean("is_read").default(false),
  actionTaken: varchar("action_taken", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  readIdx: index("read_idx").on(table.isRead),
  severityAlertIdx: index("severity_alert_idx").on(table.severity),
}));

export type Alert = typeof alerts.$inferSelect;

export const routeRecommendations = mysqlTable("route_recommendations", {
  id: serial("id").primaryKey(),
  shipmentId: bigint("shipment_id", { mode: "number", unsigned: true }).notNull(),
  originalRouteId: bigint("original_route_id", { mode: "number", unsigned: true }).notNull(),
  recommendedRouteId: bigint("recommended_route_id", { mode: "number", unsigned: true }).notNull(),
  reason: text("reason"),
  estimatedTimeSavings: int("estimated_time_savings"),
  estimatedCostSavings: decimal("estimated_cost_savings", { precision: 10, scale: 2 }),
  riskReduction: decimal("risk_reduction", { precision: 4, scale: 2 }),
  isAccepted: boolean("is_accepted").default(false),
  isExecuted: boolean("is_executed").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RouteRecommendation = typeof routeRecommendations.$inferSelect;

export const telemetryEvents = mysqlTable("telemetry_events", {
  id: serial("id").primaryKey(),
  deviceId: varchar("device_id", { length: 100 }).notNull(),
  eventType: mysqlEnum("event_type", ["gps", "temperature", "humidity", "vibration", "speed", "fuel", "door_open", "shock"]).notNull(),
  value: decimal("value", { precision: 12, scale: 4 }),
  unit: varchar("unit", { length: 20 }),
  latitude: decimal("latitude", { precision: 10, scale: 6 }),
  longitude: decimal("longitude", { precision: 10, scale: 6 }),
  shipmentId: bigint("shipment_id", { mode: "number", unsigned: true }),
  metadata: json("metadata"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
  deviceIdx: index("device_idx").on(table.deviceId),
  eventTypeIdx: index("event_type_idx").on(table.eventType),
}));

export type TelemetryEvent = typeof telemetryEvents.$inferSelect;