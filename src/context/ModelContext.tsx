"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { DEFAULT_MODEL_CONFIG } from "@/lib/model/config";
import type { ModelConfig } from "@/lib/model/types";

const STORAGE_KEY = "wc26-model-config";

interface ModelContextValue {
  config: ModelConfig;
  updateGlobal: (patch: Partial<ModelConfig["global"]>) => void;
  updateContextAdj: (patch: Partial<ModelConfig["contextAdj"]>) => void;
  updateElo: (team: string, value: number) => void;
  resetConfig: () => void;
}

const ModelContext = createContext<ModelContextValue | null>(null);

function loadConfig(): ModelConfig {
  if (typeof window === "undefined") return DEFAULT_MODEL_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_MODEL_CONFIG;
    return { ...DEFAULT_MODEL_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_MODEL_CONFIG;
  }
}

export function ModelProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<ModelConfig>(DEFAULT_MODEL_CONFIG);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setConfig(loadConfig());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [config, hydrated]);

  const updateGlobal = useCallback(
    (patch: Partial<ModelConfig["global"]>) => {
      setConfig((c) => ({ ...c, global: { ...c.global, ...patch } }));
    },
    []
  );

  const updateContextAdj = useCallback(
    (patch: Partial<ModelConfig["contextAdj"]>) => {
      setConfig((c) => ({ ...c, contextAdj: { ...c.contextAdj, ...patch } }));
    },
    []
  );

  const updateElo = useCallback((team: string, value: number) => {
    setConfig((c) => ({
      ...c,
      elo: { ...c.elo, [team]: value },
    }));
  }, []);

  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_MODEL_CONFIG);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({ config, updateGlobal, updateContextAdj, updateElo, resetConfig }),
    [config, updateGlobal, updateContextAdj, updateElo, resetConfig]
  );

  return (
    <ModelContext.Provider value={value}>{children}</ModelContext.Provider>
  );
}

export function useModelConfig() {
  const ctx = useContext(ModelContext);
  if (!ctx) throw new Error("useModelConfig must be used within ModelProvider");
  return ctx;
}
