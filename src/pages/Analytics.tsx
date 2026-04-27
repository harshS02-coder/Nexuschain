import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { trpc } from "@/providers/trpc";
import {
  Brain,
  TrendingUp,
  Activity,
  AlertTriangle,
  Route,
  Wind,
  BarChart3,
  Zap,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts";

function ModelCard({
  name,
  version,
  accuracy,
  predictions,
  status,
  icon: Icon,
}: {
  name: string;
  version: string;
  accuracy: string;
  predictions: number;
  status: "active" | "training" | "idle";
  icon: React.ElementType;
}) {
  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-stone-800">
            <Icon size={18} className="text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-200">{name}</p>
            <p className="text-xs text-stone-500">{version}</p>
          </div>
        </div>
        <span
          className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${
            status === "active"
              ? "bg-emerald-900/20 text-emerald-400"
              : status === "training"
              ? "bg-amber-900/20 text-amber-400"
              : "bg-stone-800 text-stone-400"
          }`}
        >
          {status}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <p className="text-xs text-stone-500">Accuracy</p>
          <p className="text-lg font-semibold text-stone-100">{accuracy}</p>
        </div>
        <div>
          <p className="text-xs text-stone-500">Predictions</p>
          <p className="text-lg font-semibold text-stone-100">{predictions.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

export default function Analytics() {
  const { data: statusDist } = trpc.analytics.statusDistribution.useQuery();
  const { data: disruptionTrends } = trpc.analytics.disruptionTrends.useQuery();
  const { data: routePerformance } = trpc.analytics.routePerformance.useQuery();
  const { data: predictions } = trpc.prediction.list.useQuery({ limit: 50 });
  const { data: disruptionForecast } = trpc.prediction.predictDisruption.useQuery();

  const [activeTab, setActiveTab] = useState<"overview" | "predictions" | "models">("overview");

  const trendChartData =
    (disruptionTrends || []).map((t) => ({
      week: String(t.week).slice(-2),
      disruptions: t.count,
    })).reverse();

  const statusChartData =
    (statusDist || []).map((s) => ({
      name: s.status.replace("_", " ").toUpperCase(),
      count: s.count,
    }));

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-stone-100">Predictive Analytics</h1>
            <p className="text-sm text-stone-400 mt-1">
              ML-driven forecasting, disruption modeling, and network intelligence
            </p>
          </div>
          <div className="flex gap-2">
            {(["overview", "predictions", "models"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  activeTab === t
                    ? "bg-amber-900/20 text-amber-300 border-amber-900/30"
                    : "bg-stone-900 text-stone-400 border-stone-800 hover:text-stone-200"
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "overview" && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Brain size={16} className="text-amber-400" />
                  <span className="text-xs text-stone-400">Prediction Accuracy</span>
                </div>
                <p className="text-2xl font-semibold text-stone-100">87.4%</p>
                <p className="text-xs text-emerald-400 mt-1">+2.1% vs last month</p>
              </div>
              <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={16} className="text-rose-400" />
                  <span className="text-xs text-stone-400">Disruptions Prevented</span>
                </div>
                <p className="text-2xl font-semibold text-stone-100">142</p>
                <p className="text-xs text-stone-500 mt-1">This quarter</p>
              </div>
              <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={16} className="text-emerald-400" />
                  <span className="text-xs text-stone-400">Cost Savings</span>
                </div>
                <p className="text-2xl font-semibold text-stone-100">$2.4M</p>
                <p className="text-xs text-emerald-400 mt-1">+18% vs last quarter</p>
              </div>
              <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={16} className="text-sky-400" />
                  <span className="text-xs text-stone-400">Avg Detection Lead Time</span>
                </div>
                <p className="text-2xl font-semibold text-stone-100">28.5h</p>
                <p className="text-xs text-emerald-400 mt-1">+4.2h improvement</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-stone-200 mb-4">
                  Disruption Trend (Weekly)
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendChartData}>
                      <defs>
                        <linearGradient id="colorDisruptions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#292524" />
                      <XAxis dataKey="week" tick={{ fill: "#a8a29e", fontSize: 11 }} />
                      <YAxis tick={{ fill: "#a8a29e", fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1c1917",
                          border: "1px solid #292524",
                          borderRadius: "8px",
                          color: "#e7e5e4",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="disruptions"
                        stroke="#f59e0b"
                        fillOpacity={1}
                        fill="url(#colorDisruptions)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-stone-200 mb-4">
                  Shipment Status Breakdown
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#292524" />
                      <XAxis dataKey="name" tick={{ fill: "#a8a29e", fontSize: 10 }} />
                      <YAxis tick={{ fill: "#a8a29e", fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1c1917",
                          border: "1px solid #292524",
                          borderRadius: "8px",
                          color: "#e7e5e4",
                        }}
                      />
                      <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Route Performance */}
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-stone-200 mb-4">
                Corridor Performance Matrix
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-800 text-left text-stone-400">
                      <th className="px-4 py-3 font-medium">Route</th>
                      <th className="px-4 py-3 font-medium">Distance</th>
                      <th className="px-4 py-3 font-medium">Est. Time</th>
                      <th className="px-4 py-3 font-medium">Avg Transit</th>
                      <th className="px-4 py-3 font-medium">Cost/km</th>
                      <th className="px-4 py-3 font-medium">Risk</th>
                      <th className="px-4 py-3 font-medium">Congestion</th>
                      <th className="px-4 py-3 font-medium">Weather</th>
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
                          <td className="px-4 py-3 text-stone-400">{r.distanceKm} km</td>
                          <td className="px-4 py-3 text-stone-400">
                            {r.estimatedDurationHours}h
                          </td>
                          <td className="px-4 py-3 text-stone-400">
                            {r.averageTransitTime}h
                          </td>
                          <td className="px-4 py-3 text-stone-400">${r.costPerKm}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-1 rounded-full bg-stone-800 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    risk > 5
                                      ? "bg-rose-500"
                                      : risk > 3
                                      ? "bg-amber-500"
                                      : "bg-emerald-500"
                                  }`}
                                  style={{ width: `${Math.min(risk * 10, 100)}%` }}
                                />
                              </div>
                              <span className="text-xs text-stone-400">{risk.toFixed(1)}</span>
                            </div>
                          </td>
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
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === "predictions" && (
          <div className="space-y-6">
            {/* Disruption Forecast */}
            {disruptionForecast && (
              <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-stone-200 mb-4 flex items-center gap-2">
                  <Brain size={16} className="text-amber-400" />
                  Network-Wide Disruption Forecast
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-stone-800/30 border border-stone-800">
                    <p className="text-xs text-stone-500">Overall Risk Score</p>
                    <p className="text-2xl font-semibold text-stone-100 mt-1">
                      {disruptionForecast.overallRiskScore}/100
                    </p>
                    <div className="w-full h-1.5 rounded-full bg-stone-800 mt-2">
                      <div
                        className={`h-full rounded-full ${
                          disruptionForecast.overallRiskScore > 50
                            ? "bg-rose-500"
                            : disruptionForecast.overallRiskScore > 25
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                        style={{ width: `${disruptionForecast.overallRiskScore}%` }}
                      />
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-stone-800/30 border border-stone-800">
                    <p className="text-xs text-stone-500">Next Disruption Probability</p>
                    <p className="text-2xl font-semibold text-stone-100 mt-1">
                      {(disruptionForecast.nextDisruptionProbability * 100).toFixed(0)}%
                    </p>
                    <p className="text-xs text-stone-400 mt-1">
                      Type: {disruptionForecast.predictedType}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-stone-800/30 border border-stone-800">
                    <p className="text-xs text-stone-500">Time Horizon</p>
                    <p className="text-2xl font-semibold text-stone-100 mt-1">
                      {disruptionForecast.timeHorizon}
                    </p>
                    <p className="text-xs text-amber-400 mt-1">
                      {disruptionForecast.recommendation}
                    </p>
                  </div>
                </div>
                <div className="mt-4 p-3 rounded-lg bg-stone-950/50 border border-stone-800">
                  <p className="text-xs font-semibold text-stone-400 uppercase mb-2">
                    Risk Factor Breakdown
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {disruptionForecast.riskFactors.map((f: { type: string; probability: number; severity: string }) => (
                      <div
                        key={f.type}
                        className="p-2 rounded bg-stone-900 border border-stone-800"
                      >
                        <p className="text-xs text-stone-300 capitalize">{f.type.replace("_", " ")}</p>
                        <p className="text-sm font-medium text-stone-100">
                          {(f.probability * 100).toFixed(0)}%
                        </p>
                        <span className="text-[10px] text-stone-500">{f.severity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Recent Predictions Table */}
            <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-stone-800">
                <h3 className="text-sm font-semibold text-stone-200">
                  Recent ML Predictions
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-800 text-left text-stone-400">
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Shipment/Route</th>
                      <th className="px-4 py-3 font-medium">Confidence</th>
                      <th className="px-4 py-3 font-medium">Predicted Value</th>
                      <th className="px-4 py-3 font-medium">Model</th>
                      <th className="px-4 py-3 font-medium">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(predictions || []).map((p) => (
                      <tr
                        key={p.id}
                        className="border-b border-stone-800/50 hover:bg-stone-800/20"
                      >
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              p.predictionType === "delay"
                                ? "bg-amber-900/20 text-amber-400"
                                : p.predictionType === "disruption"
                                ? "bg-rose-900/20 text-rose-400"
                                : p.predictionType === "route_optimization"
                                ? "bg-sky-900/20 text-sky-400"
                                : "bg-emerald-900/20 text-emerald-400"
                            }`}
                          >
                            {p.predictionType?.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-stone-300">
                          {p.shipmentId ? `Shipment #${p.shipmentId}` : `Route #${p.routeId}`}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-1 rounded-full bg-stone-800 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-emerald-500"
                                style={{
                                  width: `${parseFloat(String(p.confidence || 0)) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs text-stone-400">
                              {(parseFloat(String(p.confidence || 0)) * 100).toFixed(0)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-stone-300">
                          {p.predictedValue}
                        </td>
                        <td className="px-4 py-3 text-stone-400 text-xs">
                          {p.modelVersion}
                        </td>
                        <td className="px-4 py-3 text-stone-500 text-xs">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "models" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <ModelCard
                name="XGBoost Delay Predictor"
                version="v2.1"
                accuracy="91.2%"
                predictions={12845}
                status="active"
                icon={BarChart3}
              />
              <ModelCard
                name="Deep RL Route Optimizer"
                version="v3.0"
                accuracy="84.7%"
                predictions={5620}
                status="active"
                icon={Route}
              />
              <ModelCard
                name="LSTM Demand Forecaster"
                version="v1.8"
                accuracy="79.3%"
                predictions={3420}
                status="training"
                icon={TrendingUp}
              />
              <ModelCard
                name="Random Forest Disruption"
                version="v1.5"
                accuracy="88.1%"
                predictions={8940}
                status="active"
                icon={AlertTriangle}
              />
              <ModelCard
                name="Transformer ETA Estimator"
                version="v0.9-beta"
                accuracy="72.4%"
                predictions={1200}
                status="training"
                icon={Wind}
              />
              <ModelCard
                name="Graph Neural Network"
                version="v1.2"
                accuracy="85.6%"
                predictions={4560}
                status="active"
                icon={Activity}
              />
            </div>

            <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-stone-200 mb-4">
                Model Performance Over Time
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      { month: "Jan", xgboost: 84, drl: 76, lstm: 70, rf: 82 },
                      { month: "Feb", xgboost: 86, drl: 78, lstm: 72, rf: 83 },
                      { month: "Mar", xgboost: 87, drl: 80, lstm: 74, rf: 85 },
                      { month: "Apr", xgboost: 88, drl: 81, lstm: 75, rf: 86 },
                      { month: "May", xgboost: 89, drl: 82, lstm: 76, rf: 87 },
                      { month: "Jun", xgboost: 91, drl: 84, lstm: 79, rf: 88 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#292524" />
                    <XAxis dataKey="month" tick={{ fill: "#a8a29e", fontSize: 11 }} />
                    <YAxis domain={[60, 100]} tick={{ fill: "#a8a29e", fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1c1917",
                        border: "1px solid #292524",
                        borderRadius: "8px",
                        color: "#e7e5e4",
                      }}
                    />
                    <Line type="monotone" dataKey="xgboost" stroke="#f59e0b" strokeWidth={2} />
                    <Line type="monotone" dataKey="drl" stroke="#0ea5e9" strokeWidth={2} />
                    <Line type="monotone" dataKey="lstm" stroke="#8b5cf6" strokeWidth={2} />
                    <Line type="monotone" dataKey="rf" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-4 mt-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-1 rounded-full bg-amber-500" />
                  <span className="text-xs text-stone-400">XGBoost</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-1 rounded-full bg-sky-500" />
                  <span className="text-xs text-stone-400">Deep RL</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-1 rounded-full bg-violet-500" />
                  <span className="text-xs text-stone-400">LSTM</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-1 rounded-full bg-emerald-500" />
                  <span className="text-xs text-stone-400">Random Forest</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
