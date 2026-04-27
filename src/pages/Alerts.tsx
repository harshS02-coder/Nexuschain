import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { trpc } from "@/providers/trpc";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Filter,
  Wind,
  ShieldAlert,
  Info,
  MapPin,
  Clock,
} from "lucide-react";

const severityConfig = {
  critical: { icon: ShieldAlert, color: "text-rose-400", bg: "bg-rose-900/10 border-rose-900/20" },
  warning: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-900/10 border-amber-900/20" },
  info: { icon: Info, color: "text-sky-400", bg: "bg-sky-900/10 border-sky-900/20" },
};

export default function Alerts() {
  const { data: alerts } = trpc.disruption.alerts.useQuery();
  const { data: disruptions } = trpc.disruption.active.useQuery();
  const utils = trpc.useUtils();

  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [readFilter, setReadFilter] = useState<string>("all");

  const markRead = trpc.disruption.markAlertRead.useMutation({
    onSuccess: () => {
      utils.disruption.alerts.invalidate();
      utils.disruption.unreadAlerts.invalidate();
      utils.analytics.kpis.invalidate();
    },
  });

  const filtered = (alerts || []).filter((a) => {
    const matchSeverity = severityFilter === "all" || a.severity === severityFilter;
    const matchCategory = categoryFilter === "all" || a.category === categoryFilter;
    const matchRead = readFilter === "all" || (readFilter === "unread" ? !a.isRead : a.isRead);
    return matchSeverity && matchCategory && matchRead;
  });

  const unreadCount = (alerts || []).filter((a) => !a.isRead).length;
  const criticalCount = (alerts || []).filter((a) => a.severity === "critical" && !a.isRead).length;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-stone-100">Alerts & Disruptions</h1>
            <p className="text-sm text-stone-400 mt-1">
              {unreadCount} unread alerts · {criticalCount} critical
            </p>
          </div>
          <div className="flex gap-2">
            <div className="px-3 py-1.5 rounded-lg bg-rose-900/20 text-rose-400 text-xs font-medium border border-rose-900/20">
              {criticalCount} Critical
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-amber-900/20 text-amber-400 text-xs font-medium border border-amber-900/20">
              {(disruptions || []).length} Active Disruptions
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-stone-500" />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 focus:outline-none"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="shipment">Shipment</option>
            <option value="route">Route</option>
            <option value="inventory">Inventory</option>
            <option value="supplier">Supplier</option>
            <option value="system">System</option>
          </select>
          <select
            value={readFilter}
            onChange={(e) => setReadFilter(e.target.value)}
            className="bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </div>

        {/* Alerts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Alerts */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-stone-200 mb-4 flex items-center gap-2">
              <Bell size={16} className="text-amber-400" />
              System Alerts ({filtered.length})
            </h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {filtered.map((alert) => {
                const config = severityConfig[alert.severity as keyof typeof severityConfig] || severityConfig.info;
                const Icon = config.icon;
                return (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border ${config.bg} ${
                      alert.isRead ? "opacity-70" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon size={16} className={`${config.color} mt-0.5`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-stone-200">
                            {alert.title}
                          </p>
                          <span className="text-[10px] text-stone-500">
                            {new Date(alert.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-stone-400 mt-1">{alert.message}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px] text-stone-500 uppercase">
                            {alert.category}
                          </span>
                          {!alert.isRead && (
                            <button
                              onClick={() => markRead.mutate({ id: alert.id })}
                              disabled={markRead.isPending}
                              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 disabled:opacity-50"
                            >
                              <CheckCircle2 size={12} />
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <p className="text-sm text-stone-500 text-center py-8">No alerts match filters</p>
              )}
            </div>
          </div>

          {/* Disruptions */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-stone-200 mb-4 flex items-center gap-2">
              <ShieldAlert size={16} className="text-rose-400" />
              Active Disruptions ({disruptions?.length || 0})
            </h3>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {(disruptions || []).map((d) => (
                <div
                  key={d.id}
                  className="p-4 rounded-lg bg-stone-950/50 border border-stone-800"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          d.severity === "critical"
                            ? "bg-rose-500"
                            : d.severity === "high"
                            ? "bg-amber-500"
                            : "bg-stone-500"
                        }`}
                      />
                      <p className="text-sm font-medium text-stone-200">{d.title}</p>
                    </div>
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
                  <p className="text-xs text-stone-500 mt-2">{d.description}</p>
                  <div className="flex items-center gap-3 mt-3">
                    {d.location && (
                      <span className="text-xs text-stone-400 flex items-center gap-1">
                        <MapPin size={10} />
                        {d.location}
                      </span>
                    )}
                    <span className="text-xs text-stone-400 flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(d.detectedAt).toLocaleDateString()}
                    </span>
                  </div>
                  {d.predictedImpact && (
                    <div className="mt-2 p-2 rounded bg-stone-900 border border-stone-800">
                      <p className="text-xs text-stone-400">
                        <span className="text-stone-500">Impact:</span> {d.predictedImpact}
                      </p>
                    </div>
                  )}
                  {d.recommendedAction && (
                    <div className="mt-2 flex items-start gap-1.5">
                      <Wind size={12} className="text-amber-400 mt-0.5" />
                      <p className="text-xs text-amber-400">{d.recommendedAction}</p>
                    </div>
                  )}
                </div>
              ))}
              {(!disruptions || disruptions.length === 0) && (
                <p className="text-sm text-stone-500 text-center py-8">No active disruptions</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
