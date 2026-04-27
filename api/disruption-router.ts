import { z } from "zod";
import { createRouter, publicQuery, authedQuery, adminQuery } from "./middleware";
import {
  findDisruptions,
  createDisruption,
  resolveDisruption,
  findAlerts,
  createAlert,
  markAlertRead,
  createRouteRecommendation,
  findRouteRecommendations,
  acceptRecommendation,
  findAllRoutes,
} from "./queries/supplyChain";
import { getRedis } from "./lib/redis";

export const disruptionRouter = createRouter({
  list: publicQuery.query(async () => {
    return findDisruptions({ limit: 100 });
  }),

  active: publicQuery.query(async () => {
    return findDisruptions({ isResolved: false, limit: 50 });
  }),

  bySeverity: publicQuery
    .input(z.object({ severity: z.enum(["low", "medium", "high", "critical"]) }))
    .query(async ({ input }) => {
      return findDisruptions({ severity: input.severity, limit: 50 });
    }),

  create: adminQuery
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        type: z.enum([
          "weather",
          "traffic",
          "port_congestion",
          "supplier_issue",
          "equipment_failure",
          "customs_delay",
          "geopolitical",
          "pandemic",
          "other",
        ]),
        severity: z.enum(["low", "medium", "high", "critical"]).default("medium"),
        location: z.string().optional(),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
        affectedRouteIds: z.array(z.number()).optional(),
        affectedShipmentIds: z.array(z.number()).optional(),
        predictedImpact: z.string().optional(),
        recommendedAction: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const disruption = await createDisruption({
        ...input,
        affectedRouteIds: input.affectedRouteIds || [],
        affectedShipmentIds: input.affectedShipmentIds || [],
      });
      await getRedis().publish(
        "supplychain:disruptions",
        JSON.stringify({ type: "new_disruption", data: disruption })
      );
      return disruption;
    }),

  resolve: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await resolveDisruption(input.id);
      return { id: input.id, resolved: true };
    }),

  alerts: publicQuery.query(async () => {
    return findAlerts({ limit: 100 });
  }),

  unreadAlerts: publicQuery.query(async () => {
    return findAlerts({ isRead: false, limit: 50 });
  }),

  createAlert: adminQuery
    .input(
      z.object({
        title: z.string().min(1),
        message: z.string().optional(),
        severity: z.enum(["info", "warning", "critical"]).default("info"),
        category: z.enum(["shipment", "route", "inventory", "supplier", "system"]).default("system"),
        relatedShipmentId: z.number().optional(),
        relatedRouteId: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const alert = await createAlert(input);
      await getRedis().publish(
        "supplychain:alerts",
        JSON.stringify({ type: "new_alert", data: alert })
      );
      return alert;
    }),

  markAlertRead: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await markAlertRead(input.id);
      return { id: input.id, read: true };
    }),
});

export const routeRouter = createRouter({
  list: publicQuery.query(async () => {
    return findAllRoutes();
  }),

  recommendations: publicQuery
    .input(z.object({ shipmentId: z.number().optional() }))
    .query(async ({ input }) => {
      return findRouteRecommendations(input.shipmentId);
    }),

  createRecommendation: adminQuery
    .input(
      z.object({
        shipmentId: z.number(),
        originalRouteId: z.number(),
        recommendedRouteId: z.number(),
        reason: z.string().optional(),
        estimatedTimeSavings: z.number().optional(),
        estimatedCostSavings: z.string().optional(),
        riskReduction: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return createRouteRecommendation({
        ...input,
        estimatedCostSavings: input.estimatedCostSavings
          ? String(parseFloat(input.estimatedCostSavings))
          : undefined,
        riskReduction: input.riskReduction
          ? String(parseFloat(input.riskReduction))
          : undefined,
      });
    }),

  acceptRecommendation: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await acceptRecommendation(input.id);
      return { id: input.id, accepted: true };
    }),
});
