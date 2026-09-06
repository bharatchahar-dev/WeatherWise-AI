import React, { useEffect, useRef, useState } from "react";

interface YouTubeBackgroundProps {
  videoId?: string;
  blurAmount?: number;
}

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export const YouTubeBackground: React.FC<YouTubeBackgroundProps> = ({
  videoId = "1Y30sLKH1fA",
  blurAmount = 2.5,
}) => {
  const playerRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [embedRestricted, setEmbedRestricted] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Callback to initialize YouTube IFrame Player API
    const setupPlayer = () => {
      if (!window.YT || !window.YT.Player) return;
      if (playerRef.current) return;

      try {
        playerRef.current = new window.YT.Player("weatherwise-yt-bg-iframe", {
          events: {
            onReady: (event: any) => {
              if (!isMounted) return;
              try {
                // Ensure permanent mute and initiate playback
                event.target.mute();
                event.target.playVideo();
                setIsLoaded(true);
              } catch (err) {
                console.warn("YouTube autoplay call handled:", err);
              }
            },
            onStateChange: (event: any) => {
              if (!isMounted) return;
              // Seamless infinite loop restart on video completion (PlayerState.ENDED is 0)
              if (event.data === (window.YT?.PlayerState?.ENDED ?? 0)) {
                try {
                  event.target.seekTo(0);
                  event.target.playVideo();
                } catch (err) {
                  console.warn("YouTube loop restart handled:", err);
                }
              } else if (event.data === (window.YT?.PlayerState?.PLAYING ?? 1)) {
                setIsLoaded(true);
              }
            },
            onError: (event: any) => {
              console.warn("YouTube Player event code:", event.data);
              if (!isMounted) return;
              // Codes 101/150 indicate playback restriction in embedded players by video owner
              if (event.data === 101 || event.data === 150) {
                setEmbedRestricted(true);
              }
            },
          },
        });
      } catch (err) {
        console.warn("YouTube Player initialization handled:", err);
      }
    };

    // Inject YouTube IFrame API script if not already present
    if (!window.YT) {
      const existingScript = document.getElementById("youtube-iframe-api-script");
      if (!existingScript) {
        const tag = document.createElement("script");
        tag.id = "youtube-iframe-api-script";
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      }

      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        if (isMounted) setupPlayer();
      };
    } else {
      setupPlayer();
    }

    return () => {
      isMounted = false;
      try {
        if (playerRef.current && typeof playerRef.current.destroy === "function") {
          playerRef.current.destroy();
          playerRef.current = null;
        }
      } catch (err) {
        // Cleanup safety
      }
    };
  }, [videoId]);

  // Safe window origin parameter for YouTube postMessage API
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&playsinline=1&rel=0&modestbranding=1&enablejsapi=1&disablekb=1&iv_load_policy=3&origin=${encodeURIComponent(origin)}`;

  return (
    <div
      id="dashboard-video-bg-layer"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Layer 1: Global Full-Screen Upright YouTube Video (Original orientation, edge-to-edge cover, 0px blur, 0.95 opacity) */}
      <div
        id="youtube-video-wrapper"
        className="pointer-events-none absolute left-1/2 top-1/2 select-none overflow-hidden"
        style={{
          width: "max(105vw, calc(105vh * 16 / 9))",
          height: "max(105vh, calc(105vw * 9 / 16))",
          minWidth: "100vw",
          minHeight: "100vh",
          transform: "translate(-50%, -50%) scale(1.02)",
          transformOrigin: "center center",
          filter: `blur(${blurAmount}px) brightness(0.82) contrast(1.06) saturate(1.06)`,
          opacity: isLoaded ? 0.95 : 0.88,
          transition: "opacity 1.2s ease-in-out, filter 0.6s ease",
          willChange: "transform, filter",
        }}
      >
        <iframe
          id="weatherwise-yt-bg-iframe"
          title="WeatherWise Atmospheric Background Motion"
          src={embedUrl}
          className="pointer-events-none h-full w-full border-0 select-none"
          allow="autoplay; encrypted-media; picture-in-picture"
          tabIndex={-1}
          style={{
            pointerEvents: "none",
            border: 0,
            width: "100%",
            height: "100%",
          }}
        />
      </div>

      {/* Layer 2: Subtle Global Dark Ocean/Navy Nature Gradient Overlay (keeping blue video clearly recognizable) */}
      <div
        id="dashboard-video-overlay-layer"
        className="pointer-events-none fixed inset-0 z-[1] select-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(3, 18, 32, 0.22) 0%, rgba(5, 24, 38, 0.28) 50%, rgba(3, 16, 28, 0.38) 100%)",
        }}
      />

      {/* Informative notification if YouTube video embed policy is restricted by owner */}
      {embedRestricted && (
        <div
          id="youtube-embed-fallback-badge"
          className="pointer-events-none absolute bottom-4 right-4 z-[3] rounded-lg border border-slate-700/60 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-400 backdrop-blur-md"
        >
          <span>YouTube video owner restricted third-party iframe embedding • Dark atmospheric mode active</span>
        </div>
      )}
    </div>
  );
};
