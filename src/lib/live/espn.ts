import { FIXTURES } from "@/data/fixtures";
import { teamsMatch } from "./team-api-names";
import type { LiveMatchRef } from "./match-ref";
import type { LiveMatchUpdate, MatchStatus } from "./types";

const ESPN_SCOREBOARD =
  "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard";

interface EspnCompetitor {
  homeAway: "home" | "away";
  score: string;
  team: { displayName: string; abbreviation?: string };
}

interface EspnEvent {
  id: string;
  date: string;
  competitions: {
    id: string;
    date: string;
    competitors: EspnCompetitor[];
    status: {
      displayClock: string;
      period?: number;
      type: {
        id: string;
        name: string;
        state: "pre" | "in" | "post";
        description: string;
        completed: boolean;
      };
    };
  }[];
}

export interface EspnFixture {
  eventId: string;
  date: string;
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
  status: MatchStatus;
  statusLabel: string;
  minute: number | null;
}

function espnDateRange(): string {
  const days = [
    ...new Set(FIXTURES.map((f) => f.date.replace(/-/g, ""))),
  ].sort();
  if (days.length === 0) {
    return new Date().toISOString().slice(0, 10).replace(/-/g, "");
  }
  return `${days[0]}-${days[days.length - 1]}`;
}

function parseMinute(clock: string): number | null {
  const m = clock.match(/^(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}

function mapEspnStatus(comp: EspnEvent["competitions"][0]): {
  status: MatchStatus;
  label: string;
  minute: number | null;
} {
  const { type, displayClock } = comp.status;
  const minute = parseMinute(displayClock);

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
      label: displayClock || "LIVE",
      minute,
    };
  }

  if (type.state === "post" || type.completed) {
    return { status: "finished", label: "Terminé", minute: 90 };
  }

  return { status: "unknown", label: type.description, minute };
}

function parseEvent(event: EspnEvent): EspnFixture | null {
  const comp = event.competitions?.[0];
  if (!comp?.competitors?.length) return null;

  const home = comp.competitors.find((c) => c.homeAway === "home");
  const away = comp.competitors.find((c) => c.homeAway === "away");
  if (!home || !away) return null;

  const { status, label, minute } = mapEspnStatus(comp);

  return {
    eventId: event.id,
    date: (comp.date ?? event.date).slice(0, 10),
    home: home.team.displayName,
    away: away.team.displayName,
    homeScore: parseInt(home.score, 10) || 0,
    awayScore: parseInt(away.score, 10) || 0,
    status,
    statusLabel: label,
    minute,
  };
}

export async function fetchEspnFixtures(): Promise<EspnFixture[]> {
  const url = `${ESPN_SCOREBOARD}?dates=${espnDateRange()}`;

  const res = await fetch(url, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`ESPN ${res.status}: ${res.statusText}`);
  }

  const json = (await res.json()) as { events?: EspnEvent[] };
  return (json.events ?? [])
    .map(parseEvent)
    .filter((f): f is EspnFixture => f !== null);
}

function datesCompatible(espnDate: string, ourDate: string): boolean {
  const api = new Date(espnDate + "T12:00:00Z").getTime();
  const ours = new Date(ourDate + "T12:00:00Z").getTime();
  return Math.abs(api - ours) <= 36 * 60 * 60 * 1000;
}

export function findEspnFixture(
  fixtures: EspnFixture[],
  match: LiveMatchRef
): EspnFixture | undefined {
  return (
    fixtures.find(
      (f) =>
        datesCompatible(f.date, match.date) &&
        teamsMatch(match.home, f.home) &&
        teamsMatch(match.away, f.away)
    ) ??
    fixtures.find(
      (f) =>
        teamsMatch(match.home, f.home) && teamsMatch(match.away, f.away)
    )
  );
}

export function espnToUpdate(
  match: LiveMatchRef,
  fixture?: EspnFixture
): LiveMatchUpdate {
  if (!fixture) {
    return {
      matchId: match.id,
      homeScore: null,
      awayScore: null,
      status: "scheduled",
      statusLabel: "À venir",
      minute: null,
      scoreText: null,
      fixtureId: null,
    };
  }

  const showScore =
    fixture.status === "finished" ||
    fixture.status === "live" ||
    fixture.status === "halftime";

  return {
    matchId: match.id,
    homeScore: fixture.homeScore,
    awayScore: fixture.awayScore,
    status: fixture.status,
    statusLabel: fixture.statusLabel,
    minute: fixture.minute,
    scoreText: showScore
      ? `${fixture.homeScore}-${fixture.awayScore}`
      : null,
    fixtureId: parseInt(fixture.eventId, 10) || null,
  };
}
