import React from "react";
import { ShieldAlert, Info } from "lucide-react";
import { SafetyScoreData, LanguageMode } from "../types";

interface Props {
  safety: SafetyScoreData;
  language: LanguageMode;
}

export const SafetyScoreCard: React.FC<Props> = ({ safety, language }) => {
  // SVG circular meter calculations
  // r=48 -> circumference = 2 * PI * 48 ≈ 301.6
  const circumference = 301.6;
  const strokeDashoffset = circumference - (safety.score / 100) * circumference;

  return (
    <div
      id="safety-score-card"
      className="glass-surface glass-surface-hover flex flex-col justify-between rounded-2xl p-6 transition-all duration-300"
      style={{
        background: "rgba(8, 28, 44, 0.55)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        border: "1px solid rgba(52, 211, 153, 0.18)",
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-teal-400" />
          <h3 className="text-sm font-semibold tracking-wide text-[#F1F7FA]">
            {language === "hi" ? "मौसम सुरक्षा स्कोर" : "Weather Safety Score"}
          </h3>
        </div>

        <span
          id="safety-level-pill"
          className="rounded-full px-2.5 py-0.5 text-xs font-bold backdrop-blur-md"
          style={{
            color: safety.color,
            backgroundColor: `${safety.color}18`,
            border: `1px solid ${safety.color}40`,
          }}
        >
          {language === "hi" ? safety.level_hindi : safety.level}
        </span>
      </div>

      {/* Circular Gauge Centerpiece */}
      <div className="my-4 flex items-center justify-center">
        <div className="relative flex h-36 w-36 items-center justify-center">
          <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="48"
              className="fill-none stroke-[rgba(100,220,255,0.12)]"
              strokeWidth="10"
            />
            <circle
              cx="60"
              cy="60"
              r="48"
              className="fill-none transition-all duration-1000 ease-out"
              stroke={safety.color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span id="safety-score-value" className="text-3xl font-extrabold tracking-tight text-[#F1F7FA]">
              {safety.score}
            </span>
            <span className="text-xs text-[#9FB3C8]">/ 100</span>
          </div>
        </div>
      </div>

      {/* Advisory & Deduction Chips */}
      <div>
        <p id="safety-advisory" className="text-xs leading-relaxed text-[#9FB3C8]">
          {language === "hi" ? safety.advisory_hindi : safety.advisory}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {safety.deductions.map((deduction, idx) => (
            <span
              key={idx}
              className="rounded-lg border border-[rgba(100,220,255,0.14)] bg-[rgba(7,24,39,0.55)] px-2.5 py-1 text-[11px] text-[#9FB3C8] backdrop-blur-md"
            >
              {deduction}
            </span>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-1 text-[10px] text-[#6F8799]">
          <Info className="h-3 w-3" />
          <span>{safety.disclaimer}</span>
        </div>
      </div>
    </div>
  );
};
