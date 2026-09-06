import React, { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { LineChart as LineChartIcon, Thermometer, CloudRain, Droplets, Wind } from "lucide-react";
import { HourlyTrends, LanguageMode } from "../types";

interface Props {
  hourly: HourlyTrends;
  language: LanguageMode;
}

type TabType = "temp" | "rain" | "humidity" | "wind";

export const WeatherTrendsChart: React.FC<Props> = ({ hourly, language }) => {
  const [activeTab, setActiveTab] = useState<TabType>("temp");

  // Transform data array for Recharts
  const chartData = (hourly.times || []).map((time, idx) => ({
    time,
    temp: hourly.temperatures?.[idx] ?? 0,
    rain: hourly.rain_probability?.[idx] ?? 0,
    humidity: hourly.humidity?.[idx] ?? 0,
    wind: hourly.wind_speeds?.[idx] ?? 0,
  }));

  const config = {
    temp: {
      key: "temp",
      label: language === "hi" ? "तापमान (°C)" : "Temperature (°C)",
      unit: "°C",
      color: "#10B981",
      fill: "rgba(16, 185, 129, 0.2)",
    },
    rain: {
      key: "rain",
      label: language === "hi" ? "वर्षा की संभावना (%)" : "Rain Probability (%)",
      unit: "%",
      color: "#38BDF8",
      fill: "rgba(56, 189, 248, 0.2)",
    },
    humidity: {
      key: "humidity",
      label: language === "hi" ? "सापेक्ष आर्द्रता (%)" : "Relative Humidity (%)",
      unit: "%",
      color: "#34D399",
      fill: "rgba(52, 211, 153, 0.2)",
    },
    wind: {
      key: "wind",
      label: language === "hi" ? "हवा की गति (km/h)" : "Wind Speed (km/h)",
      unit: " km/h",
      color: "#F59E0B",
      fill: "rgba(245, 158, 11, 0.2)",
    },
  }[activeTab];

  return (
    <div
      id="weather-trends-panel"
      className="glass-surface glass-surface-hover rounded-2xl p-6 transition-all duration-300"
      style={{
        background: "rgba(8, 25, 42, 0.52)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        border: "1px solid rgba(80, 200, 220, 0.14)",
      }}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <LineChartIcon className="h-5 w-5 text-cyan-400" />
          <h3 className="text-sm font-semibold tracking-wide text-[#F1F7FA]">
            {language === "hi" ? "24-घंटे मौसमी रुझान" : "Hourly Meteorological Trends (24h)"}
          </h3>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 rounded-xl border border-[rgba(100,220,255,0.15)] bg-[rgba(7,24,39,0.55)] p-1 backdrop-blur-md">
          <button
            id="tab-chart-temp"
            onClick={() => setActiveTab("temp")}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
              activeTab === "temp"
                ? "bg-gradient-to-r from-sky-500 to-teal-500 text-white font-semibold shadow-[0_0_12px_rgba(14,165,233,0.3)]"
                : "text-[#9FB3C8] hover:text-[#F1F7FA] hover:bg-cyan-500/10"
            }`}
          >
            <Thermometer className="h-3.5 w-3.5" />
            <span>Temp</span>
          </button>

          <button
            id="tab-chart-rain"
            onClick={() => setActiveTab("rain")}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
              activeTab === "rain"
                ? "bg-gradient-to-r from-sky-500 to-teal-500 text-white font-semibold shadow-[0_0_12px_rgba(14,165,233,0.3)]"
                : "text-[#9FB3C8] hover:text-[#F1F7FA] hover:bg-cyan-500/10"
            }`}
          >
            <CloudRain className="h-3.5 w-3.5" />
            <span>Rain</span>
          </button>

          <button
            id="tab-chart-humidity"
            onClick={() => setActiveTab("humidity")}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
              activeTab === "humidity"
                ? "bg-gradient-to-r from-sky-500 to-teal-500 text-white font-semibold shadow-[0_0_12px_rgba(14,165,233,0.3)]"
                : "text-[#9FB3C8] hover:text-[#F1F7FA] hover:bg-cyan-500/10"
            }`}
          >
            <Droplets className="h-3.5 w-3.5" />
            <span>Humidity</span>
          </button>

          <button
            id="tab-chart-wind"
            onClick={() => setActiveTab("wind")}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
              activeTab === "wind"
                ? "bg-gradient-to-r from-sky-500 to-teal-500 text-white font-semibold shadow-[0_0_12px_rgba(14,165,233,0.3)]"
                : "text-[#9FB3C8] hover:text-[#F1F7FA] hover:bg-cyan-500/10"
            }`}
          >
            <Wind className="h-3.5 w-3.5" />
            <span>Wind</span>
          </button>
        </div>
      </div>

      <div className="h-60 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={config.color} stopOpacity={0.35} />
                <stop offset="95%" stopColor={config.color} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              stroke="#6F8799"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "rgba(100,220,255,0.10)" }}
            />
            <YAxis
              stroke="#6F8799"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "rgba(100,220,255,0.10)" }}
              tickFormatter={(v) => `${v}${config.unit}`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-xl border border-[rgba(100,220,255,0.20)] bg-[rgba(6,20,33,0.92)] p-2.5 shadow-2xl backdrop-blur-xl">
                      <span className="block text-[11px] text-[#9FB3C8]">{label}</span>
                      <span className="text-sm font-bold text-[#F1F7FA]">
                        {payload[0].value}
                        {config.unit}
                      </span>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey={config.key}
              stroke={config.color}
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#trendGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
