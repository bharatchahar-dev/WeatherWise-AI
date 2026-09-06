export type UserProfile = "General Citizen" | "Farmer" | "Traveler" | "Emergency Services";

export type LanguageMode = "en" | "hi";

export interface WeatherCurrent {
  location: string;
  latitude: number;
  longitude: number;
  temperature: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  wind_direction: number;
  pressure: number;
  uv_index: number;
  weather_code: number;
  condition: string;
  icon: string;
  sunrise: string;
  sunset: string;
  visibility_km: number;
  last_updated: string;
  is_demo: boolean;
  precipitation_mm: number;
}

export interface ForecastDay {
  day: string;
  date: string;
  min_temp: number;
  max_temp: number;
  rain_probability: number;
  condition: string;
  icon: string;
  wind_speed: number;
}

export interface HourlyTrends {
  times: string[];
  temperatures: number[];
  humidity: number[];
  rain_probability: number[];
  wind_speeds: number[];
}

export interface SafetyScoreData {
  score: number;
  level: string;
  level_hindi: string;
  color: string;
  advisory: string;
  advisory_hindi: string;
  deductions: string[];
  subscores: {
    temperature_safety: number;
    wind_safety: number;
    rain_safety: number;
    atmospheric_safety: number;
  };
  disclaimer: string;
}

export interface WeatherAlert {
  id: string;
  type: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  title: string;
  title_hi: string;
  description: string;
  description_hi: string;
  recommendation: string;
  profile_action: string;
  icon: string;
  pulse: boolean;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
}

export interface ClimateData {
  monthly_temperature_averages: {
    months: string[];
    historical_baseline_c: number[];
    current_year_observed_c: number[];
  };
  rainfall_anomaly: {
    trend: string;
    risk_period: string;
    drought_resilience_rating: string;
  };
  climate_ai_summary: string;
  disclaimer: string;
}
