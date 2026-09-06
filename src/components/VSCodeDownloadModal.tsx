import React from "react";
import { Download, Terminal, X, Check, Code, FolderArchive } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const VSCodeDownloadModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xl">
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-[rgba(100,220,255,0.20)] p-6 shadow-2xl backdrop-blur-2xl"
        style={{
          background: "rgba(7, 24, 39, 0.88)",
          boxShadow: "0 25px 60px -15px rgba(3, 15, 28, 0.9), 0 0 40px rgba(56, 189, 248, 0.15)",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(100,220,255,0.15)] bg-[rgba(7,24,39,0.60)] text-[#9FB3C8] transition-colors hover:text-[#F1F7FA]"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-400/35 bg-cyan-500/15 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.25)]">
            <FolderArchive className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#F1F7FA]">WeatherWise AI — Python VS Code Package</h3>
            <p className="text-xs text-[#9FB3C8]">Complete full-stack Flask + Vanilla JS codebase ready for local hackathon execution.</p>
          </div>
        </div>

        {/* 1-Click Download Button */}
        <div className="mt-6 flex flex-col gap-3 rounded-xl border border-cyan-400/30 bg-gradient-to-r from-sky-950/40 to-teal-950/40 p-4 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="block text-sm font-bold text-cyan-300">Download Complete Project Archive</span>
            <span className="text-xs text-[#9FB3C8]">Includes app.py, requirements.txt, templates/, static/, and services/</span>
          </div>
          <a
            href="/api/download-zip"
            download="weatherwise-ai.zip"
            className="btn-glass-primary flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white transition-all"
          >
            <Download className="h-4 w-4" />
            <span>Download ZIP</span>
          </a>
        </div>

        {/* Step-by-step setup terminal instructions */}
        <div className="mt-6 space-y-3">
          <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-300">
            <Terminal className="h-4 w-4 text-cyan-400" />
            <span>Quick Start Commands in VS Code</span>
          </h4>

          <div className="space-y-2 rounded-xl border border-[rgba(100,220,255,0.12)] bg-[rgba(4,14,24,0.85)] p-4 font-mono text-xs backdrop-blur-md">
            <div className="text-[#6F8799]"># 1. Unzip the project & open terminal in VS Code:</div>
            <div className="text-cyan-300">cd weatherwise-ai</div>

            <div className="pt-2 text-[#6F8799]"># 2. Create and activate virtual environment:</div>
            <div className="text-[#F1F7FA]">python -m venv venv</div>
            <div className="text-[#9FB3C8]">source venv/bin/activate  <span className="text-[#6F8799]"># On macOS / Linux</span></div>
            <div className="text-[#9FB3C8]">venv\Scripts\activate      <span className="text-[#6F8799]"># On Windows</span></div>

            <div className="pt-2 text-[#6F8799]"># 3. Install dependencies:</div>
            <div className="text-teal-300">pip install -r requirements.txt</div>

            <div className="pt-2 text-[#6F8799]"># 4. Copy .env template & set your Gemini API key:</div>
            <div className="text-[#F1F7FA]">cp .env.example .env</div>

            <div className="pt-2 text-[#6F8799]"># 5. Launch the local Flask server:</div>
            <div className="text-cyan-300 font-bold">python app.py</div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-[rgba(100,220,255,0.12)] pt-4 text-xs text-[#9FB3C8]">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-teal-400" />
            <span>Tested on Python 3.10+ & all modern browsers</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-[rgba(100,220,255,0.15)] bg-[rgba(7,24,39,0.60)] px-4 py-1.5 text-[#9FB3C8] hover:text-[#F1F7FA]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
