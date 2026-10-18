import React, { useState } from 'react';
import { Match, ChatMessage } from '../types/sports';
import { MessageSquare, ListOrdered, Send, ThumbsUp, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FanHubProps {
  match: Match;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onVotePoll: (option: 'A' | 'B') => void;
  hasVotedPoll: boolean;
}

export const FanHub: React.FC<FanHubProps> = ({
  match,
  messages,
  onSendMessage,
  onVotePoll,
  hasVotedPoll,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'timeline'>('chat');
  const [inputText, setInputText] = useState('');
  const [reactionCounts, setReactionCounts] = useState<{ [key: string]: number }>({
    '🔥': 142,
    '🏉': 88,
    '👏': 64,
    '🏆': 95,
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleReaction = (emoji: string) => {
    setReactionCounts((prev) => ({
      ...prev,
      [emoji]: (prev[emoji] || 0) + 1,
    }));
    confetti({
      particleCount: 15,
      spread: 45,
      origin: { y: 0.85, x: 0.8 },
      scalar: 0.8,
    });
  };

  const totalVotes = match.poll.votesA + match.poll.votesB;
  const pctA = totalVotes > 0 ? Math.round((match.poll.votesA / totalVotes) * 100) : 50;
  const pctB = 100 - pctA;

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-[520px]">
      
      {/* Top Header Tabs */}
      <div className="p-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
        <div className="inline-flex rounded-lg p-0.5 bg-slate-800/80 border border-slate-700/50">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-slate-700 text-emerald-400 font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Live Chat</span>
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
              activeTab === 'timeline'
                ? 'bg-slate-700 text-emerald-400 font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Commentary ({match.events.length})</span>
          </button>
        </div>

        {/* Reaction Bar */}
        <div className="flex items-center gap-1">
          {Object.entries(reactionCounts).map(([emoji, count]) => (
            <button
              key={emoji}
              onClick={() => handleReaction(emoji)}
              className="px-2 py-0.5 bg-slate-800/60 hover:bg-slate-700 border border-slate-700/50 rounded text-xs flex items-center gap-1 transition cursor-pointer active:scale-90"
              title={`React ${emoji}`}
            >
              <span>{emoji}</span>
              <span className="tabular-nums text-[10px] text-slate-400 font-medium">{count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {activeTab === 'chat' ? (
          <div className="space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className="text-xs space-y-0.5">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <span className="font-bold text-slate-200">{msg.user}</span>
                  {msg.team && (
                    <span
                      className="px-1 py-0.2 rounded text-[9px] font-black uppercase text-white"
                      style={{
                        backgroundColor: msg.team === 'A' ? match.teamA.color : match.teamB.color,
                      }}
                    >
                      {msg.team === 'A' ? match.teamA.shortName : match.teamB.shortName}
                    </span>
                  )}
                  <span aria-hidden="true">·</span>
                  <span className="text-[10px] tabular-nums">{msg.timestamp}</span>
                </div>
                <p className="text-slate-300 pl-1 leading-relaxed">{msg.text}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {match.events.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">
                No key incidents recorded yet. Match kickoff imminent.
              </p>
            ) : (
              match.events.map((evt) => {
                const isTeamA = evt.team === 'A';
                const team = isTeamA ? match.teamA : match.teamB;

                return (
                  <div
                    key={evt.id}
                    className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start gap-3"
                  >
                    <div className="text-xs font-mono font-bold text-emerald-400 pt-0.5 tabular-nums">
                      {evt.minute}&apos;
                    </div>
                    <div className="flex-1 text-xs">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-bold text-slate-200">{evt.player}</span>
                        <span
                          className="px-1 py-0.2 rounded text-[9px] font-black uppercase text-white"
                          style={{ backgroundColor: team.color }}
                        >
                          {team.shortName}
                        </span>
                        <span className="text-slate-400 font-semibold uppercase text-[10px]">
                          ({evt.type.replace('_', ' ')})
                        </span>
                      </div>
                      <p className="text-slate-400">{evt.description}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Fan Poll Section */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Fan Poll: {match.poll.question}</span>
          </span>
          <span className="text-[11px] text-slate-400 tabular-nums">{totalVotes} votes</span>
        </div>

        {hasVotedPoll ? (
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-[11px]">
              <span className="text-emerald-400 font-bold">{match.poll.optionA} ({pctA}%)</span>
              <span className="text-blue-400 font-bold">{match.poll.optionB} ({pctB}%)</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
              <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${pctA}%` }} />
              <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${pctB}%` }} />
            </div>
            <p className="text-[10px] text-slate-500 flex items-center gap-1 pt-0.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Vote submitted live!</span>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onVotePoll('A')}
              className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md text-xs font-semibold text-slate-200 transition cursor-pointer text-center truncate"
            >
              {match.poll.optionA}
            </button>
            <button
              onClick={() => onVotePoll('B')}
              className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md text-xs font-semibold text-slate-200 transition cursor-pointer text-center truncate"
            >
              {match.poll.optionB}
            </button>
          </div>
        )}
      </div>

      {/* Chat Input Field (Only in Chat tab) */}
      {activeTab === 'chat' && (
        <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Share your live thoughts with fans..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
          >
            <Send className="w-3 h-3" />
            <span>Send</span>
          </button>
        </form>
      )}

    </div>
  );
};
