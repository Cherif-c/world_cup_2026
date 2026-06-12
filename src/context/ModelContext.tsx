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

// v2 : invalide les configs stockées avant la correction de calibration
// (Elo Algérie, cotes inversées) — incrémenter à chaque changement de défauts.
const STORAGE_KEY = "wc26-model-config-v2";

interface ModelContextValue {
  config: ModelConfig;
  updateGlobal: (patch: Partial<ModelConfig["global"]>) => void;
  updateContextAdj: (patch: Partial<ModelConfig["contextAdj"]>) => void;
  updateElo: (team: string, value: number) => void;
  resetConfig: () => void;
}

const ModelContext = createContext<ModelContextValue | null>(null);

function mergeConfig(stored: Partial<ModelConfig>, defaults: ModelConfig): ModelConfig {
  return {
    global: {
      ...defaults.global,
      ...stored.global,
      muByMatchday: {
        ...defaults.global.muByMatchday,
        ...stored.global?.muByMatchday,
      },
    },
    contextAdj: { ...defaults.contextAdj, ...stored.contextAdj },
    elo: { ...defaults.elo, ...stored.elo },
    strength: { ...defaults.strength, ...stored.strength },
  };
}

function loadConfig(): ModelConfig {
  if (typeof window === "undefined") return DEFAULT_MODEL_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_MODEL_CONFIG;
    return mergeConfig(JSON.parse(raw), DEFAULT_MODEL_CONFIG);
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
