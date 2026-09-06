import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, Mic, Sparkles, MapPin, User, Loader2, Settings, X } from "lucide-react";
import { ChatMessage, WeatherCurrent, ForecastDay, SafetyScoreData, WeatherAlert, UserProfile, LanguageMode } from "../types";
// Converts **bold** markdown into real bold text and keeps line breaks,
// instead of showing the raw ** symbols to the user.
function formatAIText(text: string) {
  const lines = text.split("\n");
  return lines.map((line, lineIndex) => {
    const segments = line.split(/(\*\*.*?\*\*)/g).filter((s) => s.length > 0);
    return (
      <React.Fragment key={lineIndex}>
        {segments.map((segment, segIndex) =>
          segment.startsWith("**") && segment.endsWith("**") ? (
            <strong key={segIndex} className="font-semibold text-cyan-200">
              {segment.slice(2, -2)}
            </strong>
          ) : (
            <span key={segIndex}>{segment}</span>
          )
        )}
        {lineIndex < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
}

interface Props {
  current: WeatherCurrent | null;
  forecast: ForecastDay[];
  safety: SafetyScoreData | null;
  alerts: WeatherAlert[];
  profile: UserProfile;
  profileConfirmed: boolean;
  language: LanguageMode;
}

export const ChatDrawer: React.FC<Props> = ({
  current,
  forecast,
  safety,
  alerts,
  profile,
  profileConfirmed,
  language,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "assistant",
      text:
        language === "hi"
          ? "नमस्ते! मैं आपका WeatherWise AI मौसम सहायक हूँ। मैं लाइव वायुमंडलीय डेटा, 7-दिवसीय पूर्वानुमान और सुरक्षा स्कोर पर नज़र रखता हूँ। आप मुझसे बारिश, यात्रा, खेती या दैनिक दिनचर्या से जुड़े सवाल हिंदी, अंग्रेज़ी या हिंग्लिश में पूछ सकते हैं!"
          : "Hello! I am your WeatherWise AI Meteorological Assistant. I monitor real-time weather telemetry, 7-day predictive models, and safety scores. Feel free to ask about travel safety, rain timings, or farming actions in English, Hindi, or Hinglish!",
      timestamp: "Just now",
    },
  ]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showKeySettings, setShowKeySettings] = useState(false);
  const [userGeminiKey, setUserGeminiKey] = useState(() => localStorage.getItem("ww_user_gemini_key") || "");
  const [userOpenRouterKey, setUserOpenRouterKey] = useState(() => localStorage.getItem("ww_user_openrouter_key") || "");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSaveKeys = () => {
    localStorage.setItem("ww_user_gemini_key", userGeminiKey.trim());
    localStorage.setItem("ww_user_openrouter_key", userOpenRouterKey.trim());
    setShowKeySettings(false);
  };

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: textToSend,
          profile,
          profileConfirmed,
          language,
          userGeminiKey,
          userOpenRouterKey,
          weather_context: {
            current,
            forecast,
            safety,
            alerts,
          },
        }),
      });

      const data = await resp.json();
      setIsTyping(false);

      if (data.success && data.response) {
        const assistantMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          sender: "assistant",
          text: data.response,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-err-${Date.now()}`,
            sender: "assistant",
            text: "Apologies, I encountered an issue analyzing the weather telemetry. Please try again.",
            timestamp: "Just now",
          },
        ]);
      }
    } catch (err) {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-err-${Date.now()}`,
          sender: "assistant",
          text: "Unable to communicate with the AI reasoning engine. Please check your network.",
          timestamp: "Just now",
        },
      ]);
    }
  };

  // Web Speech API Voice Recognition
  const toggleSpeech = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Web Speech API is not supported in this browser. Please type your message.");
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === "hi" ? "hi-IN" : "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsRecording(false);
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const suggestions = [
    { label: "🌧️ Will it rain tomorrow?", query: "Will it rain tomorrow?" },
    { label: "☂️ Should I carry an umbrella?", query: "Should I carry an umbrella today?" },
    { label: "🚗 Is it safe to travel?", query: "Is it safe to drive or travel right now?" },
    { label: "🇮🇳 Kal baarish hogi kya?", query: "Kal baarish hogi kya?" },
    { label: "🌾 Farmer advisory", query: "What are the agricultural recommendations for current weather?" },
  ];

  return (
    <div
      id="chat-view-container"
      className="flex h-[750px] flex-col overflow-hidden rounded-2xl border border-[rgba(100,220,255,0.15)] shadow-2xl backdrop-blur-xl"
      style={{
        background: "rgba(7, 24, 39, 0.60)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-[rgba(100,220,255,0.10)] bg-[rgba(10,32,50,0.45)] px-6 py-4">
        <div className="flex items-center gap-3">
          <div
            id="chat-header-ai-pfp"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/35 bg-slate-900/80 p-0.5 shadow-[0_0_20px_rgba(34,211,238,0.25)] overflow-hidden"
          >
            <img
              src="/assets/ai_assistant_pfp.jpg"
              alt="WeatherWise AI Assistant"
              className="h-full w-full object-cover rounded-lg"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold tracking-tight text-[#F1F7FA]">
                WeatherWise AI Conversational Assistant
              </h3>
              <span className="flex items-center gap-1 rounded-full border border-cyan-400/30 bg-cyan-500/15 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
                <Sparkles className="h-2.5 w-2.5" />
                Gemini 2.5
              </span>
            </div>
            <p className="text-xs text-[#9FB3C8]">
              Live-grounded meteorological intelligence • Multilingual
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1 rounded-full border border-[rgba(100,220,255,0.15)] bg-[rgba(7,24,39,0.50)] px-2.5 py-1 text-[#9FB3C8] backdrop-blur-md">
            <MapPin className="h-3 w-3 text-cyan-400" />
            {current?.location.split(",")[0] || "New Delhi"}
          </span>
          <span className="flex items-center gap-1 rounded-full border border-[rgba(100,220,255,0.15)] bg-[rgba(7,24,39,0.50)] px-2.5 py-1 text-[#9FB3C8] backdrop-blur-md">
            <User className="h-3 w-3 text-teal-400" />
            {profile}
          </span>
          <button
            id="chat-api-key-settings-btn"
            onClick={() => setShowKeySettings((v) => !v)}
            title="Apni API key add karo"
            className="flex items-center justify-center rounded-full border border-[rgba(100,220,255,0.15)] bg-[rgba(7,24,39,0.50)] p-1.5 text-[#9FB3C8] backdrop-blur-md transition-colors hover:text-cyan-300 hover:border-cyan-400/40"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {showKeySettings && (
        <div className="border-b border-[rgba(100,220,255,0.10)] bg-[rgba(6,20,33,0.55)] px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-[#F1F7FA]">Apni AI API key (optional)</p>
            <button onClick={() => setShowKeySettings(false)} className="text-[#9FB3C8] hover:text-white">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-[11px] text-[#9FB3C8] mb-3">
            Agar default AI limit khatam ho jaye, to yaha apni key daal do — sirf tumhare browser me save hogi, seedha AI ko jaayegi.
          </p>
          <div className="flex flex-col gap-2">
            <input
              type="password"
              value={userGeminiKey}
              onChange={(e) => setUserGeminiKey(e.target.value)}
              placeholder="Gemini API key (aistudio.google.com)"
              className="w-full rounded-lg border border-[rgba(100,220,255,0.15)] bg-[rgba(8,28,46,0.60)] px-3 py-2 text-xs text-[#F1F7FA] placeholder:text-[#5C7488] focus:outline-none focus:border-cyan-400/50"
            />
            <input
              type="password"
              value={userOpenRouterKey}
              onChange={(e) => setUserOpenRouterKey(e.target.value)}
              placeholder="OpenRouter API key (openrouter.ai)"
              className="w-full rounded-lg border border-[rgba(100,220,255,0.15)] bg-[rgba(8,28,46,0.60)] px-3 py-2 text-xs text-[#F1F7FA] placeholder:text-[#5C7488] focus:outline-none focus:border-cyan-400/50"
            />
            <button
              onClick={handleSaveKeys}
              className="mt-1 self-end rounded-lg bg-cyan-500/20 border border-cyan-400/40 px-4 py-1.5 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/30 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Suggested Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-[rgba(100,220,255,0.10)] bg-[rgba(6,20,33,0.35)] px-6 py-2.5 text-xs">
        <span className="flex-shrink-0 text-[#6F8799]">Ask:</span>
        {suggestions.map((s, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(s.query)}
            className="flex-shrink-0 rounded-full border border-[rgba(100,220,255,0.12)] bg-[rgba(7,24,39,0.55)] px-3 py-1 text-[#9FB3C8] transition-all hover:border-cyan-400/40 hover:bg-cyan-500/15 hover:text-cyan-200"
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 space-y-4 overflow-y-auto p-6">
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border overflow-hidden ${
                  isUser
                    ? "border-cyan-400/40 bg-cyan-500/20 text-cyan-300"
                    : "border-cyan-400/30 bg-slate-900 text-cyan-300"
                }`}
              >
                {isUser ? (
                  <User className="h-4 w-4" />
                ) : (
                  <img
                    src="/assets/ai_assistant_pfp.jpg"
                    alt="WeatherWise AI Assistant"
                    className="h-full w-full object-cover rounded-lg"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl border p-4 text-xs leading-relaxed backdrop-blur-md sm:text-sm ${
                  isUser
                    ? "border-cyan-400/30 bg-gradient-to-r from-sky-500/20 to-teal-500/20 text-[#F1F7FA] shadow-md"
                    : "border-[rgba(100,220,255,0.12)] bg-[rgba(8,28,46,0.60)] text-[#F1F7FA] shadow-md"
                }`}
              >
                <div className="mb-1 flex items-center justify-between gap-4">
                  <span className={`text-[11px] font-bold ${isUser ? "text-cyan-300" : "text-teal-300"}`}>
                    {isUser ? "You" : "WeatherWise AI"}
                  </span>
                  <span className="text-[10px] text-[#6F8799]">{msg.timestamp}</span>
                </div>
                <div className="whitespace-pre-wrap">{isUser ? msg.text : formatAIText(msg.text)}</div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-cyan-400/35 bg-slate-900 overflow-hidden">
              <img
                src="/assets/ai_assistant_pfp.jpg"
                alt="WeatherWise AI Assistant"
                className="h-full w-full object-cover rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-[rgba(100,220,255,0.12)] bg-[rgba(8,28,46,0.60)] px-4 py-2.5 text-xs text-[#9FB3C8] backdrop-blur-md">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" />
              <span>Analyzing atmospheric telemetry...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="border-t border-[rgba(100,220,255,0.12)] bg-[rgba(7,24,39,0.65)] p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <button
            type="button"
            onClick={toggleSpeech}
            id="voice-mic-btn"
            title="Speech to Text"
            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border transition-all ${
              isRecording
                ? "border-red-500 bg-red-500/20 text-red-400 animate-pulse"
                : "border-[rgba(100,220,255,0.15)] bg-[rgba(7,24,39,0.60)] text-[#9FB3C8] hover:border-cyan-400/40 hover:text-cyan-300"
            }`}
          >
            <Mic className="h-4 w-4" />
          </button>

          <input
            type="text"
            id="chat-input-field"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              language === "hi"
                ? "पूछिए: 'क्या कल बारिश होगी?' या 'छाता लेना चाहिए क्या?'..."
                : "Ask anything: 'Will it rain tomorrow?' or 'Is it safe to drive?'..."
            }
            className="flex-1 rounded-xl border border-[rgba(100,220,255,0.15)] bg-[rgba(5,18,30,0.60)] px-4 py-2.5 text-xs text-[#F1F7FA] placeholder-[#6F8799] outline-none transition-all backdrop-blur-md focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 sm:text-sm"
          />

          <button
            type="submit"
            id="chat-send-btn"
            disabled={!input.trim() || isTyping}
            className="btn-glass-primary flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-white transition-all disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
