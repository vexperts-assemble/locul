import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
} from "react-native";
import { useSupabase } from "../../../hooks/useSupabase";
import { useWatchlist, WatchlistItem } from "../../../hooks/useWatchlist";
import { useEpisodes } from "../../../hooks/useEpisodes";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { LoadingState } from "../../../components/LoadingState";

interface Wallet {
  id: string;
  user_id: string;
  balance_cents: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export default function MyStuffScreen() {
  const { supabase } = useSupabase();
  const { getWatchlist, removeFromWatchlist } = useWatchlist();
  const { getEpisodes } = useEpisodes();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [watchlistWithEpisodes, setWatchlistWithEpisodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, []),
  );

  const loadData = async () => {
    await Promise.all([loadWallet(), loadWatchlist()]);
    setLoading(false);
  };

  const loadWatchlist = async () => {
    try {
      const items = await getWatchlist();
      setWatchlist(items);
      console.log("[MyStuff] Loaded watchlist:", items.length, "items");

      // Load episodes for each series to determine latest unwatched episode
      const episodes = await getEpisodes();
      const watchlistWithEpisodesData = items.map((watchlistItem) => {
        const seriesEpisodes = episodes.filter(
          (ep) => ep.series_id === watchlistItem.series_id,
        );
        // Sort by created_at to get chronological order
        const sortedEpisodes = seriesEpisodes.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        );

        // For now, just return the first episode (we'll add watch progress tracking later)
        const latestEpisode = sortedEpisodes[0];

        return {
          ...watchlistItem,
          latestEpisode,
          totalEpisodes: sortedEpisodes.length,
        };
      });

      setWatchlistWithEpisodes(watchlistWithEpisodesData);
    } catch (err) {
      console.error("Error loading watchlist:", err);
    }
  };

  const loadWallet = async () => {
    if (!supabase) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Failed to load wallet:", error);
        return;
      }

      setWallet(data);
    } catch (err) {
      console.error("Error loading wallet:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return `R${(cents / 100).toFixed(2)}`;
  };

  const handleRemoveFromWatchlist = async (seriesId: string) => {
    try {
      await removeFromWatchlist(seriesId);
      await loadWatchlist(); // Refresh the list
      console.log("Removed from watchlist:", seriesId);
    } catch (err) {
      console.error("Error removing from watchlist:", err);
    }
  };

  const handleViewSeries = (seriesId: string) => {
    router.push({
      pathname: "/(protected)/series/[id]",
      params: { id: seriesId },
    });
  };

  const handlePlayEpisode = (seriesId: string, episodeId: string) => {
    router.push({
      pathname: "/(protected)/series/[id]/episode/[episodeId]",
      params: { id: seriesId, episodeId },
    });
  };

  const screenWidth = Dimensions.get("window").width;
  const itemWidth = (screenWidth - 48) / 3; // 3 columns with padding

  if (loading) {
    return <LoadingState message="Loading your stuff..." />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={watchlistWithEpisodes}
        numColumns={3}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.seriesTile, { width: itemWidth }]}
            onPress={() =>
              item.latestEpisode
                ? handlePlayEpisode(item.series_id, item.latestEpisode.id)
                : null
            }
          >
            <View style={styles.tileImageContainer}>
              {item.series?.poster_url ? (
                <Image
                  source={{ uri: item.series.poster_url }}
                  style={styles.tileImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.tileImagePlaceholder}>
                  <Text style={styles.tileImagePlaceholderText}>📺</Text>
                </View>
              )}
            </View>
            <View style={styles.tileInfo}>
              <Text style={styles.tileSeriesTitle} numberOfLines={2}>
                {item.series?.title || "Untitled Series"}
              </Text>
              <Text style={styles.tileEpisodeTitle} numberOfLines={1}>
                {item.latestEpisode?.title || "No episodes"}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.title}>My Stuff</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Wallet</Text>
              <View style={styles.walletCard}>
                <Text style={styles.balanceLabel}>Available Balance</Text>
                <Text style={styles.balanceAmount}>
                  {wallet ? formatCurrency(wallet.balance_cents) : "R0.00"}
                </Text>
                <Text style={styles.currency}>{wallet?.currency || "ZAR"}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>My Watchlist</Text>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.placeholderCard}>
            <Text style={styles.placeholderText}>
              No series in your watchlist yet
            </Text>
            <Text style={styles.placeholderSubtext}>
              Add series from the Explore tab to see them here
            </Text>
          </View>
        }
        contentContainerStyle={styles.watchlistGrid}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 28,
    fontFamily: "LeagueSpartan",
    fontWeight: "bold",
    color: "#333",
  },
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "LeagueSpartan",
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  walletCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
  },
  balanceLabel: {
    fontSize: 16,
    fontFamily: "LeagueSpartan",
    color: "#666",
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontFamily: "LeagueSpartan",
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 4,
  },
  currency: {
    fontSize: 14,
    fontFamily: "LeagueSpartan",
    color: "#666",
  },
  placeholderCard: {
    backgroundColor: "white",
    padding: 40,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 16,
    fontFamily: "LeagueSpartan",
    color: "#999",
    textAlign: "center",
  },
  placeholderSubtext: {
    fontSize: 14,
    fontFamily: "LeagueSpartan",
    color: "#ccc",
    textAlign: "center",
    marginTop: 8,
  },
  watchlistContainer: {
    gap: 12,
  },
  seriesCard: {
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: "row",
    padding: 12,
    alignItems: "center",
  },
  seriesImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 12,
  },
  seriesImage: {
    width: "100%",
    height: "100%",
  },
  seriesImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  seriesImagePlaceholderText: {
    fontSize: 24,
  },
  seriesInfo: {
    flex: 1,
  },
  seriesTitle: {
    fontSize: 16,
    fontFamily: "LeagueSpartan",
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  seriesDescription: {
    fontSize: 14,
    fontFamily: "LeagueSpartan",
    color: "#666",
    marginBottom: 4,
  },
  addedDate: {
    fontSize: 12,
    fontFamily: "LeagueSpartan",
    color: "#999",
  },
  removeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#ff4444",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  removeButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "LeagueSpartan",
    fontWeight: "bold",
  },
  watchlistGrid: {
    paddingHorizontal: 0,
  },
  seriesTile: {
    marginBottom: 16,
    marginHorizontal: 4,
  },
  tileImageContainer: {
    width: "100%",
    aspectRatio: 0.75, // 4:3 aspect ratio
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 8,
  },
  tileImage: {
    width: "100%",
    height: "100%",
  },
  tileImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  tileImagePlaceholderText: {
    fontSize: 32,
  },
  tileInfo: {
    paddingHorizontal: 4,
  },
  tileSeriesTitle: {
    fontSize: 14,
    fontFamily: "LeagueSpartan",
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  tileEpisodeTitle: {
    fontSize: 12,
    fontFamily: "LeagueSpartan",
    color: "#666",
  },
});
