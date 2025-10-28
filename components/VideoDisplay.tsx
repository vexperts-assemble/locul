import React, {
  useMemo,
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from "react";
import { View, StyleSheet, ActivityIndicator, Dimensions } from "react-native";
import {
  Video,
  ResizeMode,
  AVPlaybackStatusSuccess,
  AVPlaybackStatus,
  Audio,
} from "expo-av";

type VideoPreset = "reels" | "card" | "contain" | "cover";

export interface VideoDisplayHandle {
  play: () => Promise<void>;
  pause: () => Promise<void>;
  toggle: () => Promise<void>;
  seekBy: (deltaSeconds: number) => Promise<void>;
  toggleMute: () => Promise<void>;
  setMuted: (muted: boolean) => Promise<void>;
  setVolume: (volume01: number) => Promise<void>;
  getStatus: () => Promise<AVPlaybackStatus | undefined>;
}

interface VideoDisplayProps {
  playbackId?: string; // If provided, builds Mux HLS URL
  uri?: string; // Direct URL
  preset?: VideoPreset;
  posterUri?: string | null;
  shouldPlay?: boolean;
  isLooping?: boolean;
  isMuted?: boolean;
  useNativeControls?: boolean;
  style?: any; // container style
  onLoad?: () => void;
  onError?: (error: any) => void;
  onPlaybackChange?: (isPlaying: boolean) => void;
  onStatus?: (status: AVPlaybackStatus) => void;
}

export const VideoDisplay = forwardRef<VideoDisplayHandle, VideoDisplayProps>(
  (
    {
      playbackId,
      uri,
      preset = "contain",
      posterUri,
      shouldPlay = false,
      isLooping = false,
      isMuted = false,
      useNativeControls = false,
      style,
      onLoad,
      onError,
      onPlaybackChange,
      onStatus,
    },
    ref,
  ) => {
    const [isLoading, setIsLoading] = useState(true);
    const [aspectRatio, setAspectRatio] = useState<number | null>(null);
    const videoRef = useRef<Video | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const [videoKey, setVideoKey] = useState(0);
    const [cacheBust, setCacheBust] = useState<string | null>(null);
    const isCleaningUpRef = useRef(false);

    // Ensure audio category allows speaker output and hardware buttons
    React.useEffect(() => {
      (async () => {
        try {
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
            shouldDuckAndroid: true,
            playThroughEarpieceAndroid: false,
          });
          console.log("[VideoDisplay] Audio mode set successfully");
        } catch (e) {
          console.warn("[VideoDisplay] Failed to set audio mode", e);
        }
      })();
    }, []);

    const sourceUri = useMemo(() => {
      if (playbackId) {
        return `https://stream.mux.com/${playbackId}.m3u8`;
      }
      return uri || "";
    }, [playbackId, uri]);

    const effectiveSourceUri = useMemo(() => {
      if (!sourceUri) return "";
      if (!cacheBust) return sourceUri;
      return (
        sourceUri + (sourceUri.includes("?") ? "&" : "?") + "r=" + cacheBust
      );
    }, [sourceUri, cacheBust]);

    // Debug: log source and preset when it changes
    React.useEffect(() => {
      console.log(
        "[VideoDisplay] sourceUri",
        sourceUri,
        "preset",
        preset,
        "playbackId",
        playbackId,
      );
    }, [sourceUri, preset, playbackId]);

    // Reset retry state and cleanup when the source changes
    React.useEffect(() => {
      // Cleanup previous video instance before loading new one
      const cleanup = async () => {
        if (isCleaningUpRef.current) {
          console.log("[VideoDisplay] Already cleaning up, skipping");
          return;
        }
        
        isCleaningUpRef.current = true;
        
        if (videoRef.current) {
          try {
            await videoRef.current.pauseAsync();
            await videoRef.current.unloadAsync();
            console.log("[VideoDisplay] Cleaned up previous video instance");
          } catch (e) {
            // Ignore cleanup errors
          }
        }
        
        isCleaningUpRef.current = false;
      };

      if (sourceUri) {
        // Wait for cleanup to complete before loading new video
        cleanup().then(() => {
          if (!isCleaningUpRef.current) {
            console.log("[VideoDisplay] Starting new video load");
            setRetryCount(0);
            setCacheBust(null);
            setIsLoading(true);
            setVideoKey((k) => k + 1);
          }
        });
      }

      // Cleanup on unmount
      return () => {
        cleanup();
      };
    }, [sourceUri]);

    const computeResizeMode = (): ResizeMode => {
      if (preset === "reels") {
        const { width, height } = Dimensions.get("window");
        if (aspectRatio && aspectRatio > 0) {
          const heightAtScreenWidth = width / aspectRatio;
          // If the fitted height exceeds the screen, crop top/bottom (COVER). Otherwise letterbox (CONTAIN).
          return heightAtScreenWidth > height
            ? ResizeMode.COVER
            : ResizeMode.CONTAIN;
        }
        return ResizeMode.COVER;
      }
      if (preset === "cover") return ResizeMode.COVER;
      // 'card' and 'contain'
      return ResizeMode.CONTAIN;
    };

    const handleLoad = (status: AVPlaybackStatusSuccess) => {
      console.log("[VideoDisplay] onLoad status loaded", !!status.isLoaded);
      const ns: any = (status as any).naturalSize;
      const videoWidth: number | undefined = ns?.width;
      const videoHeight: number | undefined = ns?.height;
      if (videoWidth && videoHeight && videoWidth > 0 && videoHeight > 0) {
        setAspectRatio(videoWidth / videoHeight);
        console.log("[VideoDisplay] naturalSize", {
          videoWidth,
          videoHeight,
          derivedAspect: videoWidth / videoHeight,
        });
      }
      setIsLoading(false);
      onLoad?.();
      // Force-unmute and set volume to 1 to ensure audible playback, hardware buttons then adjust
      (async () => {
        try {
          await videoRef.current?.setIsMutedAsync(false);
          await videoRef.current?.setVolumeAsync(1.0);
          const st = await videoRef.current?.getStatusAsync();
          console.log("[VideoDisplay] post-load status", st);
        } catch (e) {
          console.warn("[VideoDisplay] failed to unmute/set volume", e);
        }
      })();
    };

    const handleError = (e: any) => {
      setIsLoading(false);
      console.error("[VideoDisplay] onError", e);
      onError?.(e);
      
      // iOS sometimes throws transient CoreMedia errors (-12889, -11800). 
      // Retry with progressive backoff, cache-bust only on final retry
      if (retryCount < 2) {
        (async () => {
          try {
            await videoRef.current?.pauseAsync();
            await videoRef.current?.unloadAsync();
            console.log("[VideoDisplay] Unloaded failed video instance");
          } catch (cleanupErr) {
            // Ignore cleanup errors
          }
        })();
        
        // Progressive delay: 500ms, 1000ms
        const delay = 500 * (retryCount + 1);
        
        setTimeout(() => {
          console.log("[VideoDisplay] Retrying load, attempt", retryCount + 1, "after", delay, "ms");
          setRetryCount((c) => c + 1);
          // Only cache-bust on the final retry attempt
          if (retryCount === 1) {
            setCacheBust(String(Date.now()));
            console.log("[VideoDisplay] Using cache-bust on final retry");
          }
          setVideoKey((k) => k + 1);
          setIsLoading(true);
        }, delay);
      } else {
        console.error("[VideoDisplay] Max retries reached, giving up");
      }
    };

    const handlePlaybackStatus = useCallback(
      (status: AVPlaybackStatus) => {
        if (!status.isLoaded) return;
        const js: any = status as any;
        
        // Reduced logging - only log every 10 seconds to minimize performance impact
        if (__DEV__ && js.positionMillis % 10000 < 250) {
          console.log("[VideoDisplay] playback", {
            playing: js.isPlaying,
            pos: Math.floor(js.positionMillis / 1000) + "s",
            dur: Math.floor(js.durationMillis / 1000) + "s",
          });
        }
        
        onPlaybackChange?.(!!status.isPlaying);
        onStatus?.(status);
      },
      [onPlaybackChange, onStatus],
    );

    useImperativeHandle(
      ref,
      () => ({
        async play() {
          await videoRef.current?.playAsync();
        },
        async pause() {
          await videoRef.current?.pauseAsync();
        },
        async toggle() {
          const status = await videoRef.current?.getStatusAsync();
          if (status && "isLoaded" in status && status.isLoaded) {
            if ((status as any).isPlaying) {
              await videoRef.current?.pauseAsync();
            } else {
              await videoRef.current?.playAsync();
            }
          }
        },
        async seekBy(deltaSeconds: number) {
          const status = await videoRef.current?.getStatusAsync();
          if (status && "isLoaded" in status && status.isLoaded) {
            const pos = (status as any).positionMillis ?? 0;
            const dur =
              (status as any).durationMillis ?? Number.MAX_SAFE_INTEGER;
            let next = pos + deltaSeconds * 1000;
            if (next < 0) next = 0;
            if (next > dur) next = dur;
            await videoRef.current?.setPositionAsync(next);
          }
        },
        async toggleMute() {
          const status = await videoRef.current?.getStatusAsync();
          if (status && "isLoaded" in status && status.isLoaded) {
            const isMuted = (status as any).isMuted ?? false;
            await videoRef.current?.setIsMutedAsync(!isMuted);
          }
        },
        async setMuted(muted: boolean) {
          await videoRef.current?.setIsMutedAsync(!!muted);
        },
        async setVolume(volume01: number) {
          const vol = Math.max(0, Math.min(1, volume01));
          await videoRef.current?.setVolumeAsync(vol);
          if (vol > 0) {
            await videoRef.current?.setIsMutedAsync(false);
          }
        },
        async getStatus() {
          return videoRef.current?.getStatusAsync();
        },
      }),
      [],
    );

    return (
      <View style={[styles.container, style]}>
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        )}
        <Video
          key={videoKey}
          ref={videoRef}
          source={{ uri: effectiveSourceUri }}
          style={styles.video}
          resizeMode={computeResizeMode()}
          shouldPlay={shouldPlay}
          isLooping={isLooping}
          isMuted={isMuted}
          useNativeControls={useNativeControls}
          onLoad={handleLoad}
          onError={handleError}
          onPlaybackStatusUpdate={handlePlaybackStatus}
          posterSource={posterUri ? { uri: posterUri } : undefined}
          posterStyle={styles.video}
        />
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#000",
    overflow: "hidden",
    position: "relative",
  },
  video: {
    width: "100%",
    height: "100%",
    backgroundColor: "#000",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 1,
  },
});

export default VideoDisplay;
