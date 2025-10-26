import React from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import VideoDisplay from "./VideoDisplay";

interface VideoPlayerProps {
  playbackId: string;
  title?: string;
  thumbnailUrl?: string;
  style?: any;
  onLoad?: () => void;
  onError?: (error: any) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  playbackId,
  title,
  thumbnailUrl,
  style,
  onLoad,
  onError,
}) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = (error: any) => {
    setIsLoading(false);
    setError("Failed to load video");
    onError?.(error);
  };

  if (error) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}
      <VideoDisplay
        playbackId={playbackId}
        preset="card"
        shouldPlay={false}
        isLooping={false}
        isMuted={false}
        useNativeControls
        onLoad={handleLoad}
        onError={handleError}
        posterUri={thumbnailUrl}
        style={styles.video}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#000",
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  video: {
    width: "100%",
    aspectRatio: 16 / 9,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1,
  },
  errorContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    zIndex: 1,
  },
  errorText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
  },
});
