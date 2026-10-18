export type LeagueType = 'All' | 'NRL' | 'Super League' | 'RLWC' | 'Soccer';

export interface CameraFeed {
  id: string;
  name: string;
  angle: string;
  streamUrl: string;
}

export interface MatchEvent {
  id: string;
  minute: number;
  type: 'try' | 'conversion' | 'penalty_goal' | 'field_goal' | 'goal' | 'yellow_card' | 'red_card' | 'sub' | 'var';
  team: 'A' | 'B';
  player: string;
  description: string;
}

export interface MatchStats {
  possessionA: number; // percentage
  possessionB: number;
  completionRateA?: number; // percentage (Rugby)
  completionRateB?: number;
  tacklesA?: number;
  tacklesB?: number;
  runMetresA?: number;
  runMetresB?: number;
  lineBreaksA?: number;
  lineBreaksB?: number;
  errorsA?: number;
  errorsB?: number;
  shotsA?: number; // Soccer
  shotsB?: number;
  shotsOnTargetA?: number;
  shotsOnTargetB?: number;
  foulsA?: number;
  foulsB?: number;
  cornersA?: number;
  cornersB?: number;
}

export interface FanPoll {
  question: string;
  optionA: string;
  optionB: string;
  votesA: number;
  votesB: number;
}

export interface Match {
  id: string;
  league: 'NRL' | 'Super League' | 'RLWC' | 'Soccer';
  tournamentName: string;
  teamA: {
    name: string;
    shortName: string;
    color: string;
    logoText: string;
  };
  teamB: {
    name: string;
    shortName: string;
    color: string;
    logoText: string;
  };
  scoreA: number;
  scoreB: number;
  isLive: boolean;
  matchTime: string; // e.g. "64' 2nd Half" or "Kickoff: Tomorrow 7:30 PM"
  period: string; // "1st Half", "2nd Half", "Half Time", "Upcoming", "Full Time"
  venue: string;
  referee?: string;
  streamUrl: string;
  imageThumbnail: string;
  cameraFeeds: CameraFeed[];
  events: MatchEvent[];
  stats: MatchStats;
  poll: FanPoll;
  viewerCount: number;
}

export interface LeagueStanding {
  position: number;
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  points: number;
  differential: number;
  form: ('W' | 'L' | 'D')[];
}

export interface ChatMessage {
  id: string;
  user: string;
  badge?: string;
  text: string;
  timestamp: string;
  team?: 'A' | 'B';
}

export interface StreamQualityLevel {
  id: number;
  label: string;
  height: number;
  bitrate: number;
}
