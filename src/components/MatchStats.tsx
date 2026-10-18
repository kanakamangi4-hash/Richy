import React from 'react';
import { Match } from '../types/sports';

interface MatchStatsProps {
  match: Match;
}

export const MatchStats: React.FC<MatchStatsProps> = ({ match }) => {
  const { stats, teamA, teamB, league } = match;
  const isRugby = league === 'NRL' || league === 'Super League' || league === 'RLWC';

  const renderComparisonBar = (label: string, valA: number, valB: number, unit = '') => {
    const total = valA + valB;
    const pctA = total > 0 ? (valA / total) * 100 : 50;
    const pctB = 100 - pctA;

    return (
      <div className="space-y-1.5 py-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-200 tabular-nums">
            {valA}{unit}
          </span>
          <span className="text-slate-400 font-medium">{label}</span>
          <span className="font-bold text-slate-200 tabular-nums">
            {valB}{unit}
          </span>
        </div>
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
          <div
            className="h-full transition-all duration-500 rounded-l-full"
            style={{ width: `${pctA}%`, backgroundColor: teamA.color || '#10b981' }}
          />
          <div
            className="h-full transition-all duration-500 rounded-r-full"
            style={{ width: `${pctB}%`, backgroundColor: teamB.color || '#3b82f6' }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xl">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wide">
          {isRugby ? 'Match Telemetry & Metrics' : 'Live Match Statistics'}
        </h3>
        <span className="text-xs text-slate-400">Official Data Feed</span>
      </div>

      <div className="space-y-3">
        {/* Possession */}
        {renderComparisonBar('Possession', stats.possessionA, stats.possessionB, '%')}

        {isRugby ? (
          <>
            {stats.completionRateA !== undefined && stats.completionRateB !== undefined &&
              renderComparisonBar('Completion Rate', stats.completionRateA, stats.completionRateB, '%')}
            {stats.runMetresA !== undefined && stats.runMetresB !== undefined &&
              renderComparisonBar('Run Metres', stats.runMetresA, stats.runMetresB, 'm')}
            {stats.tacklesA !== undefined && stats.tacklesB !== undefined &&
              renderComparisonBar('Total Tackles', stats.tacklesA, stats.tacklesB)}
            {stats.lineBreaksA !== undefined && stats.lineBreaksB !== undefined &&
              renderComparisonBar('Line Breaks', stats.lineBreaksA, stats.lineBreaksB)}
            {stats.errorsA !== undefined && stats.errorsB !== undefined &&
              renderComparisonBar('Handled Errors', stats.errorsA, stats.errorsB)}
          </>
        ) : (
          <>
            {stats.shotsA !== undefined && stats.shotsB !== undefined &&
              renderComparisonBar('Total Shots', stats.shotsA, stats.shotsB)}
            {stats.shotsOnTargetA !== undefined && stats.shotsOnTargetB !== undefined &&
              renderComparisonBar('Shots on Target', stats.shotsOnTargetA, stats.shotsOnTargetB)}
            {stats.cornersA !== undefined && stats.cornersB !== undefined &&
              renderComparisonBar('Corner Kicks', stats.cornersA, stats.cornersB)}
            {stats.foulsA !== undefined && stats.foulsB !== undefined &&
              renderComparisonBar('Fouls Committed', stats.foulsA, stats.foulsB)}
          </>
        )}
      </div>
    </div>
  );
};
