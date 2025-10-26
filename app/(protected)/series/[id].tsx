import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEpisodes, Episode } from "../../../hooks/useEpisodes";
import ImageDisplay from "../../../components/ImageDisplay";
import TopGradientBar from "../../../components/ui/TopGradientBar";
import HeroOverlay from "../../../components/ui/HeroOverlay";
import { CustomBottomNav } from "../../../components/CustomBottomNav";
import { LoadingState } from "../../../components/LoadingState";

export default function SeriesDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getSeriesById } = useEpisodes();
  const [loading, setLoading] = useState(true);
  const [series, setSeries] = useState<any | null>(null);
  const insets = useSafeAreaInsets();
  const { width } = Dimensions.get("window");

  useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        console.log("[SeriesDetail] fetching series", id);
        const s = await getSeriesById(String(id));
        console.log("[SeriesDetail] fetched", !!s, s?.episodes?.length);
        setSeries(s);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, getSeriesById]);

  const orderedEpisodes: Episode[] = useMemo(() => {
    if (!series?.episodes) return [] as Episode[];
    const list: Episode[] = [...series.episodes];
    // Derive episode order purely by created_at ascending
    list.sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
    return list;
  }, [series]);

  if (loading) {
    return <LoadingState message="Loading series..." />;
  }

  if (!series) {
    return (
      <View style={styles.center}>
        <Text
          style={{
            color: "#F5F5F5",
            fontFamily: "LeagueSpartan",
            fontSize: 16,
          }}
        >
          Series not found.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Hero Section */}
      <View style={styles.heroContainer}>
        <ImageDisplay
          uri={series.poster_url || null}
          preset="cover"
          style={styles.heroImage}
        />
        <TopGradientBar showBadges={false} logoText="locul" />
        <HeroOverlay
          title={series.title}
          description={
            series.description || "Discover amazing stories and content."
          }
          onPressAdd={() => console.log("Add to watchlist")}
          onPressPlay={() => console.log("Play series")}
          showCTAStack
        />
      </View>

      {/* Episodes Section */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Episodes</Text>
          {orderedEpisodes.length === 0 ? (
            <Text style={styles.emptyText}>No episodes yet.</Text>
          ) : (
            <FlatList
              data={orderedEpisodes}
              keyExtractor={(e) => e.id}
              scrollEnabled={false}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={styles.episodeRow}
                  disabled={item.status !== "ready"}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.episodeTitle} numberOfLines={1}>
                      {`${index + 1}. `}
                      {item.title}
                    </Text>
                    {!!item.synopsis && (
                      <Text style={styles.episodeSynopsis} numberOfLines={2}>
                        {item.synopsis}
                      </Text>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.status,
                      item.status !== "ready"
                        ? styles.statusProcessing
                        : undefined,
                    ]}
                  >
                    {item.status === "ready" ? "Play" : "Processing"}
                  </Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </ScrollView>

      <CustomBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  heroContainer: {
    width: "100%",
    height: 400,
    position: "relative",
    overflow: "hidden",
  },
  heroImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    transform: [{ scale: 1.5 }],
  },
  content: {
    flex: 1,
    backgroundColor: "#000",
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    fontFamily: "LeagueSpartan",
    color: "#F5F5F5",
    marginBottom: 16,
    lineHeight: 24,
  },
  emptyText: {
    color: "#F5F5F5",
    fontFamily: "LeagueSpartan",
    opacity: 0.6,
    marginBottom: 16,
    fontSize: 16,
    textAlign: "center",
    paddingVertical: 20,
  },
  episodeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: "rgba(245, 245, 245, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(245, 245, 245, 0.1)",
  },
  episodeTitle: {
    color: "#F5F5F5",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "LeagueSpartan",
    lineHeight: 20,
  },
  episodeSynopsis: {
    color: "#F5F5F5",
    fontSize: 14,
    fontFamily: "LeagueSpartan",
    opacity: 0.7,
    marginTop: 4,
    lineHeight: 18,
  },
  status: {
    color: "#EB588C",
    fontWeight: "600",
    fontFamily: "LeagueSpartan",
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "rgba(235, 88, 140, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(235, 88, 140, 0.3)",
  },
  statusProcessing: {
    color: "#F5F5F5",
    backgroundColor: "rgba(245, 245, 245, 0.1)",
    borderColor: "rgba(245, 245, 245, 0.2)",
    opacity: 0.6,
  },
});
