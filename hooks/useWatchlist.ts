import { useState, useCallback } from "react";
import { useSupabase } from "./useSupabase";

export interface WatchlistItem {
  id: string;
  user_id: string;
  series_id: string;
  created_at: string;
  series?: {
    id: string;
    title: string;
    description?: string;
    poster_url?: string;
  };
}

export const useWatchlist = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { supabase } = useSupabase();

  const addToWatchlist = useCallback(
    async (seriesId: string) => {
      if (!supabase) {
        throw new Error("Supabase client not available");
      }

      try {
        setIsLoading(true);
        setError(null);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) {
          throw new Error("User not authenticated");
        }

        const { data, error: insertError } = await supabase
          .from("watchlists")
          .insert({ user_id: user.id, series_id: seriesId })
          .select("*")
          .single();

        if (insertError) {
          // If it's a unique constraint violation, the series is already in watchlist
          if (insertError.code === "23505") {
            return { success: true, alreadyExists: true };
          }
          throw new Error(insertError.message);
        }

        return { success: true, alreadyExists: false, data };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to add to watchlist";
        setError(errorMessage);
        console.error("Error adding to watchlist:", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [supabase],
  );

  const removeFromWatchlist = useCallback(
    async (seriesId: string) => {
      if (!supabase) {
        throw new Error("Supabase client not available");
      }

      try {
        setIsLoading(true);
        setError(null);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) {
          throw new Error("User not authenticated");
        }

        const { error: deleteError } = await supabase
          .from("watchlists")
          .delete()
          .eq("user_id", user.id)
          .eq("series_id", seriesId);

        if (deleteError) {
          throw new Error(deleteError.message);
        }

        return { success: true };
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to remove from watchlist";
        setError(errorMessage);
        console.error("Error removing from watchlist:", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [supabase],
  );

  const getWatchlist = useCallback(async () => {
    if (!supabase) {
      console.warn("Supabase client not available");
      return [];
    }

    try {
      setIsLoading(true);
      setError(null);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      const { data, error: queryError } = await supabase
        .from("watchlists")
        .select(
          `
          *,
          series:series_id (
            id,
            title,
            description,
            poster_url
          )
        `,
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (queryError) {
        console.error("[useWatchlist] Query error:", queryError);
        throw new Error(queryError.message);
      }

      console.log("[useWatchlist] Raw data:", data);
      return data as WatchlistItem[];
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch watchlist";
      setError(errorMessage);
      console.error("Error fetching watchlist:", err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const isInWatchlist = useCallback(
    async (seriesId: string) => {
      if (!supabase) {
        return false;
      }

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) {
          return false;
        }

        const { data, error } = await supabase
          .from("watchlists")
          .select("id")
          .eq("user_id", user.id)
          .eq("series_id", seriesId)
          .single();

        return !error && !!data;
      } catch (err) {
        console.error("Error checking watchlist status:", err);
        return false;
      }
    },
    [supabase],
  );

  return {
    addToWatchlist,
    removeFromWatchlist,
    getWatchlist,
    isInWatchlist,
    isLoading,
    error,
    clearError: () => setError(null),
  };
};
