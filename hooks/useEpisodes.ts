import { useState, useCallback } from "react";
import { useSupabase } from "./useSupabase";
import * as FileSystem from "expo-file-system";

export interface Episode {
  id: string;
  series_id: string;
  author_id: string;
  title: string;
  synopsis?: string;
  episode_number?: number;
  duration_seconds?: number;
  status: "pending" | "processing" | "ready" | "failed";
  mux_asset_id?: string;
  mux_playback_id?: string;
  mux_upload_id?: string;
  thumbnail_url?: string;
  file_size?: number;
  created_at: string;
  updated_at: string;
  // Joined data
  series?: {
    id: string;
    title: string;
    poster_url?: string;
  };
}

export interface Series {
  id: string;
  title: string;
  description?: string;
  tags: string[];
  poster_url?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  episodes_count?: number;
}

export const useEpisodes = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { supabase } = useSupabase();

  const getEpisodes = useCallback(
    async (seriesId?: string, limit = 20, offset = 0) => {
      if (!supabase) {
        console.warn("Supabase client not available");
        return [];
      }

      try {
        setIsLoading(true);
        setError(null);

        let query = supabase
          .from("episodes")
          .select(
            `
          *,
          series:series_id (
            id,
            title,
            poster_url
          )
        `,
          )
          .eq("status", "ready")
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);

        if (seriesId) {
          query = query.eq("series_id", seriesId);
        }

        const { data, error: queryError } = await query;

        if (queryError) {
          console.error("Failed to fetch episodes:", queryError);
          setError(queryError.message);
          return [];
        }

        return data as Episode[];
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch episodes";
        setError(errorMessage);
        console.error("Error fetching episodes:", err);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [supabase],
  );

  const createSeries = useCallback(
    async (title: string, description?: string) => {
      if (!supabase) {
        throw new Error("Supabase client not available");
      }

      if (!title.trim()) {
        throw new Error("Series title is required");
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

        // Optional: de-duplicate by title per user
        const { data: existing, error: findError } = await supabase
          .from("series")
          .select("*")
          .eq("created_by", user.id)
          .ilike("title", title)
          .limit(1);

        if (findError) {
          console.warn("Series lookup error (ignored):", findError);
        }

        if (existing && existing.length > 0) {
          return existing[0] as Series;
        }

        const { data, error: insertError } = await supabase
          .from("series")
          .insert({ title: title.trim(), description, created_by: user.id })
          .select("*")
          .single();

        if (insertError) {
          throw new Error(insertError.message);
        }

        return data as Series;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create series";
        setError(errorMessage);
        console.error("Error creating series:", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [supabase],
  );

  const updateSeries = useCallback(
    async (
      seriesId: string,
      updates: { title?: string; description?: string },
    ) => {
      if (!supabase) {
        throw new Error("Supabase client not available");
      }

      if (!seriesId) {
        throw new Error("Series ID is required");
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

        // Prepare update data
        const updateData: any = {};
        if (updates.title !== undefined)
          updateData.title = updates.title.trim();
        if (updates.description !== undefined)
          updateData.description = updates.description?.trim() || null;

        if (Object.keys(updateData).length === 0) {
          throw new Error("No updates provided");
        }

        const { data, error: updateError } = await supabase
          .from("series")
          .update(updateData)
          .eq("id", seriesId)
          .eq("created_by", user.id) // Ensure user can only update their own series
          .select("*")
          .single();

        if (updateError) {
          throw new Error(updateError.message);
        }

        return data as Series;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update series";
        setError(errorMessage);
        console.error("Error updating series:", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [supabase],
  );

  const ensureDefaultSeries = useCallback(async () => {
    // Create or fetch a per-user default series named "My Videos"
    return createSeries("My Videos");
  }, [createSeries]);

  const setSeriesPoster = useCallback(
    async (
      seriesId: string,
      fileUri: string,
      mimeType: string = "image/jpeg",
    ) => {
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

        const fileExt = mimeType.includes("png")
          ? "png"
          : mimeType.includes("webp")
            ? "webp"
            : "jpg";
        const objectPath = `${user.id}/${seriesId}/${Date.now()}.${fileExt}`;

        // Upload to a public bucket named 'series-posters'
        // For React Native, we'll use a simpler approach with fetch and FormData
        const formData = new FormData();
        formData.append("file", {
          uri: fileUri,
          type: mimeType,
          name: `poster.${fileExt}`,
        } as any);

        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.access_token) {
          throw new Error("No valid session for upload");
        }

        const uploadResponse = await fetch(
          `${supabase.supabaseUrl}/storage/v1/object/series-posters/${objectPath}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
            body: formData,
          },
        );

        const uploadError = !uploadResponse.ok
          ? new Error(`Upload failed with status ${uploadResponse.status}`)
          : null;

        if (uploadError) {
          throw new Error(`Poster upload failed: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
          .from("series-posters")
          .getPublicUrl(objectPath);

        const publicUrl = publicUrlData.publicUrl;

        const { data, error: updateError } = await supabase
          .from("series")
          .update({ poster_url: publicUrl })
          .eq("id", seriesId)
          .eq("created_by", user.id)
          .select("*")
          .single();

        if (updateError) {
          throw new Error(updateError.message);
        }

        return data as Series;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to set series poster";
        setError(errorMessage);
        console.error("Error setting series poster:", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [supabase],
  );

  const getSeries = useCallback(
    async (limit = 20, offset = 0) => {
      if (!supabase) {
        console.warn("Supabase client not available");
        return [];
      }

      try {
        setIsLoading(true);
        setError(null);

        const { data, error: queryError } = await supabase
          .from("series")
          .select(
            `
          *,
          episodes_count:episodes(count)
        `,
          )
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);

        if (queryError) {
          console.error("Failed to fetch series:", queryError);
          setError(queryError.message);
          return [];
        }

        return data as Series[];
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch series";
        setError(errorMessage);
        console.error("Error fetching series:", err);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [supabase],
  );

  const getSeriesById = useCallback(
    async (seriesId: string) => {
      if (!supabase) {
        console.warn("Supabase client not available");
        return null;
      }

      try {
        const { data, error: queryError } = await supabase
          .from("series")
          .select(
            `
          *,
          episodes:episodes(
            id,
            title,
            synopsis,
            duration_seconds,
            status,
            thumbnail_url,
            created_at
          )
        `,
          )
          .eq("id", seriesId)
          .single();

        if (queryError) {
          console.error("Failed to fetch series:", queryError);
          setError(queryError.message);
          return null;
        }

        return data as Series & { episodes: Episode[] };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch series";
        setError(errorMessage);
        console.error("Error fetching series:", err);
        return null;
      }
    },
    [supabase],
  );

  const searchEpisodes = useCallback(
    async (query: string, limit = 20) => {
      if (!supabase || !query.trim()) {
        return [];
      }

      try {
        setIsLoading(true);
        setError(null);

        const { data, error: queryError } = await supabase
          .from("episodes")
          .select(
            `
          *,
          series:series_id (
            id,
            title,
            poster_url
          )
        `,
          )
          .eq("status", "ready")
          .or(`title.ilike.%${query}%,synopsis.ilike.%${query}%`)
          .order("created_at", { ascending: false })
          .limit(limit);

        if (queryError) {
          console.error("Failed to search episodes:", queryError);
          setError(queryError.message);
          return [];
        }

        return data as Episode[];
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to search episodes";
        setError(errorMessage);
        console.error("Error searching episodes:", err);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [supabase],
  );

  const searchSeries = useCallback(
    async (query: string, limit = 20) => {
      if (!supabase || !query.trim()) {
        return [];
      }

      try {
        setIsLoading(true);
        setError(null);

        const { data, error: queryError } = await supabase
          .from("series")
          .select(
            `
          *,
          episodes_count:episodes(count)
        `,
          )
          .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
          .order("created_at", { ascending: false })
          .limit(limit);

        if (queryError) {
          console.error("Failed to search series:", queryError);
          setError(queryError.message);
          return [];
        }

        return data as Series[];
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to search series";
        setError(errorMessage);
        console.error("Error searching series:", err);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [supabase],
  );

  return {
    getEpisodes,
    getSeries,
    getSeriesById,
    searchEpisodes,
    searchSeries,
    createSeries,
    updateSeries,
    ensureDefaultSeries,
    setSeriesPoster,
    isLoading,
    error,
    clearError: () => setError(null),
  };
};
