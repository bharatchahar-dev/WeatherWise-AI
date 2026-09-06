/**
 * WeatherWise AI - Express Backend Server
 * Connects live meteorological services, computes safety score and alerts,
 * proxies Google Gemini AI queries using @google/genai, and mounts Vite middleware.
 */
     
import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config({ path: ".env.local" });

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google GenAI Server Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(overrideKey?: string): GoogleGenAI | null {
  const trimmedOverride = overrideKey?.trim();
  if (trimmedOverride) {
    return new GoogleGenAI({
      apiKey: trimmedOverride,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } },
    });
  }
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "MY_GEMINI_API_KEY" || key === "your_gemini_api_key_here") {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Weather Code mapping table
const WMO_CODES: Record<number, [string, string]> = {
  0: ["Clear Sky", "sun"],
  1: ["Mainly Clear", "sun"],
  2: ["Partly Cloudy", "cloud-sun"],
  3: ["Overcast", "cloud"],
  45: ["Foggy", "cloud-fog"],
  48: ["Depositing Rime Fog", "cloud-fog"],
  51: ["Light Drizzle", "cloud-drizzle"],
  53: ["Moderate Drizzle", "cloud-drizzle"],
  55: ["Dense Drizzle", "cloud-rain"],
  61: ["Slight Rain", "cloud-rain"],
  63: ["Moderate Rain", "cloud-rain"],
  65: ["Heavy Rain", "cloud-rain-wind"],
  71: ["Slight Snow", "cloud-snow"],
  73: ["Moderate Snow", "cloud-snow"],
  75: ["Heavy Snow", "snowflake"],
  80: ["Rain Showers", "cloud-rain"],
  81: ["Moderate Rain Showers", "cloud-rain"],
  82: ["Violent Rain Showers", "cloud-lightning"],
  95: ["Thunderstorm", "cloud-lightning"],
  96: ["Thunderstorm with Slight Hail", "cloud-lightning"],
  99: ["Thunderstorm with Heavy Hail", "cloud-lightning"],
};

const DEFAULT_CITIES: Record<string, [number, number, string]> = {
  "new delhi": [28.6139, 77.2090, "New Delhi, India"],
  "mumbai": [19.0760, 72.8777, "Mumbai, India"],
  "london": [51.5074, -0.1278, "London, United Kingdom"],
  "new york": [40.7128, -74.0060, "New York, United States"],
  "tokyo": [35.6762, 139.6503, "Tokyo, Japan"],
  "paris": [48.8566, 2.3522, "Paris, France"],
  "bengaluru": [12.9716, 77.5946, "Bengaluru, India"],
  "singapore": [1.3521, 103.8198, "Singapore"],
};

async function geocodeCity(cityQuery: string): Promise<[number, number, string]> {
  const cleaned = cityQuery.trim().toLowerCase();
  if (DEFAULT_CITIES[cleaned]) {
    return DEFAULT_CITIES[cleaned];
  }
  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityQuery)}&count=1&language=en&format=json`;
    const res = await fetch(geoUrl);
    if (res.ok) {
      const data: any = await res.json();
      if (data.results && data.results.length > 0) {
        const r = data.results[0];
        const parts = [r.name, r.admin1, r.country].filter(Boolean);
        return [r.latitude, r.longitude, parts.join(", ")];
      }
    }
  } catch (err) {
    console.error("Geocoding fetch error:", err);
  }
  return [28.6139, 77.2090, cityQuery.toUpperCase()];
}

// Compute Safety Score (0-100)
function computeSafetyScore(curr: any) {
  let score = 100;
  const deductions: string[] = [];

  const temp = curr.temperature ?? 25;
  const wind = curr.wind_speed ?? 10;
  const precipitation = curr.precipitation_mm ?? 0;
  const code = curr.weather_code ?? 0;
  const uv = curr.uv_index ?? 5;

  let tempDeduction = 0;
  if (temp >= 42) {
    tempDeduction = 25;
    deductions.push(`Extreme Heat (${temp}°C) - Heat stroke hazard`);
  } else if (temp >= 38) {
    tempDeduction = 15;
    deductions.push(`High Heat (${temp}°C) - Limit sun exposure`);
  } else if (temp <= 0) {
    tempDeduction = 25;
    deductions.push(`Sub-Zero Frost (${temp}°C) - Ice on roads`);
  } else if (temp <= 5) {
    tempDeduction = 10;
    deductions.push(`Cold Stress (${temp}°C) - Warm thermal layers required`);
  }
  score -= tempDeduction;

  let windDeduction = 0;
  if (wind >= 60) {
    windDeduction = 30;
    deductions.push(`Gale Force Winds (${wind} km/h) - Flying debris risk`);
  } else if (wind >= 40) {
    windDeduction = 18;
    deductions.push(`Strong Gusts (${wind} km/h) - High-profile vehicle warning`);
  } else if (wind >= 28) {
    windDeduction = 8;
    deductions.push(`Brisk Winds (${wind} km/h)`);
  }
  score -= windDeduction;

  let rainDeduction = 0;
  if (precipitation >= 25) {
    rainDeduction = 30;
    deductions.push(`Torrential Rain (${precipitation} mm/h) - Waterlogging and flood risk`);
  } else if (precipitation >= 10) {
    rainDeduction = 18;
    deductions.push(`Heavy Rainfall (${precipitation} mm/h) - Slick road surfaces`);
  } else if (precipitation > 0.5) {
    rainDeduction = 8;
    deductions.push(`Active Rain (${precipitation} mm/h)`);
  }
  score -= rainDeduction;

  let severeDeduction = 0;
  if ([95, 96, 99].includes(code)) {
    severeDeduction = 35;
    deductions.push("Thunderstorm & Lightning Activity - Seek indoor shelter");
  } else if ([65, 82].includes(code)) {
    severeDeduction = 20;
    deductions.push("Violent Rain Showers - Severely reduced visibility");
  } else if ([71, 73, 75].includes(code)) {
    severeDeduction = 22;
    deductions.push("Active Snowfall - Slippery road conditions");
  } else if ([45, 48].includes(code)) {
    severeDeduction = 12;
    deductions.push("Dense Fog - Impaired driving visibility");
  }
  score -= severeDeduction;

  let uvDeduction = 0;
  if (uv >= 11) {
    uvDeduction = 10;
    deductions.push(`Extreme UV Index (${uv}) - Sunburn risk < 10 mins`);
  } else if (uv >= 8) {
    uvDeduction = 5;
    deductions.push(`Very High UV (${uv})`);
  }
  score -= uvDeduction;

  const finalScore = Math.max(5, Math.min(100, score));
  let level = "Safe";
  let level_hi = "सुरक्षित (Safe)";
  let color = "#10B981";
  let advisory = "Optimal atmospheric conditions. Outdoor travel, sports, and farming schedules are highly favorable.";
  let advisory_hi = "मौसम अनुकूल है। नियमित बाहरी गतिविधियों, यात्रा और खेती के लिए आदर्श।";

  if (finalScore < 50) {
    level = "High Risk";
    level_hi = "उच्च जोखिम (High Risk)";
    color = "#EF4444";
    advisory = "Significant meteorological hazards detected. Postpone non-essential travel and stay in reinforced structures.";
    advisory_hi = "गंभीर मौसमी संकट। गैर-जरूरी यात्रा से बचें और सुरक्षित स्थानों पर रहें।";
  } else if (finalScore < 80) {
    level = "Moderate Risk";
    level_hi = "मध्यम जोखिम (Moderate Risk)";
    color = "#F59E0B";
    advisory = "Moderate atmospheric hazards detected. Plan accordingly, carry appropriate gear, and monitor updates.";
    advisory_hi = "मध्यम मौसमी जोखिम दर्ज किया गया है। आवश्यक सावधानी बरतें और मौसम पर नज़र रखें।";
  }

  return {
    score: finalScore,
    level,
    level_hindi: level_hi,
    color,
    advisory,
    advisory_hindi: advisory_hi,
    deductions: deductions.length ? deductions : ["No critical hazards detected."],
    subscores: {
      temperature_safety: Math.max(0, 100 - tempDeduction * 4),
      wind_safety: Math.max(0, 100 - windDeduction * 3),
      rain_safety: Math.max(0, 100 - rainDeduction * 3),
      atmospheric_safety: Math.max(0, 100 - severeDeduction * 2),
    },
    disclaimer: "AI-generated risk index for situational awareness only. Not an official government civil protection alert.",
  };
}

// Compute Alerts
function computeAlerts(curr: any, profile: string = "General Citizen") {
  const alerts: any[] = [];
  const temp = curr.temperature ?? 25;
  const wind = curr.wind_speed ?? 10;
  const rain = curr.precipitation_mm ?? 0;
  const code = curr.weather_code ?? 0;

  // Thunderstorm
  if ([95, 96, 99].includes(code)) {
    const pActions: Record<string, string> = {
      Farmer: "Halt all open field activities immediately. Disconnect metal irrigation pipes and move livestock into grounded covered sheds.",
      Traveler: "Expect air traffic delays and highway waterlogging. Pull off under solid highway overpasses away from tall trees.",
      "Emergency Services": "Stage swift-water rescue units and monitor urban drainage chokepoints. Prepare auxiliary generators.",
      "General Citizen": "Stay indoors away from windows and balconies. Unplug sensitive electronics.",
    };
    alerts.push({
      id: "alert-thunderstorm",
      type: "Thunderstorm & Lightning",
      severity: code === 99 ? "CRITICAL" : "WARNING",
      title: "Severe Thunderstorm & Lightning Alert",
      title_hi: "गंभीर तूफान और बिजली गिरने की चेतावनी",
      description: "Convective storm system active in your zone with intense electrical discharges and heavy wind gusts.",
      description_hi: "आपके क्षेत्र में तेज़ हवाओं और बिजली चमकने के साथ तूफान सक्रिय है।",
      recommendation: "Seek sturdy indoor shelter immediately. Avoid metal objects and open water.",
      profile_action: pActions[profile] || pActions["General Citizen"],
      icon: "zap",
      pulse: true,
    });
  }

  // Rain / Flood
  if (rain >= 25 || [65, 82].includes(code)) {
    const pActions: Record<string, string> = {
      Farmer: "Dig diversion runoff trenches along field borders. Secure grain storage from moisture.",
      Traveler: "Avoid low-lying underpasses and mountain ghats prone to landslides.",
      "Emergency Services": "Deploy pumps to subterranean transit hubs. Issue alerts for low-lying settlements.",
      "General Citizen": "Avoid driving through standing water of unknown depth. Keep flashlights accessible.",
    };
    alerts.push({
      id: "alert-heavy-rain",
      type: "Possible Flood Risk",
      severity: "CRITICAL",
      title: "Torrential Downpour & Flash Flood Threat",
      title_hi: "भारी बारिश और अचानक बाढ़ का खतरा",
      description: `Intense precipitation rate (${rain} mm/h) may exceed municipal storm runoff capacities.`,
      description_hi: `तेज़ बारिश (${rain} मिमी/घंटा) से निचले इलाकों में जलभराव हो सकता है।`,
      recommendation: "Stay on elevated ground. Do not walk or drive through flowing water.",
      profile_action: pActions[profile] || pActions["General Citizen"],
      icon: "alert-triangle",
      pulse: true,
    });
  }

  // Heatwave
  if (temp >= 42) {
    const pActions: Record<string, string> = {
      Farmer: "Schedule field irrigation exclusively during dawn (04:00 - 06:00) to prevent soil baking.",
      Traveler: "Carry minimum 2 liters of electrolyte hydration in vehicles. Check tyre pressures.",
      "Emergency Services": "Open community cooling hydration shelters.",
      "General Citizen": "Strictly avoid direct sunlight between 11:30 AM and 04:00 PM. Hydrate frequently.",
    };
    alerts.push({
      id: "alert-heatwave-crit",
      type: "Heatwave",
      severity: "CRITICAL",
      title: "Extreme Heatwave Hazard",
      title_hi: "भीषण लू (Heatwave) चेतावनी",
      description: `Dangerous ambient temperature (${temp}°C) recorded. High risk of rapid dehydration.`,
      description_hi: `अत्यधिक तापमान (${temp}°C) और लू का गंभीर खतरा।`,
      recommendation: "Remain in climate-controlled spaces and consume electrolyte fluids.",
      profile_action: pActions[profile] || pActions["General Citizen"],
      icon: "flame",
      pulse: true,
    });
  } else if (temp >= 38) {
    alerts.push({
      id: "alert-heatwave-warn",
      type: "Heatwave",
      severity: "WARNING",
      title: "Elevated Heat Advisory",
      title_hi: "गर्मी की चेतावनी",
      description: `High temperatures (${temp}°C) prevailing. Heat exhaustion risk during prolonged exposure.`,
      description_hi: `तेज़ धूप और तापमान (${temp}°C)।`,
      recommendation: "Hydrate regularly and avoid strenuous outdoor exercise midday.",
      profile_action: `Tailored for ${profile}: Stay hydrated, monitor vulnerable individuals, and wear breathable cotton clothing.`,
      icon: "sun",
      pulse: false,
    });
  }

  // High Wind
  if (wind >= 55) {
    alerts.push({
      id: "alert-gale-wind",
      type: "Strong Wind",
      severity: "CRITICAL",
      title: "Severe Gale & Windstorm Warning",
      title_hi: "तेज़ आंधी और तूफानी हवाओं की चेतावनी",
      description: `Damaging winds exceeding ${wind} km/h recorded. Risk of falling tree limbs and flying debris.`,
      description_hi: `${wind} किमी/घंटा की गति से तेज़ हवाएं।`,
      recommendation: "Keep clear of unstable billboards, power poles, and old trees.",
      profile_action: `Action for ${profile}: Anchor external fixtures and avoid parking vehicles under large trees.`,
      icon: "wind",
      pulse: true,
    });
  }

  if (!alerts.length) {
    alerts.push({
      id: "alert-normal",
      type: "General Advisory",
      severity: "INFO",
      title: "Atmospheric Conditions Stable",
      title_hi: "मौसम की स्थिति सामान्य",
      description: `No critical meteorological hazards detected in the area. Current temperature is ${temp}°C with calm winds (${wind} km/h).`,
      description_hi: `कोई गंभीर मौसमी खतरा नहीं है। तापमान ${temp}°C और हवा शांत (${wind} किमी/घंटा) है।`,
      recommendation: "All routine activities can proceed without weather-related disruptions.",
      profile_action: `Advisory for ${profile}: Great day to proceed with normal operational schedules and outdoor plans.`,
      icon: "check-circle",
      pulse: false,
    });
  }

  return alerts;
}

// Fallback Demo Weather
function getDemoWeather(locationName: string, lat: number = 28.61, lon: number = 77.20) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return {
    success: true,
    current: {
      location: locationName,
      latitude: lat,
      longitude: lon,
      temperature: 28.2,
      feels_like: 30.1,
      humidity: 58,
      wind_speed: 13.5,
      wind_direction: 210,
      pressure: 1012.4,
      uv_index: 6.5,
      weather_code: 2,
      condition: "Partly Cloudy",
      icon: "cloud-sun",
      sunrise: "06:12",
      sunset: "18:45",
      visibility_km: 10.0,
      last_updated: timeStr,
      is_demo: true,
      precipitation_mm: 0.0,
    },
    forecast: [
      { day: "Today", date: "Today", min_temp: 22.0, max_temp: 32.0, rain_probability: 15, condition: "Partly Cloudy", icon: "cloud-sun", wind_speed: 13.5 },
      { day: "Tomorrow", date: "Day 2", min_temp: 23.0, max_temp: 33.0, rain_probability: 30, condition: "Scattered Clouds", icon: "cloud", wind_speed: 15.0 },
      { day: "Wednesday", date: "Day 3", min_temp: 21.0, max_temp: 29.0, rain_probability: 70, condition: "Moderate Rain", icon: "cloud-rain", wind_speed: 21.5 },
      { day: "Thursday", date: "Day 4", min_temp: 20.0, max_temp: 27.0, rain_probability: 85, condition: "Thunderstorm", icon: "cloud-lightning", wind_speed: 28.0 },
      { day: "Friday", date: "Day 5", min_temp: 20.5, max_temp: 29.5, rain_probability: 40, condition: "Passing Showers", icon: "cloud-drizzle", wind_speed: 16.0 },
      { day: "Saturday", date: "Day 6", min_temp: 22.0, max_temp: 33.0, rain_probability: 10, condition: "Mainly Clear", icon: "sun", wind_speed: 12.0 },
      { day: "Sunday", date: "Day 7", min_temp: 23.0, max_temp: 34.0, rain_probability: 5, condition: "Clear Sky", icon: "sun", wind_speed: 10.5 },
    ],
    hourly: {
      times: ["00:00", "03:00", "06:00", "09:00", "12:00", "15:00", "18:00", "21:00"],
      temperatures: [22.5, 21.0, 22.8, 27.5, 31.8, 30.5, 27.2, 24.5],
      humidity: [74, 78, 72, 58, 48, 52, 62, 70],
      rain_probability: [5, 10, 15, 25, 30, 20, 15, 5],
      wind_speeds: [8.5, 8.0, 10.2, 13.5, 16.0, 15.2, 11.5, 9.0],
    },
  };
}

// Fetch live weather from Open-Meteo
async function fetchWeather(city?: string, latStr?: string, lonStr?: string) {
  let lat = 28.6139;
  let lon = 77.2090;
  let locName = "New Delhi, India";

  if (city) {
    const geo = await geocodeCity(city);
    lat = geo[0];
    lon = geo[1];
    locName = geo[2];
  } else if (latStr && lonStr) {
    lat = parseFloat(latStr) || 28.6139;
    lon = parseFloat(lonStr) || 77.2090;
    locName = `Coordinates (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`;
  }

  try {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      current: "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m",
      hourly: "temperature_2m,relative_humidity_2m,precipitation_probability,wind_speed_10m,uv_index",
      daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,sunrise,sunset,wind_speed_10m_max",
      timezone: "auto",
      forecast_days: "7",
    });
    const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(7000) });

    if (res.ok) {
      const data: any = await res.json();
      const curr = data.current || {};
      const daily = data.daily || {};
      const hourly = data.hourly || {};

      const code = curr.weather_code ?? 0;
      const [condText, icon] = WMO_CODES[code] || ["Clear", "sun"];

      const sunriseStr = daily.sunrise?.[0]?.split("T")?.[1] || "06:00";
      const sunsetStr = daily.sunset?.[0]?.split("T")?.[1] || "18:30";
      const uv = daily.uv_index_max?.[0] ?? 5.5;

      const forecastList = [];
      const daysCount = Math.min(7, (daily.time || []).length);
      for (let i = 0; i < daysCount; i++) {
        const dStr = daily.time[i];
        const dateObj = new Date(dStr);
        const dayName = i === 0 ? "Today" : dateObj.toLocaleDateString("en-US", { weekday: "short" });
        const c = daily.weather_code[i];
        const [cText, cIcon] = WMO_CODES[c] || ["Clear", "sun"];
        forecastList.push({
          day: dayName,
          date: dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          min_temp: Math.round(daily.temperature_2m_min[i] * 10) / 10,
          max_temp: Math.round(daily.temperature_2m_max[i] * 10) / 10,
          rain_probability: Math.round(daily.precipitation_probability_max?.[i] || 0),
          condition: cText,
          icon: cIcon,
          wind_speed: Math.round((daily.wind_speed_10m_max?.[i] || 12) * 10) / 10,
        });
      }

      const hourlyTimes = (hourly.time || []).slice(0, 24).map((t: string) => t.split("T")[1]?.slice(0, 5));
      const hourlyTemps = (hourly.temperature_2m || []).slice(0, 24);
      const hourlyHumidity = (hourly.relative_humidity_2m || []).slice(0, 24);
      const hourlyRain = (hourly.precipitation_probability || []).slice(0, 24);
      const hourlyWind = (hourly.wind_speed_10m || []).slice(0, 24);

      const now = new Date();
      const currentPayload = {
        location: locName,
        latitude: lat,
        longitude: lon,
        temperature: Math.round(curr.temperature_2m * 10) / 10,
        feels_like: Math.round((curr.apparent_temperature ?? curr.temperature_2m) * 10) / 10,
        humidity: Math.round(curr.relative_humidity_2m),
        wind_speed: Math.round(curr.wind_speed_10m * 10) / 10,
        wind_direction: curr.wind_direction_10m,
        pressure: Math.round(curr.surface_pressure * 10) / 10,
        uv_index: Math.round(uv * 10) / 10,
        weather_code: code,
        condition: condText,
        icon: icon,
        sunrise: sunriseStr,
        sunset: sunsetStr,
        visibility_km: 10.0,
        last_updated: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        is_demo: false,
        precipitation_mm: curr.precipitation || 0.0,
      };

      return {
        success: true,
        current: currentPayload,
        forecast: forecastList,
        hourly: {
          times: hourlyTimes,
          temperatures: hourlyTemps,
          humidity: hourlyHumidity,
          rain_probability: hourlyRain,
          wind_speeds: hourlyWind,
        },
      };
    }
  } catch (err) {
    console.error("Fetch weather error, defaulting to demo:", err);
  }

  return getDemoWeather(locName, lat, lon);
}

// Global cached context
let latestWeatherContext: any = null;

// ==========================================
// API ROUTES
// ==========================================

// 1. GET /api/weather
app.get("/api/weather", async (req: Request, res: Response) => {
  const city = req.query.city as string | undefined;
  const lat = req.query.lat as string | undefined;
  const lon = req.query.lon as string | undefined;
  const profile = (req.query.profile as string) || "General Citizen";

  const data = await fetchWeather(city, lat, lon);
  const safety = computeSafetyScore(data.current);
  const alerts = computeAlerts(data.current, profile);

  latestWeatherContext = {
    current: data.current,
    forecast: data.forecast,
    hourly: data.hourly,
    safety,
    alerts,
  };

  res.json({
    success: true,
    current: data.current,
    safety,
    alerts,
  });
});

// 2. GET /api/forecast
app.get("/api/forecast", async (req: Request, res: Response) => {
  const city = req.query.city as string | undefined;
  const lat = req.query.lat as string | undefined;
  const lon = req.query.lon as string | undefined;

  const data = await fetchWeather(city, lat, lon);
  res.json({
    success: true,
    location: data.current.location,
    forecast: data.forecast,
    hourly: data.hourly,
  });
});

// 3. POST /api/alerts
app.post("/api/alerts", (req: Request, res: Response) => {
  const profile = req.body.profile || "General Citizen";
  const current = req.body.current || latestWeatherContext?.current || getDemoWeather("New Delhi").current;
  const alerts = computeAlerts(current, profile);
  res.json({
    success: true,
    profile,
    alerts_count: alerts.length,
    alerts,
  });
});

// 4. POST /api/safety-score
app.post("/api/safety-score", (req: Request, res: Response) => {
  const current = req.body.current || latestWeatherContext?.current || getDemoWeather("New Delhi").current;
  const safety = computeSafetyScore(current);
  res.json({
    success: true,
    safety_score: safety,
  });
});

// 5. POST /api/chat - Gemini AI Weather Intelligence
app.post("/api/chat", async (req: Request, res: Response) => {
  const query = req.body.query?.trim() || "";
  const profile = req.body.profile || "General Citizen";
  const profileConfirmed = req.body.profileConfirmed === true;
  const userGeminiKey = req.body.userGeminiKey?.trim() || "";
  const userOpenRouterKey = req.body.userOpenRouterKey?.trim() || "";
  const language = req.body.language || "en";
  const weatherCtx = req.body.weather_context || latestWeatherContext || getDemoWeather("New Delhi");

  if (!query) {
    return res.status(400).json({ success: false, error: "Query is required" });
  }

  const curr = weatherCtx.current || {};
  const safety = weatherCtx.safety || computeSafetyScore(curr);
  const alerts = weatherCtx.alerts || [];
  const forecast = weatherCtx.forecast || [];

  const alertsStr = alerts.map((a: any) => `${a.severity}: ${a.title}`).join(", ") || "None";
  const forecastStr = forecast.slice(0, 4).map((f: any) => `${f.day} (${f.condition}, ${f.min_temp}-${f.max_temp}°C, Rain: ${f.rain_probability}%)`).join("; ");

  const profileInstruction = profileConfirmed
    ? `3. The user has explicitly selected their profile as '${profile}'. Tailor your recommendation to it, and briefly mention this profile by name in your response (e.g. start with "As a ${profile}," or the Hindi equivalent) so the user knows the advice is personalized for them.
   - Farmer: Focus on soil moisture, irrigation timing, pesticide wash-off risk, crop staking, livestock comfort.
   - Traveler: Focus on highway visibility, hydroplaning risk, transit delays, packing essentials.
   - Emergency Services: Focus on drainage surge, infrastructure vulnerability, power line hazards, priority staging.
   - General Citizen: Focus on daily commutes, outdoor activity suitability, health/hydration, umbrella necessity.`
    : `3. The user has NOT told you or selected which profile fits them (Farmer, Traveler, Emergency Services, or General Citizen) — do not assume '${profile}' is correct. If their question would benefit from profile-specific advice (e.g. farming, travel, emergency response), politely ask them which of these four profiles fits them best before giving detailed tailored advice, in one short line. If the question is generic and doesn't need a profile, just answer normally without asking.`;

  const systemInstruction = `You are 'WeatherWise AI', an expert meteorological intelligence assistant designed for hackathons and citizens worldwide.
You provide clear, accurate, conversational, and actionable weather guidance.
You remember and track the user's selected profile across the conversation — never forget it once it is confirmed.

STRICT OPERATIONAL RULES:
1. Base all statements about current or upcoming conditions strictly on the provided Meteorological Context. Do not hallucinate numbers or unmeasured live data.
2. Clearly distinguish between verified live observations and general preparedness advice.
${profileInstruction}
4. Multilingual Awareness:
   - If the user asks in Hindi (Devanagari) or Hinglish (e.g., 'Kal baarish hogi kya?'), respond naturally in Hindi (or clean Hinglish / Devanagari) while keeping numbers clear.
   - If the user asks in English, respond in articulate, modern English.
5. Keep responses SHORT and to the point: 2-4 sentences or up to 4 short bullet points maximum. No long paragraphs, no repeating the full weather data back unless the user specifically asked for a rundown. Answer only what was asked.
6. Never pad the response with generic filler ("stay safe", "let me know if you need more") unless it adds real value in one short line.`;

  const contextPrompt = `METEOROLOGICAL CONTEXT FOR LOCATION: ${curr.location || "Current Location"}:

- Current Condition: ${curr.condition || "Clear"}
- Temperature: ${curr.temperature || 25}°C (Feels like: ${curr.feels_like || 25}°C)
- Humidity: ${curr.humidity || 50}% | Wind Speed: ${curr.wind_speed || 10} km/h
- Pressure: ${curr.pressure || 1013} hPa | UV Index: ${curr.uv_index || 5}
- Active Alerts: ${alertsStr}
- Weather Safety Score: ${safety.score || 95}/100 (${safety.level || "Safe"})
- Safety Advisory: ${safety.advisory || "Normal"}
- 4-Day Forecast Glance: ${forecastStr}

USER PROFILE: ${profile}
PROFILE CONFIRMED: ${profileConfirmed ? "Yes" : "No"}
USER LANGUAGE: ${language}

USER QUESTION: "${query}"

Provide an immediate, well-structured, actionable response to the user's question using ONLY the meteorological data above for weather facts.`;
// Attempt Gemini API call via @google/genai SDK
  const ai = getGeminiClient(userGeminiKey);
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: contextPrompt,
                config: {
          systemInstruction,
          temperature: 0.4,
          maxOutputTokens: 700,
          thinkingConfig: {
            thinkingLevel: "LOW",
          },
        },
      });

      const aiText = response.text;
      if (aiText) {
        return res.json({
          success: true,
          query,
          profile,
          language,
          response: aiText.trim(),
        });
      }
    } catch (err) {
      console.error("Gemini SDK invocation error:", err);
    }
  }

  // Attempt OpenRouter as a backup when Gemini is rate-limited or unavailable (user's own key takes priority)
  const openRouterKey = userOpenRouterKey || process.env.OPENROUTER_API_KEY;
  if (openRouterKey && openRouterKey !== "MY_OPENROUTER_API_KEY") {
    try {
      const orResp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openRouterKey}`,
        },
        body: JSON.stringify({
          model: "openrouter/free",
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: contextPrompt },
          ],
          max_tokens: 400,
        }),
      });

      if (orResp.ok) {
        const orData: any = await orResp.json();
        const orText = orData?.choices?.[0]?.message?.content;
        if (orText) {
          return res.json({
            success: true,
            query,
            profile,
            language,
            response: orText.trim(),
          });
        }
      } else {
        console.error("OpenRouter API error:", orResp.status, await orResp.text());
      }
    } catch (err) {
      console.error("OpenRouter invocation error:", err);
    }
  }

  // High-Quality Rule-Based Weather Synthesizer Fallback
  const isHindi = /kya|kal|baarish|aaj|hogi|mausam|kaisa|tapman|chhatri|surakshit/i.test(query);
  const q = query.toLowerCase();
  const temp = curr.temperature ?? 25;
  const loc = curr.location || "your area";
  const cond = curr.condition || "Clear";
  const score = safety.score ?? 92;

  let fallbackResponse = "";

  if (/umbrella|rain|baarish|barsat|chhatri|wet|shower/i.test(q)) {
    const rainProb = forecast[0]?.rain_probability ?? 20;
    if (isHindi) {
      fallbackResponse = rainProb > 40
        ? `🌧️ **हाँ, छाता साथ रखना आवश्यक है!**\n\n• **${loc}** में बारिश की संभावना **${rainProb}%** है।\n• वर्तमान स्थिति: **${cond}** (तापमान ${temp}°C, नमी ${curr.humidity}%).\n• **${profile} सलाह:** जल-रोधी छाता या रेनकोट रखें।`
        : `☀️ **फिलहाल छाते की आवश्यकता नहीं है।**\n\n• **${loc}** में बारिश की संभावना केवल **${rainProb}%** है।\n• मौसम अधिकांशतः **${cond}** रहेगा (तापमान ${temp}°C)।\n• सेफ्टी स्कोर: **${score}/100** (${safety.level_hindi || "सुरक्षित"})।`;
    } else {
      fallbackResponse = rainProb > 40
        ? `🌧️ **Yes, carrying an umbrella is recommended!**\n\n• **Rain Probability:** ${rainProb}% in **${loc}**.\n• **Current Observation:** ${cond} at ${temp}°C with ${curr.humidity}% humidity.\n• **Advisory for ${profile}:** Wear waterproof gear and watch for surface puddles.`
        : `🌤️ **No umbrella required right now.**\n\n• **Precipitation Chance:** Only ${rainProb}% in **${loc}**.\n• **Current Observation:** ${cond} at ${temp}°C, wind speed ${curr.wind_speed} km/h.\n• **Weather Safety Score:** ${score}/100 (${safety.level}). Great conditions for routine outdoor plans!`;
    }
  } else if (/travel|safe|drive|trip|road|yatra|surakshit/i.test(q)) {
    if (isHindi) {
      fallbackResponse = `🚗 **यात्रा सुरक्षा समीक्षा (${loc}):**\n\n• **वेदर सेफ्टी स्कोर:** **${score}/100** (${safety.level_hindi || "सुरक्षित"})\n• **स्थिति:** ${cond}, तापमान ${temp}°C, हवा ${curr.wind_speed} किमी/घंटा।\n• **${profile} सुझाव:** ${safety.advisory_hindi || "सामान्य सावधानी के साथ यात्रा की जा सकती है।"}`;
    } else {
      fallbackResponse = `🛡️ **Travel Safety Assessment for ${loc}:**\n\n• **Weather Safety Score:** **${score}/100** (${safety.level})\n• **Atmospheric Conditions:** ${cond} at ${temp}°C, Wind ${curr.wind_speed} km/h.\n• **Tailored for ${profile}:** ${safety.advisory}\n• **Verdict:** ${score >= 75 ? "Safe for normal travel and commuting." : "Exercise caution on highways and monitor updates."}`;
    }
  } else if (/farm|crop|kisan|kheti|irrigation|spray|soil/i.test(q)) {
    if (isHindi) {
      fallbackResponse = `🌾 **किसान सलाहकार रिपोर्ट (${profile} मोड):**\n\n• **तापमान एवं नमी:** ${temp}°C | हवा में नमी: ${curr.humidity}%\n• **हवा की गति:** ${curr.wind_speed} किमी/घंटा (${curr.wind_speed > 20 ? "तेज़ हवा, कीटनाशक छिड़काव रोकें" : "छिड़काव के अनुकूल"})\n• **सिंचाई:** ${curr.precipitation_mm > 2 ? "वर्षा की संभावना है, सिंचाई रोकें" : "हल्की सिंचाई की जा सकती है"}.`;
    } else {
      fallbackResponse = `🌾 **Agricultural Intelligence Advisory (${profile} Mode):**\n\n• **Field Telemetry:** ${temp}°C ambient, ${curr.humidity}% relative humidity, wind ${curr.wind_speed} km/h.\n• **Spray Drift Window:** ${curr.wind_speed < 18 ? "Winds are calm. Optimal window for foliar spray." : "Elevated winds. Postpone chemical spraying."}\n• **Irrigation Guidance:** Soil moisture depletion is normal. Monitor incoming rainfall probability before operating borewells.`;
    }
  } else {
    if (isHindi) {
      fallbackResponse = `🌤️ **${loc} के लिए WeatherWise AI रिपोर्ट:**\n\n• मौसम वर्तमान में **${cond}** है, तापमान **${temp}°C** (महसूस: ${curr.feels_like}°C)।\n• **सेफ्टी स्कोर:** **${score}/100** (${safety.level_hindi || "सुरक्षित"})\n• **सलाह (${profile}):** ${safety.advisory_hindi || "दिन की योजना सामान्य रूप से बना सकते हैं।"}`;
    } else {
      fallbackResponse = `🌤️ **WeatherWise AI Intelligence Report for ${loc}:**\n\n• **Current Conditions:** **${cond}** at **${temp}°C** (Feels like **${curr.feels_like}°C**).\n• **Telemetry:** Wind ${curr.wind_speed} km/h | Humidity ${curr.humidity}% | UV Index ${curr.uv_index}.\n• **Weather Safety Score:** **${score}/100** (${safety.level}).\n• **Advisory for ${profile}:** ${safety.advisory}\n• Feel free to ask specific questions about rainfall timings, travel safety, or agricultural actions!`;
    }
  }

  res.json({
    success: true,
    query,
    profile,
    language,
    response: fallbackResponse,
  });
});

// 6. GET /api/climate
app.get("/api/climate", (req: Request, res: Response) => {
  res.json({
    success: true,
    monthly_temperature_averages: {
      months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      historical_baseline_c: [14.2, 17.5, 23.1, 29.4, 33.2, 33.8, 31.0, 29.8, 28.5, 25.4, 20.1, 15.3],
      current_year_observed_c: [15.1, 18.9, 24.5, 30.8, 34.1, 34.6, 31.8, 30.2, 29.1, 26.2, 21.0, 16.0],
    },
    rainfall_anomaly: {
      trend: "+12% monsoon precipitation surge",
      risk_period: "July - September",
      drought_resilience_rating: "Moderate",
    },
    climate_ai_summary:
      "Regional meteorological observation models show a +1.1°C upward baseline temperature deviation over the 10-year mean, accompanied by compressed, high-intensity monsoon convective rain bursts. Sustainable rainwater harvesting and thermal resilient crop variants are recommended.",
    disclaimer: "Sample baseline climate dataset for educational and hackathon presentation purposes.",
  });
});

// 7. GET /api/download-zip - Instant download for Python VS Code project
app.get("/api/download-zip", (req: Request, res: Response) => {
  const zipPath = path.join(process.cwd(), "public", "weatherwise-ai.zip");
  if (fs.existsSync(zipPath)) {
    res.download(zipPath, "weatherwise-ai.zip");
  } else {
    res.status(404).json({ error: "Project zip file not found" });
  }
});

// ==========================================
// VITE MIDDLEWARE & SERVER STARTUP
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`WeatherWise AI server running at http://0.0.0.0:${PORT}`);
  });
}
startServer();


