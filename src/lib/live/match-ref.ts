/** Référence minimale pour matcher ESPN / scores live */
export interface LiveMatchRef {
  id: string;
  home: string;
  away: string;
  date: string;
  result?: string | null;
}

/** Anciens slugs J1 (avant migration fixtures) */
export const LEGACY_MATCH_IDS: Record<string, string> = {
  "a-md1-0-1": "mex-za",
  "a-md1-2-3": "kor-cze",
  "b-md1-0-1": "can-bih",
  "b-md1-2-3": "qat-che",
  "c-md1-0-1": "bra-mar",
  "c-md1-2-3": "hai-sco",
  "d-md1-0-1": "usa-par",
  "d-md1-2-3": "aus-tur",
};

export function resolveLiveId(
  matchId: string,
  updates: Map<string, { matchId: string }>
): string | undefined {
  if (updates.has(matchId)) return matchId;
  const legacy = LEGACY_MATCH_IDS[matchId];
  if (legacy && updates.has(legacy)) return legacy;
  return undefined;
}
