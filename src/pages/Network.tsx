import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { trpc } from "@/providers/trpc";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Circle,
} from "react-leaflet";
import { Link } from "react-router";
import { AlertTriangle, Wind, ArrowRight, Activity } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix leaflet default icon issue
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const warehouseIcon = L.divIcon({
  className: "custom-div-icon",
  html: `<div style="background:#f59e0b;width:12px;height:12px;border-radius:50%;border:2px solid #1c1917;"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

const disruptionIcon = L.divIcon({
  className: "custom-div-icon",
  html: `<div style="background:#ef4444;width:14px;height:14px;border-radius:50%;border:2px solid #1c1917;animation:pulse 2s infinite;"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

export default function Network() {
  const { data: networkData } = trpc.analytics.networkData.useQuery();
  const { data: warehouses } = trpc.shipment.warehouses.useQuery();
  const { data: disruptions } = trpc.disruption.active.useQuery();
  const { data: routes } = trpc.route.list.useQuery();

  const [activeLayer, setActiveLayer] = useState<"all" | "shipments" | "disruptions" | "routes">("all");

  const warehouseMap = Object.fromEntries((warehouses || []).map((w) => [w.id, w]));

  const routeLines =
    (routes || []).map((r) => {
      const origin = warehouseMap[r.originId];
      const dest = warehouseMap[r.destinationId];
      if (!origin?.latitude || !origin?.longitude || !dest?.latitude || !dest?.longitude)
        return null;
      return {
        id: r.id,
        from: [parseFloat(String(origin.latitude)), parseFloat(String(origin.longitude))] as [number, number],
        to: [parseFloat(String(dest.latitude)), parseFloat(String(dest.longitude))] as [number, number],
        status: r.status,
        riskScore: parseFloat(String(r.riskScore || 0)),
      };
    }).filter(Boolean) as { id: number; from: [number, number]; to: [number, number]; status: string; riskScore: number }[];

  const _activeShipments = (networkData?.shipments || []).filter(
    (s) => s.status === "in_transit" || s.status === "delayed"
  );
  void _activeShipments;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-stone-100">Network Map</h1>
          <p className="text-sm text-stone-400 mt-1">
            Real-time supply chain topology with live disruption overlay
          </p>
        </div>

        {/* Layer Controls */}
        <div className="flex flex-wrap gap-2">
          {([
            { key: "all", label: "All Layers" },
            { key: "shipments", label: "Active Shipments" },
            { key: "disruptions", label: "Disruptions" },
            { key: "routes", label: "Route Health" },
          ] as const).map((l) => (
            <button
              key={l.key}
              onClick={() => setActiveLayer(l.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                activeLayer === l.key
                  ? "bg-amber-900/20 text-amber-300 border-amber-900/30"
                  : "bg-stone-900 text-stone-400 border-stone-800 hover:text-stone-200"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2 bg-stone-900 border border-stone-800 rounded-xl overflow-hidden">
            <div className="h-[500px] w-full">
              <MapContainer
                center={[39.8283, -98.5795]}
                zoom={4}
                scrollWheelZoom={true}
                style={{ height: "100%", width: "100%", background: "#1c1917" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {/* Warehouses */}
                {(warehouses || []).map((w) =>
                  w.latitude && w.longitude ? (
                    <Marker
                      key={w.id}
                      position={[
                        parseFloat(String(w.latitude)),
                        parseFloat(String(w.longitude)),
                      ]}
                      icon={warehouseIcon}
                    >
                      <Popup>
                        <div className="text-stone-800">
                          <p className="font-semibold">{w.name}</p>
                          <p className="text-xs">{w.code}</p>
                          <p className="text-xs capitalize">{w.type.replace("_", " ")}</p>
                        </div>
                      </Popup>
                    </Marker>
                  ) : null
                )}

                {/* Routes */}
                {(activeLayer === "all" || activeLayer === "routes") &&
                  routeLines.map((r) => (
                    <Polyline
                      key={r.id}
                      positions={[r.from, r.to]}
                      pathOptions={{
                        color:
                          r.riskScore > 5
                            ? "#ef4444"
                            : r.riskScore > 3
                            ? "#f59e0b"
                            : "#10b981",
                        weight: 3,
                        opacity: 0.7,
                        dashArray: r.status === "disrupted" ? "5, 10" : undefined,
                      }}
                    />
                  ))}

                {/* Disruption Circles */}
                {(activeLayer === "all" || activeLayer === "disruptions") &&
                  (disruptions || []).map(
                    (d) =>
                      d.latitude && d.longitude ? (
                        <Circle
                          key={d.id}
                          center={[
                            parseFloat(String(d.latitude)),
                            parseFloat(String(d.longitude)),
                          ]}
                          radius={50000}
                          pathOptions={{
                            color: "#ef4444",
                            fillColor: "#ef4444",
                            fillOpacity: 0.15,
                            weight: 1,
                          }}
                        />
                      ) : null
                  )}

                {/* Disruption Markers */}
                {(activeLayer === "all" || activeLayer === "disruptions") &&
                  (disruptions || []).map(
                    (d) =>
                      d.latitude && d.longitude ? (
                        <Marker
                          key={`marker-${d.id}`}
                          position={[
                            parseFloat(String(d.latitude)),
                            parseFloat(String(d.longitude)),
                          ]}
                          icon={disruptionIcon}
                        >
                          <Popup>
                            <div className="text-stone-800">
                              <p className="font-semibold text-rose-600">{d.title}</p>
                              <p className="text-xs">{d.description}</p>
                              <p className="text-xs mt-1 uppercase font-semibold">
                                {d.severity}
                              </p>
                            </div>
                          </Popup>
                        </Marker>
                      ) : null
                  )}
              </MapContainer>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-4">
            {/* Disruptions List */}
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-stone-200 mb-3 flex items-center gap-2">
                <AlertTriangle size={16} className="text-rose-400" />
                Active Disruptions ({disruptions?.length || 0})
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {(disruptions || []).map((d) => (
                  <div
                    key={d.id}
                    className="p-3 rounded-lg bg-stone-800/30 border border-stone-800"
                  >
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-medium text-stone-200">{d.title}</p>
                      <span
                        className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${
                          d.severity === "critical"
                            ? "bg-rose-900/30 text-rose-400"
                            : d.severity === "high"
                            ? "bg-amber-900/30 text-amber-400"
                            : "bg-stone-800 text-stone-400"
                        }`}
                      >
                        {d.severity}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-1">{d.location}</p>
                    <p className="text-xs text-stone-400 mt-1">{d.predictedImpact}</p>
                    {d.recommendedAction && (
                      <p className="text-xs text-amber-400 mt-1 flex items-center gap-1">
                        <Wind size={10} />
                        {d.recommendedAction}
                      </p>
                    )}
                  </div>
                ))}
                {(!disruptions || disruptions.length === 0) && (
                  <p className="text-xs text-stone-500 text-center py-4">
                    No active disruptions
                  </p>
                )}
              </div>
            </div>

            {/* Route Health */}
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-stone-200 mb-3 flex items-center gap-2">
                <Activity size={16} className="text-amber-400" />
                Route Health Score
              </h3>
              <div className="space-y-2">
                {(routes || []).slice(0, 5).map((r) => {
                  const risk = parseFloat(String(r.riskScore || 0));
                  return (
                    <div
                      key={r.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-stone-800/30"
                    >
                      <div>
                        <p className="text-xs text-stone-300">{r.name}</p>
                        <p className="text-[10px] text-stone-500">
                          {r.congestionLevel} congestion · {r.weatherRisk} weather
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1 rounded-full bg-stone-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              risk > 5 ? "bg-rose-500" : risk > 3 ? "bg-amber-500" : "bg-emerald-500"
                            }`}
                            style={{ width: `${Math.min(risk * 10, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-stone-400 w-6">{risk.toFixed(1)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Link
                to="/routes"
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 mt-3"
              >
                View all routes <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
