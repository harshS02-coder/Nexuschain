import { authRouter } from "./auth-router";
import { createRouter, publicQuery } from "./middleware";
import { shipmentRouter } from "./shipment-router";
import { disruptionRouter, routeRouter } from "./disruption-router";
import { analyticsRouter, predictionRouter } from "./analytics-router";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  shipment: shipmentRouter,
  disruption: disruptionRouter,
  route: routeRouter,
  analytics: analyticsRouter,
  prediction: predictionRouter,
});

export type AppRouter = typeof appRouter;
