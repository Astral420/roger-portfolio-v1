import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      /** Data is "fresh" for 15 s — no background refetch within this window. */
      staleTime: 15_000,
      /** Background poll every 30 s while the tab is visible. */
      refetchInterval: 30_000,
      /** Pause polling when the tab is hidden. */
      refetchIntervalInBackground: false,
      /** Immediately refetch when the user tabs back in. */
      refetchOnWindowFocus: true,
      retry: 2,
    },
  },
});
