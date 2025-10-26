import { useState, useCallback } from "react";
import * as DocumentPicker from "expo-document-picker";
// Use legacy API to support createUploadTask on SDK 54
import * as FileSystem from "expo-file-system/legacy";
import { useSupabase } from "./useSupabase";
import { apiConfig } from "../supabase.config";

export interface VideoUpload {
  id: string;
  series_id?: string;
  author_id?: string;
  title: string;
  description?: string;
  status: "pending" | "processing" | "ready" | "failed";
  mux_asset_id?: string;
  mux_playback_id?: string;
  file_size?: number;
  duration?: number; // kept for UI compatibility; maps from duration_seconds
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export const useVideoUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const { supabase } = useSupabase();

  const pickVideo = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "video/*",
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return null;
      }

      return result.assets[0];
    } catch (err) {
      setError("Failed to pick video file");
      console.error("Error picking video:", err);
      return null;
    }
  }, []);

  const getOrCreateDefaultSeries = useCallback(
    async (userId: string) => {
      if (!supabase) throw new Error("Supabase client not available");
      // Try to find existing "My Videos" series for this user
      const { data: existing, error: findErr } = await supabase
        .from("series")
        .select("id")
        .eq("created_by", userId)
        .eq("title", "My Videos")
        .maybeSingle();

      if (findErr) {
        console.warn(
          "Failed to search default series, will try to create anyway:",
          findErr.message,
        );
      }

      if (existing?.id) return existing.id as string;

      // Create if missing. If RLS prevents this, we'll just proceed without series_id
      const { data: created, error: createErr } = await supabase
        .from("series")
        .insert({
          title: "My Videos",
          description: "Default series for uploads",
          created_by: userId,
        })
        .select("id")
        .single();

      if (createErr) {
        console.warn(
          "Could not create default series (possibly due to RLS). Proceeding without series.",
          createErr.message,
        );
        return undefined;
      }
      return created?.id as string | undefined;
    },
    [supabase],
  );

  const createVideoRecord = useCallback(
    async (title: string, description?: string, seriesId?: string) => {
      if (!supabase) {
        throw new Error("Supabase client not available");
      }

      try {
        // Get the current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        console.log("User authentication check:", {
          user: !!user,
          userError: !!userError,
        });

        if (userError || !user) {
          console.error("User not authenticated:", userError);
          throw new Error("User not authenticated");
        }

        // Ensure we have a series id (best-effort)
        const resolvedSeriesId =
          seriesId || (await getOrCreateDefaultSeries(user.id));

        console.log(
          "Creating episode record for user:",
          user.id,
          "series:",
          resolvedSeriesId,
        );
        const insertPayload: any = {
          title,
          synopsis: description,
          status: "pending",
          author_id: user.id,
        };
        if (resolvedSeriesId) insertPayload.series_id = resolvedSeriesId;

        const { data, error } = await supabase
          .from("episodes")
          .insert(insertPayload)
          .select("*")
          .single();

        if (error) {
          console.error("Database error:", error);
          throw new Error(`Failed to create video record: ${error.message}`);
        }

        console.log("Episode record created successfully:", data.id);
        // Map duration_seconds to duration for UI compatibility
        const mapped: VideoUpload = {
          ...data,
          description: data.synopsis,
          duration: (data as any).duration_seconds,
        } as any;
        return mapped;
      } catch (error) {
        console.error("Error creating video record:", error);
        throw error;
      }
    },
    [supabase, getOrCreateDefaultSeries],
  );

  const getUploadUrl = useCallback(
    async (episodeId: string) => {
      try {
        const session = await supabase?.auth.getSession();
        const token = session?.data.session?.access_token;

        const response = await fetch(
          `${apiConfig.baseUrl}/api/mux/create-upload-url`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ episodeId }),
          },
        );

        if (!response.ok) {
          const text = await response.text();
          throw new Error(
            `Failed to get upload URL: ${response.status} - ${text}`,
          );
        }

        const { url, id } = await response.json();
        return { uploadUrl: url, uploadId: id };
      } catch (error) {
        console.error("Error getting upload URL:", error);
        throw error;
      }
    },
    [supabase],
  );

  const uploadToMux = useCallback(
    async (
      fileUri: string,
      uploadUrl: string,
      onProgress?: (progress: UploadProgress) => void,
    ) => {
      // Fallback for SDKs where FileSystemUploadType isn't exported as a named enum
      const UploadTypeBinary: any =
        (FileSystem as any).FileSystemUploadType?.BINARY_CONTENT ?? 0;

      const uploadTask = FileSystem.createUploadTask(
        uploadUrl,
        fileUri,
        {
          httpMethod: "PUT",
          headers: {
            "Content-Type": "application/octet-stream",
          },
          uploadType: UploadTypeBinary,
        },
        (uploadProgress) => {
          const progress = {
            loaded: uploadProgress.totalBytesSent,
            total: uploadProgress.totalBytesExpectedToSend,
            percentage:
              (uploadProgress.totalBytesSent /
                uploadProgress.totalBytesExpectedToSend) *
              100,
          };
          setUploadProgress(progress);
          onProgress?.(progress);
        },
      );

      const result = await uploadTask.uploadAsync();

      if (result.status !== 200) {
        throw new Error(`Upload failed with status: ${result.status}`);
      }

      return result;
    },
    [],
  );

  const uploadVideo = useCallback(
    async (
      title: string,
      description?: string,
      seriesId?: string,
      onProgress?: (progress: UploadProgress) => void,
    ) => {
      try {
        setIsUploading(true);
        setError(null);
        setUploadProgress(null);

        // 1. Pick video file
        const videoFile = await pickVideo();
        if (!videoFile) {
          return null;
        }

        // 2. Create episode record in database
        const videoRecord = await createVideoRecord(
          title,
          description,
          seriesId,
        );

        // 3. Get upload URL from your API
        const { uploadUrl, uploadId } = await getUploadUrl(videoRecord.id);

        // 4. Update episode record with upload ID
        if (supabase) {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (user) {
            await supabase
              .from("episodes")
              .update({ mux_upload_id: uploadId })
              .eq("id", videoRecord.id)
              .eq("author_id", user.id);
          }
        }

        // 5. Upload to Mux
        await uploadToMux(videoFile.uri, uploadUrl, onProgress);

        return videoRecord;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Upload failed";
        setError(errorMessage);
        console.error("Video upload error:", err);
        return null;
      } finally {
        setIsUploading(false);
        setUploadProgress(null);
      }
    },
    [pickVideo, createVideoRecord, getUploadUrl, uploadToMux, supabase],
  );

  const getVideos = useCallback(async () => {
    console.log("getVideos called, supabase:", !!supabase);

    if (!supabase) {
      console.warn("Supabase client not available");
      return [];
    }

    try {
      console.log("Attempting to fetch episodes from Supabase...");
      const { data, error } = await supabase
        .from("episodes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to fetch episodes:", error);
        return [];
      }

      const mapped = (data || []).map((row: any) => ({
        ...row,
        description: row.synopsis,
        duration: row.duration_seconds,
      })) as VideoUpload[];
      console.log("Successfully fetched episodes:", mapped.length);
      return mapped;
    } catch (error) {
      console.error("Error fetching episodes:", error);
      return [];
    }
  }, [supabase]);

  return {
    uploadVideo,
    getVideos,
    pickVideo,
    isUploading,
    uploadProgress,
    error,
    clearError: () => setError(null),
  };
};
