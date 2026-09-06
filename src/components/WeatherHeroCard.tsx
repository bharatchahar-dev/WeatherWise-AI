import React from "react";
import { MapPin, Clock, Droplets, Wind, Gauge, SunMedium, Sunrise } from "lucide-react";
import { WeatherCurrent, LanguageMode } from "../types";
import { WeatherIcon } from "./WeatherIcon";

interface Props {
  current: WeatherCurrent;
  language: LanguageMode;
}

export const WeatherHeroCard: React.FC<Props> = ({ current, language }) => {
  return (
    <div
      id="weather-hero-card"
      className="glass-surface glass-surface-hover relative overflow-hidden rounded-2xl p-6 transition-all duration-300"
      style={{
        background: "rgba(8, 25, 42, 0.52)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        border: "1px solid rgba(80, 200, 220, 0.14)",
      }}
    >
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

      {/* Top Meta Line */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-400/30 bg-cyan-500/15 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
            <MapPin className="h-4 w-4" />
          </div>
          <div>
            <h2 id="current-city-name" className="font-display text-xl sm:text-2xl font-semibold tracking-wide text-[#F1F7FA] drop-shadow-sm">
              {current.location}
            </h2>
            <span className="font-tech text-xs tracking-wider text-[#A9BBCB]">
              {current.latitude.toFixed(2)}°N, {current.longitude.toFixed(2)}°E
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full border border-[rgba(100,220,255,0.15)] bg-[rgba(7,24,39,0.50)] px-3 py-1 text-xs text-[#A9BBCB] backdrop-blur-md">
            <Clock className="h-3.5 w-3.5 text-cyan-400" />
            <span className="font-ui">Updated <span className="font-tech font-medium text-[#F1F7FA]">{current.last_updated}</span></span>
          </div>
          {current.is_demo && (
            <span id="demo-mode-badge" className="font-tech rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-semibold tracking-wider text-amber-300">
              DEMO TELEMETRY
            </span>
          )}
        </div>
      </div>

      {/* Centerpiece Temp & Condition */}
      <div className="my-6 flex flex-wrap items-center gap-8 sm:gap-12">
        <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-cyan-400/35 bg-gradient-to-tr from-cyan-500/15 to-transparent p-4 text-cyan-300 shadow-[0_0_25px_rgba(34,211,238,0.18)]">
          <WeatherIcon name={current.icon} className="h-14 w-14 transition-transform duration-500 hover:scale-110" />
        </div>

        <div>
          <div className="flex items-baseline gap-1">
            <span id="hero-temp-val" className="font-tech text-6xl sm:text-7xl font-semibold tracking-tight text-[#F1F7FA] text-shadow-clean">
              {Math.round(current.temperature)}
            </span>
            <span className="font-tech text-3xl font-light text-cyan-300 tracking-wider">°C</span>
          </div>
          <div className="mt-1">
            <span className="font-display block text-lg sm:text-xl font-medium tracking-wide text-[#F1F7FA]">{current.condition}</span>
            <span className="font-ui text-sm text-[#A9BBCB]">
              {language === "hi" ? "महसूस हो रहा है" : "Feels like"}{" "}
              <span className="font-tech font-semibold text-cyan-300">{current.feels_like}°C</span>
            </span>
          </div>
        </div>
      </div>

      {/* Stats Ribbon */}
      <div className="grid grid-cols-2 gap-3 border-t border-[rgba(100,220,255,0.12)] pt-5 sm:grid-cols-5">
        <div id="stat-humidity" className="flex items-center gap-3 rounded-xl border border-sky-400/20 bg-sky-950/20 p-2.5 backdrop-blur-md">
          <Droplets className="h-5 w-5 text-sky-400" />
          <div>
            <span className="tech-label block">
              {language === "hi" ? "आर्द्रता" : "Humidity"}
            </span>
            <span className="tech-value text-base sm:text-lg">{current.humidity}%</span>
          </div>
        </div>

        <div id="stat-wind" className="flex items-center gap-3 rounded-xl border border-teal-400/20 bg-teal-950/20 p-2.5 backdrop-blur-md">
          <Wind className="h-5 w-5 text-teal-400" />
          <div>
            <span className="tech-label block">
              {language === "hi" ? "हवा" : "Wind"}
            </span>
            <span className="tech-value text-base sm:text-lg">{current.wind_speed} <span className="text-xs font-normal text-[#A9BBCB]">km/h</span></span>
          </div>
        </div>

        <div id="stat-pressure" className="flex items-center gap-3 rounded-xl border border-cyan-400/20 bg-[rgba(7,24,39,0.45)] p-2.5 backdrop-blur-md">
          <Gauge className="h-5 w-5 text-cyan-300" />
          <div>
            <span className="tech-label block">
              {language === "hi" ? "दबाव" : "Pressure"}
            </span>
            <span className="tech-value text-base sm:text-lg">{current.pressure} <span className="text-xs font-normal text-[#A9BBCB]">hPa</span></span>
          </div>
        </div>

        <div id="stat-uv" className="flex items-center gap-3 rounded-xl border border-amber-400/20 bg-amber-950/15 p-2.5 backdrop-blur-md">
          <SunMedium className="h-5 w-5 text-amber-400" />
          <div>
            <span className="tech-label block">
              {language === "hi" ? "यूवी इंडेक्स" : "UV Index"}
            </span>
            <span className="tech-value text-base sm:text-lg">{current.uv_index}</span>
          </div>
        </div>

        <div id="stat-sun-cycle" className="col-span-2 flex items-center gap-3 rounded-xl border border-orange-400/20 bg-orange-950/15 p-2.5 backdrop-blur-md sm:col-span-1">
          <Sunrise className="h-5 w-5 text-orange-400" />
          <div>
            <span className="tech-label block">
              {language === "hi" ? "सूर्य चक्र" : "Sunrise / Set"}
            </span>
            <span className="tech-value text-xs sm:text-sm">
              {current.sunrise} <span className="text-[#71869A]">•</span> {current.sunset}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
