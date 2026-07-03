/**
 * Feature flags for toggling UI elements.
 *
 * Flags can only be changed while running in dev (`import.meta.env.DEV`).
 * In production the persisted overrides are ignored entirely and the
 * hardcoded defaults below are used, so end users have no way to flip them.
 */
export interface FeatureFlags {
  navBar: boolean;
  spotifyBar: boolean;
  /** Per-project override, keyed by `Project.id`. Missing entries default to enabled. */
  projectCards: Record<string, boolean>;
}

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  navBar: true,
  spotifyBar: true,
  projectCards: {},
};

const STORAGE_KEY = "dev:feature-flags";

export const isDev = import.meta.env.DEV;

export function loadFeatureFlags(): FeatureFlags {
  if (!isDev) return DEFAULT_FEATURE_FLAGS;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_FEATURE_FLAGS;

    const parsed = JSON.parse(raw) as Partial<FeatureFlags>;
    return {
      ...DEFAULT_FEATURE_FLAGS,
      ...parsed,
      projectCards: {
        ...DEFAULT_FEATURE_FLAGS.projectCards,
        ...parsed.projectCards,
      },
    };
  } catch {
    return DEFAULT_FEATURE_FLAGS;
  }
}

export function saveFeatureFlags(flags: FeatureFlags) {
  if (!isDev) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(flags));
}
