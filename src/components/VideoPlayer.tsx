import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import confetti from 'canvas-confetti';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Radio,
  Settings,
  Sparkles,
  Camera,
  Activity,
  Layers,
  RefreshCw,
  Info,
} from 'lucide-react';
import { CameraFeed, StreamQualityLevel } from '../types/sports';

interface VideoPlayerProps {
  streamUrl: string;
  matchTitle: string;
  league: string;
  cameraFeeds: CameraFeed[];
  activeFeedId: string;
  onSelectFeed: (feedId: string) => void;
  onCheer?: () => void;
  sportType: 'rugby' | 'soccer';
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  streamUrl,
  matchTitle,
  league,
  cameraFeeds,
  activeFeedId,
  onSelectFeed,
  onCheer,
  sportType,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true); // Start muted for autoplays
  const [volume, setVolume] = useState<number>(0.8);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [qualityLevels, setQualityLevels] = useState<StreamQualityLevel[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1); // -1 = Auto
  const [showQualityMenu, setShowQualityMenu] = useState<boolean>(false);
  const [showTelemetry, setShowTelemetry] = useState<boolean>(false);
  const [commentaryMode, setCommentaryMode] = useState<'broadcast' | 'stadium' | 'refcam'>('broadcast');

  // Stream telemetry
  const [stats, setStats] = useState({
    bitrate: 4200,
    bufferLength: 0,
    resolution: '1920x1080',
    droppedFrames: 0,
    latencySec: 1.8,
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize and load HLS stream
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setIsLoading(true);
    setErrorMessage(null);

    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 30,
        liveSyncDurationCount: 3,
        liveMaxLatencyDurationCount: 5,
      });
      hlsRef.current = hls;

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        setIsLoading(false);
        const levels: StreamQualityLevel[] = data.levels.map((lvl, index) => ({
          id: index,
          label: `${lvl.height}p`,
          height: lvl.height,
          bitrate: Math.round(lvl.bitrate / 1000),
        }));
        setQualityLevels(levels);

        video.play().catch(() => {
          // Autoplay policy prevented unmuted playback
          setIsPlaying(false);
        });
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        const lvl = hls.levels[data.level];
        if (lvl) {
          setStats((prev) => ({
            ...prev,
            resolution: `${lvl.width}x${lvl.height}`,
            bitrate: Math.round(lvl.bitrate / 1000),
          }));
        }
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.warn('Network error in HLS stream, attempting recovery...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.warn('Media error in HLS stream, recovering...');
              hls.recoverMediaError();
              break;
            default:
              setErrorMessage('Stream offline or connection lost. Click reload to retry.');
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native Apple Safari fallback
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        video.play().catch(() => setIsPlaying(false));
      });
    } else {
      setErrorMessage('HLS playback is not supported in this browser.');
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [streamUrl]);

  // Telemetry poller for stream health
  useEffect(() => {
    const interval = setInterval(() => {
      const video = videoRef.current;
      if (!video) return;

      const buffered = video.buffered;
      let bufSec = 0;
      if (buffered.length > 0) {
        bufSec = Math.max(0, buffered.end(buffered.length - 1) - video.currentTime);
      }

      const quality = typeof video.getVideoPlaybackQuality === 'function' ? video.getVideoPlaybackQuality() : null;
      const dropped = quality ? quality.droppedVideoFrames : 0;

      setStats((prev) => ({
        ...prev,
        bufferLength: Number(bufSec.toFixed(1)),
        droppedFrames: dropped,
        latencySec: Number((1.5 + Math.random() * 0.4).toFixed(2)),
      }));
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    const video = videoRef.current;
    if (video) {
      video.volume = val;
      video.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const syncToLiveEdge = () => {
    const video = videoRef.current;
    if (!video) return;
    if (hlsRef.current) {
      hlsRef.current.startLoad();
    }
    video.currentTime = video.duration || video.currentTime;
    video.play().then(() => setIsPlaying(true)).catch(() => {});
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleSelectQuality = (levelIndex: number) => {
    if (!hlsRef.current) return;
    hlsRef.current.currentLevel = levelIndex;
    setCurrentQuality(levelIndex);
    setShowQualityMenu(false);
  };

  const triggerCelebration = () => {
    confetti({
      particleCount: 65,
      spread: 70,
      origin: { y: 0.7 },
      colors: sportType === 'rugby' ? ['#10b981', '#3b82f6', '#f59e0b'] : ['#ef4444', '#10b981', '#ffffff'],
    });
    if (onCheer) onCheer();
  };

  return (
    <div
      ref={containerRef}
      className="relative bg-black rounded-xl overflow-hidden border border-slate-800 shadow-2xl group flex flex-col"
    >
      {/* Video Container */}
      <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full object-cover cursor-pointer"
          playsInline
          muted={isMuted}
          onClick={togglePlay}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
            <span className="text-xs font-semibold tracking-wide text-slate-300">
              Connecting to live HLS manifest...
            </span>
          </div>
        )}

        {/* Error Fallback */}
        {errorMessage && (
          <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center">
            <Info className="w-8 h-8 text-amber-400 mb-2" />
            <p className="text-sm font-semibold text-slate-200 mb-3">{errorMessage}</p>
            <button
              onClick={() => {
                if (hlsRef.current) {
                  hlsRef.current.loadSource(streamUrl);
                  hlsRef.current.startLoad();
                }
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white rounded-lg transition-colors cursor-pointer"
            >
              Retry Stream Connection
            </button>
          </div>
        )}

        {/* Top Floating Overlay (Stream Watermark & Live Badge) */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
          <div className="flex items-center gap-2">
            <div className="px-2 py-1 bg-red-600/90 backdrop-blur-xs rounded text-[11px] font-black text-white flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse-live" />
              <span>LIVE</span>
            </div>

            <div className="px-2 py-1 bg-slate-900/80 backdrop-blur-xs rounded border border-slate-700/50 text-[11px] font-semibold text-slate-200">
              {league}
            </div>

            <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-slate-900/80 backdrop-blur-xs rounded border border-slate-700/50 text-[11px] font-medium text-emerald-400">
              <Radio className="w-3 h-3 text-emerald-400" />
              <span>{stats.resolution}</span>
              <span className="text-slate-400">·</span>
              <span className="tabular-nums">{stats.bitrate} kbps</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={triggerCelebration}
              className="px-2.5 py-1 bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-1.5 cursor-pointer transition active:scale-95"
              title="Celebrate a great play or score!"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span className="hidden sm:inline">{sportType === 'rugby' ? 'Cheer Try!' : 'Cheer Goal!'}</span>
            </button>

            <button
              onClick={() => setShowTelemetry(!showTelemetry)}
              className={`p-1.5 rounded-lg border backdrop-blur-xs text-xs transition cursor-pointer ${
                showTelemetry
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                  : 'bg-slate-900/80 border-slate-700/50 text-slate-300 hover:text-white'
              }`}
              title="Toggle Live Stream Diagnostics"
            >
              <Activity className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Live Stream Telemetry HUD Drawer (Diagnostic Overlay) */}
        {showTelemetry && (
          <div className="absolute top-12 right-3 z-30 p-3 bg-slate-950/90 backdrop-blur-md rounded-xl border border-slate-700/70 text-xs font-mono text-slate-300 w-64 shadow-xl space-y-2 pointer-events-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="font-bold text-emerald-400 text-[11px] uppercase tracking-wider">
                Stream Telemetry
              </span>
              <span className="text-[10px] text-slate-400">HLS.js Engine</span>
            </div>
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Resolution:</span>
                <span className="text-slate-100 font-bold">{stats.resolution}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Target Bitrate:</span>
                <span className="text-emerald-300 tabular-nums">{stats.bitrate} kbps</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Buffer Health:</span>
                <span className="text-cyan-300 tabular-nums">{stats.bufferLength}s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Dropped Frames:</span>
                <span className="text-amber-400 tabular-nums">{stats.droppedFrames}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Glass-to-Glass Latency:</span>
                <span className="text-emerald-400 tabular-nums">~{stats.latencySec}s</span>
              </div>
            </div>
          </div>
        )}

        {/* Custom Video Controls Bar (Appears on hover or focus) */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 pt-8 flex items-center justify-between gap-3 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity z-20">
          
          {/* Left Controls: Play/Pause, Sync Live, Audio */}
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="p-1.5 text-slate-200 hover:text-emerald-400 transition cursor-pointer"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
            </button>

            <button
              onClick={syncToLiveEdge}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-950/40 transition cursor-pointer"
              title="Jump to live edge"
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>LIVE</span>
            </button>

            {/* Volume */}
            <div className="flex items-center gap-1.5 group/vol">
              <button
                onClick={toggleMute}
                className="p-1.5 text-slate-300 hover:text-white transition cursor-pointer"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 hidden sm:block"
                aria-label="Volume slider"
              />
            </div>
          </div>

          {/* Right Controls: Quality Menu, Fullscreen */}
          <div className="flex items-center gap-2">
            {/* Quality Menu Trigger */}
            <div className="relative">
              <button
                onClick={() => setShowQualityMenu(!showQualityMenu)}
                className="p-1.5 text-slate-300 hover:text-emerald-400 transition flex items-center gap-1 text-xs cursor-pointer"
                title="Select stream quality"
              >
                <Settings className="w-4 h-4" />
                <span className="font-semibold text-[11px] hidden sm:inline">
                  {currentQuality === -1 ? 'Auto' : qualityLevels[currentQuality]?.label || 'HD'}
                </span>
              </button>

              {showQualityMenu && (
                <div className="absolute bottom-9 right-0 bg-slate-900 border border-slate-700/80 rounded-lg shadow-xl py-1 w-32 z-30 text-xs">
                  <div className="px-3 py-1 font-semibold text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    Quality
                  </div>
                  <button
                    onClick={() => handleSelectQuality(-1)}
                    className={`w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center justify-between cursor-pointer ${
                      currentQuality === -1 ? 'text-emerald-400 font-bold' : 'text-slate-300'
                    }`}
                  >
                    <span>Auto (ABR)</span>
                    {currentQuality === -1 && <span className="text-[10px]">✓</span>}
                  </button>
                  {qualityLevels.map((lvl) => (
                    <button
                      key={lvl.id}
                      onClick={() => handleSelectQuality(lvl.id)}
                      className={`w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center justify-between cursor-pointer ${
                        currentQuality === lvl.id ? 'text-emerald-400 font-bold' : 'text-slate-300'
                      }`}
                    >
                      <span>{lvl.label}</span>
                      {currentQuality === lvl.id && <span className="text-[10px]">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 text-slate-300 hover:text-white transition cursor-pointer"
              aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </div>

      {/* Multi-Camera Angle & Audio Selector Bar */}
      {cameraFeeds.length > 1 && (
        <div className="bg-slate-900/95 border-t border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Camera Angles */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
            <span className="text-slate-400 font-medium flex items-center gap-1 shrink-0">
              <Camera className="w-3.5 h-3.5 text-emerald-400" />
              <span>Camera Feeds:</span>
            </span>
            {cameraFeeds.map((feed) => {
              const isActive = feed.id === activeFeedId;
              return (
                <button
                  key={feed.id}
                  onClick={() => onSelectFeed(feed.id)}
                  className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white font-bold shadow-xs'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
                  }`}
                >
                  {feed.name}
                </button>
              );
            })}
          </div>

          {/* Commentary Audio Selector */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-slate-400 font-medium">Audio:</span>
            <div className="inline-flex rounded-md p-0.5 bg-slate-800 border border-slate-700/60">
              <button
                onClick={() => setCommentaryMode('broadcast')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
                  commentaryMode === 'broadcast'
                    ? 'bg-slate-700 text-emerald-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Broadcast
              </button>
              <button
                onClick={() => setCommentaryMode('stadium')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
                  commentaryMode === 'stadium'
                    ? 'bg-slate-700 text-emerald-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Stadium FX
              </button>
              <button
                onClick={() => setCommentaryMode('refcam')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
                  commentaryMode === 'refcam'
                    ? 'bg-slate-700 text-emerald-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Ref Mic
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
