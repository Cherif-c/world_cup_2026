import { flattenMatches, MATCH_DAYS, type FlatMatch } from "@/data/matches";
import { teamsMatch } from "./team-api-names";
import type { LiveApiResponse, LiveMatchUpdate, MatchStatus } from "./types";

const API_BASE = "https://v3.football.api-sports.io";
const WC_LEAGUE_ID = 1;
/** Fenêtre accessible plan gratuit (étendue par API-Football au fil du tournoi) */
const FREE_DATE_MIN = "2026-06-11";
const FREE_DATE_MAX = "2026-06-13";

interface ApiFixture {
  fixture: {
    id: number;
    date: string;
    status: { short: string; long: string; elapsed: number | null };
  };
  league: { id: number; name: string; season: number };
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

/** Tolérance fuseaux : coup d'envoi 20h Mexico peut tomber J+1 en UTC */
function datesCompatible(apiDate: string, ourDate: string): boolean {
  const api = new Date(apiDate.slice(0, 10) + "T12:00:00Z").getTime();
  const ours = new Date(ourDate + "T12:00:00Z").getTime();
  return Math.abs(api - ours) <= 36 * 60 * 60 * 1000;
}

function teamsPairMatch(
  match: FlatMatch,
  fixture: ApiFixture
): boolean {
  return (
    teamsMatch(match.home, fixture.teams.home.name) &&
    teamsMatch(match.away, fixture.teams.away.name)
  );
}

function findApiFixture(
  fixtures: ApiFixture[],
  match: FlatMatch
): ApiFixture | undefined {
  const wc = fixtures.filter((f) => f.league?.id === WC_LEAGUE_ID);

  return (
    wc.find(
      (f) => datesCompatible(f.fixture.date, match.date) && teamsPairMatch(match, f)
    ) ??
    wc.find((f) => teamsPairMatch(match, f))
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

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function offsetDate(isoDate: string, days: number): string {
  const d = new Date(isoDate + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function inFreeWindow(date: string): boolean {
  return date >= FREE_DATE_MIN && date <= FREE_DATE_MAX;
}

/** Plan gratuit : ?date= uniquement, fenêtre 11–13 juin (puis étendue par l'API). */
function datesToFetch(liveMode: boolean): string[] {
  const today = todayUtc();
  const candidates = liveMode
    ? [offsetDate(today, -1), today, offsetDate(today, 1)]
    : [...new Set(MATCH_DAYS.map((d) => d.date))];
  return candidates.filter(inFreeWindow).sort();
}

async function fetchDate(
  apiKey: string,
  date: string
): Promise<ApiFixture[]> {
  const url = new URL(`${API_BASE}/fixtures`);
  url.searchParams.set("date", date);

  const res = await fetch(url.toString(), {
    headers: { "x-apisports-key": apiKey },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`API-Football ${res.status}: ${res.statusText}`);
  }

  const json = (await res.json()) as {
    response?: ApiFixture[];
    errors?: Record<string, string>;
  };

  if (json.errors && Object.keys(json.errors).length > 0) {
    const err = JSON.stringify(json.errors);
    if (err.includes("rateLimit")) throw new Error(err);
    if (err.includes("date") || err.includes("plan")) return [];
    throw new Error(err);
  }

  return (json.response ?? []).filter((f) => f.league?.id === WC_LEAGUE_ID);
}

async function fetchAllWorldCupFixtures(
  apiKey: string,
  liveMode: boolean
): Promise<ApiFixture[]> {
  const dates = datesToFetch(liveMode);
  const batches = await Promise.all(dates.map((d) => fetchDate(apiKey, d)));

  const seen = new Set<number>();
  const out: ApiFixture[] = [];
  for (const batch of batches) {
    for (const f of batch) {
      if (!seen.has(f.fixture.id)) {
        seen.add(f.fixture.id);
        out.push(f);
      }
    }
  }
  return out;
}

function staticFallback(message?: string): LiveApiResponse {
  const matches = flattenMatches().map((m) => toUpdate(m));
  return {
    updatedAt: new Date().toISOString(),
    source: "static",
    configured: false,
    liveCount: 0,
    matches,
    error: message ?? "Clé API absente — ajoutez API_FOOTBALL_KEY dans .env.local",
  };
}

export async function getLiveScores(): Promise<LiveApiResponse> {
  const apiKey = process.env.API_FOOTBALL_KEY;

  if (!apiKey) {
    return staticFallback();
  }

  const hasLive = (cache?.data.liveCount ?? 0) > 0;
  const ttl = hasLive ? 60_000 : 2 * 60 * 60_000;

  if (cache && Date.now() < cache.expires) {
    return cache.data;
  }

  try {
    const fixtures = await fetchAllWorldCupFixtures(apiKey, hasLive);
    const ourMatches = flattenMatches();

    const updates = ourMatches.map((m) => toUpdate(m, findApiFixture(fixtures, m)));
    const liveCount = updates.filter(
      (u) => u.status === "live" || u.status === "halftime"
    ).length;

    const apiMatched = updates.filter((u) => u.fixtureId !== null).length;

    const data: LiveApiResponse = {
      updatedAt: new Date().toISOString(),
      source: "api-football",
      configured: true,
      liveCount,
      matches: updates,
      error:
        apiMatched === 0 && fixtures.length === 0
          ? `Aucun match CDM sur les dates ${FREE_DATE_MIN}→${FREE_DATE_MAX} (plan gratuit)`
          : undefined,
    };

    cache = { data, expires: Date.now() + ttl };
    return data;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur API";
    const fallback = staticFallback();
    return { ...fallback, configured: true, error: message };
  }
}
