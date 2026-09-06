import React from "react";
import {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudLightning,
  Snowflake,
  Wind,
  Droplets,
  AlertTriangle,
  Flame,
  CheckCircle,
  Zap,
} from "lucide-react";

interface WeatherIconProps {
  name: string;
  className?: string;
  id?: string;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ name, className = "w-6 h-6", id }) => {
  switch (name) {
    case "sun":
      return <Sun id={id} className={className} />;
    case "cloud-sun":
      return <CloudSun id={id} className={className} />;
    case "cloud":
      return <Cloud id={id} className={className} />;
    case "cloud-fog":
      return <CloudFog id={id} className={className} />;
    case "cloud-drizzle":
      return <CloudDrizzle id={id} className={className} />;
    case "cloud-rain":
    case "cloud-rain-wind":
      return <CloudRain id={id} className={className} />;
    case "cloud-lightning":
    case "zap":
      return <CloudLightning id={id} className={className} />;
    case "snowflake":
    case "cloud-snow":
      return <Snowflake id={id} className={className} />;
    case "wind":
      return <Wind id={id} className={className} />;
    case "droplets":
    case "droplet":
      return <Droplets id={id} className={className} />;
    case "flame":
      return <Flame id={id} className={className} />;
    case "alert-triangle":
      return <AlertTriangle id={id} className={className} />;
    case "check-circle":
      return <CheckCircle id={id} className={className} />;
    default:
      return <CloudSun id={id} className={className} />;
  }
};
