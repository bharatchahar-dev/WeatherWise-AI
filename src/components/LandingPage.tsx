import React from "react";
import { motion } from "motion/react";
import {
  Sparkles,
  ArrowRight,
  CloudSun,
  Wind,
  Droplets,
  ShieldCheck,
  Compass,
  Activity,
  Globe,
  Radio,
} from "lucide-react";
import { WeatherCurrent, LanguageMode } from "../types";

interface LandingPageProps {
  currentWeather: WeatherCurrent | null;
  language: LanguageMode;
  onEnterDashboard: (tab?: "dashboard" | "chat" | "forecast" | "alerts" | "climate") => void;
  onToggleLanguage?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  currentWeather,
  language,
  onEnterDashboard,
  onToggleLanguage,
}) => {
  const temp = currentWeather ? Math.round(currentWeather.temperature) : 27;
  const locationName = currentWeather ? currentWeather.location.split(",")[0] : "New Delhi";
  const conditionText = currentWeather ? currentWeather.condition : "Clear Sky";

  return (
    <div
      id="weatherwise-landing-root"
      className="relative z-10 flex min-h-screen w-full items-center justify-center p-3 sm:p-6 lg:p-10 select-none overflow-x-hidden"
    >
      {/* Decorative ambient background glows behind the glass container */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-35 blur-[120px]"
        style={{
          background: "radial-gradient(circle, rgba(34, 211, 238, 0.4) 0%, rgba(20, 184, 166, 0.25) 45%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute right-[15%] top-[20%] h-[350px] w-[350px] rounded-full opacity-25 blur-[100px]"
        style={{
          background: "radial-gradient(circle, rgba(56, 189, 248, 0.4) 0%, transparent 70%)",
        }}
      />

      {/* Main Glassmorphism Container */}
      <motion.div
        id="landing-glass-container"
        initial={{ opacity: 0, scale: 0.97, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex w-[95%] sm:w-[90%] max-w-[1220px] min-h-[70vh] lg:min-h-[74vh] flex-col justify-between overflow-hidden rounded-[26px] p-5 sm:p-8 lg:p-10"
        style={{
          background: "rgba(8, 25, 35, 0.32)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          border: "1px solid rgba(255, 255, 255, 0.35)",
          boxShadow:
            "0 35px 90px -15px rgba(2, 10, 22, 0.85), 0 0 50px rgba(34, 211, 238, 0.12), inset 0 1px 2px rgba(255, 255, 255, 0.45)",
        }}
      >
        {/* Subtle decorative edge highlights */}
        <div className="pointer-events-none absolute left-0 top-0 h-32 w-32 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-60" />
        <div className="pointer-events-none absolute right-0 bottom-0 h-32 w-32 bg-gradient-to-tl from-cyan-400/20 via-transparent to-transparent opacity-40" />

        {/* TOP NAVIGATION BAR */}
        <header className="relative z-20 flex items-center justify-between border-b border-white/15 pb-4 sm:pb-5">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/40 bg-gradient-to-br from-cyan-500/25 to-teal-500/20 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
              <CloudSun className="h-5 w-5 text-cyan-300" />
              <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
              </span>
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold tracking-tight text-[#F1F7FA]">
                WeatherWise <span className="text-cyan-300">AI</span>
              </span>
              <span className="block text-[9px] font-semibold uppercase tracking-widest text-[#9FB3C8]">
                Earth Intelligence Platform
              </span>
            </div>
          </div>

          {/* Center Minimal Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 backdrop-blur-md">
            <button
              id="landing-nav-home"
              className="flex items-center gap-1.5 rounded-full bg-cyan-400/20 px-3 py-1 text-xs font-semibold text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.25)] border border-cyan-400/30"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-300"></span>
              <span>Home</span>
            </button>
            <button
              id="landing-nav-weather"
              onClick={() => onEnterDashboard("dashboard")}
              className="rounded-full px-3 py-1 text-xs font-medium text-[#9FB3C8] transition-all hover:bg-white/10 hover:text-[#F1F7FA]"
            >
              Weather
            </button>
            <button
              id="landing-nav-ai"
              onClick={() => onEnterDashboard("chat")}
              className="rounded-full px-3 py-1 text-xs font-medium text-[#9FB3C8] transition-all hover:bg-white/10 hover:text-[#F1F7FA]"
            >
              AI Insights
            </button>
            <button
              id="landing-nav-safety"
              onClick={() => onEnterDashboard("alerts")}
              className="rounded-full px-3 py-1 text-xs font-medium text-[#9FB3C8] transition-all hover:bg-white/10 hover:text-[#F1F7FA]"
            >
              Safety
            </button>
            <button
              id="landing-nav-climate"
              onClick={() => onEnterDashboard("climate")}
              className="rounded-full px-3 py-1 text-xs font-medium text-[#9FB3C8] transition-all hover:bg-white/10 hover:text-[#F1F7FA]"
            >
              Climate
            </button>
          </nav>

          {/* Right Action Button */}
          <div className="flex items-center gap-3">
            {onToggleLanguage && (
              <button
                onClick={onToggleLanguage}
                title="Toggle Language (EN / HI)"
                className="hidden sm:flex items-center gap-1 rounded-full border border-white/20 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-[#9FB3C8] hover:text-[#F1F7FA] hover:border-cyan-400/40 transition-colors"
              >
                <Globe className="h-3 w-3 text-cyan-300" />
                <span>{language === "hi" ? "हिन्दी" : "EN"}</span>
              </button>
            )}

          </div>
        </header>

        {/* CENTER HERO CONTENT */}
        <main className="relative z-10 my-auto py-8 sm:py-10">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-10">
            {/* Left Column: Huge Artistic WeatherWise AI Typography & CTAs */}
            <div className="lg:col-span-8 flex flex-col justify-center">
              {/* Category Pill / Eyebrow */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mb-3 sm:mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/35 bg-cyan-500/10 px-3.5 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.2)] backdrop-blur-md w-fit"
              >
                <Radio className="h-3 w-3 text-cyan-400 animate-pulse" />
                <span>Weather Intelligence Platform</span>
              </motion.div>

              {/* Large Artistic Headline */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="font-['Outfit'] select-none"
              >
                <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[6.5rem] font-black tracking-tight text-[#F1F7FA] leading-[0.88] drop-shadow-[0_12px_40px_rgba(2,10,22,0.85)]">
                  WEATHER
                </h1>

                <div className="mt-1 sm:mt-2 flex flex-wrap items-baseline gap-x-3 sm:gap-x-5 gap-y-1 text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-black tracking-tight leading-[0.95]">
                  <span className="bg-gradient-to-r from-[#38BDF8] via-[#22D3EE] to-[#14B8A6] bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(34,211,238,0.4)]">
                    Wise
                  </span>
                  <span className="inline-flex items-center px-3 sm:px-4 py-0.5 sm:py-1 text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-cyan-200 border border-cyan-400/40 rounded-2xl bg-gradient-to-b from-cyan-400/20 to-teal-500/10 backdrop-blur-md shadow-[0_0_30px_rgba(34,211,238,0.3)]">
                    AI
                  </span>
                </div>
              </motion.div>

              {/* Tagline */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-5 sm:mt-6 max-w-xl"
              >
                <h2 className="text-lg sm:text-2xl font-semibold tracking-wide text-[#F1F7FA] drop-shadow-md">
                  Intelligence for Every Citizen
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-[#9FB3C8] leading-relaxed">
                  Real-time weather intelligence, climate awareness and AI-powered insights — designed to help you understand the world around you.
                </p>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-7 sm:mt-8 flex flex-wrap items-center gap-3 sm:gap-4"
              >
                {/* Primary CTA */}
                <button
                  id="landing-explore-weather-btn"
                  onClick={() => onEnterDashboard("dashboard")}
                  className="btn-glass-primary group flex items-center justify-center gap-2.5 rounded-xl px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-[0_0_30px_rgba(14,165,233,0.45)] transition-all hover:scale-[1.03]"
                >
                  <Compass className="h-4 w-4 text-cyan-200 transition-transform group-hover:rotate-45" />
                  <span>Explore Weather</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 text-white" />
                </button>
                
              </motion.div>

              {/* Micro telemetry indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mt-6 flex flex-wrap items-center gap-3 text-[10px] font-mono text-[#6F8799]"
              >
                <div className="flex items-center gap-1.5 text-teal-300/90">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                  <span>99.8% ATMOSPHERIC PRECISION</span>
                </div>
                <span>•</span>
                <span className="text-[#9FB3C8]">GEMINI 2.5 TELEMETRY</span>
                <span>•</span>
                <span className="text-[#9FB3C8]">CITIZEN SAFETY ACTIVE</span>
              </motion.div>
            </div>

            {/* Right Column: Decorative Weather & Environmental Glass Detail Cards */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="lg:col-span-4 flex flex-col gap-4"
            >
              {/* Card 1: Live Weather Observation Detail */}
              <div
                className="rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:translate-y-[-2px]"
                style={{
                  background: "rgba(7, 24, 39, 0.45)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  border: "1px solid rgba(255, 255, 255, 0.22)",
                  boxShadow: "0 15px 35px -5px rgba(2, 10, 22, 0.5), 0 0 20px rgba(34, 211, 238, 0.08)",
                }}
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping"></span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                      Live Weather
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#9FB3C8]">
                    {locationName.toUpperCase()}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <div className="font-['Outfit'] text-4xl sm:text-5xl font-black text-[#F1F7FA] leading-none">
                      {temp}°<span className="text-2xl font-light text-cyan-300">C</span>
                    </div>
                    <span className="mt-1 block text-xs font-medium text-sky-200">
                      {conditionText}
                    </span>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                    <CloudSun className="h-6 w-6" />
                  </div>
                </div>

                {/* Micro indicators */}
                <div className="mt-4 grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-[11px]">
                  <div className="flex items-center gap-1.5 text-[#9FB3C8]">
                    <Droplets className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Hum: {currentWeather?.humidity ?? 52}%</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#9FB3C8]">
                    <Wind className="h-3.5 w-3.5 text-teal-400" />
                    <span>Wind: {currentWeather?.wind_speed ?? 14} km/h</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Live Environmental & Safety Score Detail */}
              <div
                className="rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:translate-y-[-2px]"
                style={{
                  background: "rgba(7, 24, 39, 0.45)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  border: "1px solid rgba(255, 255, 255, 0.22)",
                  boxShadow: "0 15px 35px -5px rgba(2, 10, 22, 0.5), 0 0 20px rgba(20, 184, 166, 0.08)",
                }}
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-teal-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300">
                      Live Environment
                    </span>
                  </div>
                  <span className="rounded-full border border-teal-400/30 bg-teal-500/15 px-2 py-0.5 text-[9px] font-bold text-teal-300">
                    SAFE
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold text-[#F1F7FA]">
                      88<span className="text-sm font-normal text-[#9FB3C8]"> / 100</span>
                    </div>
                    <span className="text-[11px] text-teal-200">
                      Optimal Citizen Safety Index
                    </span>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-teal-400/30 bg-teal-500/10 text-teal-300">
                    <Activity className="h-5 w-5" />
                  </div>
                </div>

                <p className="mt-3 text-[10px] leading-relaxed text-[#9FB3C8] border-t border-white/10 pt-2">
                  AIR • WIND • HUMIDITY telemetries evaluated across 4 citizen vulnerability profiles.
                </p>
              </div>

              {/* Minimal coordinates chip */}
              <div className="flex items-center justify-between rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] font-mono text-[#6F8799] backdrop-blur-md">
                <span className="flex items-center gap-1.5 text-cyan-300">
                  <Compass className="h-3 w-3" />
                  <span>28.6139° N, 77.2090° E</span>
                </span>
                <span>ELEV 216m</span>
              </div>
            </motion.div>
          </div>
        </main>

        {/* BOTTOM STATUS FOOTER */}
        <footer className="relative z-20 flex flex-wrap items-center justify-between border-t border-white/15 pt-3 sm:pt-4 text-[10px] sm:text-xs text-[#9FB3C8]">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-teal-400"></span>
            <span>Grounded with Open-Meteo & Gemini Multimodal Intelligence</span>
          </div>

          <div className="mt-2 sm:mt-0 flex items-center gap-4">
            <button
              onClick={() => onEnterDashboard("chat")}
              className="text-[#9FB3C8] hover:text-cyan-300 transition-colors flex items-center gap-1"
            >
              <Sparkles className="h-3 w-3 text-cyan-400" />
              <span>AI Assistant</span>
            </button>
            <span>•</span>
            <button
              onClick={() => onEnterDashboard("forecast")}
              className="text-[#9FB3C8] hover:text-cyan-300 transition-colors"
            >
              7-Day Radar
            </button>
            <span>•</span>
            <button
              onClick={() => onEnterDashboard("climate")}
              className="text-[#9FB3C8] hover:text-cyan-300 transition-colors"
            >
              Climate Trends
            </button>
          </div>
        </footer>
      </motion.div>
    </div>
  );
};
