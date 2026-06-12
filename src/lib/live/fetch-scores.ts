import { flattenMatches, type FlatMatch } from "@/data/matches";
import { espnToUpdate, fetchEspnFixtures, findEspnFixture } from "./espn";
import { teamsMatch } from "./team-api-names";
import type { LiveApiResponse, LiveMatchUpdate, MatchStatus } from "./types";

const API_FOOTBALL_BASE = "https://v3.football.api-sports.io";
const WC_LEAGUE_ID = 1;
const FREE_DATE_MIN = "2026-06-11";
const FREE_DATE_MAX = "2026-06-13";

interface ApiFixture {
  fixture: {
    id: number;
    date: string;
    status: { short: string; long: string; elapsed: number | null };
  };
  league: { id: number };
  goals: { home: number | null; away: number | null };
  teams: { home: { name: string }; away: { name: string } };
}

let cache: { data: LiveApiResponse; expires: number } | null = null;

const LIVE_STATUS = new Set(["1H", "2H", "ET", "BT", "P", "LIVE", "INT"]);
const HT_STATUS = new Set(["HT"]);
const FINISHED_STATUS = new Set(["FT", "AET", "PEN"]);

function mapApiFootballStatus(short: string): MatchStatus {
  if (LIVE_STATUS.has(short)) return "live";
  if (HT_STATUS.has(short)) return "halftime";
  if (FINISHED_STATUS.has(short)) return "finished";
  if (short === "NS" || short === "TBD") return "scheduled";
  return "unknown";
}

function apiFootballToUpdate(
  match: FlatMatch,
  fixture?: ApiFixture
): LiveMatchUpdate {
  if (!fixture) return espnToUpdate(match);

  const { short, elapsed } = fixture.fixture.status;
  const status = mapApiFootballStatus(short);
  const home = fixture.goals.home;
  const away = fixture.goals.away;
  const scoreText =
    home !== null && away !== null ? `${home}-${away}` : match.result;

  return {
    matchId: match.id,
    homeScore: home,
    awayScore: away,
    status,
    statusLabel:
      short === "HT"
        ? "Mi-temps"
        : LIVE_STATUS.has(short) && elapsed !== null
          ? `${elapsed}'`
          : short === "FT"
            ? "Terminé"
            : "À venir",
    minute: elapsed,
    scoreText:
      status === "finished" || status === "live" || status === "halftime"
        ? scoreText
        : match.result,
    fixtureId: fixture.fixture.id,
  };
}

function findApiFootballFixture(
  fixtures: ApiFixture[],
  match: FlatMatch
): ApiFixture | undefined {
  const wc = fixtures.filter((f) => f.league?.id === WC_LEAGUE_ID);
  return wc.find(
    (f) =>
      teamsMatch(match.home, f.teams.home.name) &&
      teamsMatch(match.away, f.teams.away.name)
  );
}

async function fetchApiFootballFallback(
  apiKey: string
): Promise<ApiFixture[]> {
  const dates = [...new Set(flattenMatches().map((m) => m.date))]
    .filter((d) => d >= FREE_DATE_MIN && d <= FREE_DATE_MAX);

  const all: ApiFixture[] = [];
  for (const date of dates) {
    const url = new URL(`${API_FOOTBALL_BASE}/fixtures`);
    url.searchParams.set("date", date);
    const res = await fetch(url.toString(), {
      headers: { "x-apisports-key": apiKey },
      cache: "no-store",
    });
    if (!res.ok) continue;
    const json = (await res.json()) as { response?: ApiFixture[]; errors?: object };
    if (json.errors && Object.keys(json.errors).length > 0) continue;
    all.push(...(json.response ?? []).filter((f) => f.league?.id === WC_LEAGUE_ID));
  }
  return all;
}

function staticFallback(message?: string): LiveApiResponse {
  const matches = flattenMatches().map((m) => espnToUpdate(m));
  return {
    updatedAt: new Date().toISOString(),
    source: "static",
    configured: false,
    liveCount: 0,
    matches,
    error: message,
  };
}

export async function getLiveScores(): Promise<LiveApiResponse> {
  const hasLive = (cache?.data.liveCount ?? 0) > 0;
  const ttl = hasLive ? 8_000 : 45_000;

  if (cache && Date.now() < cache.expires) {
    return cache.data;
  }

  try {
    const espnFixtures = await fetchEspnFixtures();
    const ourMatches = flattenMatches();

    let updates = ourMatches.map((m) =>
      espnToUpdate(m, findEspnFixture(espnFixtures, m))
    );

    let source: LiveApiResponse["source"] = "espn";

    const unmatched = updates.filter((u) => u.fixtureId === null && !u.scoreText);
    const apiKey = process.env.API_FOOTBALL_KEY;

    if (unmatched.length > 0 && apiKey) {
      try {
        const afFixtures = await fetchApiFootballFallback(apiKey);
        updates = ourMatches.map((m) => {
          const espn = findEspnFixture(espnFixtures, m);
          if (espn) return espnToUpdate(m, espn);
          const af = findApiFootballFixture(afFixtures, m);
          if (af) return apiFootballToUpdate(m, af);
          return espnToUpdate(m);
        });
        if (afFixtures.length > 0) source = "api-football";
      } catch {
        /* ESPN seul */
      }
    }

    const liveCount = updates.filter(
      (u) => u.status === "live" || u.status === "halftime"
    ).length;

    const data: LiveApiResponse = {
      updatedAt: new Date().toISOString(),
      source,
      configured: true,
      liveCount,
      matches: updates,
    };

    cache = { data, expires: Date.now() + ttl };
    return data;
  } catch (espnErr) {
    const apiKey = process.env.API_FOOTBALL_KEY;
    if (apiKey) {
      try {
        const afFixtures = await fetchApiFootballFallback(apiKey);
        const ourMatches = flattenMatches();
        const updates = ourMatches.map((m) =>
          apiFootballToUpdate(m, findApiFootballFixture(afFixtures, m))
        );
        const data: LiveApiResponse = {
          updatedAt: new Date().toISOString(),
          source: "api-football",
          configured: true,
          liveCount: updates.filter(
            (u) => u.status === "live" || u.status === "halftime"
          ).length,
          matches: updates,
          error: "ESPN indisponible — repli API-Football",
        };
        cache = { data, expires: Date.now() + 60_000 };
        return data;
      } catch {
        /* fall through */
      }
    }

    const message =
      espnErr instanceof Error ? espnErr.message : "Erreur ESPN";
    return staticFallback(message);
  }
}
