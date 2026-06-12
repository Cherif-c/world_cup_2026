import { flattenMatches, type FlatMatch } from "@/data/matches";
import { teamsMatch } from "./team-api-names";
import type { LiveApiResponse, LiveMatchUpdate, MatchStatus } from "./types";

const API_BASE = "https://v3.football.api-sports.io";
const WC_LEAGUE = 1;
const WC_SEASON = 2026;

interface ApiFixture {
  fixture: {
    id: number;
    date: string;
    status: { short: string; long: string; elapsed: number | null };
  };
  goals: { home: number | null; away: number | null };
  teams: {
    home: { name: string };
    away: { name: string };
  };
}

let cache: { data: LiveApiResponse; expires: number } | null = null;

const LIVE_STATUS = new Set(["1H", "2H", "ET", "BT", "P", "LIVE", "INT"]);
const HT_STATUS = new Set(["HT"]);
const FINISHED_STATUS = new Set(["FT", "AET", "PEN"]);
const SCHEDULED_STATUS = new Set(["NS", "TBD"]);

function mapStatus(short: string): MatchStatus {
  if (LIVE_STATUS.has(short)) return "live";
  if (HT_STATUS.has(short)) return "halftime";
  if (FINISHED_STATUS.has(short)) return "finished";
  if (SCHEDULED_STATUS.has(short)) return "scheduled";
  if (short === "PST" || short === "CANC" || short === "ABD") return "postponed";
  return "unknown";
}

function statusLabel(short: string, elapsed: number | null): string {
  if (short === "HT") return "Mi-temps";
  if (LIVE_STATUS.has(short) && elapsed !== null) return `${elapsed}'`;
  if (short === "FT") return "Terminé";
  if (short === "AET") return "Prol. terminé";
  if (short === "PEN") return "Tirs au but";
  if (short === "NS") return "À venir";
  return short;
}

function sameDate(apiDate: string, ourDate: string): boolean {
  return apiDate.slice(0, 10) === ourDate;
}

function findApiFixture(
  fixtures: ApiFixture[],
  match: FlatMatch
): ApiFixture | undefined {
  return fixtures.find(
    (f) =>
      sameDate(f.fixture.date, match.date) &&
      teamsMatch(match.home, f.teams.home.name) &&
      teamsMatch(match.away, f.teams.away.name)
  );
}

function toUpdate(match: FlatMatch, fixture?: ApiFixture): LiveMatchUpdate {
  if (!fixture) {
    return {
      matchId: match.id,
      homeScore: match.result ? parseInt(match.result.split("-")[0]) : null,
      awayScore: match.result ? parseInt(match.result.split("-")[1]) : null,
      status: match.result ? "finished" : "scheduled",
      statusLabel: match.result ? "Terminé" : "À venir",
      minute: null,
      scoreText: match.result,
      fixtureId: null,
    };
  }

  const { short, elapsed } = fixture.fixture.status;
  const status = mapStatus(short);
  const home = fixture.goals.home;
  const away = fixture.goals.away;

  const hasScore = home !== null && away !== null;
  const scoreText = hasScore ? `${home}-${away}` : null;

  return {
    matchId: match.id,
    homeScore: home,
    awayScore: away,
    status,
    statusLabel: statusLabel(short, elapsed),
    minute: elapsed,
    scoreText:
      status === "finished" || status === "live" || status === "halftime"
        ? scoreText
        : match.result,
    fixtureId: fixture.fixture.id,
  };
}

async function fetchFixtures(apiKey: string): Promise<ApiFixture[]> {
  const from = "2026-06-11";
  const to = "2026-07-19";

  const url = new URL(`${API_BASE}/fixtures`);
  url.searchParams.set("league", String(WC_LEAGUE));
  url.searchParams.set("season", String(WC_SEASON));
  url.searchParams.set("from", from);
  url.searchParams.set("to", to);

  const res = await fetch(url.toString(), {
    headers: { "x-apisports-key": apiKey },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error(`API-Football ${res.status}: ${res.statusText}`);
  }

  const json = (await res.json()) as {
    response?: ApiFixture[];
    errors?: Record<string, string>;
  };

  if (json.errors && Object.keys(json.errors).length > 0) {
    throw new Error(JSON.stringify(json.errors));
  }

  return json.response ?? [];
}

function staticFallback(): LiveApiResponse {
  const matches = flattenMatches().map((m) => toUpdate(m));
  return {
    updatedAt: new Date().toISOString(),
    source: "static",
    configured: false,
    liveCount: 0,
    matches,
    error: "Clé API absente — ajoutez API_FOOTBALL_KEY dans .env.local",
  };
}

export async function getLiveScores(): Promise<LiveApiResponse> {
  const apiKey = process.env.API_FOOTBALL_KEY;

  if (!apiKey) {
    return staticFallback();
  }

  const hasLive = cache?.data.liveCount && cache.data.liveCount > 0;
  const ttl = hasLive ? 30_000 : 120_000;

  if (cache && Date.now() < cache.expires) {
    return cache.data;
  }

  try {
    const fixtures = await fetchFixtures(apiKey);
    const ourMatches = flattenMatches();

    const updates = ourMatches.map((m) => toUpdate(m, findApiFixture(fixtures, m)));
    const liveCount = updates.filter(
      (u) => u.status === "live" || u.status === "halftime"
    ).length;

    const data: LiveApiResponse = {
      updatedAt: new Date().toISOString(),
      source: "api-football",
      configured: true,
      liveCount,
      matches: updates,
    };

    cache = { data, expires: Date.now() + ttl };
    return data;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur API";
    const fallback = staticFallback();
    return { ...fallback, configured: true, error: message };
  }
}
