import { useState, useCallback } from "react";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { useSupabase } from "./useSupabase";
import { apiConfig } from "../supabase.config";

export interface EpisodeUpload {
  id: string;
  series_id: string;
  author_id: string;
  title: string;
  synopsis?: string;
  episode_number?: number;
  status: "pending" | "processing" | "ready" | "failed";
  mux_asset_id?: string;
  mux_playback_id?: string;
  mux_upload_id?: string;
  file_size?: number;
  duration_seconds?: number;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export const useEpisodeUpload = () => {
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

  const createEpisodeRecord = useCallback(
    async (
      seriesId: string,
      title: string,
      synopsis?: string,
      episodeNumber?: number,
    ) => {
      if (!supabase) {
        throw new Error("Supabase client not available");
      }

      try {
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

        console.log("Creating episode record for user:", user.id);
        const { data, error } = await supabase
          .from("episodes")
          .insert({
            series_id: seriesId,
            author_id: user.id,
            title,
            synopsis,
            episode_number: episodeNumber,
            status: "pending",
          })
          .select()
          .single();

        if (error) {
          console.error("Database error:", error);
          throw new Error(`Failed to create episode record: ${error.message}`);
        }

        console.log("Episode record created successfully:", data.id);
        return data as EpisodeUpload;
      } catch (error) {
        console.error("Error creating episode record:", error);
        throw error;
      }
    },
    [supabase],
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
            body: JSON.stringify({ videoId: episodeId }), // API still expects videoId for now
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

  const uploadEpisode = useCallback(
    async (
      seriesId: string,
      title: string,
      synopsis?: string,
      episodeNumber?: number,
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
        const episodeRecord = await createEpisodeRecord(
          seriesId,
          title,
          synopsis,
          episodeNumber,
        );

        // 3. Get upload URL from your API
        const { uploadUrl, uploadId } = await getUploadUrl(episodeRecord.id);

        // 4. Update episode record with upload ID
        if (supabase) {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (user) {
            await supabase
              .from("episodes")
              .update({ mux_upload_id: uploadId })
              .eq("id", episodeRecord.id)
              .eq("author_id", user.id);
          }
        }

        // 5. Upload to Mux
        await uploadToMux(videoFile.uri, uploadUrl, onProgress);

        return episodeRecord;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Upload failed";
        setError(errorMessage);
        console.error("Episode upload error:", err);
        return null;
      } finally {
        setIsUploading(false);
        setUploadProgress(null);
      }
    },
    [pickVideo, createEpisodeRecord, getUploadUrl, uploadToMux, supabase],
  );

  return {
    uploadEpisode,
    pickVideo,
    isUploading,
    uploadProgress,
    error,
    clearError: () => setError(null),
  };
};




