import type { Fixture } from "@/data/fixtures";
import { getMarketOdds } from "@/data/odds";
import { resolveLiveId } from "@/lib/live/match-ref";
import {
  displayScore,
  liveBrier,
  liveVerdict,
  liveVerdict1x2,
  resultForVerdict,
} from "@/lib/live/merge";
import type { LiveMatchUpdate } from "@/lib/live/types";
import {
  brierScore,
  getVerdict,
  getVerdict1x2,
  pick1x2,
  pick1x2Label,
  type Pick1x2,
} from "@/lib/scoring";
import { buildEloTimeline } from "./elo-update";
import { priceMatch } from "./engine";
import { getMatchAdjustments, muForMatchday } from "./match-context";
import type { ModelConfig, PricingResult } from "./types";

export interface EnrichedMatch extends Fixture {
  pricing: PricingResult;
  /** Probabilités 1 / N / 2 en % */
  pred: [number, number, number];
  predictedScore: string;
  pick1x2: Pick1x2;
  pick1x2Label: string;
  /** Elo effectif (pré-match si terminé, courant sinon) */
  effectiveElo?: { home: number; away: number };
  live?: LiveMatchUpdate;
}

export function enrichFixture(
  fixture: Fixture,
  config: ModelConfig,
  live?: LiveMatchUpdate,
  eloOverride?: Record<string, number>
): EnrichedMatch {
  const configForMatch = eloOverride
    ? { ...config, elo: eloOverride }
    : config;

  const adj = getMatchAdjustments(
    fixture.home,
    fixture.away,
    fixture.venue,
    configForMatch
  );
  const mu = muForMatchday(configForMatch, fixture.matchday);
  const marketOdds = getMarketOdds(fixture.id);
  const pricing = priceMatch(
    fixture.home,
    fixture.away,
    configForMatch,
    adj,
    marketOdds,
    mu
  );
  const pred = pricing.pFinal.map((p) => Math.round(p * 1000) / 10) as [
    number,
    number,
    number,
  ];
  const pick = pick1x2(pred);

  return {
    ...fixture,
    pricing,
    pred,
    predictedScore: pricing.predictedScore,
    pick1x2: pick,
    pick1x2Label: pick1x2Label(pick, fixture.home, fixture.away),
    effectiveElo: eloOverride
      ? {
          home: eloOverride[fixture.home] ?? config.elo[fixture.home] ?? 1700,
          away: eloOverride[fixture.away] ?? config.elo[fixture.away] ?? 1700,
        }
      : undefined,
    live,
  };
}

export function enrichAll(
  fixtures: Fixture[],
  config: ModelConfig,
  liveMap: Map<string, LiveMatchUpdate>
): EnrichedMatch[] {
  const timeline = buildEloTimeline(
    config.elo,
    fixtures,
    liveMap,
    config.global.eloPerGd
  );

  return fixtures.map((f) => {
    const resolved = resolveLiveId(f.id, liveMap);
    const live = resolved ? liveMap.get(resolved) : undefined;
    const eloForMatch =
      timeline.beforeMatch.get(f.id) ?? timeline.current;
    return enrichFixture(f, config, live, eloForMatch);
  });
}

export function computePredictionStats(matches: EnrichedMatch[]) {
  let scoreExact = 0;
  let scoreVainqueur = 0;
  let scoreRate = 0;
  let pick1x2Ok = 0;
  let pick1x2Rate = 0;
  let upcoming = 0;
  let live = 0;
  let brierSum = 0;
  let played = 0;

  for (const m of matches) {
    if (m.live?.status === "live" || m.live?.status === "halftime") {
      live++;
      continue;
    }
    const result = resultForVerdict({ ...m, result: null }, m.live);
    if (!result) {
      upcoming++;
      continue;
    }
    played++;

    const scoreV = getVerdict(m.predictedScore, result);
    if (scoreV === "exact") scoreExact++;
    else if (scoreV === "vainqueur") scoreVainqueur++;
    else scoreRate++;

    const x2V = getVerdict1x2(m.pred, result);
    if (x2V === "vainqueur" || x2V === "exact") pick1x2Ok++;
    else pick1x2Rate++;

    brierSum += brierScore(m.pred, result);
  }

  return {
    exact: scoreExact,
    vainqueur: scoreVainqueur,
    rate: scoreRate,
    pick1x2Ok,
    pick1x2Rate,
    upcoming,
    live,
    played,
    avgBrier: played > 0 ? brierSum / played : null,
    accuracy:
      played > 0 ? Math.round((pick1x2Ok / played) * 100) : null,
    scoreAccuracy:
      played > 0
        ? Math.round(((scoreExact + scoreVainqueur) / played) * 100)
        : null,
  };
}

export { displayScore, liveBrier, liveVerdict, liveVerdict1x2, resultForVerdict };
