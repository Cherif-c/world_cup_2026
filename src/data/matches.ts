import { brierScore, getVerdict } from "@/lib/scoring";

export interface Match {
  id: string;
  home: string;
  away: string;
  venue: string;
  /** Probabilités 1 / N / 2 en % */
  pred: [number, number, number];
  /** Score prédit "x-y" */
  predictedScore: string;
  /** Score réel ou null si à venir */
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
        venue: "Estadio Azteca, Mexico",
        pred: [58, 26, 16],
        predictedScore: "2-0",
        result: "2-0",
      },
      {
        id: "kor-cze",
        home: "Corée du Sud",
        away: "Tchéquie",
        venue: "Estadio Guadalajara",
        pred: [33, 28, 39],
        predictedScore: "1-2",
        result: "2-1",
        revision:
          "Révisé pré-match : thèse CPA tchèque (Krejčí a bien marqué de la tête) — vainqueur raté.",
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
        venue: "BMO Field, Toronto",
        pred: [47, 28, 25],
        predictedScore: "2-1",
        result: null,
      },
      {
        id: "usa-par",
        home: "États-Unis",
        away: "Paraguay",
        venue: "SoFi Stadium, Los Angeles",
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
        venue: "Levi's Stadium, Santa Clara",
        pred: [14, 23, 63],
        predictedScore: "0-2",
        result: null,
      },
      {
        id: "bra-mar",
        home: "Brésil",
        away: "Maroc",
        venue: "MetLife Stadium, New York/NJ",
        pred: [48, 28, 24],
        predictedScore: "2-1",
        result: null,
      },
      {
        id: "hai-sco",
        home: "Haïti",
        away: "Écosse",
        venue: "Gillette Stadium, Boston",
        pred: [18, 27, 55],
        predictedScore: "0-2",
        result: null,
      },
      {
        id: "aus-tur",
        home: "Australie",
        away: "Turquie",
        venue: "BC Place, Vancouver",
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
        venue: "NRG Stadium, Houston",
        pred: [85, 10, 5],
        predictedScore: "3-0",
        result: null,
      },
      {
        id: "ned-jpn",
        home: "Pays-Bas",
        away: "Japon",
        venue: "AT&T Stadium, Dallas",
        pred: [44, 29, 27],
        predictedScore: "2-1",
        result: null,
      },
      {
        id: "civ-ecu",
        home: "Côte d'Ivoire",
        away: "Équateur",
        venue: "Lincoln Financial Field, Philadelphie",
        pred: [32, 31, 37],
        predictedScore: "1-1",
        result: null,
      },
      {
        id: "swe-tun",
        home: "Suède",
        away: "Tunisie",
        venue: "Estadio BBVA, Monterrey",
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
        venue: "Mercedes-Benz Stadium, Atlanta",
        pred: [87, 9, 4],
        predictedScore: "4-0",
        result: null,
      },
      {
        id: "bel-egy",
        home: "Belgique",
        away: "Égypte",
        venue: "Lumen Field, Seattle",
        pred: [53, 27, 20],
        predictedScore: "2-1",
        result: null,
      },
      {
        id: "ksa-uru",
        home: "Arabie saoudite",
        away: "Uruguay",
        venue: "Hard Rock Stadium, Miami",
        pred: [16, 25, 59],
        predictedScore: "0-2",
        result: null,
      },
      {
        id: "irn-nzl",
        home: "Iran",
        away: "Nouvelle-Zélande",
        venue: "SoFi Stadium, Los Angeles",
        pred: [50, 30, 20],
        predictedScore: "1-0",
        result: null,
      },
    ],
  },
  {
    id: "j6",
    title: "Mardi 16 juin — Groupe J",
    date: "2026-06-16",
    matches: [
      {
        id: "fra-sen",
        home: "France",
        away: "Sénégal",
        venue: "MetLife Stadium, New York/NJ",
        pred: [51, 28, 21],
        predictedScore: "2-1",
        result: null,
      },
      {
        id: "irq-nor",
        home: "Irak",
        away: "Norvège",
        venue: "Gillette Stadium, Boston",
        pred: [12, 20, 68],
        predictedScore: "0-2",
        result: null,
      },
      {
        id: "arg-alg",
        home: "Argentine",
        away: "Algérie",
        venue: "Arrowhead Stadium, Kansas City",
        pred: [60, 24, 16],
        predictedScore: "2-1",
        result: null,
      },
      {
        id: "aut-jor",
        home: "Autriche",
        away: "Jordanie",
        venue: "Levi's Stadium, Santa Clara",
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
        venue: "NRG Stadium, Houston",
        pred: [74, 17, 9],
        predictedScore: "3-0",
        result: null,
      },
      {
        id: "eng-cro",
        home: "Angleterre",
        away: "Croatie",
        venue: "AT&T Stadium, Dallas",
        pred: [49, 28, 23],
        predictedScore: "2-1",
        result: null,
      },
      {
        id: "gha-pan",
        home: "Ghana",
        away: "Panama",
        venue: "BMO Field, Toronto",
        pred: [40, 31, 29],
        predictedScore: "1-1",
        result: null,
      },
      {
        id: "uzb-col",
        home: "Ouzbékistan",
        away: "Colombie",
        venue: "Estadio Azteca, Mexico",
        pred: [18, 28, 54],
        predictedScore: "0-2",
        result: null,
      },
    ],
  },
];

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
  };
}
