import React from 'react';
import { Match } from '../types/sports';
import { MapPin, User, Users, Flame } from 'lucide-react';

interface ScoreBoardProps {
  match: Match;
  onSimulateScore: (scoringTeam: 'A' | 'B') => void;
  viewerCount: number;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  match,
  onSimulateScore,
  viewerCount,
}) => {
  const isRugby = match.league === 'NRL' || match.league === 'Super League' || match.league === 'RLWC';

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xl">
      {/* Top Metadata Row: Unboxed clean text with separators (Zero-Pill compliant) */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-emerald-400 uppercase tracking-wider">{match.league}</span>
          <span aria-hidden="true">·</span>
          <span className="text-slate-300 font-medium">{match.tournamentName}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <span>{match.venue}</span>
          </div>
          {match.referee && (
            <>
              <span aria-hidden="true" className="hidden sm:inline">·</span>
              <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Ref: {match.referee}</span>
              </div>
            </>
          )}
          <span aria-hidden="true">·</span>
          <div className="flex items-center gap-1.5 text-slate-300">
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span className="tabular-nums font-semibold">{viewerCount.toLocaleString()}</span>
            <span className="hidden sm:inline">watching</span>
          </div>
        </div>
      </div>

      {/* Main Scoreboard Arena */}
      <div className="grid grid-cols-1 md:grid-cols-7 items-center gap-4 py-2">
        
        {/* Team A */}
        <div className="md:col-span-3 flex items-center justify-start md:justify-end gap-3.5 order-1 md:order-1">
          <div className="text-left md:text-right">
            <h2 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight">
              {match.teamA.name}
            </h2>
            <span className="text-xs text-slate-400 font-medium">Home Squad</span>
          </div>
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center font-display font-black text-lg text-white shadow-md shrink-0 border border-white/10"
            style={{ backgroundColor: match.teamA.color }}
          >
            {match.teamA.logoText}
          </div>
        </div>

        {/* Center Score & Match Clock */}
        <div className="md:col-span-1 flex flex-col items-center justify-center text-center order-2 md:order-2 py-1 md:py-0">
          <div className="flex items-center gap-3 font-display font-black text-3xl sm:text-4xl text-slate-100 tabular-nums tracking-wider">
            <span>{match.scoreA}</span>
            <span className="text-slate-600 font-light">-</span>
            <span>{match.scoreB}</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
            {match.isLive ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse-live" />
                <span className="tabular-nums">{match.matchTime}</span>
              </>
            ) : (
              <span className="text-slate-400">{match.matchTime}</span>
            )}
          </div>
        </div>

        {/* Team B */}
        <div className="md:col-span-3 flex items-center justify-start gap-3.5 order-3 md:order-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center font-display font-black text-lg text-white shadow-md shrink-0 border border-white/10"
            style={{ backgroundColor: match.teamB.color }}
          >
            {match.teamB.logoText}
          </div>
          <div className="text-left">
            <h2 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight">
              {match.teamB.name}
            </h2>
            <span className="text-xs text-slate-400 font-medium">Away Squad</span>
          </div>
        </div>

      </div>

      {/* Real-time simulation bar */}
      {match.isLive && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Flame className="w-4 h-4 text-amber-400" />
            <span className="font-medium">Live Action Simulation:</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSimulateScore('A')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md font-medium transition cursor-pointer active:scale-95"
            >
              + {isRugby ? '4 pt Try' : 'Goal'} for {match.teamA.shortName}
            </button>
            <button
              onClick={() => onSimulateScore('B')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md font-medium transition cursor-pointer active:scale-95"
            >
              + {isRugby ? '4 pt Try' : 'Goal'} for {match.teamB.shortName}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
