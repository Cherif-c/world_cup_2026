import { FIXTURES } from "@/data/fixtures";
import {
  fetchEspnFixtures,
  findEspnFixture,
  type EspnFixture,
} from "./espn";
import type {
  MatchDetail,
  MatchEvent,
  MatchShot,
  MatchStatRow,
  MatchTeamStats,
  ShotOutcome,
} from "./match-detail-types";
import type { MatchStatus } from "./types";

const ESPN_SUMMARY =
  "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary";
const ESPN_PLAYS =
  "https://sports.core.api.espn.com/v2/sports/soccer/leagues/fifa.world/events";

interface EspnStat {
  name: string;
  displayValue: string;
  label: string;
}

interface EspnCompetition {
  id: string;
  date: string;
  venue?: { fullName?: string };
  status: {
    displayClock: string;
    type: {
      state: "pre" | "in" | "post";
      description: string;
      completed: boolean;
    };
  };
  competitors: {
    homeAway: "home" | "away";
    score: string;
    team: { displayName: string; id?: string; uid?: string };
  }[];
  shotMapAvailable?: boolean;
}

interface EspnSummaryJson {
  header?: {
    competitions?: EspnCompetition[];
  };
  boxscore?: {
    teams?: {
      homeAway: "home" | "away";
      team: { displayName: string };
      statistics?: EspnStat[];
    }[];
  };
  keyEvents?: {
    id: string;
    type?: { text?: string; type?: string };
    text?: string;
    shortText?: string;
    period?: { number: number };
    clock?: { displayValue: string };
    team?: { displayName: string };
    scoringPlay?: boolean;
    participants?: { athlete?: { displayName: string } }[];
  }[];
  commentary?: { time?: { displayValue?: string }; text?: string }[];
}

interface EspnPlayListItem {
  id: string;
  type?: { text?: string; type?: string };
  text?: string;
  shortText?: string;
  fieldPositionX?: number;
  fieldPositionY?: number;
  fieldPosition2X?: number;
  fieldPosition2Y?: number;
  goalPositionY?: number;
  period?: { number: number };
  clock?: { displayValue: string };
  scoringPlay?: boolean;
  team?: { $ref?: string };
  participants?: {
    athlete?: { displayName?: string };
    type?: string;
  }[];
}

interface EspnPlaysPage {
  count: number;
  pageCount: number;
  items?: EspnPlayListItem[];
}

const STAT_MAP: Record<keyof MatchTeamStats, string> = {
  possession: "possessionPct",
  shots: "totalShots",
  shotsOnTarget: "shotsOnTarget",
  corners: "wonCorners",
  fouls: "foulsCommitted",
  yellowCards: "yellowCards",
  redCards: "redCards",
  passes: "totalPasses",
  passPct: "passPct",
  saves: "saves",
  offsides: "offsides",
  blockedShots: "blockedShots",
  tackles: "totalTackles",
  interceptions: "interceptions",
};

function parseNum(val: string | undefined): number | null {
  if (val == null || val === "") return null;
  const n = parseFloat(val.replace("%", "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function parseTeamStats(stats: EspnStat[] | undefined): MatchTeamStats {
  const byName = new Map(stats?.map((s) => [s.name, s.displayValue]) ?? []);
  const out = {} as MatchTeamStats;
  for (const [key, espnName] of Object.entries(STAT_MAP) as [
    keyof MatchTeamStats,
    string,
  ][]) {
    out[key] = parseNum(byName.get(espnName));
  }
  return out;
}

function mapStatus(comp: EspnCompetition): {
  status: MatchStatus;
  label: string;
  minute: number | null;
} {
  const { type, displayClock } = comp.status;
  const clock = displayClock ?? "";
  const minuteMatch = clock.match(/^(\d+)/);
  const minute = minuteMatch ? parseInt(minuteMatch[1], 10) : null;

  if (type.state === "pre") {
    return { status: "scheduled", label: "À venir", minute: null };
  }
  const desc = type.description.toLowerCase();
  if (desc.includes("half") && type.state === "in") {
    return { status: "halftime", label: "Mi-temps", minute };
  }
  if (type.state === "in") {
    return {
      status: "live",
      label: clock || "LIVE",
      minute,
    };
  }
  if (type.state === "post" || type.completed) {
    return { status: "finished", label: "Terminé", minute: 90 };
  }
  return { status: "unknown", label: type.description, minute };
}

function buildStatRows(
  home: MatchTeamStats,
  away: MatchTeamStats
): MatchStatRow[] {
  const rows: Omit<MatchStatRow, "home" | "away">[] = [
    { key: "possession", label: "Possession", bar: true },
    { key: "shots", label: "Tirs" },
    { key: "shotsOnTarget", label: "Tirs cadrés" },
    { key: "blockedShots", label: "Tirs bloqués" },
    { key: "corners", label: "Corners" },
    { key: "fouls", label: "Fautes" },
    { key: "offsides", label: "Hors-jeu" },
    { key: "passes", label: "Passes" },
    { key: "passPct", label: "Précision passes", bar: true },
    { key: "tackles", label: "Tacles" },
    { key: "interceptions", label: "Interceptions" },
    { key: "saves", label: "Arrêts" },
    { key: "yellowCards", label: "Cartons jaunes" },
    { key: "redCards", label: "Cartons rouges" },
  ];

  return rows.map(({ key, label, bar }) => ({
    key,
    label,
    bar,
    home: home[key as keyof MatchTeamStats],
    away: away[key as keyof MatchTeamStats],
  }));
}

function parseEvents(json: EspnSummaryJson): MatchEvent[] {
  return (json.keyEvents ?? [])
    .filter((e) => {
      const t = e.type?.type ?? "";
      return (
        t.includes("goal") ||
        t.includes("card") ||
        t === "substitution" ||
        t === "halftime" ||
        t === "start-2nd-half"
      );
    })
    .map((e) => ({
      id: e.id,
      minute: e.clock?.displayValue || "—",
      type: e.type?.text ?? "Événement",
      text: e.text ?? e.shortText ?? "",
      shortText: e.shortText ?? "",
      team: e.team?.displayName ?? null,
      scoringPlay: e.scoringPlay ?? false,
      period: e.period?.number ?? 1,
    }));
}

function shotOutcome(type: string | undefined): ShotOutcome {
  const t = (type ?? "").toLowerCase();
  if (t.includes("goal")) return "goal";
  if (t.includes("on-target") || t.includes("on target")) return "on_target";
  if (t.includes("off-target") || t.includes("off target")) return "off_target";
  if (t.includes("blocked")) return "blocked";
  return "other";
}

function isShotPlay(type: string | undefined): boolean {
  const t = (type ?? "").toLowerCase();
  return (
    t.includes("shot") ||
    t === "goal" ||
    t === "goal---header" ||
    t.includes("goal-")
  );
}

function teamIdFromRef(ref?: string): string | null {
  if (!ref) return null;
  const m = ref.match(/\/teams\/(\d+)/);
  return m ? m[1] : null;
}

async function fetchPlayPages(eventId: string): Promise<EspnPlayListItem[]> {
  const base = `${ESPN_PLAYS}/${eventId}/competitions/${eventId}/plays?limit=300`;
  const first = (await (await fetch(base, { cache: "no-store" })).json()) as EspnPlaysPage;
  const items = [...(first.items ?? [])];
  const pageCount = first.pageCount ?? 1;

  if (pageCount > 1) {
    const pages = await Promise.all(
      Array.from({ length: pageCount - 1 }, (_, i) =>
        fetch(`${base}&page=${i + 2}`, { cache: "no-store" }).then(
          (r) => r.json() as Promise<EspnPlaysPage>
        )
      )
    );
    for (const page of pages) items.push(...(page.items ?? []));
  }

  return items;
}

function sideFromTeamRef(
  ref: string | undefined,
  homeTeamId: string | null,
  awayTeamId: string | null
): "home" | "away" | null {
  const id = teamIdFromRef(ref);
  if (!id) return null;
  if (homeTeamId && id === homeTeamId) return "home";
  if (awayTeamId && id === awayTeamId) return "away";
  return null;
}

function parseShotsFromPlays(
  plays: EspnPlayListItem[],
  homeTeamId: string | null,
  awayTeamId: string | null,
  homeName: string,
  awayName: string
): MatchShot[] {
  const shots: MatchShot[] = [];

  for (const p of plays) {
    if (!isShotPlay(p.type?.type)) continue;
    const x = p.fieldPositionX ?? p.fieldPosition2X;
    const y = p.fieldPositionY ?? p.fieldPosition2Y ?? p.goalPositionY;
    if (x == null || y == null) continue;

    const side = sideFromTeamRef(p.team?.$ref, homeTeamId, awayTeamId);
    if (!side) continue;

    const shooter = p.participants?.find((pt) => pt.type === "shooter")?.athlete
      ?.displayName;

    shots.push({
      id: p.id,
      x,
      y,
      outcome: shotOutcome(p.type?.type),
      teamSide: side,
      teamName: side === "home" ? homeName : awayName,
      minute: p.clock?.displayValue ?? "—",
      player: shooter ?? null,
      text: p.shortText ?? p.text ?? "",
    });
  }

  return shots;
}

/** Touch points for heatmap (passes, carries, shots…) */
export function parseTouchPoints(
  plays: EspnPlayListItem[],
  homeTeamId: string | null,
  awayTeamId: string | null,
  filterSide?: "home" | "away" | "all"
): { x: number; y: number; side: "home" | "away" }[] {
  const touches: { x: number; y: number; side: "home" | "away" }[] = [];
  const skip = new Set(["kickoff", "halftime", "start-2nd-half", "end-regular-time"]);

  for (const p of plays) {
    const t = p.type?.type ?? "";
    if (skip.has(t)) continue;
    const x = p.fieldPositionX;
    const y = p.fieldPositionY;
    if (x == null || y == null) continue;
    const side = sideFromTeamRef(p.team?.$ref, homeTeamId, awayTeamId);
    if (!side) continue;
    if (filterSide && filterSide !== "all" && side !== filterSide) continue;
    touches.push({ x, y, side });
  }

  return touches;
}

function emptyDetail(matchId: string): MatchDetail {
  const fixture = FIXTURES.find((f) => f.id === matchId);
  return {
    matchId,
    eventId: null,
    home: fixture?.home ?? "—",
    away: fixture?.away ?? "—",
    homeScore: null,
    awayScore: null,
    status: "scheduled",
    statusLabel: "À venir",
    minute: null,
    date: fixture?.date ?? "",
    venue: fixture?.venue ?? null,
    shotMapAvailable: false,
    homeStats: parseTeamStats(undefined),
    awayStats: parseTeamStats(undefined),
    statRows: [],
    events: [],
    shots: [],
    commentary: [],
    touchPoints: [],
    updatedAt: new Date().toISOString(),
  };
}

export async function fetchMatchPitchData(matchId: string): Promise<{
  shots: MatchShot[];
  touchPoints: { x: number; y: number; side: "home" | "away" }[];
  shotMapAvailable: boolean;
}> {
  const fixture = FIXTURES.find((f) => f.id === matchId);
  if (!fixture) throw new Error(`Match inconnu: ${matchId}`);

  const all = await fetchEspnFixtures();
  const fx = findEspnFixture(all, {
    id: fixture.id,
    home: fixture.home,
    away: fixture.away,
    date: fixture.date,
    result: null,
  });
  if (!fx) {
    return { shots: [], touchPoints: [], shotMapAvailable: false };
  }

  const summaryRes = await fetch(`${ESPN_SUMMARY}?event=${fx.eventId}`, {
    cache: "no-store",
  });
  if (!summaryRes.ok) throw new Error(`ESPN summary ${summaryRes.status}`);

  const json = (await summaryRes.json()) as EspnSummaryJson;
  const comp = json.header?.competitions?.[0];
  if (!comp) {
    return { shots: [], touchPoints: [], shotMapAvailable: false };
  }

  const homeComp = comp.competitors.find((c) => c.homeAway === "home");
  const awayComp = comp.competitors.find((c) => c.homeAway === "away");
  const homeId = homeComp?.team.id ?? extractIdFromUid(homeComp?.team.uid);
  const awayId = awayComp?.team.id ?? extractIdFromUid(awayComp?.team.uid);

  const plays = await fetchPlayPages(fx.eventId);
  const shots = parseShotsFromPlays(
    plays,
    homeId,
    awayId,
    fixture.home,
    fixture.away
  );
  const touchPoints = parseTouchPoints(plays, homeId, awayId);

  return {
    shots,
    touchPoints,
    shotMapAvailable: comp.shotMapAvailable ?? shots.length > 0,
  };
}

export async function fetchMatchDetail(
  matchId: string,
  options?: { includePitch?: boolean; espnFixture?: EspnFixture }
): Promise<MatchDetail> {
  const includePitch = options?.includePitch ?? true;
  const fixture = FIXTURES.find((f) => f.id === matchId);
  if (!fixture) {
    throw new Error(`Match inconnu: ${matchId}`);
  }

  let fx = options?.espnFixture;
  if (!fx) {
    const all = await fetchEspnFixtures();
    fx = findEspnFixture(all, {
      id: fixture.id,
      home: fixture.home,
      away: fixture.away,
      date: fixture.date,
      result: null,
    });
  }

  if (!fx) {
    return {
      ...emptyDetail(matchId),
      home: fixture.home,
      away: fixture.away,
      date: fixture.date,
      venue: fixture.venue,
    };
  }

  const summaryRes = await fetch(`${ESPN_SUMMARY}?event=${fx.eventId}`, {
    cache: "no-store",
  });
  if (!summaryRes.ok) {
    throw new Error(`ESPN summary ${summaryRes.status}`);
  }

  const json = (await summaryRes.json()) as EspnSummaryJson;
  const comp = json.header?.competitions?.[0];
  if (!comp) {
    return {
      ...emptyDetail(matchId),
      home: fixture.home,
      away: fixture.away,
      date: fixture.date,
      venue: fixture.venue,
    };
  }

  const homeComp = comp.competitors.find((c) => c.homeAway === "home");
  const awayComp = comp.competitors.find((c) => c.homeAway === "away");
  const homeTeam = json.boxscore?.teams?.find((t) => t.homeAway === "home");
  const awayTeam = json.boxscore?.teams?.find((t) => t.homeAway === "away");

  const homeStats = parseTeamStats(homeTeam?.statistics);
  const awayStats = parseTeamStats(awayTeam?.statistics);
  const { status, label, minute } = mapStatus(comp);

  const showScore =
    status === "finished" || status === "live" || status === "halftime";

  let shots: MatchShot[] = [];
  let touchPoints: { x: number; y: number; side: "home" | "away" }[] = [];

  const homeId =
    homeComp?.team.id ?? extractIdFromUid(homeComp?.team.uid);
  const awayId =
    awayComp?.team.id ?? extractIdFromUid(awayComp?.team.uid);

  if (
    includePitch &&
    (comp.shotMapAvailable || status !== "scheduled")
  ) {
    try {
      const plays = await fetchPlayPages(fx.eventId);
      shots = parseShotsFromPlays(
        plays,
        homeId,
        awayId,
        fixture.home,
        fixture.away
      );
      touchPoints = parseTouchPoints(plays, homeId, awayId);
    } catch {
      shots = [];
      touchPoints = [];
    }
  }

  return {
    matchId,
    eventId: fx.eventId,
    home: fixture.home,
    away: fixture.away,
    homeScore: showScore ? parseInt(homeComp?.score ?? "0", 10) : null,
    awayScore: showScore ? parseInt(awayComp?.score ?? "0", 10) : null,
    status,
    statusLabel: label,
    minute,
    date: fixture.date,
    venue: comp.venue?.fullName ?? fixture.venue,
    shotMapAvailable: comp.shotMapAvailable ?? shots.length > 0,
    homeStats,
    awayStats,
    statRows: buildStatRows(homeStats, awayStats),
    events: parseEvents(json),
    shots,
    commentary: (json.commentary ?? [])
      .filter((c) => c.text && c.text.length > 10)
      .slice(-40)
      .reverse()
      .map((c) => ({
        minute: c.time?.displayValue ?? "—",
        text: c.text ?? "",
      })),
    touchPoints,
    updatedAt: new Date().toISOString(),
  };
}

function extractIdFromUid(uid?: string): string | null {
  if (!uid) return null;
  const m = uid.match(/~t:(\d+)/);
  return m ? m[1] : null;
}
