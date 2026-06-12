import type { MatchAdjustments } from "./types";
import type { ModelConfig } from "./types";

const HOSTS = new Set(["Mexique", "États-Unis", "Canada"]);

/** Forte diaspora maghrébine dans plusieurs villes US */
const DIASPORA_TEAMS = new Set(["Algérie", "Maroc", "Tunisie"]);

const HOST_NATION: Record<string, "mexique" | "usa" | "canada"> = {
  Mexique: "mexique",
  "États-Unis": "usa",
  Canada: "canada",
};

function venueNation(venue: string): "mexique" | "usa" | "canada" | null {
  const v = venue.toLowerCase();
  if (
    v.includes("mexico") ||
    v.includes("monterrey") ||
    v.includes("guadalajara") ||
    v.includes("azteca") ||
    v.includes("bbva")
  ) {
    return "mexique";
  }
  if (
    v.includes("toronto") ||
    v.includes("canada") ||
    v.includes("vancouver") ||
    v.includes("bmo")
  ) {
    return "canada";
  }
  if (v.includes("groupe")) return null;
  return "usa";
}

export function getMatchAdjustments(
  home: string,
  away: string,
  venue: string,
  config: ModelConfig
): MatchAdjustments {
  let adjEloA = 0;
  const adjEloB = 0;
  const bonusLambdaA = 0;
  const bonusLambdaB = 0;

  if (HOSTS.has(home)) {
    const teamNation = HOST_NATION[home];
    const venueNat = venueNation(venue);
    if (venueNat === teamNation) {
      adjEloA += config.contextAdj.hote;
    } else if (venueNat !== null) {
      adjEloA += config.contextAdj.quasiDomicile;
    } else {
      adjEloA += config.contextAdj.hote;
    }
  }

  if (venue.toLowerCase().includes("azteca") && home === "Mexique") {
    adjEloA += config.contextAdj.altitudeAzteca;
  }

  if (
    DIASPORA_TEAMS.has(home) &&
    venueNation(venue) === "usa" &&
    !HOSTS.has(home)
  ) {
    adjEloA += Math.round(config.contextAdj.quasiDomicile * 0.6);
  }

  return { adjEloA, adjEloB, bonusLambdaA, bonusLambdaB };
}

export function muForMatchday(
  config: ModelConfig,
  matchday: 1 | 2 | 3
): number {
  return config.global.muByMatchday?.[matchday] ?? config.global.muTotal;
}
