import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import {
  findAllShipments,
  findShipmentById,
  findShipmentByTracking,
  createShipment,
  updateShipmentStatus,
  findShipmentEvents,
  createShipmentEvent,
  findAllWarehouses,
  findAllSuppliers,
  findAllCarriers,
} from "./queries/supplyChain";

export const shipmentRouter = createRouter({
  list: publicQuery.query(async () => {
    return findAllShipments();
  }),

  byId: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return findShipmentById(input.id);
    }),

  byTracking: publicQuery
    .input(z.object({ trackingNumber: z.string() }))
    .query(async ({ input }) => {
      return findShipmentByTracking(input.trackingNumber);
    }),

  events: publicQuery
    .input(z.object({ shipmentId: z.number() }))
    .query(async ({ input }) => {
      return findShipmentEvents(input.shipmentId);
    }),

  create: adminQuery
    .input(
      z.object({
        trackingNumber: z.string().min(1),
        originWarehouseId: z.number(),
        destinationWarehouseId: z.number(),
        supplierId: z.number().optional(),
        carrierId: z.number().optional(),
        priority: z.enum(["low", "normal", "high", "critical"]).default("normal"),
        weight: z.string().optional(),
        volume: z.string().optional(),
        value: z.string().optional(),
        eta: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return createShipment({
        ...input,
        eta: input.eta ? new Date(input.eta) : undefined,
        status: "pending",
      });
    }),

  updateStatus: adminQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum([
          "pending",
          "in_transit",
          "at_hub",
          "out_for_delivery",
          "delivered",
          "delayed",
          "cancelled",
        ]),
        risk: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return updateShipmentStatus(input.id, input.status, input.risk);
    }),

  addEvent: adminQuery
    .input(
      z.object({
        shipmentId: z.number(),
        eventType: z.enum([
          "departed",
          "arrived",
          "delayed",
          "rerouted",
          "weather_alert",
          "customs_hold",
          "delivered",
          "exception",
        ]),
        location: z.string().optional(),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return createShipmentEvent({
        ...input,
        timestamp: new Date(),
      });
    }),

  warehouses: publicQuery.query(() => findAllWarehouses()),
  suppliers: publicQuery.query(() => findAllSuppliers()),
  carriers: publicQuery.query(() => findAllCarriers()),
});
