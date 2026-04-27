import { getDb } from "../queries/connection";
import {
  shipments,
  shipmentEvents,
  routes,
  disruptionEvents,
  alerts,
  predictions,
  routeRecommendations,
  telemetryEvents,
} from "@db/schema";
import { eq, desc, and, sql, count, avg } from "drizzle-orm";

export async function findAllShipments() {
  return getDb().query.shipments.findMany({
    orderBy: desc(shipments.createdAt),
    limit: 1000,
  });
}

export async function findShipmentById(id: number) {
  return getDb().query.shipments.findFirst({
    where: eq(shipments.id, id),
  });
}

export async function findShipmentByTracking(trackingNumber: string) {
  return getDb().query.shipments.findFirst({
    where: eq(shipments.trackingNumber, trackingNumber),
  });
}

export async function createShipment(data: typeof shipments.$inferInsert) {
  const result = await getDb().insert(shipments).values(data).$returningId();
  const id = result[0].id;
  return getDb().query.shipments.findFirst({ where: eq(shipments.id, id) });
}

export async function updateShipmentStatus(
  id: number,
  status: string,
  risk?: number
) {
  const update: Record<string, unknown> = { status, updatedAt: new Date() };
  if (risk !== undefined) update.disruptionRisk = risk;
  await getDb().update(shipments).set(update).where(eq(shipments.id, id));
  return findShipmentById(id);
}

export async function findShipmentEvents(shipmentId: number) {
  return getDb()
    .select()
    .from(shipmentEvents)
    .where(eq(shipmentEvents.shipmentId, shipmentId))
    .orderBy(desc(shipmentEvents.timestamp))
    .limit(100);
}

export async function createShipmentEvent(
  data: typeof shipmentEvents.$inferInsert
) {
  return getDb().insert(shipmentEvents).values(data).$returningId();
}

export async function findAllWarehouses() {
  return getDb().query.warehouses.findMany();
}

export async function findAllSuppliers() {
  return getDb().query.suppliers.findMany();
}

export async function findAllCarriers() {
  return getDb().query.carriers.findMany();
}

export async function findAllRoutes() {
  return getDb().query.routes.findMany();
}

export async function findRouteById(id: number) {
  return getDb().query.routes.findFirst({ where: eq(routes.id, id) });
}

export async function findDisruptions(args?: {
  severity?: "low" | "medium" | "high" | "critical";
  isResolved?: boolean;
  limit?: number;
}) {
  const conditions = [];
  if (args?.severity) {
    conditions.push(eq(disruptionEvents.severity, args.severity));
  }
  if (args?.isResolved !== undefined) {
    conditions.push(eq(disruptionEvents.isResolved, args.isResolved));
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  return getDb()
    .select()
    .from(disruptionEvents)
    .where(where)
    .orderBy(desc(disruptionEvents.detectedAt))
    .limit(args?.limit || 100);
}

export async function createDisruption(
  data: typeof disruptionEvents.$inferInsert
) {
  const result = await getDb()
    .insert(disruptionEvents)
    .values(data)
    .$returningId();
  const id = result[0].id;
  return getDb()
    .select()
    .from(disruptionEvents)
    .where(eq(disruptionEvents.id, id))
    .then((rows) => rows[0]);
}

export async function resolveDisruption(id: number) {
  await getDb()
    .update(disruptionEvents)
    .set({ isResolved: true, resolvedAt: new Date() })
    .where(eq(disruptionEvents.id, id));
}

export async function findAlerts(args?: {
  isRead?: boolean;
  severity?: "info" | "warning" | "critical";
  limit?: number;
}) {
  const conditions = [];
  if (args?.isRead !== undefined) {
    conditions.push(eq(alerts.isRead, args.isRead));
  }
  if (args?.severity) {
    conditions.push(eq(alerts.severity, args.severity));
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  return getDb()
    .select()
    .from(alerts)
    .where(where)
    .orderBy(desc(alerts.createdAt))
    .limit(args?.limit || 100);
}

export async function createAlert(data: typeof alerts.$inferInsert) {
  return getDb().insert(alerts).values(data).$returningId();
}

export async function markAlertRead(id: number) {
  await getDb()
    .update(alerts)
    .set({ isRead: true })
    .where(eq(alerts.id, id));
}

export async function createPrediction(data: typeof predictions.$inferInsert) {
  return getDb().insert(predictions).values(data).$returningId();
}

export async function findPredictions(args?: {
  predictionType?: "delay" | "disruption" | "demand_surge" | "route_optimization" | "inventory_risk";
  shipmentId?: number;
  limit?: number;
}) {
  const conditions = [];
  if (args?.predictionType) {
    conditions.push(eq(predictions.predictionType, args.predictionType));
  }
  if (args?.shipmentId) {
    conditions.push(eq(predictions.shipmentId, args.shipmentId));
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  return getDb()
    .select()
    .from(predictions)
    .where(where)
    .orderBy(desc(predictions.createdAt))
    .limit(args?.limit || 100);
}

export async function createRouteRecommendation(
  data: typeof routeRecommendations.$inferInsert
) {
  return getDb().insert(routeRecommendations).values(data).$returningId();
}

export async function findRouteRecommendations(shipmentId?: number) {
  const where = shipmentId
    ? eq(routeRecommendations.shipmentId, shipmentId)
    : undefined;
  return getDb()
    .select()
    .from(routeRecommendations)
    .where(where)
    .orderBy(desc(routeRecommendations.createdAt))
    .limit(100);
}

export async function acceptRecommendation(id: number) {
  await getDb()
    .update(routeRecommendations)
    .set({ isAccepted: true })
    .where(eq(routeRecommendations.id, id));
}

export async function createTelemetry(
  data: typeof telemetryEvents.$inferInsert
) {
  return getDb().insert(telemetryEvents).values(data).$returningId();
}

export async function findTelemetryByShipment(
  shipmentId: number,
  limit = 100
) {
  return getDb()
    .select()
    .from(telemetryEvents)
    .where(eq(telemetryEvents.shipmentId, shipmentId))
    .orderBy(desc(telemetryEvents.timestamp))
    .limit(limit);
}

export async function getDashboardKPIs() {
  const db = getDb();
  const totalShipments = await db
    .select({ count: count() })
    .from(shipments)
    .then((r) => r[0].count);

  const inTransit = await db
    .select({ count: count() })
    .from(shipments)
    .where(eq(shipments.status, "in_transit"))
    .then((r) => r[0].count);

  const delayed = await db
    .select({ count: count() })
    .from(shipments)
    .where(eq(shipments.status, "delayed"))
    .then((r) => r[0].count);

  const delivered = await db
    .select({ count: count() })
    .from(shipments)
    .where(eq(shipments.status, "delivered"))
    .then((r) => r[0].count);

  const criticalAlerts = await db
    .select({ count: count() })
    .from(alerts)
    .where(and(eq(alerts.severity, "critical"), eq(alerts.isRead, false)))
    .then((r) => r[0].count);

  const avgRisk = await db
    .select({ avg: avg(shipments.disruptionRisk) })
    .from(shipments)
    .then((r) => r[0].avg || "0");

  const activeDisruptions = await db
    .select({ count: count() })
    .from(disruptionEvents)
    .where(eq(disruptionEvents.isResolved, false))
    .then((r) => r[0].count);

  return {
    totalShipments,
    inTransit,
    delayed,
    delivered,
    criticalAlerts,
    avgRisk: parseFloat(avgRisk),
    activeDisruptions,
    onTimeRate: totalShipments > 0 ? Math.round((delivered / totalShipments) * 100) : 0,
  };
}

export async function getShipmentStatusDistribution() {
  const db = getDb();
  const result = await db
    .select({ status: shipments.status, count: count() })
    .from(shipments)
    .groupBy(shipments.status);
  return result;
}

export async function getWeeklyDisruptionTrends() {
  const db = getDb();
  const result = await db
    .select({
      week: sql`DATE_FORMAT(${disruptionEvents.detectedAt}, '%Y-%u')`.as("week"),
      count: count(),
    })
    .from(disruptionEvents)
    .groupBy(sql`DATE_FORMAT(${disruptionEvents.detectedAt}, '%Y-%u')`)
    .orderBy(desc(sql`week`))
    .limit(12);
  return result;
}

export async function getRoutePerformance() {
  const db = getDb();
  return db.select().from(routes).orderBy(desc(routes.riskScore)).limit(20);
}
