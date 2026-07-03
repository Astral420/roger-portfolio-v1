import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_FEATURE_FLAGS,
  isDev,
  loadFeatureFlags,
  saveFeatureFlags,
  type FeatureFlags,
} from "../lib/featureFlags";

type ToggleableFlag = "navBar" | "spotifyBar";

interface FeatureFlagContextValue {
  flags: FeatureFlags;
  /** Whether a given project card should render (defaults to enabled). */
  isProjectEnabled: (projectId: string) => boolean;
  /** No-op in production — flags can only be changed in dev. */
  setFlag: (key: ToggleableFlag, value: boolean) => void;
  /** No-op in production — flags can only be changed in dev. */
  setProjectEnabled: (projectId: string, value: boolean) => void;
  /** True only in dev builds; use this to gate any flag-editing UI. */
  canEditFlags: boolean;
}

const FeatureFlagContext = createContext<FeatureFlagContextValue | undefined>(
  undefined,
);

export function FeatureFlagProvider({ children }: { children: ReactNode }) {
  const [flags, setFlags] = useState<FeatureFlags>(() =>
    isDev ? loadFeatureFlags() : DEFAULT_FEATURE_FLAGS,
  );

  const updateFlags = useCallback(
    (updater: (prev: FeatureFlags) => FeatureFlags) => {
      if (!isDev) return;
      setFlags((prev) => {
        const next = updater(prev);
        saveFeatureFlags(next);
        return next;
      });
    },
    [],
  );

  const setFlag = useCallback(
    (key: ToggleableFlag, value: boolean) => {
      updateFlags((prev) => ({ ...prev, [key]: value }));
    },
    [updateFlags],
  );

  const setProjectEnabled = useCallback(
    (projectId: string, value: boolean) => {
      updateFlags((prev) => ({
        ...prev,
        projectCards: { ...prev.projectCards, [projectId]: value },
      }));
    },
    [updateFlags],
  );

  const isProjectEnabled = useCallback(
    (projectId: string) => flags.projectCards[projectId] ?? true,
    [flags.projectCards],
  );

  const value = useMemo<FeatureFlagContextValue>(
    () => ({
      flags,
      isProjectEnabled,
      setFlag,
      setProjectEnabled,
      canEditFlags: isDev,
    }),
    [flags, isProjectEnabled, setFlag, setProjectEnabled],
  );

  return (
    <FeatureFlagContext.Provider value={value}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

export function useFeatureFlags() {
  const ctx = useContext(FeatureFlagContext);
  if (!ctx) {
    throw new Error("useFeatureFlags must be used within a FeatureFlagProvider");
  }
  return ctx;
}
