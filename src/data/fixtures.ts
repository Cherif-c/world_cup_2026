import { GROUPS } from "./groups";

export interface Fixture {
  id: string;
  home: string;
  away: string;
  group: string;
  matchday: 1 | 2 | 3;
  date: string;
  kickoff: string;
  venue: string;
  revision?: string;
}

/** Round-robin 4 équipes : J1 (0-1,2-3), J2 (0-2,1-3), J3 (0-3,1-2) */
const ROUNDS: [number, number][][] = [
  [
    [0, 1],
    [2, 3],
  ],
  [
    [0, 2],
    [1, 3],
  ],
  [
    [0, 3],
    [1, 2],
  ],
];

const MD_BASE_DATES: Record<1 | 2 | 3, string> = {
  1: "2026-06-11",
  2: "2026-06-19",
  3: "2026-06-27",
};

/** Détails J1 connus (dates / stades réels) */
const J1_OVERRIDES: Record<string, Partial<Fixture>> = {
  "a-md1-0-1": {
    date: "2026-06-11",
    kickoff: "14:00",
    venue: "Estadio Azteca, Mexico",
  },
  "a-md1-2-3": {
    date: "2026-06-11",
    kickoff: "20:00",
    venue: "Estadio Guadalajara",
    revision:
      "Match serré — le modèle privilégie le 1X2 (Corée) plutôt que le score exact.",
  },
  "b-md1-0-1": {
    date: "2026-06-12",
    kickoff: "14:00",
    venue: "BMO Field, Toronto",
  },
  "b-md1-2-3": {
    date: "2026-06-13",
    kickoff: "14:00",
    venue: "Levi's Stadium, Santa Clara",
  },
  "c-md1-0-1": {
    date: "2026-06-13",
    kickoff: "20:00",
    venue: "Gillette Stadium, Boston",
  },
  "c-md1-2-3": {
    date: "2026-06-13",
    kickoff: "17:00",
    venue: "MetLife Stadium, New York/NJ",
  },
  "d-md1-0-1": {
    date: "2026-06-12",
    kickoff: "20:00",
    venue: "SoFi Stadium, Los Angeles",
  },
  "d-md1-2-3": {
    date: "2026-06-13",
    kickoff: "23:00",
    venue: "BC Place, Vancouver",
  },
  "e-md1-0-1": {
    date: "2026-06-14",
    kickoff: "12:00",
    venue: "NRG Stadium, Houston",
  },
  "e-md1-2-3": {
    date: "2026-06-14",
    kickoff: "17:00",
    venue: "Lincoln Financial Field, Philadelphie",
  },
  "f-md1-0-1": {
    date: "2026-06-14",
    kickoff: "14:00",
    venue: "AT&T Stadium, Dallas",
  },
  "f-md1-2-3": {
    date: "2026-06-14",
    kickoff: "20:00",
    venue: "Estadio BBVA, Monterrey",
  },
  "g-md1-0-1": {
    date: "2026-06-15",
    kickoff: "14:00",
    venue: "Lumen Field, Seattle",
  },
  "g-md1-2-3": {
    date: "2026-06-15",
    kickoff: "20:00",
    venue: "SoFi Stadium, Los Angeles",
  },
  "h-md1-0-1": {
    date: "2026-06-15",
    kickoff: "12:00",
    venue: "Mercedes-Benz Stadium, Atlanta",
  },
  "h-md1-2-3": {
    date: "2026-06-15",
    kickoff: "17:00",
    venue: "Hard Rock Stadium, Miami",
  },
  "i-md1-0-1": {
    date: "2026-06-16",
    kickoff: "14:00",
    venue: "MetLife Stadium, New York/NJ",
  },
  "i-md1-2-3": {
    date: "2026-06-16",
    kickoff: "17:00",
    venue: "Gillette Stadium, Boston",
  },
  "j-md1-0-1": {
    date: "2026-06-16",
    kickoff: "20:00",
    venue: "Arrowhead Stadium, Kansas City",
  },
  "j-md1-2-3": {
    date: "2026-06-16",
    kickoff: "23:00",
    venue: "Levi's Stadium, Santa Clara",
  },
  "j-md2-1-3": {
    date: "2026-06-24",
    kickoff: "20:00",
    venue: "Lumen Field, Seattle",
    revision: "Thèse : 4-0 — attaque algérienne vs bloc jordanien perméable.",
  },
  "j-md3-1-2": {
    date: "2026-06-28",
    kickoff: "17:00",
    venue: "Arrowhead Stadium, Kansas City",
    revision: "Match décisif pour la 2e place — nul ou victoire serrée attendue.",
  },
  "k-md1-0-1": {
    date: "2026-06-17",
    kickoff: "14:00",
    venue: "NRG Stadium, Houston",
  },
  "k-md1-2-3": {
    date: "2026-06-17",
    kickoff: "23:00",
    venue: "Estadio Azteca, Mexico",
  },
  "l-md1-0-1": {
    date: "2026-06-17",
    kickoff: "17:00",
    venue: "AT&T Stadium, Dallas",
  },
  "l-md1-2-3": {
    date: "2026-06-17",
    kickoff: "20:00",
    venue: "BMO Field, Toronto",
  },
};

function slug(team: string): string {
  return team
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 6);
}

function generateFixtures(): Fixture[] {
  const out: Fixture[] = [];

  for (const [group, teams] of Object.entries(GROUPS)) {
    const g = group.toLowerCase();
    for (let md = 0; md < 3; md++) {
      const matchday = (md + 1) as 1 | 2 | 3;
      for (const [i, j] of ROUNDS[md]) {
        const id = `${g}-md${matchday}-${i}-${j}`;
        const base: Fixture = {
          id,
          home: teams[i],
          away: teams[j],
          group,
          matchday,
          date: MD_BASE_DATES[matchday],
          kickoff: md === 0 ? "18:00" : md === 1 ? "20:00" : "17:00",
          venue: `Groupe ${group} — J${matchday}`,
        };
        const override = J1_OVERRIDES[id];
        out.push(override ? { ...base, ...override } : base);
      }
    }
  }

  return out;
}

export const FIXTURES: Fixture[] = generateFixtures();

export function getFixturesByMatchday(md: 1 | 2 | 3): Fixture[] {
  return FIXTURES.filter((f) => f.matchday === md);
}

export function getFixturesByGroup(group: string): Fixture[] {
  return FIXTURES.filter((f) => f.group === group);
}

export function formatDateFr(dateStr: string): string {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function involvesAlgeria(f: { home: string; away: string }): boolean {
  return f.home === "Algérie" || f.away === "Algérie";
}
