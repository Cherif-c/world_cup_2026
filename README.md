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

## Scores en direct

**Source principale : ESPN** (gratuit, sans clé, toute la CDM 2026)
- Rafraîchissement **toutes les 15 s** pendant un match live
- Horloge en direct (`45'`, `90'+3'`, Mi-temps…)

**Repli optionnel : API-Football** (clé dans `.env.local` / Vercel)

```env
API_FOOTBALL_KEY=votre_cle   # optionnel
```

> Google n'expose pas d'API sport publique gratuite. ESPN est la meilleure alternative sans clé.

## Saisir un résultat (fallback manuel)

`src/data/matches.ts` → `result: "2-1"` si pas d'API.

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
