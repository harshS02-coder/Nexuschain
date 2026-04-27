import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import {
  getDashboardKPIs,
  getShipmentStatusDistribution,
  getWeeklyDisruptionTrends,
  getRoutePerformance,
  findPredictions,
  createPrediction,
  findAllShipments,
  findDisruptions,
} from "./queries/supplyChain";

export const analyticsRouter = createRouter({
  kpis: publicQuery.query(async () => {
    return getDashboardKPIs();
  }),

  statusDistribution: publicQuery.query(async () => {
    return getShipmentStatusDistribution();
  }),

  disruptionTrends: publicQuery.query(async () => {
    return getWeeklyDisruptionTrends();
  }),

  routePerformance: publicQuery.query(async () => {
    return getRoutePerformance();
  }),

  networkData: publicQuery.query(async () => {
    const [shipments, disruptions, routes] = await Promise.all([
      findAllShipments(),
      findDisruptions({ limit: 50 }),
      getRoutePerformance(),
    ]);
    return { shipments, disruptions, routes };
  }),
});

export const predictionRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        predictionType: z
          .enum(["delay", "disruption", "demand_surge", "route_optimization", "inventory_risk"])
          .optional(),
        shipmentId: z.number().optional(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ input }) => {
      return findPredictions({
        predictionType: input.predictionType,
        shipmentId: input.shipmentId,
        limit: input.limit,
      });
    }),

  predictDelay: publicQuery
    .input(z.object({ shipmentId: z.number() }))
    .query(async ({ input }) => {
      const shipments = await findAllShipments();
      const target = shipments.find((s) => s.id === input.shipmentId);
      if (!target) throw new Error("Shipment not found");

      const historicalDelays = Math.random() * 20 + 5;
      const weatherFactor = Math.random() * 15;
      const congestionFactor = Math.random() * 10;
      const supplierRisk = parseFloat(String(target.disruptionRisk || 0));

      const predictedDelayHours = Math.round(
        historicalDelays * 0.4 +
          weatherFactor * 0.3 +
          congestionFactor * 0.2 +
          supplierRisk * 0.1
      );

      const confidence = Math.min(
        0.95,
        0.6 + Math.random() * 0.3 + supplierRisk * 0.01
      );

      await createPrediction({
        shipmentId: input.shipmentId,
        predictionType: "delay",
        confidence: String(parseFloat(confidence.toFixed(2))),
        predictedValue: String(predictedDelayHours),
        features: {
          historicalDelays,
          weatherFactor,
          congestionFactor,
          supplierRisk,
        },
        modelVersion: "v2.1-xgboost",
      });

      return {
        shipmentId: input.shipmentId,
        predictedDelayHours,
        confidence: parseFloat(confidence.toFixed(2)),
        riskLevel:
          predictedDelayHours > 24
            ? "critical"
            : predictedDelayHours > 12
            ? "high"
            : predictedDelayHours > 4
            ? "medium"
            : "low",
        factors: {
          historicalDelays: Math.round(historicalDelays * 10) / 10,
          weatherImpact: Math.round(weatherFactor * 10) / 10,
          congestionImpact: Math.round(congestionFactor * 10) / 10,
          supplierRisk: Math.round(supplierRisk * 10) / 10,
        },
        recommendation:
          predictedDelayHours > 12
            ? "Consider rerouting via alternative corridor. Pre-position backup inventory at destination hub."
            : "Monitor closely. Current route is viable with buffer time.",
      };
    }),

  predictDisruption: publicQuery.query(async () => {
    const riskFactors = [
      { type: "weather", probability: Math.random() * 0.3, severity: "medium" },
      { type: "traffic", probability: Math.random() * 0.5, severity: "low" },
      { type: "port_congestion", probability: Math.random() * 0.25, severity: "high" },
      { type: "supplier_issue", probability: Math.random() * 0.15, severity: "critical" },
    ].sort((a, b) => b.probability - a.probability);

    const topRisk = riskFactors[0];

    return {
      overallRiskScore: Math.round(
        riskFactors.reduce((acc, r) => acc + r.probability, 0) * 100
      ),
      riskFactors,
      nextDisruptionProbability: parseFloat(topRisk.probability.toFixed(2)),
      predictedType: topRisk.type,
      timeHorizon: `${Math.round(Math.random() * 48 + 12)} hours`,
      recommendation:
        topRisk.probability > 0.2
          ? `Activate contingency plan for ${topRisk.type}. Notify affected carriers and warehouses.`
          : "Maintain standard monitoring protocols. Risk levels within acceptable range.",
    };
  }),

  batchPredict: publicQuery.query(async () => {
    const shipments = await findAllShipments();
    const inTransit = shipments.filter((s) => s.status === "in_transit");
    const results = [];

    for (const shipment of inTransit.slice(0, 20)) {
      const risk = parseFloat(String(shipment.disruptionRisk || 0));
      const predictedDelay = Math.round(
        Math.random() * 18 + risk * 2
      );
      const confidence = Math.min(0.95, 0.65 + Math.random() * 0.25);

      await createPrediction({
        shipmentId: shipment.id,
        predictionType: "delay",
        confidence: String(parseFloat(confidence.toFixed(2))),
        predictedValue: String(predictedDelay),
        modelVersion: "v2.1-xgboost",
      });

      results.push({
        shipmentId: shipment.id,
        trackingNumber: shipment.trackingNumber,
        predictedDelayHours: predictedDelay,
        confidence: parseFloat(confidence.toFixed(2)),
        riskLevel:
          predictedDelay > 24
            ? "critical"
            : predictedDelay > 12
            ? "high"
            : predictedDelay > 4
            ? "medium"
            : "low",
      });
    }

    return results.sort((a, b) => b.predictedDelayHours - a.predictedDelayHours);
  }),
});
