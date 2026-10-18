/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  INITIAL_MATCHES,
  NRL_STANDINGS,
  SUPER_LEAGUE_STANDINGS,
  SOCCER_STANDINGS,
  INITIAL_CHAT_MESSAGES,
} from './data/mockMatches';
import { Match, LeagueType, ChatMessage, MatchEvent } from './types/sports';
import { Navbar } from './components/Navbar';
import { VideoPlayer } from './components/VideoPlayer';
import { ScoreBoard } from './components/ScoreBoard';
import { MatchStats } from './components/MatchStats';
import { FanHub } from './components/FanHub';
import { FixturesAndStandings } from './components/FixturesAndStandings';
import { ArchitectureModal } from './components/ArchitectureModal';
import { CustomStreamModal } from './components/CustomStreamModal';
import confetti from 'canvas-confetti';
import { Radio, ShieldAlert } from 'lucide-react';

export default function App() {
  const [matches, setMatches] = useState<Match[]>(INITIAL_MATCHES);
  const [selectedMatch, setSelectedMatch] = useState<Match>(INITIAL_MATCHES[0]);
  const [activeFeedId, setActiveFeedId] = useState<string>('main');
  const [currentLeague, setCurrentLeague] = useState<LeagueType>('All');
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [hasVotedPoll, setHasVotedPoll] = useState<boolean>(false);
  const [viewerCount, setViewerCount] = useState<number>(selectedMatch.viewerCount);

  // Modals
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState<boolean>(false);
  const [isCustomStreamModalOpen, setIsCustomStreamModalOpen] = useState<boolean>(false);

  // Determine current active stream URL based on feed
  const activeFeed = selectedMatch.cameraFeeds.find((f) => f.id === activeFeedId);
  const currentStreamUrl = activeFeed ? activeFeed.streamUrl : selectedMatch.streamUrl;

  const isRugby =
    selectedMatch.league === 'NRL' ||
    selectedMatch.league === 'Super League' ||
    selectedMatch.league === 'RLWC';

  // Realistic viewer count fluctuation
  useEffect(() => {
    const timer = setInterval(() => {
      setViewerCount((prev) => {
        const delta = Math.floor(Math.random() * 21) - 10;
        return Math.max(1000, prev + delta);
      });
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Update viewer count when match changes
  const handleSelectMatch = (match: Match) => {
    setSelectedMatch(match);
    setActiveFeedId('main');
    setViewerCount(match.viewerCount || 54200);
    setHasVotedPoll(false);
  };

  // Switch camera feed
  const handleSelectFeed = (feedId: string) => {
    setActiveFeedId(feedId);
  };

  // Send message
  const handleSendMessage = (text: string) => {
    const newMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      user: 'You (Fan)',
      text,
      timestamp: selectedMatch.isLive ? 'Just now' : 'Pre-game',
      team: 'A',
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  // Vote on poll
  const handleVotePoll = (option: 'A' | 'B') => {
    setHasVotedPoll(true);
    setSelectedMatch((prev) => ({
      ...prev,
      poll: {
        ...prev.poll,
        votesA: option === 'A' ? prev.poll.votesA + 1 : prev.poll.votesA,
        votesB: option === 'B' ? prev.poll.votesB + 1 : prev.poll.votesB,
      },
    }));
  };

  // Cheer / Celebration
  const handleCheer = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.75 },
    });
  };

  // Simulate Score change
  const handleSimulateScore = (team: 'A' | 'B') => {
    const pointDelta = isRugby ? 4 : 1; // 4 points for a Rugby League try, 1 point for a Soccer goal
    const isTeamA = team === 'A';
    const scorer = isTeamA ? selectedMatch.teamA : selectedMatch.teamB;

    confetti({
      particleCount: 80,
      spread: 80,
      origin: { y: 0.6 },
    });

    const newEvent: MatchEvent = {
      id: `sim-${Date.now()}`,
      minute: 65,
      type: isRugby ? 'try' : 'goal',
      team,
      player: isTeamA ? 'Star Playmaker' : 'Captain',
      description: isRugby
        ? `Magnificent set play, breaking through tackle to touch down!`
        : `Brilliant finish inside the box into the top corner!`,
    };

    const updatedMatch: Match = {
      ...selectedMatch,
      scoreA: isTeamA ? selectedMatch.scoreA + pointDelta : selectedMatch.scoreA,
      scoreB: !isTeamA ? selectedMatch.scoreB + pointDelta : selectedMatch.scoreB,
      events: [newEvent, ...selectedMatch.events],
    };

    setSelectedMatch(updatedMatch);
    setMatches((prev) => prev.map((m) => (m.id === updatedMatch.id ? updatedMatch : m)));

    // Also push a live fan reaction message
    const cheerMsg: ChatMessage = {
      id: `cheer-${Date.now()}`,
      user: 'StreamBot',
      text: `🚨 ${isRugby ? 'TRY!' : 'GOAL!'} ${scorer.name} score! (+${pointDelta})`,
      timestamp: '65\'',
      team,
    };
    setMessages((prev) => [...prev, cheerMsg]);
  };

  // Apply custom stream URL
  const handleApplyCustomStream = (streamUrl: string, title?: string) => {
    const customMatch: Match = {
      ...selectedMatch,
      id: `custom-${Date.now()}`,
      tournamentName: title || 'Custom Video Test Stream',
      streamUrl,
      cameraFeeds: [
        { id: 'main', name: 'Direct Stream Feed', angle: 'Custom Ingest', streamUrl },
      ],
    };
    setSelectedMatch(customMatch);
    setActiveFeedId('main');
  };

  const liveMatches = matches.filter((m) => m.isLive);

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Navigation Top Bar */}
      <Navbar
        currentLeague={currentLeague}
        onSelectLeague={(league) => setCurrentLeague(league)}
        onOpenArchitecture={() => setIsArchitectureModalOpen(true)}
        onOpenCustomStream={() => setIsCustomStreamModalOpen(true)}
        liveMatchCount={liveMatches.length}
      />

      {/* Main Broadcast Hub Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-8">
        
        {/* Top Arena Layout: Video Player + Scoreboard + Fan Hub */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main Broadcast Player Column (7 Cols on LG) */}
          <div className="lg:col-span-8 space-y-5">
            {/* HLS Video Player */}
            <VideoPlayer
              streamUrl={currentStreamUrl}
              matchTitle={`${selectedMatch.teamA.name} vs ${selectedMatch.teamB.name}`}
              league={selectedMatch.league}
              cameraFeeds={selectedMatch.cameraFeeds}
              activeFeedId={activeFeedId}
              onSelectFeed={handleSelectFeed}
              onCheer={handleCheer}
              sportType={isRugby ? 'rugby' : 'soccer'}
            />

            {/* Scoreboard & Running Clock */}
            <ScoreBoard
              match={selectedMatch}
              onSimulateScore={handleSimulateScore}
              viewerCount={viewerCount}
            />

            {/* Match Telemetry & Metrics */}
            <MatchStats match={selectedMatch} />
          </div>

          {/* Right Column: Fan Hub (Chat & Commentary) + Quick Live Match Switcher (4 Cols) */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* Quick Live Channels Switcher */}
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <span className="font-bold text-slate-200 text-xs uppercase tracking-wide flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse-live" />
                  <span>Other Live Streams</span>
                </span>
                <span className="text-[11px] text-slate-400 font-medium">Click to switch</span>
              </div>

              <div className="space-y-2">
                {liveMatches.map((m) => {
                  const isCurrent = m.id === selectedMatch.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => handleSelectMatch(m)}
                      className={`w-full p-2.5 rounded-lg border text-left transition flex items-center justify-between cursor-pointer ${
                        isCurrent
                          ? 'bg-slate-800/90 border-emerald-500/60 shadow-sm'
                          : 'bg-slate-900/60 hover:bg-slate-800/60 border-slate-800'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5 text-[10px]">
                          <span className="font-bold text-emerald-400 uppercase tracking-wider">{m.league}</span>
                          <span aria-hidden="true" className="text-slate-500">·</span>
                          <span className="text-red-400 font-semibold">{m.period}</span>
                        </div>
                        <div className="font-semibold text-xs text-slate-200 truncate mt-0.5">
                          {m.teamA.shortName} vs {m.teamB.shortName}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-display font-bold text-sm text-slate-100 tabular-nums">
                          {m.scoreA} - {m.scoreB}
                        </div>
                        <div className="text-[10px] text-slate-400 tabular-nums">{m.matchTime}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Fan Hub (Chat, Timeline, Poll) */}
            <FanHub
              match={selectedMatch}
              messages={messages}
              onSendMessage={handleSendMessage}
              onVotePoll={handleVotePoll}
              hasVotedPoll={hasVotedPoll}
            />

          </div>

        </div>

        {/* Lower Section: Full Fixtures & Official League Standings */}
        <section className="pt-4">
          <FixturesAndStandings
            matches={matches}
            currentLeague={currentLeague}
            selectedMatchId={selectedMatch.id}
            onSelectMatch={handleSelectMatch}
            standings={{
              nrl: NRL_STANDINGS,
              superLeague: SUPER_LEAGUE_STANDINGS,
              soccer: SOCCER_STANDINGS,
            }}
          />
        </section>

      </main>

      {/* Broadcast Platform Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0b0f19] py-8 mt-12 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-200 font-display tracking-wider">
              PITCH<span className="text-emerald-400">STREAM</span>
            </span>
            <span aria-hidden="true">·</span>
            <span>Live Rugby League (NRL, Super League, RLWC) & Soccer Broadcast Hub</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <button
              onClick={() => setIsArchitectureModalOpen(true)}
              className="hover:text-emerald-400 transition cursor-pointer"
            >
              Streaming Architecture Guide
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsCustomStreamModalOpen(true)}
              className="hover:text-emerald-400 transition cursor-pointer"
            >
              Test HLS Stream (.m3u8)
            </button>
            <span aria-hidden="true">·</span>
            <span className="text-slate-600">Built for production low-latency scale</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ArchitectureModal
        isOpen={isArchitectureModalOpen}
        onClose={() => setIsArchitectureModalOpen(false)}
      />

      <CustomStreamModal
        isOpen={isCustomStreamModalOpen}
        onClose={() => setIsCustomStreamModalOpen(false)}
        onApplyStream={handleApplyCustomStream}
      />

    </div>
  );
}
