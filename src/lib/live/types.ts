export type MatchStatus =
  | "scheduled"
  | "live"
  | "halftime"
  | "finished"
  | "postponed"
  | "unknown";

export interface LiveMatchUpdate {
  matchId: string;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
  statusLabel: string;
  minute: number | null;
  scoreText: string | null;
  fixtureId: number | null;
}

export interface LiveApiResponse {
  updatedAt: string;
  source: "api-football" | "static";
  configured: boolean;
  liveCount: number;
  matches: LiveMatchUpdate[];
  error?: string;
}
