# Coupe du Monde 2026 — Prédictions

Dashboard Next.js des prédictions vs résultats réels, avec drapeaux, calendrier par journée et score Brier.

## Stack

- **Next.js 15** + TypeScript + Tailwind CSS
- **Modèle Python** (`wc26_model.py`) — Poisson bivarié Elo, Dixon-Coles, crédibilité marché

## Développement local

```powershell
cd C:\Users\cherif.PERSONAL-PC\OneDrive\mcp_work\world_cup_2026
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Saisir un résultat

Éditer `src/data/matches.ts` : remplacer `result: null` par `result: "2-1"` (score équipe domicile — extérieur). Rebuild / redéployer.

## Modèle Python

```powershell
python wc26_model.py "Argentine" "Algerie"
python wc26_model.py "France" "Senegal" --marche 1.70 3.80 5.20
```

## Déploiement

```powershell
git add .
git commit -m "Resultats du 13 juin"
git push
vercel --prod
```

Site : [world-cup-2026](https://github.com/Cherif-c/world_cup_2026)
