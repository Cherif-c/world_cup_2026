# CDM 2026 — Pricing Engine

Dashboard Next.js : prédictions dynamiques (72 matchs), classement projeté, paramétrage du modèle et documentation mathématique.

## Pages

| Route | Contenu |
|---|---|
| `/predictions` | Prédictions par journée × groupe (J1–J3, 12 poules) |
| `/classement` | Classement réel + projection modèle par poule |
| `/parametres` | Réglages modèle, Elo, simulateur de pricing live |
| `/doc` | Spécification Poisson-Elo · Dixon-Coles · Bühlmann |

## Stack

- Next.js 15 · TypeScript · Tailwind CSS · KaTeX
- Moteur TypeScript (`src/lib/model/`) + CLI Python (`wc26_model.py`)
- Fixtures : `src/data/fixtures.ts` (72 matchs, 3 journées × 12 groupes)

## Développement

```powershell
npm install
npm run dev
```

## Scores en direct

**Source : ESPN** (gratuit, sans clé, toute la CDM 2026)

- Rafraîchissement **toutes les 15 s** pendant un match live
- Horloge en direct (`45'`, `90'+3'`, Mi-temps…)

> Les prédictions et le classement projeté sont **recalculés côté client** à chaque changement de paramètres du modèle — aucune valeur en dur.

## Modèle Python

```powershell
python wc26_model.py "Argentine" "Algerie" --bonus-b 0.25
python wc26_model.py "France" "Senegal" --marche 1.70 3.80 5.20
```
