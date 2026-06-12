"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { LiveApiResponse, LiveMatchUpdate } from "@/lib/live/types";

interface LiveScoresContextValue {
  data: LiveApiResponse | null;
  loading: boolean;
  refresh: () => Promise<void>;
  getUpdate: (matchId: string) => LiveMatchUpdate | undefined;
  pollIntervalMs: number;
}

const LiveScoresContext = createContext<LiveScoresContextValue | null>(null);

export function LiveScoresProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<LiveApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/live", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as LiveApiResponse;
      setData(json);
    } catch {
      /* garde la dernière donnée valide */
    } finally {
      setLoading(false);
    }
  }, []);

  const pollIntervalMs = useMemo(() => {
    if (!data) return 45_000;
    if (data.liveCount > 0) return 15_000;
    return 45_000;
  }, [data]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    const tick = () => {
      if (document.visibilityState === "visible") refresh();
    };

    timerRef.current = setInterval(tick, pollIntervalMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [refresh, pollIntervalMs]);

  const getUpdate = useCallback(
    (matchId: string) => data?.matches.find((m) => m.matchId === matchId),
    [data]
  );

  const value = useMemo(
    () => ({ data, loading, refresh, getUpdate, pollIntervalMs }),
    [data, loading, refresh, getUpdate, pollIntervalMs]
  );

  return (
    <LiveScoresContext.Provider value={value}>
      {children}
    </LiveScoresContext.Provider>
  );
}

export function useLiveScores() {
  const ctx = useContext(LiveScoresContext);
  if (!ctx) throw new Error("useLiveScores must be used within LiveScoresProvider");
  return ctx;
}
