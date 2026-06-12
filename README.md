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

## Scores en direct (API-Football)

1. Créer un compte gratuit sur [api-football.com](https://www.api-football.com/)
2. Copier la clé dans `.env.local` :

```env
API_FOOTBALL_KEY=votre_cle
```

3. Sur **Vercel** : Settings → Environment Variables → `API_FOOTBALL_KEY`
4. Les pages se rafraîchissent toutes les **60 s** (match en cours) ou **3 min** (sinon)
5. Plan gratuit : pas d'accès `season=2026` — le site utilise `?date=` (compatible free tier, ~100 req/jour)

Sans clé API, les scores statiques de `matches.ts` sont utilisés.

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
