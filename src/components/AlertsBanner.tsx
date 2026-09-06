import React from "react";
import { WeatherAlert, UserProfile, LanguageMode } from "../types";
import { WeatherIcon } from "./WeatherIcon";

interface Props {
  alerts: WeatherAlert[];
  profile: UserProfile;
  language: LanguageMode;
}

export const AlertsBanner: React.FC<Props> = ({ alerts, profile, language }) => {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div id="active-alerts-container" className="space-y-3">
      {alerts.map((alert) => {
        const isCritical = alert.severity === "CRITICAL";
        const isWarning = alert.severity === "WARNING";

        const borderClass = isCritical
          ? "border-red-500/40 bg-red-950/25 animate-alert-pulse"
          : isWarning
          ? "border-amber-500/35 bg-amber-950/25"
          : "border-teal-500/30 bg-teal-950/20";

        const tagClass = isCritical
          ? "bg-red-500/20 text-red-300 border border-red-500/40"
          : isWarning
          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
          : "bg-teal-500/20 text-teal-300 border border-teal-500/40";

        const iconColor = isCritical
          ? "text-red-400"
          : isWarning
          ? "text-amber-400"
          : "text-teal-400";

        return (
          <div
            key={alert.id}
            id={`alert-card-${alert.id}`}
            className={`flex flex-col gap-3 rounded-2xl border p-4 backdrop-blur-xl shadow-xl sm:flex-row sm:items-start ${borderClass} transition-all duration-300`}
            style={{
              boxShadow: "0 10px 30px -5px rgba(3, 15, 28, 0.45)",
            }}
          >
            <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-[rgba(100,220,255,0.15)] bg-[rgba(7,24,39,0.60)] backdrop-blur-md ${iconColor}`}>
              <WeatherIcon name={alert.icon} className="h-5 w-5" />
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-[#F1F7FA]">
                  {language === "hi" ? alert.title_hi : alert.title}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${tagClass}`}>
                  {alert.severity}
                </span>
              </div>

              <p className="mt-1 text-xs text-[#9FB3C8] leading-relaxed">
                {language === "hi" ? alert.description_hi : alert.description}
              </p>

              <div className="mt-2.5 rounded-xl border border-[rgba(100,220,255,0.12)] bg-[rgba(7,24,39,0.55)] p-2.5 text-xs text-[#F1F7FA] backdrop-blur-md">
                <span className="font-semibold text-cyan-300">
                  {profile} {language === "hi" ? "सलाह" : "Advisory"}:
                </span>{" "}
                {alert.profile_action}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
