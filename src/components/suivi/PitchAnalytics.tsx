"use client";

import { useEffect, useMemo, useState } from "react";
import type { MatchDetail, MatchShot } from "@/lib/live/match-detail-types";
import { FlagIcon } from "@/components/ui/FlagIcon";

type ViewMode = "heatmap" | "shots";
type SideFilter = "all" | "home" | "away";

const SHOT_COLOR: Record<MatchShot["outcome"], string> = {
  goal: "#22c55e",
  on_target: "#f97316",
  off_target: "#94a3b8",
  blocked: "#eab308",
  other: "#64748b",
};

const HEAT_COLS = 32;
const HEAT_ROWS = 20;

/** Vert → lime → orange → rouge (style analytics moderne) */
function heatColor(intensity: number): string {
  const t = Math.max(0, Math.min(1, intensity));
  if (t < 0.25) return mixHex("#14532d", "#22c55e", t / 0.25);
  if (t < 0.5) return mixHex("#22c55e", "#a3e635", (t - 0.25) / 0.25);
  if (t < 0.75) return mixHex("#a3e635", "#f97316", (t - 0.5) / 0.25);
  return mixHex("#f97316", "#ef4444", (t - 0.75) / 0.25);
}

function mixHex(a: string, b: string, t: number): string {
  const pa = hexToRgb(a);
  const pb = hexToRgb(b);
  const r = Math.round(pa.r + (pb.r - pa.r) * t);
  const g = Math.round(pa.g + (pb.g - pa.g) * t);
  const bl = Math.round(pa.b + (pb.b - pa.b) * t);
  return `rgb(${r},${g},${bl})`;
}

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function buildHeatGrid(
  points: { x: number; y: number }[],
  cols: number,
  rows: number
): number[][] {
  const grid = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => 0)
  );
  const sigma = 1.1;

  for (const p of points) {
    const cx = (p.x / 100) * (cols - 1);
    const cy = (p.y / 100) * (rows - 1);
    const ri0 = Math.max(0, Math.floor(cy - sigma * 2));
    const ri1 = Math.min(rows - 1, Math.ceil(cy + sigma * 2));
    const ci0 = Math.max(0, Math.floor(cx - sigma * 2));
    const ci1 = Math.min(cols - 1, Math.ceil(cx + sigma * 2));

    for (let ri = ri0; ri <= ri1; ri++) {
      for (let ci = ci0; ci <= ci1; ci++) {
        const d2 = (ri - cy) ** 2 + (ci - cx) ** 2;
        grid[ri][ci] += Math.exp(-d2 / (2 * sigma ** 2));
      }
    }
  }

  const max = Math.max(1, ...grid.flat());
  return grid.map((row) => row.map((v) => v / max));
}

function teamTouchCount(
  points: MatchDetail["touchPoints"],
  side: "home" | "away"
) {
  return points.filter((p) => p.side === side).length;
}

export function PitchAnalytics({
  matchId,
  detail,
}: {
  matchId: string;
  detail: MatchDetail;
}) {
  const [mode, setMode] = useState<ViewMode>("heatmap");
  const [side, setSide] = useState<SideFilter>("all");
  const [shots, setShots] = useState<MatchShot[]>(detail.shots);
  const [touchPoints, setTouchPoints] = useState(detail.touchPoints);
  const [pitchLoading, setPitchLoading] = useState(
    detail.shots.length === 0 && detail.touchPoints.length === 0
  );
  const [shotMapAvailable, setShotMapAvailable] = useState(
    detail.shotMapAvailable
  );

  useEffect(() => {
    if (detail.shots.length > 0 || detail.touchPoints.length > 0) return;

    let cancelled = false;
    async function loadPitch() {
      try {
        const res = await fetch(`/api/match/${matchId}?pitch=1`);
        if (!res.ok) return;
        const data = (await res.json()) as {
          shots: MatchShot[];
          touchPoints: { x: number; y: number; side: "home" | "away" }[];
          shotMapAvailable: boolean;
        };
        if (!cancelled) {
          setShots(data.shots);
          setTouchPoints(data.touchPoints);
          setShotMapAvailable(data.shotMapAvailable);
        }
      } finally {
        if (!cancelled) setPitchLoading(false);
      }
    }
    loadPitch();
    return () => {
      cancelled = true;
    };
  }, [matchId, detail.shots.length, detail.touchPoints.length]);

  const filteredTouches = useMemo(() => {
    if (side === "all") return touchPoints;
    return touchPoints.filter((p) => p.side === side);
  }, [touchPoints, side]);

  const filteredShots = useMemo(() => {
    if (side === "all") return shots;
    return shots.filter((s) => s.teamSide === side);
  }, [shots, side]);

  const heatGrid = useMemo(
    () =>
      buildHeatGrid(
        filteredTouches.map((p) => ({ x: p.x, y: p.y })),
        HEAT_COLS,
        HEAT_ROWS
      ),
    [filteredTouches]
  );

  const hasHeat = filteredTouches.length > 20;
  const hasShots = filteredShots.length > 0;

  const teamOptions: {
    id: SideFilter;
    label: string;
    team?: string;
    count: number;
  }[] = [
    { id: "all", label: "Combinée", count: touchPoints.length },
    {
      id: "home",
      label: detail.home,
      team: detail.home,
      count: teamTouchCount(touchPoints, "home"),
    },
    {
      id: "away",
      label: detail.away,
      team: detail.away,
      count: teamTouchCount(touchPoints, "away"),
    },
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <div className="card-analytics xl:col-span-2">
        <div className="card-analytics-header flex-col items-stretch gap-4 sm:flex-row sm:items-center">
          <h2>Terrain analytique</h2>
          <div className="analytics-pills sm:ml-auto">
            {(["heatmap", "shots"] as ViewMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`analytics-pill ${mode === m ? "analytics-pill-active" : ""}`}
              >
                {m === "heatmap" ? "Heatmap" : "Tirs"}
              </button>
            ))}
          </div>
        </div>

        <div className="border-b border-line-soft bg-surface-muted/40 px-4 py-3 sm:px-6">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-ink-tertiary">
            Filtrer par équipe
          </p>
          <div className="flex flex-wrap gap-2">
            {teamOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSide(opt.id)}
                className={`team-filter-chip ${side === opt.id ? "team-filter-chip-active" : ""}`}
              >
                {opt.team && <FlagIcon team={opt.team} size={22} />}
                <span className="max-w-[120px] truncate font-semibold">
                  {opt.label}
                </span>
                <span className="team-filter-count">{opt.count}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {pitchLoading ? (
            <div className="flex h-72 items-center justify-center rounded-card-lg bg-gradient-to-br from-[#0c1220] to-[#111827] text-sm text-ink-onDark-muted shadow-card-lg">
              Construction heatmap ESPN…
            </div>
          ) : (
            <>
              <PitchSvg
                mode={mode}
                heatGrid={heatGrid}
                shots={filteredShots}
                home={detail.home}
                away={detail.away}
                side={side}
                hasHeat={hasHeat}
                hasShots={hasShots}
              />
              {mode === "heatmap" && hasHeat && (
                <HeatLegend />
              )}
            </>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="card-analytics p-5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-accent-emerald">
            Résumé
            {side !== "all" && (
              <span className="ml-1 normal-case text-ink-secondary">
                · {side === "home" ? detail.home : detail.away}
              </span>
            )}
          </h3>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-secondary">Touches affichées</dt>
              <dd className="font-mono font-bold">{filteredTouches.length}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-secondary">Tirs affichés</dt>
              <dd className="font-mono font-bold">{filteredShots.length}</dd>
            </div>
            <div className="flex justify-between border-t border-line-soft pt-3">
              <dt className="text-ink-secondary">{detail.home}</dt>
              <dd className="font-mono font-bold">
                {teamTouchCount(touchPoints, "home")} touches
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-secondary">{detail.away}</dt>
              <dd className="font-mono font-bold">
                {teamTouchCount(touchPoints, "away")} touches
              </dd>
            </div>
          </dl>
        </div>

        {mode === "shots" && filteredShots.length > 0 && (
          <div className="card-analytics max-h-[340px] overflow-y-auto">
            <div className="card-analytics-header">
              <h2>Détail tirs</h2>
            </div>
            <ul className="divide-y divide-line-soft">
              {filteredShots.map((s) => (
                <li key={s.id} className="px-4 py-2.5 text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full shadow-sm"
                      style={{ background: SHOT_COLOR[s.outcome] }}
                    />
                    <span className="font-mono text-xs font-bold text-accent-emerald">
                      {s.minute}
                    </span>
                    <span className="font-semibold text-ink">
                      {s.player ?? s.teamName}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-ink-tertiary">{s.text}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="card-analytics p-4 text-xs leading-relaxed text-ink-tertiary">
          Heatmap lissée (noyau gaussien) — vert zones calmes, orange
          activité moyenne, rouge zones chaudes.
          {shotMapAvailable
            ? " Données ESPN complètes."
            : " Données partielles."}
        </div>
      </div>
    </div>
  );
}

function HeatLegend() {
  return (
    <div className="mx-auto mt-4 flex max-w-md items-center gap-3">
      <span className="text-[10px] font-bold uppercase tracking-wider text-ink-tertiary">
        Faible
      </span>
      <div
        className="heat-legend-bar h-2.5 flex-1 rounded-full shadow-inner"
        aria-hidden
      />
      <span className="text-[10px] font-bold uppercase tracking-wider text-ink-tertiary">
        Intense
      </span>
    </div>
  );
}

function PitchSvg({
  mode,
  heatGrid,
  shots,
  home,
  away,
  side,
  hasHeat,
  hasShots,
}: {
  mode: ViewMode;
  heatGrid: number[][];
  shots: MatchDetail["shots"];
  home: string;
  away: string;
  side: SideFilter;
  hasHeat: boolean;
  hasShots: boolean;
}) {
  const uid = useMemo(
    () => `pitch-${Math.random().toString(36).slice(2, 9)}`,
    []
  );
  const w = 720;
  const h = 468;
  const pad = 28;
  const pw = w - pad * 2;
  const ph = h - pad * 2;
  const cols = heatGrid[0]?.length ?? HEAT_COLS;
  const rows = heatGrid.length;
  const cellW = pw / cols;
  const cellH = ph / rows;

  const activeTeam = side === "home" ? home : side === "away" ? away : null;

  return (
    <div className="pitch-frame">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="pitch-svg"
        role="img"
        aria-label="Terrain de football analytique"
      >
        <defs>
          <linearGradient id={`${uid}-pitch`} x1="0" y1="0" x2="0.2" y2="1">
            <stop offset="0%" stopColor="#1e5c4a" />
            <stop offset="45%" stopColor="#164a3d" />
            <stop offset="100%" stopColor="#0f3329" />
          </linearGradient>

          <pattern
            id={`${uid}-stripes`}
            patternUnits="userSpaceOnUse"
            width="36"
            height={ph}
          >
            <rect width="18" height={ph} fill="rgba(255,255,255,0.028)" />
          </pattern>

          <radialGradient id={`${uid}-vignette`} cx="50%" cy="50%" r="65%">
            <stop offset="55%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.45" />
          </radialGradient>

          <filter
            id={`${uid}-heatBlur`}
            x="-40%"
            y="-40%"
            width="180%"
            height="180%"
          >
            <feGaussianBlur stdDeviation="11" />
          </filter>

          <filter
            id={`${uid}-pitchShadow`}
            x="-15%"
            y="-15%"
            width="130%"
            height="130%"
          >
            <feDropShadow
              dx="0"
              dy="10"
              stdDeviation="14"
              floodColor="#0c1220"
              floodOpacity="0.55"
            />
          </filter>

          <filter id={`${uid}-shotGlow`}>
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="3"
              floodColor="#fff"
              floodOpacity="0.35"
            />
          </filter>
        </defs>

        <g filter={`url(#${uid}-pitchShadow)`}>
          <rect
            x={4}
            y={4}
            width={w - 8}
            height={h - 8}
            rx={18}
            fill={`url(#${uid}-pitch)`}
          />
          <rect
            x={pad}
            y={pad}
            width={pw}
            height={ph}
            fill={`url(#${uid}-stripes)`}
          />

          {/* Lignes terrain */}
          <g stroke="rgba(255,255,255,0.32)" strokeWidth={1.75} fill="none">
            <rect x={pad} y={pad} width={pw} height={ph} />
            <line x1={pad + pw / 2} y1={pad} x2={pad + pw / 2} y2={pad + ph} />
            <circle
              cx={pad + pw / 2}
              cy={pad + ph / 2}
              r={pw * 0.115}
            />
            <rect
              x={pad}
              y={pad + ph * 0.21}
              width={pw * 0.17}
              height={ph * 0.58}
            />
            <rect
              x={pad + pw * 0.83}
              y={pad + ph * 0.21}
              width={pw * 0.17}
              height={ph * 0.58}
            />
            <rect
              x={pad}
              y={pad + ph * 0.35}
              width={pw * 0.06}
              height={ph * 0.3}
            />
            <rect
              x={pad + pw * 0.94}
              y={pad + ph * 0.35}
              width={pw * 0.06}
              height={ph * 0.3}
            />
          </g>

          {/* Heatmap lissée */}
          {mode === "heatmap" && hasHeat && (
            <g
              filter={`url(#${uid}-heatBlur)`}
              style={{ mixBlendMode: "screen" }}
              opacity={0.95}
            >
              {heatGrid.flatMap((row, ri) =>
                row.map((intensity, ci) => {
                  if (intensity < 0.06) return null;
                  const cx = pad + ci * cellW + cellW / 2;
                  const cy = pad + ri * cellH + cellH / 2;
                  const r = Math.max(cellW, cellH) * 1.65;
                  return (
                    <circle
                      key={`${ri}-${ci}`}
                      cx={cx}
                      cy={cy}
                      r={r}
                      fill={heatColor(intensity)}
                      opacity={0.28 + intensity * 0.62}
                    />
                  );
                })
              )}
            </g>
          )}

          {/* Vignette */}
          <rect
            x={pad}
            y={pad}
            width={pw}
            height={ph}
            fill={`url(#${uid}-vignette)`}
            pointerEvents="none"
          />

          {/* Labels équipes */}
          <g fill="rgba(255,255,255,0.85)" fontSize={11} fontWeight={700}>
            <text
              x={pad + 10}
              y={pad + 18}
              opacity={side === "away" ? 0.35 : 1}
            >
              {home}
            </text>
            <text
              x={pad + pw - 10}
              y={pad + 18}
              textAnchor="end"
              opacity={side === "home" ? 0.35 : 1}
            >
              {away}
            </text>
          </g>

          {activeTeam && mode === "heatmap" && (
            <text
              x={w / 2}
              y={h - 10}
              textAnchor="middle"
              fill="rgba(255,255,255,0.55)"
              fontSize={10}
              fontWeight={600}
            >
              Filtre actif · {activeTeam}
            </text>
          )}

          {mode === "heatmap" && !hasHeat && (
            <text
              x={w / 2}
              y={h / 2}
              fill="rgba(255,255,255,0.65)"
              fontSize={13}
              textAnchor="middle"
              fontWeight={600}
            >
              Heatmap disponible pendant / après le match
            </text>
          )}

          {/* Tirs */}
          {mode === "shots" &&
            shots.map((s) => {
              const cx = pad + (s.x / 100) * pw;
              const cy = pad + (s.y / 100) * ph;
              const isGoal = s.outcome === "goal";
              const color = SHOT_COLOR[s.outcome];
              return (
                <g key={s.id} filter={`url(#${uid}-shotGlow)`}>
                  {isGoal && (
                    <>
                      <circle
                        cx={cx}
                        cy={cy}
                        r={18}
                        fill={color}
                        opacity={0.18}
                      />
                      <circle
                        cx={cx}
                        cy={cy}
                        r={10}
                        fill={color}
                        opacity={0.35}
                      />
                    </>
                  )}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isGoal ? 5.5 : 4}
                    fill={color}
                    stroke="rgba(255,255,255,0.9)"
                    strokeWidth={1.5}
                  />
                </g>
              );
            })}

          {mode === "shots" && !hasShots && (
            <text
              x={w / 2}
              y={h / 2}
              fill="rgba(255,255,255,0.65)"
              fontSize={13}
              textAnchor="middle"
              fontWeight={600}
            >
              Aucun tir géolocalisé pour cette sélection
            </text>
          )}
        </g>
      </svg>
    </div>
  );
}
