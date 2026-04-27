import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { trpc } from "@/providers/trpc";
import {
  Search,
  Filter,
  Truck,
  Package,
  MapPin,
  Calendar,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Activity,
} from "lucide-react";

const statusStyles: Record<string, string> = {
  pending: "bg-stone-800 text-stone-400",
  in_transit: "bg-sky-900/20 text-sky-400 border-sky-900/30",
  at_hub: "bg-amber-900/20 text-amber-400 border-amber-900/30",
  out_for_delivery: "bg-violet-900/20 text-violet-400 border-violet-900/30",
  delivered: "bg-emerald-900/20 text-emerald-400 border-emerald-900/30",
  delayed: "bg-rose-900/20 text-rose-400 border-rose-900/30",
  cancelled: "bg-stone-800 text-stone-500",
};

const priorityStyles: Record<string, string> = {
  low: "text-stone-500",
  normal: "text-stone-300",
  high: "text-amber-400",
  critical: "text-rose-400 font-semibold",
};

export default function Shipments() {
  const { data: shipments } = trpc.shipment.list.useQuery();
  const { data: warehouses } = trpc.shipment.warehouses.useQuery();
  const { data: carriers } = trpc.shipment.carriers.useQuery();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const warehouseMap = Object.fromEntries((warehouses || []).map((w) => [w.id, w]));
  const carrierMap = Object.fromEntries((carriers || []).map((c) => [c.id, c]));

  const filtered = (shipments || []).filter((s) => {
    const matchesSearch =
      s.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
      (warehouseMap[s.originWarehouseId]?.name || "")
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    "all",
    "pending",
    "in_transit",
    "at_hub",
    "out_for_delivery",
    "delivered",
    "delayed",
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-stone-100">Shipment Tracking</h1>
          <p className="text-sm text-stone-400 mt-1">
            Monitor {shipments?.length || 0} active shipments across your network
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500"
            />
            <input
              type="text"
              placeholder="Search tracking number or origin..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-stone-900 border border-stone-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-amber-900/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-stone-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-stone-900 border border-stone-800 rounded-lg px-3 py-2.5 text-sm text-stone-200 focus:outline-none focus:border-amber-900/50"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s === "all" ? "All Statuses" : s.replace("_", " ").toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-800 text-left text-stone-400">
                  <th className="px-4 py-3 font-medium">Tracking</th>
                  <th className="px-4 py-3 font-medium">Origin → Destination</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Priority</th>
                  <th className="px-4 py-3 font-medium">Risk</th>
                  <th className="px-4 py-3 font-medium">ETA</th>
                  <th className="px-4 py-3 font-medium">Carrier</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const origin = warehouseMap[s.originWarehouseId];
                  const dest = warehouseMap[s.destinationWarehouseId];
                  const carrier = carrierMap[s.carrierId || 0];
                  const isExpanded = expandedId === s.id;
                  const risk = parseFloat(String(s.disruptionRisk || 0));

                  return (
                    <>
                      <tr
                        key={s.id}
                        className={`border-b border-stone-800/50 hover:bg-stone-800/30 transition-colors cursor-pointer ${
                          isExpanded ? "bg-stone-800/20" : ""
                        }`}
                        onClick={() => setExpandedId(isExpanded ? null : s.id)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Package size={14} className="text-stone-500" />
                            <span className="font-mono text-stone-200">
                              {s.trackingNumber}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 text-stone-300">
                            <MapPin size={14} className="text-stone-500" />
                            <span className="text-xs">
                              {origin?.code} → {dest?.code}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                              statusStyles[s.status] || "bg-stone-800 text-stone-400"
                            }`}
                          >
                            <Truck size={12} />
                            {s.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs uppercase font-semibold ${
                              priorityStyles[s.priority || "normal"]
                            }`}
                          >
                            {s.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-stone-800 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  risk > 6
                                    ? "bg-rose-500"
                                    : risk > 3
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
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
                          <div className="flex items-center gap-1.5 text-stone-400">
                            <Calendar size={12} />
                            <span className="text-xs">
                              {s.eta
                                ? new Date(s.eta).toLocaleDateString()
                                : "—"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-stone-400">
                          {carrier?.code || "—"}
                        </td>
                        <td className="px-4 py-3">
                          {isExpanded ? (
                            <ChevronUp size={16} className="text-stone-500" />
                          ) : (
                            <ChevronDown size={16} className="text-stone-500" />
                          )}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={8} className="px-4 py-4 bg-stone-950/50">
                            <ShipmentDetails shipmentId={s.id} />
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-stone-500">
              <Package size={32} className="mx-auto mb-3 opacity-50" />
              <p>No shipments match your filters</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function ShipmentDetails({ shipmentId }: { shipmentId: number }) {
  const { data: events } = trpc.shipment.events.useQuery({ shipmentId });
  const { data: telemetry } = trpc.shipment.byId.useQuery({ id: shipmentId });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <h4 className="text-xs font-semibold text-stone-400 uppercase mb-3 flex items-center gap-2">
          <Activity size={14} />
          Event Timeline
        </h4>
        <div className="space-y-2">
          {(events || []).map((e) => (
            <div
              key={e.id}
              className="flex items-start gap-3 p-2.5 rounded-lg bg-stone-900 border border-stone-800"
            >
              <div
                className={`w-2 h-2 rounded-full mt-1.5 ${
                  e.eventType === "delayed"
                    ? "bg-rose-500"
                    : e.eventType === "delivered"
                    ? "bg-emerald-500"
                    : "bg-amber-500"
                }`}
              />
              <div className="flex-1">
                <p className="text-sm text-stone-200 capitalize">
                  {e.eventType.replace("_", " ")}
                </p>
                <p className="text-xs text-stone-500">{e.location}</p>
              </div>
              <span className="text-xs text-stone-500">
                {new Date(e.timestamp).toLocaleString()}
              </span>
            </div>
          ))}
          {(!events || events.length === 0) && (
            <p className="text-xs text-stone-500">No events recorded</p>
          )}
        </div>
      </div>
      <div>
        <h4 className="text-xs font-semibold text-stone-400 uppercase mb-3 flex items-center gap-2">
          <AlertTriangle size={14} />
          Risk Assessment
        </h4>
        <div className="p-4 rounded-lg bg-stone-900 border border-stone-800 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-stone-400">Disruption Risk</span>
            <span className="text-stone-200 font-medium">
              {parseFloat(String(telemetry?.disruptionRisk || 0)).toFixed(1)}/10
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-stone-400">Weight</span>
            <span className="text-stone-200">{telemetry?.weight || "—"} kg</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-stone-400">Value</span>
            <span className="text-stone-200">${telemetry?.value || "—"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-stone-400">Volume</span>
            <span className="text-stone-200">{telemetry?.volume || "—"} m³</span>
          </div>
        </div>
      </div>
    </div>
  );
}
