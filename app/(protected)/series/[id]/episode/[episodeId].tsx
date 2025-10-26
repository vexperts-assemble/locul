import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { ReelsScroller } from "../../../../../components/ReelsScroller";
import { router, useLocalSearchParams } from "expo-router";
import { useEpisodes, Episode } from "../../../../../hooks/useEpisodes";
import { useFocusEffect } from "@react-navigation/native";
import { LoadingState } from "../../../../../components/LoadingState";

export default function SeriesEpisodeScreen() {
  const { id: seriesId, episodeId } = useLocalSearchParams<{
    id: string;
    episodeId: string;
  }>();
  const { getEpisodes, getSeriesById } = useEpisodes();
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [series, setSeries] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);

  const loadSeriesData = useCallback(async () => {
    if (!seriesId) return;

    try {
      const [episodesData, seriesData] = await Promise.all([
        getEpisodes(),
        getSeriesById(seriesId),
      ]);

      // Filter episodes for this series and sort by creation date
      const seriesEpisodes = episodesData
        .filter((ep) => ep.series_id === seriesId && ep.mux_playback_id)
        .sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        );

      setEpisodes(seriesEpisodes);
      setSeries(seriesData);

      // Find the current episode index
      const episodeIndex = seriesEpisodes.findIndex(
        (ep) => ep.id === episodeId,
      );
      setCurrentEpisodeIndex(episodeIndex >= 0 ? episodeIndex : 0);

      console.log(
        "[SeriesEpisode] Loaded",
        seriesEpisodes.length,
        "episodes for series",
        seriesId,
      );
    } catch (err) {
      console.error("Error loading series data:", err);
    } finally {
      setLoading(false);
    }
  }, [seriesId, episodeId, getEpisodes, getSeriesById]);

  useEffect(() => {
    loadSeriesData();
  }, [loadSeriesData]);

  useFocusEffect(
    useCallback(() => {
      loadSeriesData();
    }, [loadSeriesData]),
  );

  const reelsData = useMemo(() => {
    console.log(
      "[SeriesEpisode] building reelsData from",
      episodes.length,
      "episodes",
    );
    const episodeData = episodes.map((episode, index) => ({
      id: episode.id,
      uri: `https://stream.mux.com/${episode.mux_playback_id}.m3u8`,
      title: episode.title,
      thumbnail: episode.thumbnail_url ?? null,
      seriesTitle: series?.title,
      seriesId: series?.id,
      episodeNumber: index + 1,
      totalEpisodes: episodes.length,
      onShowAllEpisodes: () => {
        router.back(); // Back to My Stuff
      },
    }));

    // Add "End of Series" item after the last episode
    episodeData.push({
      id: "end-of-series",
      uri: "", // No video for end screen
      title: "End of Series",
      thumbnail: null,
      seriesTitle: series?.title,
      seriesId: series?.id,
      episodeNumber: episodes.length + 1,
      totalEpisodes: episodes.length,
      isEndOfSeries: true,
      onShowAllEpisodes: () => {
        router.back(); // Back to My Stuff
      },
    });

    return episodeData;
  }, [episodes, series]);

  if (loading) {
    return <LoadingState message="Loading episode..." />;
  }

  if (episodes.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>No episodes found for this series</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Back to My Stuff</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ReelsScroller data={reelsData} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "black",
  },
  errorText: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
