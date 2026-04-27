import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { trpc } from "@/providers/trpc";
import {
  Truck,
  AlertTriangle,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  Route,
  Wind,
  ArrowRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import { Link } from "react-router";

const STATUS_COLORS: Record<string, string> = {
  pending: "#a8a29e",
  in_transit: "#0ea5e9",
  at_hub: "#f59e0b",
  out_for_delivery: "#8b5cf6",
  delivered: "#10b981",
  delayed: "#ef4444",
  cancelled: "#6b7280",
};

function KPICard({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
  subtitle?: string;
}) {
  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 hover:border-stone-700 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-stone-400">{title}</p>
          <p className="text-2xl font-semibold text-stone-100 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-stone-500 mt-1">{subtitle}</p>}
        </div>
        <div className="p-2 rounded-lg bg-stone-800/50">
          <Icon size={20} className="text-amber-400" />
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-1 mt-3">
          {trendUp ? (
            <TrendingUp size={14} className="text-emerald-400" />
          ) : (
            <TrendingDown size={14} className="text-rose-400" />
          )}
          <span
            className={`text-xs font-medium ${
              trendUp ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {trend}
          </span>
          <span className="text-xs text-stone-500">vs last week</span>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { data: kpis } = trpc.analytics.kpis.useQuery();
  const { data: statusDist } = trpc.analytics.statusDistribution.useQuery();
  const { data: disruptions } = trpc.disruption.active.useQuery();
  const { data: unreadAlerts } = trpc.disruption.unreadAlerts.useQuery();
  const { data: recommendations } = trpc.route.recommendations.useQuery({});
  const { data: batchPredictions } = trpc.prediction.batchPredict.useQuery();

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const pieData =
    statusDist?.map((s) => ({
      name: s.status.replace("_", " ").toUpperCase(),
      value: s.count,
      color: STATUS_COLORS[s.status] || "#a8a29e",
    })) || [];

  const disruptionChartData =
    disruptions?.slice(0, 5).map((d) => ({
      name: d.title.slice(0, 20) + "...",
      severity: d.severity === "critical" ? 4 : d.severity === "high" ? 3 : d.severity === "medium" ? 2 : 1,
    })) || [];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-stone-100">Operations Dashboard</h1>
            <p className="text-sm text-stone-400 mt-1">
              Real-time visibility across your supply network
            </p>
          </div>
          <div className="text-xs text-stone-500 bg-stone-900 border border-stone-800 px-3 py-1.5 rounded-lg">
            Last updated: {now.toLocaleTimeString()}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Shipments"
            value={kpis?.totalShipments ?? "—"}
            icon={Truck}
            trend="+12%"
            trendUp={true}
            subtitle={`${kpis?.inTransit ?? 0} currently in transit`}
          />
          <KPICard
            title="Active Disruptions"
            value={kpis?.activeDisruptions ?? "—"}
            icon={AlertTriangle}
            trend="-8%"
            trendUp={true}
            subtitle={`${kpis?.criticalAlerts ?? 0} critical alerts`}
          />
          <KPICard
            title="On-Time Delivery"
            value={`${kpis?.onTimeRate ?? 0}%`}
            icon={Clock}
            trend="+3.2%"
            trendUp={true}
            subtitle={`${kpis?.delayed ?? 0} delayed shipments`}
          />
          <KPICard
            title="Network Risk"
            value={`${(kpis?.avgRisk ?? 0).toFixed(1)}/10`}
            icon={Activity}
            trend="-0.4"
            trendUp={true}
            subtitle="Average disruption risk"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Status Distribution */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-stone-200 mb-4">
              Shipment Status Distribution
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1c1917",
                      border: "1px solid #292524",
                      borderRadius: "8px",
                      color: "#e7e5e4",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 mt-2">
              {pieData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: d.color }}
                  />
                  <span className="text-xs text-stone-400">
                    {d.name} ({d.value})
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Disruption Severity */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-stone-200 mb-4">
              Active Disruption Severity
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={disruptionChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#292524" />
                  <XAxis type="number" domain={[0, 5]} hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={120}
                    tick={{ fill: "#a8a29e", fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1c1917",
                      border: "1px solid #292524",
                      borderRadius: "8px",
                      color: "#e7e5e4",
                    }}
                  />
                  <Bar dataKey="severity" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-xs text-stone-400">Severity scale 1-4</span>
              </div>
            </div>
          </div>

          {/* Predictions */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-stone-200 mb-4">
              Top Delay Predictions
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {(batchPredictions || []).slice(0, 6).map((p) => (
                <div
                  key={p.shipmentId}
                  className="flex items-center justify-between p-3 rounded-lg bg-stone-800/50 border border-stone-800"
                >
                  <div>
                    <p className="text-sm font-medium text-stone-200">
                      {p.trackingNumber}
                    </p>
                    <p className="text-xs text-stone-500">
                      Predicted delay: {p.predictedDelayHours}h
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        p.riskLevel === "critical"
                          ? "bg-rose-900/30 text-rose-400"
                          : p.riskLevel === "high"
                          ? "bg-amber-900/30 text-amber-400"
                          : "bg-emerald-900/30 text-emerald-400"
                      }`}
                    >
                      {p.riskLevel.toUpperCase()}
                    </span>
                    <p className="text-xs text-stone-500 mt-1">
                      {(p.confidence * 100).toFixed(0)}% confidence
                    </p>
                  </div>
                </div>
              ))}
              {(!batchPredictions || batchPredictions.length === 0) && (
                <p className="text-sm text-stone-500 text-center py-8">
                  Run batch prediction to see results
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Alerts */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-stone-200">Recent Alerts</h3>
              <Link
                to="/alerts"
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                View all <ArrowRight size={12} />
              </Link>
            </div>
            <div className="space-y-2">
              {(unreadAlerts || []).slice(0, 5).map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    alert.severity === "critical"
                      ? "bg-rose-900/10 border-rose-900/20"
                      : alert.severity === "warning"
                      ? "bg-amber-900/10 border-amber-900/20"
                      : "bg-stone-800/30 border-stone-800"
                  }`}
                >
                  <AlertTriangle
                    size={16}
                    className={
                      alert.severity === "critical"
                        ? "text-rose-400 mt-0.5"
                        : alert.severity === "warning"
                        ? "text-amber-400 mt-0.5"
                        : "text-stone-400 mt-0.5"
                    }
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-stone-200">{alert.title}</p>
                    <p className="text-xs text-stone-500 mt-0.5">{alert.message}</p>
                  </div>
                  <span
                    className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${
                      alert.severity === "critical"
                        ? "bg-rose-900/30 text-rose-400"
                        : alert.severity === "warning"
                        ? "bg-amber-900/30 text-amber-400"
                        : "bg-stone-800 text-stone-400"
                    }`}
                  >
                    {alert.severity}
                  </span>
                </div>
              ))}
              {(!unreadAlerts || unreadAlerts.length === 0) && (
                <p className="text-sm text-stone-500 text-center py-6">No unread alerts</p>
              )}
            </div>
          </div>

          {/* Route Recommendations */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-stone-200">
                Route Recommendations
              </h3>
              <Link
                to="/routes"
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                View all <ArrowRight size={12} />
              </Link>
            </div>
            <div className="space-y-2">
              {(recommendations || []).slice(0, 4).map((rec) => (
                <div
                  key={rec.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-stone-800/30 border border-stone-800"
                >
                  <div className="p-1.5 rounded-md bg-stone-800">
                    <Route size={14} className="text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-stone-200">
                      Shipment #{rec.shipmentId} → Route #{rec.recommendedRouteId}
                    </p>
                    <p className="text-xs text-stone-500 mt-0.5">{rec.reason}</p>
                    <div className="flex gap-3 mt-2">
                      {rec.estimatedTimeSavings && (
                        <span className="text-xs text-emerald-400 flex items-center gap-1">
                          <Wind size={10} />
                          Save {rec.estimatedTimeSavings}h
                        </span>
                      )}
                      {rec.riskReduction && (
                        <span className="text-xs text-amber-400">
                          Risk -{rec.riskReduction} pts
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${
                      rec.isAccepted
                        ? "bg-emerald-900/30 text-emerald-400"
                        : "bg-stone-800 text-stone-400"
                    }`}
                  >
                    {rec.isAccepted ? "Accepted" : "Pending"}
                  </span>
                </div>
              ))}
              {(!recommendations || recommendations.length === 0) && (
                <p className="text-sm text-stone-500 text-center py-6">
                  No active recommendations
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
