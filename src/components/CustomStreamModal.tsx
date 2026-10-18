import React, { useState } from 'react';
import { X, Play, Radio, CheckCircle, ExternalLink } from 'lucide-react';
import { TEST_HLS_STREAMS } from '../data/mockMatches';

interface CustomStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyStream: (streamUrl: string, title?: string) => void;
}

export const CustomStreamModal: React.FC<CustomStreamModalProps> = ({
  isOpen,
  onClose,
  onApplyStream,
}) => {
  const [customUrl, setCustomUrl] = useState('');
  const [streamLabel, setStreamLabel] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) {
      setError('Please provide a valid stream URL (.m3u8 or .mp4)');
      return;
    }
    setError(null);
    onApplyStream(customUrl.trim(), streamLabel.trim() || 'Custom Live Feed');
    onClose();
  };

  const handleSelectPreset = (url: string, name: string) => {
    setCustomUrl(url);
    setStreamLabel(name);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-slate-100">Test Custom Stream Feed</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Live Stream URL (HLS / m3u8 / mp4)
            </label>
            <input
              type="url"
              value={customUrl}
              onChange={(e) => {
                setCustomUrl(e.target.value);
                if (error) setError(null);
              }}
              placeholder="https://your-domain.com/live/stream.m3u8"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono text-xs"
            />
            {error && <p className="text-red-400 mt-1 text-[11px]">{error}</p>}
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Feed Label / Match Title (Optional)
            </label>
            <input
              type="text"
              value={streamLabel}
              onChange={(e) => setStreamLabel(e.target.value)}
              placeholder="e.g. My Test Camera / High Tactical Feed"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs"
            />
          </div>

          {/* Quick Presets */}
          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Verified Public Test Feeds
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSelectPreset(TEST_HLS_STREAMS.muxTest, 'Mux Low-Latency ABR')}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition cursor-pointer group"
              >
                <div className="font-bold text-slate-200 group-hover:text-emerald-400">Mux Official</div>
                <div className="text-[10px] text-slate-500 truncate">Multi-bitrate 1080p ABR</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset(TEST_HLS_STREAMS.akamaiTest, 'Akamai CDN Stream')}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition cursor-pointer group"
              >
                <div className="font-bold text-slate-200 group-hover:text-emerald-400">Akamai Live</div>
                <div className="text-[10px] text-slate-500 truncate">CPH Edge Master HLS</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset(TEST_HLS_STREAMS.bigBuckBunny, 'Bunny Multi-Bitrate')}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition cursor-pointer group"
              >
                <div className="font-bold text-slate-200 group-hover:text-emerald-400">Big Buck Bunny</div>
                <div className="text-[10px] text-slate-500 truncate">PTS Shift Master ABR</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset(TEST_HLS_STREAMS.tearsOfSteel, 'Tears of Steel 4K')}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition cursor-pointer group"
              >
                <div className="font-bold text-slate-200 group-hover:text-emerald-400">Tears of Steel</div>
                <div className="text-[10px] text-slate-500 truncate">Unified Streaming 4K/HD</div>
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Load Stream</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
