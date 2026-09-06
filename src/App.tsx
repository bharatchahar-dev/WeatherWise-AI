import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  LayoutDashboard,
  Bot,
  CalendarDays,
  AlertOctagon,
  Activity,
  Search,
  Navigation,
  Languages,
  UserCheck,
  Download,
  CloudLightning,
  Sparkles,
  ExternalLink,
  HelpCircle,
  Home,
} from "lucide-react";
import {
  WeatherCurrent,
  ForecastDay,
  HourlyTrends,
  SafetyScoreData,
  WeatherAlert,
  UserProfile,
  LanguageMode,
  ClimateData,
} from "./types";
import { WeatherHeroCard } from "./components/WeatherHeroCard";
import { SafetyScoreCard } from "./components/SafetyScoreCard";
import { WeatherTrendsChart } from "./components/WeatherTrendsChart";
import { ForecastGrid } from "./components/ForecastGrid";
import { AlertsBanner } from "./components/AlertsBanner";
import { ChatDrawer } from "./components/ChatDrawer";
import { ClimateView } from "./components/ClimateView";
import { VSCodeDownloadModal } from "./components/VSCodeDownloadModal";
import { YouTubeBackground } from "./components/YouTubeBackground";
import { LandingPage } from "./components/LandingPage";

type ActiveTab = "dashboard" | "chat" | "forecast" | "alerts" | "climate";
type ViewMode = "landing" | "dashboard";

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>("landing");
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [cityInput, setCityInput] = useState("");
  const [currentCity, setCurrentCity] = useState("New Delhi");
  const [profile, setProfile] = useState<UserProfile>("General Citizen");
  const [profileConfirmed, setProfileConfirmed] = useState(false);
  const [language, setLanguage] = useState<LanguageMode>("en");
  const [isVSCodeModalOpen, setIsVSCodeModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Core Data States
  const [currentWeather, setCurrentWeather] = useState<WeatherCurrent | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [hourly, setHourly] = useState<HourlyTrends>({
    times: [],
    temperatures: [],
    humidity: [],
    rain_probability: [],
    wind_speeds: [],
  });
  const [safety, setSafety] = useState<SafetyScoreData | null>(null);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [climate, setClimate] = useState<ClimateData | null>(null);
  const [loading, setLoading] = useState(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Fetch weather and forecast
  const loadWeather = async (city: string, lat?: number, lon?: number) => {
    setLoading(true);
    try {
      let url = `/api/weather?city=${encodeURIComponent(city)}&profile=${encodeURIComponent(profile)}`;
      if (lat !== undefined && lon !== undefined) {
        url = `/api/weather?lat=${lat}&lon=${lon}&profile=${encodeURIComponent(profile)}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setCurrentWeather(data.current);
        setSafety(data.safety);
        setAlerts(data.alerts);
        setCurrentCity(data.current.location.split(",")[0]);

        // Fetch forecast & hourly
        let fUrl = `/api/forecast?city=${encodeURIComponent(city)}`;
        if (lat !== undefined && lon !== undefined) {
          fUrl = `/api/forecast?lat=${lat}&lon=${lon}`;
        }
        const fRes = await fetch(fUrl);
        const fData = await fRes.json();
        if (fData.success) {
          setForecast(fData.forecast);
          setHourly(fData.hourly);
        }
      }
    } catch (err) {
      console.error("Error loading weather data:", err);
      showToast("Network error. Using cached weather model.");
    } finally {
      setLoading(false);
    }
  };

  // Re-evaluate alerts when profile changes
  const handleProfileChange = async (newProfile: UserProfile) => {
    setProfile(newProfile);
    setProfileConfirmed(true);
    showToast(`Switched active mode to ${newProfile}`);
    if (currentWeather) {
      try {
        const res = await fetch("/api/alerts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profile: newProfile,
            current: currentWeather,
          }),
        });
        const d = await res.json();
        if (d.success) {
          setAlerts(d.alerts);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Fetch climate data once
  useEffect(() => {
    loadWeather("New Delhi");
    fetch("/api/climate")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setClimate(d);
      })
      .catch(() => {});
  }, []);

  // Geolocation trigger
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      showToast("Geolocation is not supported by your browser.");
      return;
    }
    showToast("Detecting current coordinates...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        loadWeather("", lat, lon);
        showToast("Position synchronized.");
      },
      () => {
        showToast("Location access denied or unavailable.");
      },
      { timeout: 8000 }
    );
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cityInput.trim()) {
      loadWeather(cityInput.trim());
      setCityInput("");
    }
  };

  const criticalAlertCount = alerts.filter(
    (a) => a.severity === "CRITICAL" || a.severity === "WARNING"
  ).length;

  const handleEnterDashboard = (tab: ActiveTab = "dashboard") => {
    setActiveTab(tab);
    setViewMode("dashboard");
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      {/* Layer 1 & 2: Global Full-Screen YouTube Video Background with subtle 2.5px blur on landing page, 0px on dashboard */}
      <YouTubeBackground videoId="1Y30sLKH1fA" blurAmount={viewMode === "landing" ? 2.5 : 0} />

      <AnimatePresence mode="wait">
        {viewMode === "landing" ? (
          <motion.div
            key="landing-view-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.35, ease: "easeInOut" } }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            <LandingPage
              currentWeather={currentWeather}
              language={language}
              onEnterDashboard={handleEnterDashboard}
              onToggleLanguage={() => {
                const next = language === "en" ? "hi" : "en";
                setLanguage(next);
                showToast(next === "en" ? "Language: English" : "भाषा: हिंदी");
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard-view-container"
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99, transition: { duration: 0.25 } }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="relative z-10 flex min-h-screen flex-col lg:flex-row"
          >
            {/* Sidebar with soft translucent ocean navy frosted glass */}
            <aside className="glass-sidebar flex w-full flex-col justify-between p-5 lg:w-72 lg:p-6 flex-shrink-0 z-20">
              <div>
                {/* Brand Logo - Clickable to return to landing page */}
                <div
                  onClick={() => setViewMode("landing")}
                  className="group flex cursor-pointer items-center gap-3 transition-transform"
                  title="Return to Front Landing Page"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/30 bg-gradient-to-br from-cyan-500/20 via-sky-600/20 to-teal-500/20 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.25)] group-hover:scale-105 transition-transform">
                    <CloudLightning className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold tracking-tight text-[#F1F7FA] group-hover:text-cyan-200 transition-colors">
                      WeatherWise <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-teal-300 bg-clip-text text-transparent">AI</span>
                    </h1>
                    <p className="text-[11px] text-[#9FB3C8]">Intelligence for Every Citizen</p>
                  </div>
                </div>

                {/* Return to Landing Page Quick Button */}
                <button
                  id="nav-tab-landing-return"
                  onClick={() => setViewMode("landing")}
                  className="mt-6 flex w-full items-center gap-2.5 rounded-xl border border-cyan-400/25 bg-cyan-500/10 px-3.5 py-2 text-xs font-semibold text-cyan-200 shadow-[0_0_15px_rgba(34,211,238,0.1)] backdrop-blur-md transition-all hover:border-cyan-400/45 hover:bg-cyan-500/20 hover:text-white"
                >
                  <Home className="h-4 w-4 text-cyan-300" />
                  <span>{language === "hi" ? "← मुख्य फ्रंट पेज" : "← Front Landing Page"}</span>
                </button>

                {/* Navigation Tabs */}
                <nav className="mt-4 space-y-1.5">
              <button
                id="nav-tab-dashboard"
                onClick={() => setActiveTab("dashboard")}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                  activeTab === "dashboard"
                    ? "border border-cyan-400/35 bg-gradient-to-r from-sky-500/20 to-teal-500/15 text-cyan-200 shadow-[0_0_15px_rgba(34,211,238,0.18)] font-bold backdrop-blur-md"
                    : "border border-transparent text-[#9FB3C8] hover:bg-cyan-500/10 hover:text-[#F1F7FA] hover:border-cyan-400/20"
                }`}
              >
                <LayoutDashboard className="h-4 w-4 text-cyan-400" />
                <span>{language === "hi" ? "डैशबोर्ड" : "Dashboard"}</span>
              </button>

              <button
                id="nav-tab-chat"
                onClick={() => setActiveTab("chat")}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                  activeTab === "chat"
                    ? "border border-cyan-400/35 bg-gradient-to-r from-sky-500/20 to-teal-500/15 text-cyan-200 shadow-[0_0_15px_rgba(34,211,238,0.18)] font-bold backdrop-blur-md"
                    : "border border-transparent text-[#9FB3C8] hover:bg-cyan-500/10 hover:text-[#F1F7FA] hover:border-cyan-400/20"
                }`}
              >
                <div className="h-5 w-5 flex-shrink-0 overflow-hidden rounded-full border border-cyan-400/40">
                  <img
                    src="/assets/ai_assistant_pfp.jpg"
                    alt="AI Assistant"
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span>{language === "hi" ? "एआई मौसम चैट" : "AI Weather Chat"}</span>
                <span className="ml-auto rounded-full border border-cyan-400/30 bg-cyan-500/20 px-2 py-0.5 text-[9px] font-bold text-cyan-300">
                  Gemini
                </span>
              </button>

              <button
                id="nav-tab-forecast"
                onClick={() => setActiveTab("forecast")}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                  activeTab === "forecast"
                    ? "border border-cyan-400/35 bg-gradient-to-r from-sky-500/20 to-teal-500/15 text-cyan-200 shadow-[0_0_15px_rgba(34,211,238,0.18)] font-bold backdrop-blur-md"
                    : "border border-transparent text-[#9FB3C8] hover:bg-cyan-500/10 hover:text-[#F1F7FA] hover:border-cyan-400/20"
                }`}
              >
                <CalendarDays className="h-4 w-4 text-sky-400" />
                <span>{language === "hi" ? "7-दिवसीय पूर्वानुमान" : "7-Day Forecast"}</span>
              </button>

              <button
                id="nav-tab-alerts"
                onClick={() => setActiveTab("alerts")}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                  activeTab === "alerts"
                    ? "border border-cyan-400/35 bg-gradient-to-r from-sky-500/20 to-teal-500/15 text-cyan-200 shadow-[0_0_15px_rgba(34,211,238,0.18)] font-bold backdrop-blur-md"
                    : "border border-transparent text-[#9FB3C8] hover:bg-cyan-500/10 hover:text-[#F1F7FA] hover:border-cyan-400/20"
                }`}
              >
                <AlertOctagon className="h-4 w-4 text-amber-400" />
                <span>{language === "hi" ? "मौसम चेतावनी" : "Weather Alerts"}</span>
                {criticalAlertCount > 0 && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-red-400 shadow-[0_0_8px_#f87171]" />
                )}
              </button>

              <button
                id="nav-tab-climate"
                onClick={() => setActiveTab("climate")}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                  activeTab === "climate"
                    ? "border border-cyan-400/35 bg-gradient-to-r from-sky-500/20 to-teal-500/15 text-cyan-200 shadow-[0_0_15px_rgba(34,211,238,0.18)] font-bold backdrop-blur-md"
                    : "border border-transparent text-[#9FB3C8] hover:bg-cyan-500/10 hover:text-[#F1F7FA] hover:border-cyan-400/20"
                }`}
              >
                <Activity className="h-4 w-4 text-teal-400" />
                <span>{language === "hi" ? "जलवायु रुझान" : "Climate Insights"}</span>
              </button>
            </nav>

            {/* Profile Context Switcher */}
            <div className="mt-8 rounded-2xl border border-[rgba(100,220,255,0.12)] bg-[rgba(7,24,39,0.50)] p-4 backdrop-blur-md shadow-lg">
              <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#9FB3C8]">
                <UserCheck className="h-3.5 w-3.5 text-teal-400" />
                <span>{language === "hi" ? "सक्रिय मोड" : "Active Profile"}</span>
              </div>
              <select
                id="user-profile-selector"
                value={profile}
                onChange={(e) => handleProfileChange(e.target.value as UserProfile)}
                className="w-full rounded-xl border border-[rgba(100,220,255,0.20)] bg-[rgba(6,20,33,0.85)] px-3 py-2 text-xs font-semibold text-[#F1F7FA] outline-none transition-all focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
              >
                <option value="General Citizen">👤 General Citizen</option>
                <option value="Farmer">🌾 Farmer (कृषि)</option>
                <option value="Traveler">✈️ Traveler (यात्री)</option>
                <option value="Emergency Services">🛡️ Emergency Services</option>
              </select>
              <p className="mt-2 text-[11px] text-[#6F8799] leading-relaxed">
                {profile === "Farmer"
                  ? "Tailored advice for soil moisture, spray windows, and harvesting."
                  : profile === "Traveler"
                  ? "Highway visibility, flight weather delays, and transit guidance."
                  : profile === "Emergency Services"
                  ? "Civil risk thresholds, urban flooding, and rescue staging."
                  : "Daily citizen routine, commute safety, and umbrella readiness."}
              </p>
            </div>
          </div>

        </aside>

        {/* Main Content Area (transparent so global full-screen video background continues seamlessly) */}
        <main
          id="main-dashboard-viewport"
          className="relative flex-1 overflow-y-auto overflow-x-hidden bg-transparent"
        >
          {/* Dashboard Viewport Floating UI Layers */}
          <div className="relative z-10 flex min-h-full flex-col">
            {/* Topbar Header with translucent frosted glass */}
            <header className="glass-topbar sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 px-6 py-4">
            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="flex flex-1 max-w-lg items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6F8799]" />
                <input
                  type="text"
                  id="search-city-input"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  placeholder={
                    language === "hi"
                      ? "शहर खोजें (जैसे New Delhi, Mumbai, London)..."
                      : "Search city (e.g. New Delhi, Mumbai, London, Tokyo)..."
                  }
                  className="w-full rounded-xl border border-[rgba(100,220,255,0.15)] bg-[rgba(7,24,39,0.55)] py-2 pl-9 pr-4 text-xs text-[#F1F7FA] placeholder-[#6F8799] outline-none transition-all backdrop-blur-md focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 sm:text-sm"
                />
              </div>
              <button
                type="submit"
                id="search-city-submit-btn"
                className="btn-glass-primary rounded-xl px-4 py-2 text-xs font-bold text-white"
              >
                {language === "hi" ? "खोजें" : "Search"}
              </button>
              <button
                type="button"
                id="use-geolocation-btn"
                onClick={handleUseMyLocation}
                title="Use Current Location"
                className="flex items-center gap-1.5 rounded-xl border border-[rgba(100,220,255,0.15)] bg-[rgba(7,24,39,0.55)] px-3.5 py-2 text-xs font-semibold text-[#9FB3C8] transition-all hover:border-cyan-400/40 hover:text-cyan-200 hover:bg-cyan-500/10 backdrop-blur-md"
              >
                <Navigation className="h-3.5 w-3.5 text-cyan-400" />
                <span className="hidden sm:inline">
                  {language === "hi" ? "मेरा स्थान" : "My Location"}
                </span>
              </button>
            </form>

            {/* Right Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Return to Landing Page Button */}
              <button
                id="topbar-return-landing-btn"
                onClick={() => setViewMode("landing")}
                title={language === "hi" ? "मुख्य फ्रंट पेज पर जाएं" : "Return to Front Landing Page"}
                className="flex items-center gap-1.5 rounded-xl border border-cyan-400/25 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-200 transition-all hover:border-cyan-400/45 hover:text-white hover:bg-cyan-500/20 backdrop-blur-md shadow-[0_0_12px_rgba(34,211,238,0.1)]"
              >
                <Home className="h-3.5 w-3.5 text-cyan-300" />
                <span className="hidden sm:inline">{language === "hi" ? "होम पेज" : "Landing"}</span>
              </button>

              {/* Language Switcher */}
              <button
                id="language-toggle-btn"
                onClick={() => {
                  const next = language === "en" ? "hi" : "en";
                  setLanguage(next);
                  showToast(next === "en" ? "Language: English" : "भाषा: हिंदी");
                }}
                className="flex items-center gap-1.5 rounded-xl border border-[rgba(100,220,255,0.15)] bg-[rgba(7,24,39,0.55)] px-3 py-1.5 text-xs font-semibold text-[#9FB3C8] transition-all hover:border-cyan-400/40 hover:text-[#F1F7FA] hover:bg-cyan-500/10 backdrop-blur-md"
              >
                <Languages className="h-3.5 w-3.5 text-cyan-400" />
                <span>{language === "en" ? "EN | हिंदी" : "हिंदी | EN"}</span>
              </button>

              <div className="hidden items-center gap-2 rounded-full border border-teal-400/30 bg-teal-500/15 px-3 py-1 text-xs text-teal-300 shadow-[0_0_12px_rgba(20,184,166,0.2)] sm:flex">
                <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
                <span>Live Synchronized</span>
              </div>
            </div>
          </header>

          {/* Body Stage */}
          <div className="p-6 sm:p-8">
            {/* 1. DASHBOARD VIEW */}
            {activeTab === "dashboard" && currentWeather && safety && (
              <div className="space-y-6">
                {/* Hero Grid: Weather Card (2 cols) + Safety Gauge (1 col) */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <WeatherHeroCard current={currentWeather} language={language} />
                  </div>
                  <div className="lg:col-span-1">
                    <SafetyScoreCard safety={safety} language={language} />
                  </div>
                </div>

                {/* Active Alerts Ribbon */}
                <AlertsBanner alerts={alerts} profile={profile} language={language} />

                {/* Hourly Trends Chart */}
                <WeatherTrendsChart hourly={hourly} language={language} />

                {/* 7-Day Forecast Row */}
                <ForecastGrid forecast={forecast} language={language} />

                {/* Quick AI Consultation Banner */}
                <div
                  id="ai-quick-consult-banner"
                  className="flex flex-col gap-4 rounded-2xl border border-[rgba(100,220,255,0.18)] bg-gradient-to-r from-[rgba(8,35,58,0.65)] via-[rgba(11,58,91,0.45)] to-[rgba(7,24,39,0.65)] p-6 backdrop-blur-xl shadow-xl transition-all hover:border-cyan-400/30 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border border-cyan-400/35 bg-slate-900/80 p-0.5 shadow-[0_0_20px_rgba(34,211,238,0.25)] overflow-hidden">
                      <img
                        src="/assets/ai_assistant_pfp.jpg"
                        alt="WeatherWise AI Avatar"
                        className="h-full w-full object-cover rounded-xl"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-[#F1F7FA]">
                        {language === "hi"
                          ? `व्यक्तिगत एआई मौसमी मार्गदर्शन (${profile})`
                          : `WeatherWise AI Personalized Advisory (${profile})`}
                      </h4>
                      <p className="mt-0.5 text-xs text-[#9FB3C8]">
                        {safety.score > 75
                          ? "Atmospheric parameters are optimal. Ask Gemini 2.5 for hourly advice, safe commute timings, or farming windows."
                          : "Heightened atmospheric caution advised. Consult WeatherWise AI for step-by-step risk mitigation."}
                      </p>
                    </div>
                  </div>

                  <button
                    id="btn-consult-gemini-cta"
                    onClick={() => setActiveTab("chat")}
                    className="btn-glass-primary flex flex-shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-lg"
                  >
                    <div className="h-4 w-4 flex-shrink-0 overflow-hidden rounded-full border border-white/40">
                      <img
                        src="/assets/ai_assistant_pfp.jpg"
                        alt="AI"
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span>{language === "hi" ? "एआई से पूछें" : "Consult AI Assistant"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* 2. CHAT VIEW */}
            {activeTab === "chat" && (
             <ChatDrawer
                current={currentWeather}
                forecast={forecast}
                safety={safety}
                alerts={alerts}
                profile={profile}
                profileConfirmed={profileConfirmed}
                language={language}
              />
            )}

            {/* 3. FORECAST VIEW */}
            {activeTab === "forecast" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-[#F1F7FA] sm:text-2xl">
                    {language === "hi" ? "विस्तृत 7-दिवसीय मौसम पूर्वानुमान" : "Comprehensive 7-Day Meteorological Outlook"}
                  </h2>
                  <p className="text-xs text-[#9FB3C8] sm:text-sm">
                    {language === "hi"
                      ? "तापमान, हवा की गति और वर्षा की संभावना का दैनिक विश्लेषण।"
                      : "Daily high/low temperature trajectories, wind vectors, and precipitation probability."}
                  </p>
                </div>
                <ForecastGrid forecast={forecast} language={language} />
                <WeatherTrendsChart hourly={hourly} language={language} />
              </div>
            )}

            {/* 4. ALERTS VIEW */}
            {activeTab === "alerts" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-[#F1F7FA] sm:text-2xl">
                    {language === "hi" ? "वायुमंडलीय जोखिम एवं मौसम चेतावनी केंद्र" : "Atmospheric Hazard & Risk Alert Center"}
                  </h2>
                  <p className="text-xs text-[#9FB3C8] sm:text-sm">
                    {language === "hi"
                      ? "बारिश, लू, आंधी-तूफान और संभावित बाढ़ के खतरों का स्वचालित मूल्यांकन।"
                      : "Automated threshold evaluation across torrential rain, heat stress, gale winds, and severe lightning."}
                  </p>
                </div>
                <AlertsBanner alerts={alerts} profile={profile} language={language} />
              </div>
            )}

            {/* 5. CLIMATE INSIGHTS VIEW */}
            {activeTab === "climate" && (
              <ClimateView climate={climate} language={language} />
            )}
          </div>
        </div>
      </main>
      </motion.div>
      )}
      </AnimatePresence>

      {/* VS Code Download Modal */}
      <VSCodeDownloadModal
        isOpen={isVSCodeModalOpen}
        onClose={() => setIsVSCodeModalOpen(false)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div
          id="toast-notification-banner"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-cyan-400/35 bg-[rgba(6,20,33,0.92)] px-4 py-2.5 text-xs font-semibold text-cyan-300 shadow-2xl backdrop-blur-xl animate-bounce"
        >
          <Sparkles className="h-4 w-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Bottom-right credit watermark */}
      <div className="fixed bottom-2 right-3 z-40 text-[10px] font-medium text-white/30 select-none pointer-events-none">
        @bharatchahar
      </div>
    </div>
  );
}

