import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { View, StyleSheet, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ReelsScroller } from "../../components/ReelsScroller";
import { router } from "expo-router";
import { useEpisodes, Episode } from "../../hooks/useEpisodes";
import { useFocusEffect } from "@react-navigation/native";
import TopGradientBar from "../../components/ui/TopGradientBar";
import { CustomBottomNav } from "../../components/CustomBottomNav";
import { LoadingState } from "../../components/LoadingState";

export default function ExploreScreen() {
  const { getEpisodes } = useEpisodes();
  const [videos, setVideos] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const insets = useSafeAreaInsets();
  const [showBottomNav, setShowBottomNav] = useState(true);

  const loadReadyVideos = useCallback(async () => {
    const list = await getEpisodes();
    // Be permissive: any row with a playback id is playable
    setVideos(list.filter((v) => !!v.mux_playback_id));
  }, [getEpisodes]);

  useEffect(() => {
    (async () => {
      try {
        await loadReadyVideos();
      } finally {
        setLoading(false);
      }
    })();
    // short polling window after mount to catch newly-ready items
    pollTimerRef.current = setInterval(loadReadyVideos, 5000);
    const stopTimer = setTimeout(() => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    }, 30000);
    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
      clearTimeout(stopTimer);
    };
  }, [loadReadyVideos]);

  useFocusEffect(
    useCallback(() => {
      loadReadyVideos();
    }, [loadReadyVideos]),
  );

  const reelsData = useMemo(() => {
    console.log("[Explore] building reelsData from", videos.length, "videos");
    return videos
      .filter((v) => !!v.mux_playback_id)
      .map((v) => ({
        id: v.id,
        uri: `https://stream.mux.com/${v.mux_playback_id}.m3u8`,
        title: v.title,
        thumbnail: v.thumbnail_url ?? null,
        seriesTitle: v.series?.title,
        seriesId: v.series?.id,
        onShowAllEpisodes: () => {
          if (v.series?.id) {
            router.push({
              pathname: "/(protected)/series/[id]",
              params: { id: v.series.id },
            });
          }
        },
      }));
  }, [videos]);

  if (loading) {
    return <LoadingState message="Loading episodes..." />;
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <TopGradientBar showBadges={false} logoText="locul" />
      <ReelsScroller data={reelsData} onScrollStateChange={setShowBottomNav} />
      <CustomBottomNav visible={showBottomNav} />
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
  },
});
