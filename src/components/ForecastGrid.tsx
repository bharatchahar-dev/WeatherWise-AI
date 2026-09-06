import React from "react";
import { Calendar, Droplet } from "lucide-react";
import { ForecastDay, LanguageMode } from "../types";
import { WeatherIcon } from "./WeatherIcon";

interface Props {
  forecast: ForecastDay[];
  language: LanguageMode;
}

export const ForecastGrid: React.FC<Props> = ({ forecast, language }) => {
  return (
    <div id="forecast-grid-section" className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-cyan-400" />
          <h3 className="text-sm font-semibold tracking-wide text-[#F1F7FA]">
            {language === "hi" ? "7-दिवसीय स्मार्ट पूर्वानुमान" : "7-Day Predictive Forecast"}
          </h3>
        </div>
        <span className="text-xs text-[#6F8799]">
          {language === "hi" ? "दैनिक सीमा और वर्षा संभावना" : "Daily ranges & precipitation likelihood"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-7">
        {forecast.map((day, idx) => (
          <div
            key={idx}
            id={`forecast-card-${idx}`}
            className="group flex flex-col items-center justify-between rounded-2xl p-3.5 text-center transition-all duration-300 hover:-translate-y-1.5 hover:border-cyan-400/40 hover:bg-[rgba(11,40,65,0.65)] hover:shadow-[0_12px_25px_-5px_rgba(3,15,28,0.7),0_0_15px_rgba(56,189,248,0.18)]"
            style={{
              background: "rgba(8, 25, 42, 0.50)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(100, 220, 255, 0.12)",
              boxShadow: "0 8px 25px -5px rgba(3, 15, 28, 0.45)",
            }}
          >
            <div>
              <span className="block text-xs font-bold text-[#F1F7FA]">{day.day}</span>
              <span className="block text-[10px] text-[#9FB3C8]">{day.date}</span>
            </div>

            <div className="my-2 flex h-10 w-10 items-center justify-center text-cyan-300 transition-transform duration-300 group-hover:scale-110">
              <WeatherIcon name={day.icon} className="h-7 w-7" />
            </div>

            <div>
              <div className="flex items-baseline justify-center gap-1.5 text-xs">
                <span className="font-bold text-[#F1F7FA]">{Math.round(day.max_temp)}°</span>
                <span className="text-[#9FB3C8]">{Math.round(day.min_temp)}°</span>
              </div>

              <div className="mt-1.5 flex items-center justify-center gap-1 text-[11px] font-medium text-sky-400">
                <Droplet className="h-3 w-3" />
                <span>{day.rain_probability}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
