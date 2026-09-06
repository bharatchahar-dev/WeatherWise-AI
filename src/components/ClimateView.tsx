import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { TrendingUp, Layers, Sparkles, AlertCircle } from "lucide-react";
import { ClimateData, LanguageMode } from "../types";

interface Props {
  climate: ClimateData | null;
  language: LanguageMode;
}

export const ClimateView: React.FC<Props> = ({ climate, language }) => {
  if (!climate) return null;

  const chartData = (climate.monthly_temperature_averages?.months || []).map((month, idx) => ({
    month,
    observed: climate.monthly_temperature_averages?.current_year_observed_c?.[idx] ?? 0,
    baseline: climate.monthly_temperature_averages?.historical_baseline_c?.[idx] ?? 0,
  }));

  return (
    <div id="climate-insights-section" className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-[#F1F7FA] sm:text-2xl">
          {language === "hi" ? "जलवायु रुझान और दीर्घकालिक विश्लेषण" : "Climate Insights & Long-term Telemetry"}
        </h2>
        <p className="text-xs text-[#9FB3C8] sm:text-sm">
          {language === "hi"
            ? "10-वर्षीय ऐतिहासिक बेसलाइन तापमान और मौसम विसंगतियों का तुलनात्मक विश्लेषण।"
            : "Comparative analysis of 10-year historical baselines against current observed meteorological shifts."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Baseline Chart Card */}
        <div
          className="glass-surface glass-surface-hover rounded-2xl p-6 transition-all duration-300"
          style={{
            background: "rgba(8, 25, 42, 0.52)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            border: "1px solid rgba(80, 200, 220, 0.14)",
          }}
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-cyan-400" />
            <h3 className="text-sm font-semibold tracking-wide text-[#F1F7FA]">
              {language === "hi" ? "वार्षिक तापमान बेसलाइन तुलना" : "Annual Temperature Baseline Comparison"}
            </h3>
          </div>

          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#6F8799" fontSize={11} tickLine={false} axisLine={{ stroke: "rgba(100,220,255,0.10)" }} />
                <YAxis stroke="#6F8799" fontSize={11} tickLine={false} axisLine={{ stroke: "rgba(100,220,255,0.10)" }} tickFormatter={(v) => `${v}°C`} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-xl border border-[rgba(100,220,255,0.20)] bg-[rgba(6,20,33,0.92)] p-2.5 shadow-2xl backdrop-blur-xl text-xs">
                          <span className="block font-bold text-[#F1F7FA]">{label}</span>
                          <span className="block text-sky-300">
                            Observed: {payload[0]?.value}°C
                          </span>
                          <span className="block text-teal-300">
                            Baseline: {payload[1]?.value}°C
                          </span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "10px", color: "#9FB3C8" }}
                />
                <Line
                  name="Observed (2025-2026)"
                  type="monotone"
                  dataKey="observed"
                  stroke="#38BDF8"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
                <Line
                  name="10-Year Baseline Mean"
                  type="monotone"
                  dataKey="baseline"
                  stroke="#14B8A6"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <span className="mt-2 block text-[10px] text-[#6F8799]">* Comparative sample dataset for climate analysis.</span>
        </div>

        {/* Resilience Matrix & AI Summary */}
        <div
          className="glass-surface glass-surface-hover flex flex-col justify-between rounded-2xl p-6 transition-all duration-300"
          style={{
            background: "rgba(8, 25, 42, 0.52)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            border: "1px solid rgba(80, 200, 220, 0.14)",
          }}
        >
          <div>
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-teal-400" />
              <h3 className="text-sm font-semibold tracking-wide text-[#F1F7FA]">
                {language === "hi" ? "मौसमी विसंगति और लचीलापन मैट्रिक्स" : "Seasonal Anomaly & Resilience Matrix"}
              </h3>
            </div>

            <div className="mt-4 space-y-2.5">
              <div className="flex items-center justify-between rounded-xl border border-[rgba(100,220,255,0.12)] bg-[rgba(7,24,39,0.55)] p-3 text-xs backdrop-blur-md">
                <span className="text-[#9FB3C8]">Monsoon Precipitation Shift</span>
                <span className="font-bold text-teal-300">
                  {climate.rainfall_anomaly.trend}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-[rgba(100,220,255,0.12)] bg-[rgba(7,24,39,0.55)] p-3 text-xs backdrop-blur-md">
                <span className="text-[#9FB3C8]">Vulnerability Surge Period</span>
                <span className="font-bold text-cyan-300">
                  {climate.rainfall_anomaly.risk_period}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-[rgba(100,220,255,0.12)] bg-[rgba(7,24,39,0.55)] p-3 text-xs backdrop-blur-md">
                <span className="text-[#9FB3C8]">Drought Resilience Rating</span>
                <span className="font-bold text-sky-400">
                  {climate.rainfall_anomaly.drought_resilience_rating}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-cyan-400/25 bg-gradient-to-r from-cyan-950/30 to-teal-950/30 p-4 backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
              <Sparkles className="h-4 w-4" />
              <span>AI Climate Synthesis</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-[#9FB3C8]">
              {climate.climate_ai_summary}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
