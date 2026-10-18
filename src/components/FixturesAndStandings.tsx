import React, { useState } from 'react';
import { Match, LeagueType, LeagueStanding } from '../types/sports';
import { Play, Calendar, Trophy, BarChart3, Clock } from 'lucide-react';

interface FixturesAndStandingsProps {
  matches: Match[];
  currentLeague: LeagueType;
  selectedMatchId: string;
  onSelectMatch: (match: Match) => void;
  standings: {
    nrl: LeagueStanding[];
    superLeague: LeagueStanding[];
    soccer: LeagueStanding[];
  };
}

export const FixturesAndStandings: React.FC<FixturesAndStandingsProps> = ({
  matches,
  currentLeague,
  selectedMatchId,
  onSelectMatch,
  standings,
}) => {
  const [viewFilter, setViewFilter] = useState<'fixtures' | 'standings'>('fixtures');
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'upcoming'>('all');

  const filteredMatches = matches.filter((m) => {
    // League filter
    if (currentLeague !== 'All' && m.league !== currentLeague) {
      return false;
    }
    // Status filter
    if (statusFilter === 'live' && !m.isLive) return false;
    if (statusFilter === 'upcoming' && m.isLive) return false;
    return true;
  });

  const getActiveStandings = (): { name: string; list: LeagueStanding[] } => {
    if (currentLeague === 'Super League') {
      return { name: 'Betfred Super League Standings', list: standings.superLeague };
    }
    if (currentLeague === 'Soccer') {
      return { name: 'Premier League Table', list: standings.soccer };
    }
    return { name: 'NRL Telstra Premiership Ladder', list: standings.nrl };
  };

  const activeStandings = getActiveStandings();

  return (
    <div className="space-y-6">
      
      {/* Top Filter Bar: Interactive segmented controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-800">
        
        {/* View Switcher: Matches vs Standings */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
          <button
            onClick={() => setViewFilter('fixtures')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              viewFilter === 'fixtures'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Fixtures & Replays</span>
          </button>
          <button
            onClick={() => setViewFilter('standings')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              viewFilter === 'standings'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>League Standings</span>
          </button>
        </div>

        {/* Secondary Status Filters (Only for Fixtures view) */}
        {viewFilter === 'fixtures' && (
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-slate-800 text-emerald-400 font-bold border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Matches
            </button>
            <button
              onClick={() => setStatusFilter('live')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                statusFilter === 'live'
                  ? 'bg-slate-800 text-emerald-400 font-bold border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Live Only
            </button>
            <button
              onClick={() => setStatusFilter('upcoming')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                statusFilter === 'upcoming'
                  ? 'bg-slate-800 text-emerald-400 font-bold border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Upcoming
            </button>
          </div>
        )}
      </div>

      {/* Fixtures Grid View */}
      {viewFilter === 'fixtures' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMatches.map((m) => {
            const isSelected = m.id === selectedMatchId;
            return (
              <div
                key={m.id}
                onClick={() => onSelectMatch(m)}
                className={`bg-[#111827] border rounded-xl overflow-hidden transition flex flex-col justify-between cursor-pointer group hover:border-slate-600 shadow-lg ${
                  isSelected ? 'border-emerald-500 ring-1 ring-emerald-500/50' : 'border-slate-800'
                }`}
              >
                {/* Match Card Thumbnail */}
                <div className="relative aspect-16/9 bg-slate-900 overflow-hidden">
                  <img
                    src={m.imageThumbnail}
                    alt={`${m.teamA.name} vs ${m.teamB.name}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-black/30 to-transparent" />

                  {/* Badges on Thumbnail */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between text-xs">
                    <span className="font-semibold text-white/90 text-[11px] drop-shadow-sm">
                      {m.league}
                    </span>
                    {m.isLive ? (
                      <span className="px-2 py-0.5 bg-red-600 rounded text-[10px] font-black text-white flex items-center gap-1 shadow-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-live" />
                        LIVE
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-900/80 backdrop-blur-xs rounded text-[10px] font-medium text-slate-300">
                        {m.period}
                      </span>
                    )}
                  </div>

                  {/* Play Action Overlay on Hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                    <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Match Card Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[11px] text-slate-400 block truncate mb-1.5">
                      {m.tournamentName}
                    </span>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3.5 h-3.5 rounded-sm flex items-center justify-center text-[8px] font-black text-white"
                            style={{ backgroundColor: m.teamA.color }}
                          >
                            {m.teamA.logoText.slice(0, 1)}
                          </span>
                          <span className="font-bold text-sm text-slate-200">{m.teamA.name}</span>
                        </div>
                        {m.isLive ? (
                          <span className="font-display font-bold text-base text-slate-100 tabular-nums">
                            {m.scoreA}
                          </span>
                        ) : null}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3.5 h-3.5 rounded-sm flex items-center justify-center text-[8px] font-black text-white"
                            style={{ backgroundColor: m.teamB.color }}
                          >
                            {m.teamB.logoText.slice(0, 1)}
                          </span>
                          <span className="font-bold text-sm text-slate-200">{m.teamB.name}</span>
                        </div>
                        {m.isLive ? (
                          <span className="font-display font-bold text-base text-slate-100 tabular-nums">
                            {m.scoreB}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* Footer Info */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    {m.isLive ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <Play className="w-3 h-3 fill-current" />
                        <span>Watch Live Stream</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{m.matchTime}</span>
                      </span>
                    )}

                    {isSelected && (
                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                        Playing
                      </span>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* Standings Table View */
        <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wide">
              {activeStandings.name}
            </h3>
            <span className="text-xs text-slate-400">2026 Season Official Ladder</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-4">Club</th>
                  <th className="py-2.5 px-3 text-center">P</th>
                  <th className="py-2.5 px-3 text-center">W</th>
                  <th className="py-2.5 px-3 text-center">D</th>
                  <th className="py-2.5 px-3 text-center">L</th>
                  <th className="py-2.5 px-3 text-center">Diff</th>
                  <th className="py-2.5 px-4 text-center">PTS</th>
                  <th className="py-2.5 px-4 text-center">Form</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {activeStandings.list.map((row) => (
                  <tr key={row.team} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-400 tabular-nums">
                      {row.position}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-100 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-slate-700" />
                      <span>{row.team}</span>
                    </td>
                    <td className="py-3 px-3 text-center tabular-nums text-slate-400">{row.played}</td>
                    <td className="py-3 px-3 text-center tabular-nums text-emerald-400 font-semibold">{row.won}</td>
                    <td className="py-3 px-3 text-center tabular-nums text-slate-400">{row.drawn}</td>
                    <td className="py-3 px-3 text-center tabular-nums text-red-400 font-semibold">{row.lost}</td>
                    <td className="py-3 px-3 text-center tabular-nums font-mono text-slate-300">
                      {row.differential > 0 ? `+${row.differential}` : row.differential}
                    </td>
                    <td className="py-3 px-4 text-center font-display font-bold text-sm text-slate-100 tabular-nums">
                      {row.points}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        {row.form.map((res, idx) => (
                          <span
                            key={idx}
                            className={`w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center text-white ${
                              res === 'W' ? 'bg-emerald-600' : res === 'D' ? 'bg-amber-600' : 'bg-red-600'
                            }`}
                          >
                            {res}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
