import { useQuery } from "@tanstack/react-query";
import { getNowPlaying } from "../lib/spotify";

export function useNowPlaying() {
  return useQuery({
    queryKey: ["spotify", "now-playing"],
    queryFn: getNowPlaying,
    staleTime: 15_000,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    retry: 2,
  });
}
