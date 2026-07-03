import { useState } from "react";
import { useFeatureFlags } from "../../contexts/FeatureFlagContext";
import { projects } from "../../data/projects";

/**
 * Floating dev-only panel for toggling feature flags at runtime.
 * Renders nothing outside of dev (`canEditFlags` is false in production),
 * and the parent only mounts this component when `import.meta.env.DEV`.
 */
export function FeatureFlagsPanel() {
  const { flags, setFlag, setProjectEnabled, isProjectEnabled, canEditFlags } =
    useFeatureFlags();
  const [open, setOpen] = useState(false);

  if (!canEditFlags) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] font-mono text-xs">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="rounded-full bg-black/85 px-3 py-2 text-white shadow-lg transition hover:bg-black"
      >
        🚩 Feature Flags
      </button>

      {open && (
        <div className="mt-2 w-64 rounded-lg border border-white/10 bg-black/90 p-3 text-white shadow-xl backdrop-blur">
          <p className="mb-2 uppercase tracking-wide text-white/40">
            Dev only — hidden in production
          </p>

          <label className="flex items-center justify-between gap-2 py-1">
            <span>Nav Bar</span>
            <input
              type="checkbox"
              checked={flags.navBar}
              onChange={(e) => setFlag("navBar", e.target.checked)}
            />
          </label>

          <label className="flex items-center justify-between gap-2 py-1">
            <span>Spotify Listening Bar</span>
            <input
              type="checkbox"
              checked={flags.spotifyBar}
              onChange={(e) => setFlag("spotifyBar", e.target.checked)}
            />
          </label>

          <div className="mt-2 border-t border-white/10 pt-2">
            <p className="mb-1 text-white/40">Project Cards</p>
            {projects.map((project) => (
              <label
                key={project.id}
                className="flex items-center justify-between gap-2 py-1"
              >
                <span className="truncate pr-2">{project.name}</span>
                <input
                  type="checkbox"
                  checked={isProjectEnabled(project.id)}
                  onChange={(e) =>
                    setProjectEnabled(project.id, e.target.checked)
                  }
                />
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
