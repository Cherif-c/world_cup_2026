"use client";

import "katex/dist/katex.min.css";
import katex from "katex";
import { PageHeader } from "@/components/ui/PageHeader";

function Formula({ tex }: { tex: string }) {
  const html = katex.renderToString(tex, {
    throwOnError: false,
    displayMode: true,
  });
  return (
    <div
      className="doc-formula"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function InlineFormula({ tex }: { tex: string }) {
  const html = katex.renderToString(tex, { throwOnError: false });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

export function DocContent() {
  return (
    <article className="doc-section">
      <PageHeader
        title="Documentation"
        subtitle="Spécification complète du moteur de pricing — Poisson bivarié à intensités Elo, Dixon-Coles, crédibilité Bühlmann."
      />

      <div className="card-pro p-6 sm:p-8">
        <p className="callout-dz mb-6">
          <strong className="font-bold text-dz-green">Cadre actuariel.</strong> Le modèle
          combine une estimation structurelle (Elo → intensités Poisson) avec une
          pondération de crédibilité contre le marché — exactement la logique
          Bühlmann : expérience propre vs expérience du portefeuille.
        </p>

        <h2>1. Force des équipes → différentiel de buts</h2>
        <p>
          Base : ratings <strong>Elo</strong> (eloratings.net — pas le classement
          FIFA, trop lissé). Le différentiel ajusté :
        </p>
        <Formula tex="d = E_A - E_B + H + A_{\text{alt}} + S" />
        <ul>
          <li>
            <InlineFormula tex="H" /> = avantage terrain (+80 hôte, +25
            quasi-domicile)
          </li>
          <li>
            <InlineFormula tex="A_{\text{alt}}" /> = altitude (+30 Azteca pour le
            Mexique)
          </li>
          <li>
            <InlineFormula tex="S" /> = ajustements stylistiques (couche 5)
          </li>
        </ul>
        <p>Conversion Elo → écart de buts espéré (calibration ~40 ans) :</p>
        <Formula tex="\mathbb{E}[\Delta G] \approx \frac{d}{137}" />

        <h2>2. Décomposition en intensités</h2>
        <p>
          Total de buts attendu{" "}
          <InlineFormula tex="\mu \approx 2{,}45" /> pour un match de poule CDM
          (prudence J1, chaleur, enjeu). Partage multiplicatif dérivé du score
          attendu Elo :
        </p>
        <Formula tex="w = \frac{1}{1 + 10^{-d/400}}, \quad \text{ratio} = \left(\frac{w}{1-w}\right)^{0{,}85}" />
        <Formula tex="\lambda_A = \max\!\left(0{,}15,\; \frac{\mu \cdot \text{ratio}}{1+\text{ratio}} + b_A\right), \quad \lambda_B = \max\!\left(0{,}15,\; \frac{\mu}{1+\text{ratio}} + b_B\right)" />
        <p>
          Le partage multiplicatif évite d&apos;écraser l&apos;outsider au
          plancher sur les gros écarts (défaut du partage additif).
        </p>

        <h2>3. Matrice de scores — Dixon-Coles</h2>
        <p>
          Scores ~ Poisson(<InlineFormula tex="\lambda_A" />) ×
          Poisson(<InlineFormula tex="\lambda_B" />), avec correction des
          cellules basses (ρ ≈ −0,10) :
        </p>
        <Formula tex="\tau(x,y) = \begin{cases} 1 - \lambda_A \lambda_B \rho & x{=}y{=}0 \\ 1 + \lambda_A \rho & x{=}0, y{=}1 \\ 1 + \lambda_B \rho & x{=}1, y{=}0 \\ 1 - \rho & x{=}y{=}1 \\ 1 & \text{sinon} \end{cases}" />
        <p>
          Somme par triangle → P(1), P(N), P(2). Le mode de la matrice donne le
          score à trancher.
        </p>

        <h2>4. Crédibilité contre le marché</h2>
        <p>
          Probabilités marché dé-vigées (normalisation des inverses de cotes),
          puis mélange Bühlmann :
        </p>
        <Formula tex="p_{\text{final}} = z \cdot p_{\text{modèle}} + (1-z) \cdot p_{\text{marché}}, \quad z \approx 0{,}35" />
        <p>
          Un écart &gt; ~8 points sur une issue après pondération signale un
          potentiel value bet — pas avant.
        </p>

        <h2>5. Couche stylistique S</h2>
        <h3>Set-piece share</h3>
        <p>
          Si une équipe tire &gt;40 % de ses buts des CPA (Tchéquie : 50 %), on
          redistribue λ vers une loi plus discrète — même espérance, variance
          accrue. D&apos;où la thèse Krejčí (juste) sans changer le vainqueur
          prédit.
        </p>
        <h3>Block-breaking</h3>
        <p>
          Modificateur +0,2 à +0,5 sur λ pour créateurs élite face à un bloc bas.
          La Corée (Lee Kang-in / Hwang) méritait +0,4 — paramètre absent = match
          perdu. Ajustable dans l&apos;onglet Paramètres.
        </p>

        <h2>6. Métriques de suivi</h2>
        <p>Score de Brier multiclasse pour calibrer le modèle :</p>
        <Formula tex="BS = \sum_{i \in \{1,N,2\}} (p_i - o_i)^2" />
        <p>
          Référence chance pure (⅓, ⅓, ⅓) : 0,667. Verdicts : score exact,
          bon vainqueur, ou raté.
        </p>

        <h2>7. Implémentation</h2>
        <div className="overflow-x-auto rounded-card border border-fifa-blue/20">
          <table className="table-pro">
            <thead>
              <tr>
                <th>Module</th>
                <th>Rôle</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-mono text-xs">wc26_model.py</td>
                <td className="text-sm">CLI Python (stdlib) — pricing batch</td>
              </tr>
              <tr>
                <td className="font-mono text-xs">src/lib/model/engine.ts</td>
                <td className="text-sm">
                  Moteur TypeScript identique — UI interactive
                </td>
              </tr>
              <tr>
                <td className="font-mono text-xs">src/data/fixtures.ts</td>
                <td className="text-sm">
                  Données matchs + saisie des résultats réels
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-xs text-ink-tertiary">
          Auteur du cadre : Karim × Claude, juin 2026. Ratings Elo à rafraîchir
          après chaque journée (~10–25 pts par match CDM).
        </p>
      </div>
    </article>
  );
}
