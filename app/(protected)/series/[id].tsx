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
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useEpisodes, Episode } from "../../../hooks/useEpisodes";
import { useWallet } from "../../../hooks/useWallet";
import ImageDisplay from "../../../components/ImageDisplay";
import HeroOverlay from "../../../components/ui/HeroOverlay";
import { CustomBottomNav } from "../../../components/CustomBottomNav";
import { LoadingState } from "../../../components/LoadingState";
import { sessionStorage } from "../../../utils/sessionStorage";

const PRICE_CENTS = 4999; // R49.99

interface DemonstrativeEpisode {
  id: string;
  title: string;
  isDemonstrative: true;
  episodeNumber: number;
  status?: string;
  synopsis?: string;
}

export default function SeriesDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getSeriesById } = useEpisodes();
  const { getWallet, isSeriesUnlocked, purchaseSeriesUnlock } = useWallet();
  const [loading, setLoading] = useState(true);
  const [series, setSeries] = useState<any | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  
  // DEMO MODE: Hardcode locked state and sufficient balance for demonstration
  // Set DEMO_MODE to false to use real database values
  // Change demoUnlocked to true/false to demonstrate locked/unlocked states
  // NOTE: Episodes 1-2 are always free, episodes 3-10 require unlock
  const DEMO_MODE = true; // Using demo mode
  const demoUnlocked = false; // Set to true to demo unlocked state (episodes 3-10)
  const DEMO_INITIAL_BALANCE = 140053; // R1400.53 for demo
  const insets = useSafeAreaInsets();
  const { width } = Dimensions.get("window");

  // Initialize demo wallet balance in session storage on mount
  useEffect(() => {
    if (DEMO_MODE) {
      const existingBalance = sessionStorage.getItem('demoWalletBalance');
      if (existingBalance === null) {
        sessionStorage.setItem('demoWalletBalance', DEMO_INITIAL_BALANCE.toString());
        console.log("[SeriesDetail] Initialized demo wallet:", DEMO_INITIAL_BALANCE);
      }
    }
  }, []);

  useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        console.log("[SeriesDetail] fetching series", id);
        const s = await getSeriesById(String(id));
        console.log("[SeriesDetail] fetched", !!s, s?.episodes?.length);
        setSeries(s);
        
        // Fetch wallet balance and unlock status
        if (DEMO_MODE) {
          // Get session balance or use initial demo balance
          const sessionBalance = sessionStorage.getItem('demoWalletBalance');
          setWalletBalance(sessionBalance ? parseInt(sessionBalance) : DEMO_INITIAL_BALANCE);
          setUnlocked(demoUnlocked);
        } else {
          const w = await getWallet();
          setWalletBalance(w?.balance_cents ?? null);
          const u = await isSeriesUnlocked(String(id));
          setUnlocked(u);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id, getSeriesById, getWallet, isSeriesUnlocked]);

  const orderedEpisodes: (Episode | DemonstrativeEpisode)[] = useMemo(() => {
    if (!series?.episodes) return [] as (Episode | DemonstrativeEpisode)[];
    const list: Episode[] = [...series.episodes];
    // Derive episode order purely by created_at ascending
    list.sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
    
    // Pad with demonstrative episodes up to 10
    const result: (Episode | DemonstrativeEpisode)[] = [...list];
    const currentCount = list.length;
    
    if (currentCount < 10) {
      for (let i = currentCount + 1; i <= 10; i++) {
        result.push({
          id: `demo-${i}`,
          title: `Episode ${i}`,
          isDemonstrative: true,
          episodeNumber: i,
        });
      }
    }
    
    return result;
  }, [series]);

  const getEpisodeUnlockState = (index: number): boolean => {
    // Episodes 1-2 are always unlocked (free) - even when series is locked
    if (index < 2) return true;
    // Episodes 3-10 require series unlock
    // Note: They show as unlocked/playable but may not have video data yet
    return unlocked;
  };

  const firstPlayableEpisode = useMemo(() => {
    for (let index = 0; index < orderedEpisodes.length; index++) {
      const item = orderedEpisodes[index];
      const isUnlocked = getEpisodeUnlockState(index);
      const isDemonstrative =
        "isDemonstrative" in item && item.isDemonstrative === true;
      const hasPlaybackId =
        !isDemonstrative &&
        "mux_playback_id" in item &&
        !!item.mux_playback_id;
      const isProcessing =
        !isDemonstrative &&
        (!hasPlaybackId || item.status !== "ready");
      const isPlayable =
        isUnlocked && !isDemonstrative && !isProcessing && hasPlaybackId;

      if (isPlayable) {
        return {
          episode: item as Episode,
          index,
        };
      }
    }

    return null;
  }, [orderedEpisodes, unlocked]);

  const handleHeroPlay = () => {
    if (!series) return;

    if (!firstPlayableEpisode) {
      console.log("[SeriesDetail] No playable episodes available", {
        seriesId: series.id,
        orderedEpisodes: orderedEpisodes.length,
      });
      Alert.alert(
        "Playback Unavailable",
        "We couldn't find a playable episode yet. Please try again later.",
      );
      return;
    }

    console.log("[SeriesDetail] Hero play pressed", {
      seriesId: series.id,
      episodeId: firstPlayableEpisode.episode.id,
      index: firstPlayableEpisode.index + 1,
    });

    router.push({
      pathname: "/(protected)/series/[id]/episode/[episodeId]",
      params: {
        id: series.id,
        episodeId: firstPlayableEpisode.episode.id,
      },
    });
  };

  const handleUnlockPurchase = async () => {
    if (unlocked || isPurchasing || !id) return;
    
    // Show confirmation dialog
    Alert.alert(
      "Unlock All Episodes",
      `This will deduct R${(PRICE_CENTS / 100).toFixed(2)} from your wallet.\n\nCurrent Balance: R${((walletBalance || 0) / 100).toFixed(2)}\nAfter Purchase: R${(((walletBalance || 0) - PRICE_CENTS) / 100).toFixed(2)}\n\nDo you want to continue?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Unlock",
          style: "default",
          onPress: async () => {
            setIsPurchasing(true);
            try {
              if (DEMO_MODE) {
                // Demo mode: just toggle state and reduce balance
                await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
                const newBal = (walletBalance || 0) - PRICE_CENTS;
                setWalletBalance(newBal);
                // Save to session storage
                sessionStorage.setItem('demoWalletBalance', newBal.toString());
                setUnlocked(true);
                console.log("[SeriesDetail] DEMO: Series unlocked successfully");
              } else {
                const res = await purchaseSeriesUnlock(String(id), PRICE_CENTS);
                const newBal = res?.new_balance_cents ?? null;
                if (newBal !== null) setWalletBalance(newBal);
                setUnlocked(true);
                console.log("[SeriesDetail] Series unlocked successfully");
              }
            } catch (e) {
              console.error("[SeriesDetail] Purchase failed:", e);
              Alert.alert("Purchase Failed", "Unable to unlock series. Please try again.");
            } finally {
              setIsPurchasing(false);
            }
          },
        },
      ]
    );
  };

  const canAfford = walletBalance !== null && walletBalance >= PRICE_CENTS;

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
        <HeroOverlay
          title={series.title}
          description={
            series.description || "Discover amazing stories and content."
          }
          onPressAdd={() => console.log("Add to watchlist")}
          onPressPlay={handleHeroPlay}
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
              renderItem={({ item, index }) => {
                const isUnlocked = getEpisodeUnlockState(index);
                const isDemonstrative = 'isDemonstrative' in item && item.isDemonstrative;
                const hasPlaybackId = !isDemonstrative && 'mux_playback_id' in item && !!item.mux_playback_id;
                const isProcessing = !isDemonstrative && (!hasPlaybackId || item.status !== "ready");
                
                // Episodes 1-2: Always show playable (even if locked series has no video yet)
                // Episodes 3+: Show as unlocked/playable if series is unlocked, even without video data
                // Only actually clickable if they have valid playback data
                const canShowAsPlayable = isUnlocked; // Shows play icon if unlocked (regardless of video data)
                const isPlayable = isUnlocked && !isDemonstrative && !isProcessing && hasPlaybackId; // Actually clickable
                
                const handleEpisodePress = () => {
                  if (!isPlayable) {
                    console.log("[SeriesDetail] Episode not playable:", {
                      index: index + 1,
                      isUnlocked,
                      isDemonstrative,
                      hasPlaybackId,
                      isProcessing,
                      status: item.status,
                    });
                    return;
                  }
                  
                  console.log("[SeriesDetail] Navigating to episode:", {
                    episodeId: item.id,
                    title: item.title,
                    hasPlaybackId,
                  });
                  
                  // Navigate to episode player (ReelsScroller)
                  router.push({
                    pathname: "/(protected)/series/[id]/episode/[episodeId]",
                    params: {
                      id: series.id,
                      episodeId: item.id,
                    },
                  });
                };

                return (
                  <TouchableOpacity
                    style={[
                      styles.episodeRow,
                      !isPlayable && styles.episodeRowDisabled
                    ]}
                    disabled={!isPlayable}
                    onPress={handleEpisodePress}
                    activeOpacity={0.7}
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
                    <View style={styles.statusIcon}>
                      {isProcessing ? (
                        <Ionicons name="time-outline" size={24} color="#F5F5F5" />
                      ) : canShowAsPlayable ? (
                        <Ionicons name="play" size={24} color="#EB588C" />
                      ) : (
                        <Ionicons name="lock-closed" size={24} color="#E6C274" />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>

        {/* Unlock Button Section */}
        <View style={styles.unlockSection}>
          <TouchableOpacity
            disabled={unlocked || !canAfford || isPurchasing}
            onPress={handleUnlockPurchase}
            style={[
              styles.unlockButton,
              unlocked ? styles.unlockButtonDisabled : undefined,
              !canAfford && !unlocked ? styles.unlockButtonInsufficient : undefined,
            ]}
          >
            <Ionicons
              name="lock-open"
              size={18}
              color="white"
              style={styles.unlockIconStyle}
            />
            <Text style={styles.unlockButtonText}>
              {unlocked
                ? "Unlocked"
                : canAfford
                  ? `Unlock All (R${(PRICE_CENTS / 100).toFixed(2)})`
                  : "Insufficient funds"}
            </Text>
          </TouchableOpacity>
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
  episodeRowDisabled: {
    opacity: 0.5,
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
  statusIcon: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  unlockSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  unlockButton: {
    height: 48,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#EB588C",
  },
  unlockButtonDisabled: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  unlockButtonInsufficient: {
    backgroundColor: "#5c3a42",
  },
  unlockButtonText: {
    fontFamily: "LeagueSpartan",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 20,
    color: "#F5F5F5",
    textAlign: "center",
  },
  unlockIconStyle: {
    marginRight: 4,
  },
});
