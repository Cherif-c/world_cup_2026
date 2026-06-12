import type { MatchStatus } from "./types";

export interface MatchTeamStats {
  possession: number | null;
  shots: number | null;
  shotsOnTarget: number | null;
  corners: number | null;
  fouls: number | null;
  yellowCards: number | null;
  redCards: number | null;
  passes: number | null;
  passPct: number | null;
  saves: number | null;
  offsides: number | null;
  blockedShots: number | null;
  tackles: number | null;
  interceptions: number | null;
}

export interface MatchStatRow {
  key: string;
  label: string;
  home: number | null;
  away: number | null;
  /** Percentage bar (e.g. possession) */
  bar?: boolean;
}

export interface MatchEvent {
  id: string;
  minute: string;
  type: string;
  text: string;
  shortText: string;
  team: string | null;
  scoringPlay: boolean;
  period: number;
}

export type ShotOutcome =
  | "goal"
  | "on_target"
  | "off_target"
  | "blocked"
  | "other";

export interface MatchShot {
  id: string;
  x: number;
  y: number;
  outcome: ShotOutcome;
  teamSide: "home" | "away";
  teamName: string;
  minute: string;
  player: string | null;
  text: string;
}

export interface MatchDetail {
  matchId: string;
  eventId: string | null;
  home: string;
  away: string;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
  statusLabel: string;
  minute: number | null;
  date: string;
  venue: string | null;
  shotMapAvailable: boolean;
  homeStats: MatchTeamStats;
  awayStats: MatchTeamStats;
  statRows: MatchStatRow[];
  events: MatchEvent[];
  shots: MatchShot[];
  commentary: { minute: string; text: string }[];
  touchPoints: { x: number; y: number; side: "home" | "away" }[];
  updatedAt: string;
}
