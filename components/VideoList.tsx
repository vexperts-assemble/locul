import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { VideoPlayer } from "./VideoPlayer";
import {
  useVideoUpload,
  VideoUpload as VideoUploadType,
} from "../hooks/useVideoUpload";

interface VideoListProps {
  onVideoPress?: (video: VideoUploadType) => void;
}

export const VideoList: React.FC<VideoListProps> = ({ onVideoPress }) => {
  const [videos, setVideos] = useState<VideoUploadType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { getVideos } = useVideoUpload();

  const loadVideos = async () => {
    try {
      const videoList = await getVideos();
      setVideos(videoList);
    } catch (error) {
      console.error("Failed to load videos:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadVideos();
  };

  const renderVideoItem = ({ item }: { item: VideoUploadType }) => {
    const handlePress = () => {
      onVideoPress?.(item);
    };

    return (
      <TouchableOpacity style={styles.videoItem} onPress={handlePress}>
        <View style={styles.videoContainer}>
          {item.status === "ready" && item.mux_playback_id ? (
            <VideoPlayer
              playbackId={item.mux_playback_id}
              title={item.title}
              thumbnailUrl={item.thumbnail_url}
              style={styles.videoPlayer}
            />
          ) : (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderText}>
                {item.status === "processing"
                  ? "Processing..."
                  : "Video not ready"}
              </Text>
              {item.status === "processing" && (
                <ActivityIndicator
                  size="small"
                  color="#007AFF"
                  style={styles.loading}
                />
              )}
            </View>
          )}
        </View>

        <View style={styles.videoInfo}>
          <Text style={styles.videoTitle} numberOfLines={2}>
            {item.title}
          </Text>
          {item.description && (
            <Text style={styles.videoDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}
          <View style={styles.videoMeta}>
            <Text style={styles.statusText}>Status: {item.status}</Text>
            {item.duration && (
              <Text style={styles.durationText}>
                {Math.floor(item.duration / 60)}:
                {(item.duration % 60).toString().padStart(2, "0")}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading videos...</Text>
      </View>
    );
  }

  if (videos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No videos uploaded yet</Text>
        <Text style={styles.emptySubtext}>
          Upload your first video to get started!
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={videos}
      renderItem={renderVideoItem}
      keyExtractor={(item) => item.id}
      style={styles.list}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  videoItem: {
    backgroundColor: "rgba(245, 245, 245, 0.05)",
    marginHorizontal: 0,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(245, 245, 245, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  videoContainer: {
    aspectRatio: 16 / 9,
  },
  videoPlayer: {
    width: "100%",
    height: "100%",
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(245, 245, 245, 0.05)",
  },
  placeholderText: {
    fontSize: 16,
    color: "#F5F5F5",
    marginBottom: 8,
    fontFamily: "LeagueSpartan",
    opacity: 0.6,
  },
  loading: {
    marginTop: 8,
  },
  videoInfo: {
    padding: 16,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#F5F5F5",
    marginBottom: 4,
    fontFamily: "LeagueSpartan",
  },
  videoDescription: {
    fontSize: 14,
    color: "#F5F5F5",
    marginBottom: 8,
    fontFamily: "LeagueSpartan",
    opacity: 0.8,
  },
  videoMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusText: {
    fontSize: 12,
    color: "#F5F5F5",
    textTransform: "capitalize",
    fontFamily: "LeagueSpartan",
    opacity: 0.6,
  },
  durationText: {
    fontSize: 12,
    color: "#F5F5F5",
    fontFamily: "LeagueSpartan",
    opacity: 0.6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#F5F5F5",
    fontFamily: "LeagueSpartan",
    opacity: 0.8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#F5F5F5",
    marginBottom: 8,
    fontFamily: "LeagueSpartan",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#F5F5F5",
    textAlign: "center",
    fontFamily: "LeagueSpartan",
    opacity: 0.6,
  },
});
