import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSupabase } from "../../../hooks/useSupabase";
import { useWatchlist, WatchlistItem } from "../../../hooks/useWatchlist";
import { useEpisodes } from "../../../hooks/useEpisodes";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { LoadingState } from "../../../components/LoadingState";
import { ImageDisplay } from "../../../components/ImageDisplay";

const { width } = Dimensions.get("window");

interface Wallet {
  id: string;
  user_id: string;
  balance_cents: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { supabase } = useSupabase();
  const { getWatchlist } = useWatchlist();
  const { getEpisodes } = useEpisodes();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
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
      console.log("[Profile] Loaded watchlist:", items.length, "items");
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
    }
  };

  const formatCurrency = (cents: number) => {
    return `R${(cents / 100).toFixed(2)}`;
  };

  const handleViewSeries = (seriesId: string) => {
    router.push({
      pathname: "/(protected)/series/[id]",
      params: { id: seriesId },
    });
  };

  if (loading) {
    return <LoadingState message="Loading your profile..." />;
  }

  return (
    <View style={styles.container}>
      {/* Top Bar with Gradient */}
      <View style={[styles.topBar, { paddingTop: insets.top + 31 }]}>
        <LinearGradient
          colors={["rgba(0,0,0,1)", "rgba(0,0,0,0.64)", "rgba(0,0,0,0)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.topBarGradient}
        />
        <View style={styles.topBarContent}>
          <Image
            source={require("../../../assets/locul logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 }]}
      >
        {/* Wallet Section */}
        <View style={styles.section}>
          <Text style={styles.walletLabel}>My Wallet</Text>
          <Text style={styles.balanceAmount}>
            {wallet ? formatCurrency(wallet.balance_cents) : "R0.00"}
          </Text>
          <TouchableOpacity style={styles.topUpButton}>
            <Text style={styles.topUpButtonText}>Top-Up</Text>
          </TouchableOpacity>
        </View>

        {/* Watchlist Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Watchlist</Text>

          {watchlist.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.watchlistScroll}
            >
              {watchlist.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.watchlistCard}
                  onPress={() => handleViewSeries(item.series_id)}
                >
                  <ImageDisplay
                    uri={item.series?.poster_url}
                    preset="poster"
                    style={styles.watchlistImage}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No series in watchlist</Text>
            </View>
          )}
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <TouchableOpacity style={[styles.menuItem, styles.menuItemTop]}>
            <Text style={styles.menuText}>Watch History</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Settings & Notifications</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, styles.menuItemBottom]}>
            <Text style={styles.menuText}>Payment Methods & History</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  topBar: {
    width: "100%",
    position: "relative",
    paddingBottom: 10,
    paddingHorizontal: 20,
  },
  topBarGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "100%",
    zIndex: 1,
  },
  topBarContent: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    zIndex: 2,
  },
  logo: {
    width: 115,
    height: 50,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 40,
  },
  walletLabel: {
    fontSize: 16,
    fontFamily: "LeagueSpartan",
    fontWeight: "400",
    color: "#F5F5F5",
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontFamily: "LeagueSpartan",
    fontWeight: "100",
    color: "#F5F5F5",
    marginBottom: 8,
  },
  topUpButton: {
    backgroundColor: "#EB588C",
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  topUpButtonText: {
    fontSize: 16,
    fontFamily: "LeagueSpartan",
    fontWeight: "400",
    color: "#F5F5F5",
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "LeagueSpartan",
    fontWeight: "600",
    color: "#F5F5F5",
    marginBottom: 16,
  },
  watchlistScroll: {
    gap: 10,
  },
  watchlistCard: {
    width: 120,
    height: 183,
    borderRadius: 9,
    backgroundColor: "#b3b3b3",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.37,
    shadowRadius: 20.5,
    elevation: 5,
  },
  watchlistImage: {
    width: "100%",
    height: "100%",
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "LeagueSpartan",
    color: "#666",
  },
  menuSection: {
    marginBottom: 40,
  },
  menuItem: {
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.14)",
  },
  menuItemTop: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.14)",
  },
  menuItemBottom: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.14)",
  },
  menuText: {
    fontSize: 16,
    fontFamily: "LeagueSpartan",
    fontWeight: "300",
    color: "#F5F5F5",
  },
});
