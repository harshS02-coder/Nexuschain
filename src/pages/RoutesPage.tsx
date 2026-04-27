import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { trpc } from "@/providers/trpc";
import {
  Route,
  Wind,
  CheckCircle2,
  Clock,
  DollarSign,
  Shield,
  ChevronRight,
  Play,
  TrendingUp,
} from "lucide-react";

export default function RoutesPage() {
  const { data: routes } = trpc.route.list.useQuery();
  const { data: recommendations } = trpc.route.recommendations.useQuery({});
  const { data: routePerformance } = trpc.analytics.routePerformance.useQuery();
  const utils = trpc.useUtils();

  const [selectedRoute, setSelectedRoute] = useState<number | null>(null);

  const acceptRec = trpc.route.acceptRecommendation.useMutation({
    onSuccess: () => {
      utils.route.recommendations.invalidate();
      utils.analytics.kpis.invalidate();
    },
  });

  const selectedRouteData = routes?.find((r) => r.id === selectedRoute);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-stone-100">Route Optimization</h1>
          <p className="text-sm text-stone-400 mt-1">
            AI-powered corridor analysis and dynamic rerouting recommendations
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Routes List */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-stone-800">
              <h3 className="text-sm font-semibold text-stone-200">Active Corridors</h3>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              {(routes || []).map((r) => {
                const risk = parseFloat(String(r.riskScore || 0));
                const isSelected = selectedRoute === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRoute(isSelected ? null : r.id)}
                    className={`w-full text-left p-4 border-b border-stone-800/50 transition-colors ${
                      isSelected ? "bg-stone-800/40" : "hover:bg-stone-800/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Route size={14} className="text-amber-400" />
                        <span className="text-sm font-medium text-stone-200">
                          {r.name}
                        </span>
                      </div>
                      <ChevronRight
                        size={14}
                        className={`text-stone-500 transition-transform ${
                          isSelected ? "rotate-90" : ""
                        }`}
                      />
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-stone-500">
                        {r.distanceKm} km
                      </span>
                      <span className="text-xs text-stone-500">
                        {r.estimatedDurationHours}h est.
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          risk > 5
                            ? "text-rose-400"
                            : risk > 3
                            ? "text-amber-400"
                            : "text-emerald-400"
                        }`}
                      >
                        Risk {risk.toFixed(1)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Route Detail */}
          <div className="lg:col-span-2 space-y-4">
            {selectedRouteData ? (
              <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-stone-100">
                      {selectedRouteData.name}
                    </h2>
                    <p className="text-xs text-stone-500 mt-1">
                      Status: {" "}
                      <span
                        className={`font-medium ${
                          selectedRouteData.status === "active"
                            ? "text-emerald-400"
                            : selectedRouteData.status === "disrupted"
                            ? "text-rose-400"
                            : "text-stone-400"
                        }`}
                      >
                        {selectedRouteData.status}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        selectedRouteData.congestionLevel === "severe"
                          ? "bg-rose-900/20 text-rose-400"
                          : selectedRouteData.congestionLevel === "high"
                          ? "bg-amber-900/20 text-amber-400"
                          : "bg-emerald-900/20 text-emerald-400"
                      }`}
                    >
                      {selectedRouteData.congestionLevel} congestion
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-stone-800/30 border border-stone-800">
                    <p className="text-xs text-stone-500">Distance</p>
                    <p className="text-sm font-semibold text-stone-200 mt-1">
                      {selectedRouteData.distanceKm} km
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-stone-800/30 border border-stone-800">
                    <p className="text-xs text-stone-500">Est. Duration</p>
                    <p className="text-sm font-semibold text-stone-200 mt-1">
                      {selectedRouteData.estimatedDurationHours}h
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-stone-800/30 border border-stone-800">
                    <p className="text-xs text-stone-500">Cost/km</p>
                    <p className="text-sm font-semibold text-stone-200 mt-1">
                      ${selectedRouteData.costPerKm}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-stone-800/30 border border-stone-800">
                    <p className="text-xs text-stone-500">Risk Score</p>
                    <p className="text-sm font-semibold text-stone-200 mt-1">
                      {parseFloat(String(selectedRouteData.riskScore || 0)).toFixed(1)}/10
                    </p>
                  </div>
                </div>

                {/* Performance metrics */}
                <div className="p-4 rounded-lg bg-stone-950/50 border border-stone-800">
                  <h4 className="text-xs font-semibold text-stone-400 uppercase mb-3">
                    Historical Performance
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-sky-400" />
                      <div>
                        <p className="text-xs text-stone-500">Avg Transit</p>
                        <p className="text-sm text-stone-200">
                          {selectedRouteData.averageTransitTime}h
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield size={16} className="text-emerald-400" />
                      <div>
                        <p className="text-xs text-stone-500">Reliability</p>
                        <p className="text-sm text-stone-200">
                          {Math.max(60, 100 - parseFloat(String(selectedRouteData.riskScore || 0)) * 6).toFixed(0)}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp size={16} className="text-amber-400" />
                      <div>
                        <p className="text-xs text-stone-500">Weather Risk</p>
                        <p className="text-sm text-stone-200 capitalize">
                          {selectedRouteData.weatherRisk}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-stone-900 border border-stone-800 rounded-xl p-8 text-center">
                <Route size={40} className="mx-auto text-stone-700 mb-3" />
                <p className="text-stone-400">Select a corridor to view optimization details</p>
              </div>
            )}

            {/* Recommendations */}
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-stone-200 mb-4 flex items-center gap-2">
                <Wind size={16} className="text-amber-400" />
                Active Rerouting Recommendations
              </h3>
              <div className="space-y-3">
                {(recommendations || []).map((rec) => (
                  <div
                    key={rec.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg bg-stone-800/30 border border-stone-800"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-stone-200">
                          Shipment #{rec.shipmentId}
                        </span>
                        <span className="text-xs text-stone-500">
                          Route #{rec.originalRouteId} → #{rec.recommendedRouteId}
                        </span>
                      </div>
                      <p className="text-xs text-stone-400 mt-1">{rec.reason}</p>
                      <div className="flex flex-wrap gap-3 mt-2">
                        {rec.estimatedTimeSavings && (
                          <span className="text-xs text-emerald-400 flex items-center gap-1">
                            <Clock size={10} />
                            Save {rec.estimatedTimeSavings}h
                          </span>
                        )}
                        {rec.estimatedCostSavings && (
                          <span className="text-xs text-sky-400 flex items-center gap-1">
                            <DollarSign size={10} />
                            {parseFloat(String(rec.estimatedCostSavings)) > 0
                              ? `Save $${parseFloat(String(rec.estimatedCostSavings)).toFixed(0)}`
                              : `Cost +$${Math.abs(parseFloat(String(rec.estimatedCostSavings))).toFixed(0)}`}
                          </span>
                        )}
                        {rec.riskReduction && (
                          <span className="text-xs text-amber-400 flex items-center gap-1">
                            <Shield size={10} />
                            Risk -{parseFloat(String(rec.riskReduction)).toFixed(1)} pts
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {rec.isAccepted ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-900/20 text-emerald-400 text-xs font-medium">
                          <CheckCircle2 size={14} />
                          Accepted
                        </span>
                      ) : rec.isExecuted ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-900/20 text-sky-400 text-xs font-medium">
                          <Play size={14} />
                          Executed
                        </span>
                      ) : (
                        <button
                          onClick={() => acceptRec.mutate({ id: rec.id })}
                          disabled={acceptRec.isPending}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-900/20 text-amber-400 text-xs font-medium hover:bg-amber-900/30 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle2 size={14} />
                          Accept
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {(!recommendations || recommendations.length === 0) && (
                  <p className="text-sm text-stone-500 text-center py-6">
                    No active rerouting recommendations
                  </p>
                )}
              </div>
            </div>

            {/* Performance Table */}
            <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-stone-800">
                <h3 className="text-sm font-semibold text-stone-200">Corridor Risk Ranking</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-800 text-left text-stone-400">
                      <th className="px-4 py-3 font-medium">Route</th>
                      <th className="px-4 py-3 font-medium">Congestion</th>
                      <th className="px-4 py-3 font-medium">Weather</th>
                      <th className="px-4 py-3 font-medium">Risk</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(routePerformance || []).map((r) => {
                      const risk = parseFloat(String(r.riskScore || 0));
                      return (
                        <tr
                          key={r.id}
                          className="border-b border-stone-800/50 hover:bg-stone-800/20"
                        >
                          <td className="px-4 py-3 text-stone-200">{r.name}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-xs capitalize ${
                                r.congestionLevel === "severe" || r.congestionLevel === "high"
                                  ? "text-rose-400"
                                  : "text-stone-400"
                              }`}
                            >
                              {r.congestionLevel}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-xs capitalize ${
                                r.weatherRisk === "severe"
                                  ? "text-rose-400"
                                  : r.weatherRisk === "moderate"
                                  ? "text-amber-400"
                                  : "text-stone-400"
                              }`}
                            >
                              {r.weatherRisk}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-12 h-1 rounded-full bg-stone-800 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    risk > 5 ? "bg-rose-500" : risk > 3 ? "bg-amber-500" : "bg-emerald-500"
                                  }`}
                                  style={{ width: `${Math.min(risk * 10, 100)}%` }}
                                />
                              </div>
                              <span className="text-xs text-stone-400">
                                {risk.toFixed(1)}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-xs font-medium ${
                                r.status === "active"
                                  ? "text-emerald-400"
                                  : r.status === "disrupted"
                                  ? "text-rose-400"
                                  : "text-stone-400"
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
