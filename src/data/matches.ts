import { brierScore, getVerdict } from "@/lib/scoring";

export interface Match {
  id: string;
  home: string;
  away: string;
  group: string;
  venue: string;
  kickoff: string;
  /** Probabilités 1 / N / 2 en % */
  pred: [number, number, number];
  predictedScore: string;
  result: string | null;
  revision?: string;
}

export interface MatchDay {
  id: string;
  title: string;
  date: string;
  matches: Match[];
}

export const MATCH_DAYS: MatchDay[] = [
  {
    id: "j1",
    title: "Journée d'ouverture",
    date: "2026-06-11",
    matches: [
      {
        id: "mex-za",
        home: "Mexique",
        away: "Afrique du Sud",
        group: "A",
        venue: "Estadio Azteca, Mexico",
        kickoff: "14:00",
        pred: [58, 26, 16],
        predictedScore: "2-0",
        result: "2-0",
      },
      {
        id: "kor-cze",
        home: "Corée du Sud",
        away: "Tchéquie",
        group: "A",
        venue: "Estadio Guadalajara",
        kickoff: "20:00",
        pred: [33, 28, 39],
        predictedScore: "1-2",
        result: "2-1",
        revision:
          "Révisé pré-match : thèse CPA tchèque (Krejčí) — vainqueur raté, block-breaking Corée absent.",
      },
    ],
  },
  {
    id: "j2",
    title: "Vendredi 12 juin",
    date: "2026-06-12",
    matches: [
      {
        id: "can-bih",
        home: "Canada",
        away: "Bosnie-Herzégovine",
        group: "B",
        venue: "BMO Field, Toronto",
        kickoff: "14:00",
        pred: [47, 28, 25],
        predictedScore: "2-1",
        result: null,
      },
      {
        id: "usa-par",
        home: "États-Unis",
        away: "Paraguay",
        group: "D",
        venue: "SoFi Stadium, Los Angeles",
        kickoff: "20:00",
        pred: [54, 28, 18],
        predictedScore: "1-0",
        result: null,
      },
    ],
  },
  {
    id: "j3",
    title: "Samedi 13 juin",
    date: "2026-06-13",
    matches: [
      {
        id: "qat-che",
        home: "Qatar",
        away: "Suisse",
        group: "B",
        venue: "Levi's Stadium, Santa Clara",
        kickoff: "14:00",
        pred: [14, 23, 63],
        predictedScore: "0-2",
        result: null,
      },
      {
        id: "bra-mar",
        home: "Brésil",
        away: "Maroc",
        group: "C",
        venue: "MetLife Stadium, New York/NJ",
        kickoff: "17:00",
        pred: [48, 28, 24],
        predictedScore: "2-1",
        result: null,
      },
      {
        id: "hai-sco",
        home: "Haïti",
        away: "Écosse",
        group: "C",
        venue: "Gillette Stadium, Boston",
        kickoff: "20:00",
        pred: [18, 27, 55],
        predictedScore: "0-2",
        result: null,
      },
      {
        id: "aus-tur",
        home: "Australie",
        away: "Turquie",
        group: "D",
        venue: "BC Place, Vancouver",
        kickoff: "23:00",
        pred: [30, 28, 42],
        predictedScore: "1-2",
        result: null,
      },
    ],
  },
  {
    id: "j4",
    title: "Dimanche 14 juin",
    date: "2026-06-14",
    matches: [
      {
        id: "ger-cuw",
        home: "Allemagne",
        away: "Curaçao",
        group: "E",
        venue: "NRG Stadium, Houston",
        kickoff: "12:00",
        pred: [85, 10, 5],
        predictedScore: "3-0",
        result: null,
      },
      {
        id: "ned-jpn",
        home: "Pays-Bas",
        away: "Japon",
        group: "F",
        venue: "AT&T Stadium, Dallas",
        kickoff: "14:00",
        pred: [44, 29, 27],
        predictedScore: "2-1",
        result: null,
      },
      {
        id: "civ-ecu",
        home: "Côte d'Ivoire",
        away: "Équateur",
        group: "E",
        venue: "Lincoln Financial Field, Philadelphie",
        kickoff: "17:00",
        pred: [32, 31, 37],
        predictedScore: "1-1",
        result: null,
      },
      {
        id: "swe-tun",
        home: "Suède",
        away: "Tunisie",
        group: "F",
        venue: "Estadio BBVA, Monterrey",
        kickoff: "20:00",
        pred: [42, 31, 27],
        predictedScore: "1-0",
        result: null,
      },
    ],
  },
  {
    id: "j5",
    title: "Lundi 15 juin",
    date: "2026-06-15",
    matches: [
      {
        id: "esp-cpv",
        home: "Espagne",
        away: "Cap-Vert",
        group: "H",
        venue: "Mercedes-Benz Stadium, Atlanta",
        kickoff: "12:00",
        pred: [87, 9, 4],
        predictedScore: "4-0",
        result: null,
      },
      {
        id: "bel-egy",
        home: "Belgique",
        away: "Égypte",
        group: "G",
        venue: "Lumen Field, Seattle",
        kickoff: "14:00",
        pred: [53, 27, 20],
        predictedScore: "2-1",
        result: null,
      },
      {
        id: "ksa-uru",
        home: "Arabie saoudite",
        away: "Uruguay",
        group: "H",
        venue: "Hard Rock Stadium, Miami",
        kickoff: "17:00",
        pred: [16, 25, 59],
        predictedScore: "0-2",
        result: null,
      },
      {
        id: "irn-nzl",
        home: "Iran",
        away: "Nouvelle-Zélande",
        group: "G",
        venue: "SoFi Stadium, Los Angeles",
        kickoff: "20:00",
        pred: [50, 30, 20],
        predictedScore: "1-0",
        result: null,
      },
    ],
  },
  {
    id: "j6",
    title: "Mardi 16 juin",
    date: "2026-06-16",
    matches: [
      {
        id: "fra-sen",
        home: "France",
        away: "Sénégal",
        group: "I",
        venue: "MetLife Stadium, New York/NJ",
        kickoff: "14:00",
        pred: [51, 28, 21],
        predictedScore: "2-1",
        result: null,
      },
      {
        id: "irq-nor",
        home: "Irak",
        away: "Norvège",
        group: "I",
        venue: "Gillette Stadium, Boston",
        kickoff: "17:00",
        pred: [12, 20, 68],
        predictedScore: "0-2",
        result: null,
      },
      {
        id: "arg-alg",
        home: "Argentine",
        away: "Algérie",
        group: "J",
        venue: "Arrowhead Stadium, Kansas City",
        kickoff: "20:00",
        pred: [60, 24, 16],
        predictedScore: "2-1",
        result: null,
      },
      {
        id: "aut-jor",
        home: "Autriche",
        away: "Jordanie",
        group: "J",
        venue: "Levi's Stadium, Santa Clara",
        kickoff: "23:00",
        pred: [58, 26, 16],
        predictedScore: "2-0",
        result: null,
      },
    ],
  },
  {
    id: "j7",
    title: "Mercredi 17 juin",
    date: "2026-06-17",
    matches: [
      {
        id: "por-cod",
        home: "Portugal",
        away: "RD Congo",
        group: "K",
        venue: "NRG Stadium, Houston",
        kickoff: "14:00",
        pred: [74, 17, 9],
        predictedScore: "3-0",
        result: null,
      },
      {
        id: "eng-cro",
        home: "Angleterre",
        away: "Croatie",
        group: "L",
        venue: "AT&T Stadium, Dallas",
        kickoff: "17:00",
        pred: [49, 28, 23],
        predictedScore: "2-1",
        result: null,
      },
      {
        id: "gha-pan",
        home: "Ghana",
        away: "Panama",
        group: "L",
        venue: "BMO Field, Toronto",
        kickoff: "20:00",
        pred: [40, 31, 29],
        predictedScore: "1-1",
        result: null,
      },
      {
        id: "uzb-col",
        home: "Ouzbékistan",
        away: "Colombie",
        group: "K",
        venue: "Estadio Azteca, Mexico",
        kickoff: "23:00",
        pred: [18, 28, 54],
        predictedScore: "0-2",
        result: null,
      },
    ],
  },
];

export interface FlatMatch extends Match {
  date: string;
  dayTitle: string;
}

export function flattenMatches(): FlatMatch[] {
  return MATCH_DAYS.flatMap((day) =>
    day.matches.map((m) => ({
      ...m,
      date: day.date,
      dayTitle: day.title,
    }))
  );
}

export function computeStats() {
  let exact = 0;
  let vainqueur = 0;
  let rate = 0;
  let upcoming = 0;
  let brierSum = 0;
  let played = 0;

  for (const day of MATCH_DAYS) {
    for (const m of day.matches) {
      if (!m.result) {
        upcoming++;
        continue;
      }
      played++;
      const v = getVerdict(m.predictedScore, m.result);
      if (v === "exact") exact++;
      else if (v === "vainqueur") vainqueur++;
      else rate++;
      brierSum += brierScore(m.pred, m.result);
    }
  }

  return {
    exact,
    vainqueur,
    rate,
    upcoming,
    avgBrier: played > 0 ? brierSum / played : null,
    played,
    total: exact + vainqueur + rate + upcoming,
    accuracy: played > 0 ? Math.round(((exact + vainqueur) / played) * 100) : null,
  };
}

export function formatDateFr(dateStr: string): string {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function involvesAlgeria(match: Match): boolean {
  return match.home === "Algérie" || match.away === "Algérie";
}
