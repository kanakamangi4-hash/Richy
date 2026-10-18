import React from 'react';
import { LeagueType } from '../types/sports';
import { Tv, Radio, Cpu, PlusCircle } from 'lucide-react';

interface NavbarProps {
  currentLeague: LeagueType;
  onSelectLeague: (league: LeagueType) => void;
  onOpenArchitecture: () => void;
  onOpenCustomStream: () => void;
  liveMatchCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLeague,
  onSelectLeague,
  onOpenArchitecture,
  onOpenCustomStream,
  liveMatchCount,
}) => {
  const leagues: { id: LeagueType; label: string }[] = [
    { id: 'All', label: 'All Sports' },
    { id: 'NRL', label: 'NRL Premiership' },
    { id: 'Super League', label: 'Super League' },
    { id: 'RLWC', label: 'World Cup' },
    { id: 'Soccer', label: 'Premier Soccer' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0b0f19]/95 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onSelectLeague('All');
            }}
            className="flex items-center gap-2 group text-decoration-none"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/25 transition-colors">
              <Tv className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-lg font-black tracking-wider text-slate-100 font-display">
              PITCH<span className="text-emerald-400">STREAM</span>
            </span>
          </a>

          {liveMatchCount > 0 && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-400 font-medium ml-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse-live" />
              <span className="tabular-nums text-slate-300 font-semibold">{liveMatchCount}</span> Live Now
            </span>
          )}
        </div>

        {/* Zone 2: 4-5 clean single-line text navigation links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-400">
          {leagues.map((item) => {
            const isActive = currentLeague === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectLeague(item.id)}
                className={`transition-colors whitespace-nowrap shrink-0 py-1 cursor-pointer ${
                  isActive
                    ? 'text-emerald-400 font-bold border-b-2 border-emerald-400 -mb-[2px]'
                    : 'hover:text-slate-200'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary action button + Architecture modal button */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenArchitecture}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            title="Inspect Live Streaming Architecture & Tech Stack"
          >
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>Architecture</span>
          </button>

          <button
            onClick={onOpenCustomStream}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm shadow-emerald-900/40 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Test Stream URL</span>
          </button>
        </div>

      </div>

      {/* Mobile league scroll bar */}
      <div className="lg:hidden flex items-center gap-4 px-4 py-2 overflow-x-auto border-t border-slate-800/60 scrollbar-none text-xs font-medium text-slate-400 bg-slate-900/40">
        {leagues.map((item) => {
          const isActive = currentLeague === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectLeague(item.id)}
              className={`whitespace-nowrap shrink-0 py-1 transition-colors cursor-pointer ${
                isActive ? 'text-emerald-400 font-bold border-b border-emerald-400' : 'hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
