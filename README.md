# CDM 2026 — Pricing Engine

Dashboard Next.js professionnel : prédictions tabulaires, calendrier, paramétrage du modèle et documentation mathématique.

## Pages

| Route | Contenu |
|---|---|
| `/predictions` | Tableau prédictions vs résultats (1X2, Brier, verdicts) |
| `/calendrier` | Programme complet phase de poules |
| `/parametres` | Réglages modèle, Elo, simulateur de pricing live |
| `/doc` | Spécification Poisson-Elo · Dixon-Coles · Bühlmann |

## Stack

- Next.js 15 · TypeScript · Tailwind CSS · KaTeX
- Moteur TypeScript (`src/lib/model/`) + CLI Python (`wc26_model.py`)

## Développement

```powershell
npm install
npm run dev
```

## Saisir un résultat

`src/data/matches.ts` → `result: "2-1"` puis `git push` (Vercel redéploie).

## Modèle Python

```powershell
python wc26_model.py "Argentine" "Algerie" --bonus-b 0.25
python wc26_model.py "France" "Senegal" --marche 1.70 3.80 5.20
```

## Déploiement

```powershell
git add . ; git commit -m "message" ; git push
vercel --prod
```

Site : [worldcup2026-gamma-mocha.vercel.app](https://worldcup2026-gamma-mocha.vercel.app)
