"use client";

import { useMemo, useState } from "react";
import { useModelConfig } from "@/context/ModelContext";
import { flattenMatches } from "@/data/matches";
import { priceMatch } from "@/lib/model/engine";
import type { ContextAdj, GlobalParams } from "@/lib/model/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { TeamCell } from "@/components/ui/TeamCell";

const GLOBAL_FIELDS: {
  key: keyof GlobalParams;
  label: string;
  step: number;
  hint?: string;
}[] = [
  { key: "muTotal", label: "μ — total buts attendu", step: 0.05 },
  { key: "eloPerGd", label: "Pts Elo / but d'écart", step: 1 },
  { key: "rhoDc", label: "ρ Dixon-Coles", step: 0.01 },
  { key: "lambdaMin", label: "λ plancher", step: 0.05 },
  { key: "zCred", label: "z crédibilité Bühlmann", step: 0.05, hint: "Poids modèle vs marché" },
  { key: "maxGoals", label: "Troncature matrice", step: 1 },
  { key: "ratioExponent", label: "Exposant ratio λ", step: 0.05 },
];

const ADJ_FIELDS: {
  key: keyof ContextAdj;
  label: string;
}[] = [
  { key: "hote", label: "Hôte (+Elo)" },
  { key: "quasiDomicile", label: "Quasi-domicile" },
  { key: "altitudeAzteca", label: "Altitude Azteca" },
];

export function ParametresPanel() {
  const { config, updateGlobal, updateContextAdj, updateElo, resetConfig } =
    useModelConfig();
  const matches = flattenMatches();

  const [teamA, setTeamA] = useState("Argentine");
  const [teamB, setTeamB] = useState("Algérie");
  const [adjA, setAdjA] = useState(0);
  const [adjB, setAdjB] = useState(0);
  const [bonusA, setBonusA] = useState(0);
  const [bonusB, setBonusB] = useState(0);
  const [odds1, setOdds1] = useState("");
  const [oddsN, setOddsN] = useState("");
  const [odds2, setOdds2] = useState("");

  const teams = useMemo(
    () => Object.keys(config.elo).sort((a, b) => a.localeCompare(b, "fr")),
    [config.elo]
  );

  const marketOdds = useMemo(() => {
    const o1 = parseFloat(odds1);
    const on = parseFloat(oddsN);
    const o2 = parseFloat(odds2);
    if (o1 > 1 && on > 1 && o2 > 1) return [o1, on, o2] as [number, number, number];
    return undefined;
  }, [odds1, oddsN, odds2]);

  const pricing = useMemo(
    () =>
      priceMatch(
        teamA,
        teamB,
        config,
        {
          adjEloA: adjA,
          adjEloB: adjB,
          bonusLambdaA: bonusA,
          bonusLambdaB: bonusB,
        },
        marketOdds
      ),
    [teamA, teamB, config, adjA, adjB, bonusA, bonusB, marketOdds]
  );

  const pct = (p: number) => `${(p * 100).toFixed(1)}%`;

  return (
    <>
      <PageHeader
        title="Paramètres du modèle"
        subtitle="Réglages globaux, ratings Elo et simulateur de pricing en temps réel. Sauvegarde automatique (localStorage)."
      >
        <button type="button" onClick={resetConfig} className="btn-secondary">
          Réinitialiser
        </button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Global params */}
        <section className="card-pro">
          <div className="card-pro-header">
            <h2>Paramètres globaux</h2>
          </div>
          <div className="grid gap-3 p-5 sm:grid-cols-2">
            {GLOBAL_FIELDS.map(({ key, label, step, hint }) => (
              <label key={key} className="block">
                <span className="mb-1 block text-xs font-medium text-ink-secondary">
                  {label}
                </span>
                <input
                  type="number"
                  step={step}
                  value={config.global[key]}
                  onChange={(e) =>
                    updateGlobal({ [key]: parseFloat(e.target.value) || 0 })
                  }
                  className="input-pro font-mono"
                />
                {hint && (
                  <span className="mt-0.5 block text-[10px] text-ink-tertiary">
                    {hint}
                  </span>
                )}
              </label>
            ))}
          </div>
        </section>

        {/* Context adjustments */}
        <section className="card-pro">
          <div className="card-pro-header">
            <h2>Ajustements contextuels</h2>
          </div>
          <div className="grid gap-3 p-5">
            {ADJ_FIELDS.map(({ key, label }) => (
              <label key={key} className="block">
                <span className="mb-1 block text-xs font-medium text-ink-secondary">
                  {label}
                </span>
                <input
                  type="number"
                  step={5}
                  value={config.contextAdj[key]}
                  onChange={(e) =>
                    updateContextAdj({
                      [key]: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="input-pro font-mono"
                />
              </label>
            ))}
          </div>
        </section>
      </div>

      {/* Elo table */}
      <section className="card-pro mt-6 overflow-hidden">
        <div className="card-pro-header">
          <h2>Ratings Elo</h2>
          <p className="mt-1 text-xs text-white/70">
            eloratings.net — à rafraîchir après chaque journée
          </p>
        </div>
        <div className="max-h-80 overflow-auto">
          <table className="table-pro">
            <thead>
              <tr>
                <th>Équipe</th>
                <th className="text-right">Elo</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr
                  key={team}
                  className={team === "Algérie" ? "row-algeria" : undefined}
                >
                  <td>
                    <TeamCell team={team} highlight={team === "Algérie"} />
                  </td>
                  <td className="text-right">
                    <input
                      type="number"
                      step={5}
                      value={config.elo[team]}
                      onChange={(e) =>
                        updateElo(team, parseFloat(e.target.value) || 0)
                      }
                      className="input-pro w-24 text-right font-mono"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Match pricer */}
      <section className="card-pro mt-6">
        <div className="card-pro-header">
          <h2>Simulateur de pricing</h2>
        </div>

        <div className="mb-6 grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <label>
            <span className="mb-1 block text-xs text-ink-secondary">
              Équipe A
            </span>
            <select
              value={teamA}
              onChange={(e) => setTeamA(e.target.value)}
              className="input-pro"
            >
              {teams.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-1 block text-xs text-ink-secondary">
              Équipe B
            </span>
            <select
              value={teamB}
              onChange={(e) => setTeamB(e.target.value)}
              className="input-pro"
            >
              {teams.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-1 block text-xs text-ink-secondary">
              Adj. Elo A
            </span>
            <input
              type="number"
              value={adjA}
              onChange={(e) => setAdjA(parseFloat(e.target.value) || 0)}
              className="input-pro font-mono"
            />
          </label>
          <label>
            <span className="mb-1 block text-xs text-ink-secondary">
              Adj. Elo B
            </span>
            <input
              type="number"
              value={adjB}
              onChange={(e) => setAdjB(parseFloat(e.target.value) || 0)}
              className="input-pro font-mono"
            />
          </label>
          <label>
            <span className="mb-1 block text-xs text-ink-secondary">
              Block-breaking λ A
            </span>
            <input
              type="number"
              step={0.1}
              value={bonusA}
              onChange={(e) => setBonusA(parseFloat(e.target.value) || 0)}
              className="input-pro font-mono"
            />
          </label>
          <label>
            <span className="mb-1 block text-xs text-ink-secondary">
              Block-breaking λ B
            </span>
            <input
              type="number"
              step={0.1}
              value={bonusB}
              onChange={(e) => setBonusB(parseFloat(e.target.value) || 0)}
              className="input-pro font-mono"
            />
          </label>
          <label>
            <span className="mb-1 block text-xs text-ink-secondary">
              Cote 1 (marché)
            </span>
            <input
              type="number"
              step={0.01}
              placeholder="1.70"
              value={odds1}
              onChange={(e) => setOdds1(e.target.value)}
              className="input-pro font-mono"
            />
          </label>
          <label>
            <span className="mb-1 block text-xs text-ink-secondary">
              Cote N
            </span>
            <input
              type="number"
              step={0.01}
              placeholder="3.80"
              value={oddsN}
              onChange={(e) => setOddsN(e.target.value)}
              className="input-pro font-mono"
            />
          </label>
        </div>

        <div className="mx-5 overflow-x-auto rounded-card border border-fifa-blue/20">
          <table className="table-pro">
            <thead>
              <tr>
                <th>Métrique</th>
                <th className="text-center">1 ({teamA})</th>
                <th className="text-center">N</th>
                <th className="text-center">2 ({teamB})</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-medium">P modèle</td>
                <td className="text-center font-mono">{pct(pricing.pModel[0])}</td>
                <td className="text-center font-mono">{pct(pricing.pModel[1])}</td>
                <td className="text-center font-mono">{pct(pricing.pModel[2])}</td>
              </tr>
              {pricing.pMarket && (
                <tr>
                  <td className="font-medium">P marché (de-vig)</td>
                  <td className="text-center font-mono">
                    {pct(pricing.pMarket[0])}
                  </td>
                  <td className="text-center font-mono">
                    {pct(pricing.pMarket[1])}
                  </td>
                  <td className="text-center font-mono">
                    {pct(pricing.pMarket[2])}
                  </td>
                </tr>
              )}
              <tr className="bg-dz-green/5">
                <td className="font-semibold">P final (z={config.global.zCred})</td>
                <td className="text-center font-mono font-semibold text-dz-green">
                  {pct(pricing.pFinal[0])}
                </td>
                <td className="text-center font-mono font-semibold text-dz-green">
                  {pct(pricing.pFinal[1])}
                </td>
                <td className="text-center font-mono font-semibold text-dz-green">
                  {pct(pricing.pFinal[2])}
                </td>
              </tr>
              <tr>
                <td className="font-medium">Cotes justes</td>
                <td className="text-center font-mono">
                  {pricing.fairOdds[0].toFixed(2)}
                </td>
                <td className="text-center font-mono">
                  {pricing.fairOdds[1].toFixed(2)}
                </td>
                <td className="text-center font-mono">
                  {pricing.fairOdds[2].toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mx-5 mb-5 grid gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-card border-2 border-fifa-blue/15 bg-fifa-blue/5 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wider text-fifa-blue">
              Intensités
            </p>
            <p className="font-mono font-semibold text-fifa-blue-dark">
              λₐ = {pricing.lambdaA.toFixed(2)} · λᵦ = {pricing.lambdaB.toFixed(2)}
            </p>
          </div>
          <div className="rounded-card border-2 border-dz-green/20 bg-dz-green/5 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wider text-dz-green">
              Score mode
            </p>
            <p className="font-display text-lg font-extrabold text-fifa-blue-dark">
              {pricing.modeScore}
            </p>
          </div>
          <div className="rounded-card border-2 border-dz-red/20 bg-dz-red/5 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wider text-dz-red">
              O/U 2.5 · BTTS
            </p>
            <p className="font-mono font-semibold text-fifa-blue-dark">
              {pct(pricing.over25)} · {pct(pricing.btts)}
            </p>
          </div>
        </div>

        <div className="mx-5 mb-5">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-fifa-blue">
            Top scores
          </p>
          <div className="flex flex-wrap gap-2">
            {pricing.topScores.map(({ score, prob }) => (
              <span
                key={score}
                className="rounded-card border border-fifa-blue/20 bg-surface px-3 py-1 font-mono text-xs"
              >
                {score}{" "}
                <span className="font-bold text-dz-green">{pct(prob)}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      <p className="mt-4 text-xs text-ink-tertiary">
        Matchs programmés : {matches.length} · Équipes : {teams.length}
      </p>
    </>
  );
}
