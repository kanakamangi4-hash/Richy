import React, { useState } from 'react';
import { X, Server, Cloud, Smartphone, ShieldCheck, Database, Code2, Check, Copy } from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<'reactNative' | 'flutter' | 'webHls'>('reactNative');

  if (!isOpen) return null;

  const copySnippet = (text: string, tab: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(tab);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const codeSnippets = {
    reactNative: `// React Native / Expo (iOS & Android)
import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Video from 'react-native-video';

export default function SportsLivePlayer({ streamUrl }) {
  const playerRef = useRef(null);

  return (
    <View style={styles.container}>
      <Video
        source={{ uri: streamUrl, type: 'm3u8' }}
        ref={playerRef}
        style={styles.video}
        controls={true}
        resizeMode="contain"
        bufferConfig={{
          minBufferMs: 1500,
          maxBufferMs: 5000,
          bufferForPlaybackMs: 1000,
        }}
      />
    </View>
  );
}`,
    flutter: `// Flutter (Android, iOS & Smart TVs)
import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';

class LiveSportsScreen extends StatefulWidget {
  final String streamUrl;
  const LiveSportsScreen({Key? key, required this.streamUrl}) : super(key: key);

  @override
  _LiveSportsScreenState createState() => _LiveSportsScreenState();
}

class _LiveSportsScreenState extends State<LiveSportsScreen> {
  late VideoPlayerController _controller;

  @override
  void initState() {
    super.initState();
    _controller = VideoPlayerController.networkUrl(
      Uri.parse(widget.streamUrl),
      videoPlayerOptions: VideoPlayerOptions(mixWithOthers: true),
    )..initialize().then((_) {
        setState(() {});
        _controller.play();
      });
  }
}`,
    webHls: `// Web (Next.js / React with HLS.js)
import Hls from 'hls.js';

function setupHlsPlayer(videoElement, streamUrl) {
  if (Hls.isSupported()) {
    const hls = new Hls({
      lowLatencyMode: true,
      liveSyncDurationCount: 3,
    });
    hls.loadSource(streamUrl);
    hls.attachMedia(videoElement);
    hls.on(Hls.Events.MANIFEST_PARSED, () => videoElement.play());
  } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
    videoElement.src = streamUrl;
    videoElement.play();
  }
}`,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl max-w-4xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Server className="w-5 h-5 text-emerald-400" />
              <span>Live Sports Streaming Architecture</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Production pipeline for NRL, Super League, and high-concurrency sports broadcast
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scroll Body */}
        <div className="overflow-y-auto flex-1 py-4 space-y-6 text-xs text-slate-300">
          
          {/* Architecture Pipeline Flow Diagram */}
          <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800">
            <span className="font-bold text-emerald-400 uppercase tracking-wider block mb-3 text-[11px]">
              End-to-End Glass-to-Glass Pipeline
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700/60">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                  1
                </div>
                <div className="font-bold text-slate-200">OB Van / Feed</div>
                <div className="text-[11px] text-slate-400 mt-1">RTMP / SRT Protocol (1080p60 15Mbps)</div>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700/60">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                  2
                </div>
                <div className="font-bold text-slate-200">Cloud Transcoder</div>
                <div className="text-[11px] text-slate-400 mt-1">AWS IVS / Mux Video (ABR Transcoding)</div>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700/60">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                  3
                </div>
                <div className="font-bold text-slate-200">Global Edge CDN</div>
                <div className="text-[11px] text-slate-400 mt-1">CloudFront / Fastly (HLS / DASH Segments)</div>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700/60">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                  4
                </div>
                <div className="font-bold text-slate-200">Client Player</div>
                <div className="text-[11px] text-slate-400 mt-1">HLS.js / React Native Video (&lt;2s Latency)</div>
              </div>
            </div>
          </div>

          {/* Recommended Production Tech Stack */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-100 text-xs">
                <Cloud className="w-4 h-4 text-emerald-400" />
                <span>Live Streaming PaaS</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Do not maintain raw FFmpeg servers. Use <strong>AWS IVS (Interactive Video Service)</strong> or <strong>Mux Video</strong> for managed low-latency HLS ingest, sub-3s delivery, and global packaging.
              </p>
            </div>

            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-100 text-xs">
                <Database className="w-4 h-4 text-cyan-400" />
                <span>Live Sports Data APIs</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Connect <strong>Sportradar</strong>, <strong>Opta</strong>, or <strong>API-Sports (API-Football)</strong> to sync automated match clocks, scoreboards, and player telemetry via WebSockets.
              </p>
            </div>

            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-100 text-xs">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Broadcast Rights & DRM</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                NRL, Super League, and FIFA require commercial broadcast sub-licenses. For fan apps, start with official highlights, radio audio, and licensed feeds with FairPlay / Widevine DRM.
              </p>
            </div>
          </div>

          {/* Client Implementation Code Tabs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-slate-200">Mobile & Web Implementation</span>
              </div>

              {/* Code Tabs */}
              <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[11px]">
                <button
                  onClick={() => setActiveCodeTab('reactNative')}
                  className={`px-2.5 py-1 rounded transition cursor-pointer ${
                    activeCodeTab === 'reactNative' ? 'bg-slate-700 text-emerald-400 font-bold' : 'text-slate-400'
                  }`}
                >
                  React Native
                </button>
                <button
                  onClick={() => setActiveCodeTab('flutter')}
                  className={`px-2.5 py-1 rounded transition cursor-pointer ${
                    activeCodeTab === 'flutter' ? 'bg-slate-700 text-emerald-400 font-bold' : 'text-slate-400'
                  }`}
                >
                  Flutter
                </button>
                <button
                  onClick={() => setActiveCodeTab('webHls')}
                  className={`px-2.5 py-1 rounded transition cursor-pointer ${
                    activeCodeTab === 'webHls' ? 'bg-slate-700 text-emerald-400 font-bold' : 'text-slate-400'
                  }`}
                >
                  Web (HLS.js)
                </button>
              </div>
            </div>

            <div className="relative bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-[11px] overflow-x-auto text-slate-300">
              <button
                onClick={() => copySnippet(codeSnippets[activeCodeTab], activeCodeTab)}
                className="absolute top-3 right-3 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] flex items-center gap-1 cursor-pointer transition"
              >
                {copiedTab === activeCodeTab ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
              <pre>{codeSnippets[activeCodeTab]}</pre>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition cursor-pointer"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
