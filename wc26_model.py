"""
Modèle de prédiction — Coupe du monde 2026
==========================================
Poisson bivarié à intensités Elo, correction Dixon-Coles,
ajustements contextuels (domicile, altitude, style) et
pondération de crédibilité contre les cotes du marché.

Pure stdlib (math uniquement) — tourne partout.

Usage rapide :
    python wc26_model.py "Coree du Sud" "Tchequie"
    python wc26_model.py "Argentine" "Algerie" --marche 1.55 4.20 6.50

"""

import math
import argparse

# ---------------------------------------------------------------------------
# 1. RATINGS ELO (approximation juin 2026 — À RAFRAÎCHIR sur eloratings.net)
#    Ces valeurs sont mes estimations pré-tournoi ; mets-les à jour après
#    chaque journée, l'Elo bouge de ~10-25 pts par match de CDM.
# ---------------------------------------------------------------------------
ELO = {
    # Groupe A
    "Mexique": 1850, "Afrique du Sud": 1690, "Coree du Sud": 1790, "Tchequie": 1775,
    # Groupe B
    "Canada": 1810, "Suisse": 1860, "Qatar": 1640, "Bosnie": 1745,
    # Groupe C
    "Bresil": 2020, "Maroc": 1900, "Haiti": 1545, "Ecosse": 1760,
    # Groupe D
    "Etats-Unis": 1820, "Australie": 1760, "Paraguay": 1810, "Turquie": 1850,
    # Groupe E
    "Allemagne": 1950, "Curacao": 1580, "Cote d'Ivoire": 1760, "Equateur": 1895,
    # Groupe F
    "Pays-Bas": 1990, "Japon": 1880, "Tunisie": 1730, "Suede": 1745,
    # Groupe G
    "Belgique": 1930, "Iran": 1780, "Egypte": 1750, "Nouvelle-Zelande": 1590,
    # Groupe H
    "Espagne": 2180, "Uruguay": 1930, "Arabie saoudite": 1660, "Cap-Vert": 1585,
    # Groupe I
    "France": 2030, "Senegal": 1850, "Norvege": 1900, "Irak": 1650,
    # Groupe J
    "Argentine": 2150, "Autriche": 1860, "Algerie": 1790, "Jordanie": 1645,
    # Groupe K
    "Portugal": 2010, "Colombie": 1950, "Ouzbekistan": 1700, "RD Congo": 1645,
    # Groupe L
    "Angleterre": 2050, "Croatie": 1910, "Panama": 1700, "Ghana": 1705,
}

# ---------------------------------------------------------------------------
# 2. PARAMÈTRES GLOBAUX
# ---------------------------------------------------------------------------
MU_TOTAL   = 2.45    # total de buts attendu, match de poule CDM (J1 prudente)
ELO_PER_GD = 137.0   # ~137 pts Elo par but d'écart espéré (calibration empirique)
RHO_DC     = -0.10   # paramètre Dixon-Coles (dépendance scores bas)
LAMBDA_MIN = 0.15    # plancher d'intensité
MAX_GOALS  = 8       # troncature de la matrice de scores
Z_CRED     = 0.35    # crédibilité accordée au modèle vs marché (Bühlmann-style)

# Ajustements Elo contextuels (en points Elo, s'ajoutent au différentiel)
ADJ = {
    "hote": 80,            # pays hôte chez lui (Mexique/USA/Canada)
    "quasi_domicile": 25,  # public massivement acquis sans être l'hôte
    "altitude_azteca": 30, # Mexico 2 200 m, pour l'équipe acclimatée
}


# ---------------------------------------------------------------------------
# 3. COEUR DU MODÈLE
# ---------------------------------------------------------------------------
def poisson_pmf(k: int, lam: float) -> float:
    return math.exp(-lam) * lam ** k / math.factorial(k)


def tau_dixon_coles(x: int, y: int, la: float, lb: float, rho: float) -> float:
    """Correction multiplicative des quatre cellules basses (Dixon & Coles 1997)."""
    if x == 0 and y == 0:
        return 1 - la * lb * rho
    if x == 0 and y == 1:
        return 1 + la * rho
    if x == 1 and y == 0:
        return 1 + lb * rho
    if x == 1 and y == 1:
        return 1 - rho
    return 1.0


def intensites(elo_a: float, elo_b: float,
               adj_elo_a: float = 0.0, adj_elo_b: float = 0.0,
               bonus_lambda_a: float = 0.0, bonus_lambda_b: float = 0.0,
               mu_total: float = MU_TOTAL) -> tuple:
    """
    Différentiel Elo ajusté -> (lambda_A, lambda_B).

    adj_elo_*     : ajustements en points Elo (domicile, altitude...)
    bonus_lambda_*: ajustements directs d'intensité (couche stylistique),
                    ex. block-breaking +0.2 à +0.5 pour des créateurs élite
                    face à un bloc bas annoncé. C'est le patch post-Corée.
    """
    d = (elo_a + adj_elo_a) - (elo_b + adj_elo_b)
    # Partage MULTIPLICATIF : ratio de buts derive du score espere Elo.
    # Evite d'ecraser l'outsider au plancher sur les gros ecarts (defaut
    # du partage additif lambda = mu/2 +/- egd/2).
    w = 1 / (1 + 10 ** (-d / 400))             # score espere Elo de A
    ratio = (w / (1 - w)) ** 0.85              # lambda_A / lambda_B
    lb = max(LAMBDA_MIN, mu_total / (1 + ratio) + bonus_lambda_b)
    la = max(LAMBDA_MIN, mu_total * ratio / (1 + ratio) + bonus_lambda_a)
    return la, lb


def matrice_scores(la: float, lb: float) -> dict:
    """Matrice P(score) avec correction Dixon-Coles, renormalisée."""
    m = {}
    for x in range(MAX_GOALS + 1):
        for y in range(MAX_GOALS + 1):
            p = (poisson_pmf(x, la) * poisson_pmf(y, lb)
                 * tau_dixon_coles(x, y, la, lb, RHO_DC))
            m[(x, y)] = max(0.0, p)
    s = sum(m.values())
    return {k: v / s for k, v in m.items()}


def issues_1n2(m: dict) -> tuple:
    p1 = sum(p for (x, y), p in m.items() if x > y)
    pn = sum(p for (x, y), p in m.items() if x == y)
    p2 = sum(p for (x, y), p in m.items() if x < y)
    return p1, pn, p2


def over_under(m: dict, seuil: float = 2.5) -> tuple:
    po = sum(p for (x, y), p in m.items() if x + y > seuil)
    return po, 1 - po


def btts(m: dict) -> float:
    return sum(p for (x, y), p in m.items() if x > 0 and y > 0)


def devig(cotes: list) -> list:
    """Cotes décimales -> probabilités implicites sans marge (normalisation)."""
    inv = [1 / c for c in cotes]
    s = sum(inv)
    return [i / s for i in inv]


def credibilite(p_modele: tuple, p_marche: tuple, z: float = Z_CRED) -> tuple:
    """p_final = z * modele + (1-z) * marche  (puis renormalisation)."""
    blend = [z * pm + (1 - z) * pk for pm, pk in zip(p_modele, p_marche)]
    s = sum(blend)
    return tuple(b / s for b in blend)


# ---------------------------------------------------------------------------
# 4. INTERFACE DE PRICING
# ---------------------------------------------------------------------------
def pricer(equipe_a: str, equipe_b: str,
           adj_a: float = 0.0, adj_b: float = 0.0,
           bonus_a: float = 0.0, bonus_b: float = 0.0,
           cotes_marche: list = None,
           n_scores: int = 6) -> None:
    ea, eb = ELO[equipe_a], ELO[equipe_b]
    la, lb = intensites(ea, eb, adj_a, adj_b, bonus_a, bonus_b)
    m = matrice_scores(la, lb)
    p1, pn, p2 = issues_1n2(m)

    print(f"\n{'=' * 58}")
    print(f"  {equipe_a}  vs  {equipe_b}")
    print(f"{'=' * 58}")
    print(f"  Elo : {ea:.0f} (+{adj_a:.0f})  vs  {eb:.0f} (+{adj_b:.0f})")
    print(f"  Intensites : lambda_A = {la:.2f} | lambda_B = {lb:.2f}")
    print(f"\n  1X2 modele : {p1:6.1%} / {pn:6.1%} / {p2:6.1%}")
    print(f"  Cotes justes (sans marge) : "
          f"{1/p1:.2f} / {1/pn:.2f} / {1/p2:.2f}")

    if cotes_marche:
        pm = devig(cotes_marche)
        pf = credibilite((p1, pn, p2), pm)
        print(f"  Marche (de-vige)  : {pm[0]:6.1%} / {pm[1]:6.1%} / {pm[2]:6.1%}")
        print(f"  Final (z={Z_CRED}) : {pf[0]:6.1%} / {pf[1]:6.1%} / {pf[2]:6.1%}")
        # Detection de value : edge = p_final - p_implicite_brute
        labels = [f"1 ({equipe_a})", "N", f"2 ({equipe_b})"]
        for lab, p_f, cote in zip(labels, pf, cotes_marche):
            ev = p_f * cote - 1
            tag = "  <-- VALUE" if ev > 0.05 else ""
            print(f"    EV {lab:<22}: {ev:+6.1%}{tag}")

    po, pu = over_under(m)
    print(f"\n  Over/Under 2.5 : {po:5.1%} / {pu:5.1%}   |   BTTS : {btts(m):5.1%}")

    print(f"\n  Scores les plus probables :")
    top = sorted(m.items(), key=lambda kv: -kv[1])[:n_scores]
    for (x, y), p in top:
        print(f"    {x}-{y} : {p:5.1%}")
    print()


# ---------------------------------------------------------------------------
# 5. CLI
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    ap = argparse.ArgumentParser(description="Pricing matchs CDM 2026")
    ap.add_argument("equipe_a")
    ap.add_argument("equipe_b")
    ap.add_argument("--adj-a", type=float, default=0.0,
                    help="Ajustement Elo equipe A (ex. 80 = hote)")
    ap.add_argument("--adj-b", type=float, default=0.0)
    ap.add_argument("--bonus-a", type=float, default=0.0,
                    help="Bonus lambda direct (block-breaking, +0.2 a +0.5)")
    ap.add_argument("--bonus-b", type=float, default=0.0)
    ap.add_argument("--marche", type=float, nargs=3, metavar=("C1", "CN", "C2"),
                    help="Cotes decimales 1/N/2 pour la ponderation credibilite")
    args = ap.parse_args()
    pricer(args.equipe_a, args.equipe_b,
           args.adj_a, args.adj_b, args.bonus_a, args.bonus_b,
           args.marche)
