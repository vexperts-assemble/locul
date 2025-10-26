import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  ViewToken,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import VideoDisplay, { VideoDisplayHandle } from "./VideoDisplay";
import { useRouter } from "expo-router";
import { useWatchlist } from "../hooks/useWatchlist";
import EpisodesBottomSheet from "./EpisodesBottomSheet";
import { colors, fonts, spacing, radii, shadows } from "../theme/tokens";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface ReelItem {
  id: string;
  uri: string;
  title?: string;
  thumbnail?: string | null;
  seriesTitle?: string;
  seriesId?: string;
  isEndOfSeries?: boolean;
  onShowAllEpisodes?: () => void;
}

interface ReelsScrollerProps {
  data: ReelItem[];
  onScrollStateChange?: (isScrolling: boolean) => void;
}

export const ReelsScroller: React.FC<ReelsScrollerProps> = ({
  data,
  onScrollStateChange,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const windowHeight = Dimensions.get("window").height;
  const playerRefs = useRef<Record<string, VideoDisplayHandle | null>>({});
  const [isPlaying, setIsPlaying] = useState<Record<string, boolean>>({});
  const [showControls, setShowControls] = useState(true);
  const [progressById, setProgressById] = useState<
    Record<string, { pos: number; dur: number }>
  >({});
  const hideControlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const [watchlistStatus, setWatchlistStatus] = useState<
    Record<string, boolean>
  >({});
  const [showEpisodes, setShowEpisodes] = useState(false);
  const [sheetSeries, setSheetSeries] = useState<{
    id?: string;
    title?: string;
  }>({});
  const insets = useSafeAreaInsets();

  const keyExtractor = useCallback((item: ReelItem) => item.id, []);

  const viewabilityConfig = useMemo(
    () => ({ itemVisiblePercentThreshold: 60 }),
    [],
  );

  const resetHideTimer = useCallback(() => {
    if (hideControlsTimer.current) {
      clearTimeout(hideControlsTimer.current);
    }
    hideControlsTimer.current = setTimeout(() => {
      setShowControls(false);
    }, 3000); // Hide after 3 seconds
  }, []);

  const handleScreenTouch = useCallback(() => {
    setShowControls(true);
    resetHideTimer();
  }, [resetHideTimer]);

  const checkWatchlistStatus = useCallback(
    async (seriesId: string) => {
      if (!seriesId) return;
      try {
        const inWatchlist = await isInWatchlist(seriesId);
        setWatchlistStatus((prev) => ({ ...prev, [seriesId]: inWatchlist }));
      } catch (err) {
        console.error("Error checking watchlist status:", err);
      }
    },
    [isInWatchlist],
  );

  const handleToggleWatchlist = useCallback(
    async (seriesId: string) => {
      if (!seriesId) return;
      try {
        const isCurrentlyInWatchlist = watchlistStatus[seriesId];

        if (isCurrentlyInWatchlist) {
          await removeFromWatchlist(seriesId);
          setWatchlistStatus((prev) => ({ ...prev, [seriesId]: false }));
        } else {
          await addToWatchlist(seriesId);
          setWatchlistStatus((prev) => ({ ...prev, [seriesId]: true }));
        }
      } catch (err) {
        console.error("Error toggling watchlist:", err);
      }
    },
    [addToWatchlist, removeFromWatchlist, watchlistStatus],
  );

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems && viewableItems.length > 0) {
        const first = viewableItems[0];
        if (typeof first.index === "number") {
          setCurrentIndex(first.index);
          setShowControls(true);
          resetHideTimer();

          // Hide bottom nav when scrolling
          onScrollStateChange?.(true);
          setTimeout(() => onScrollStateChange?.(false), 1000);

          // Reset video to beginning when scrolled to
          if (first.item?.id && playerRefs.current[first.item.id]) {
            playerRefs.current[first.item.id]?.seekBy(-Number.MAX_SAFE_INTEGER); // Seek to start
          }

          // Check watchlist status for the current item
          if (first.item?.seriesId) {
            checkWatchlistStatus(first.item.seriesId);
          }
        }
      }
    },
  ).current;

  const renderItem = useCallback(
    ({ item, index }: { item: ReelItem; index: number }) => {
      const shouldPlay = index === currentIndex;

      // Handle End of Series screen
      if (item.isEndOfSeries) {
        return (
          <View style={[styles.itemContainer, { height: windowHeight }]}>
            <View
              style={[
                styles.endOfSeriesContainer,
                { paddingTop: insets.top + spacing.xl },
              ]}
            >
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <BlurView intensity={23.5} style={styles.backButtonBlur}>
                  <Text style={styles.backButtonText}>
                    {"< Back to My Stuff"}
                  </Text>
                </BlurView>
              </TouchableOpacity>

              <View style={styles.endContent}>
                <Ionicons
                  name="film"
                  size={80}
                  color={colors.brand.primary}
                  style={styles.endIcon}
                />
                <Text style={styles.endTitle}>End of Series</Text>
                <Text style={styles.endSubtitle}>
                  You've reached the end of this series.{"\n"}
                  Ready to discover more content?
                </Text>

                <TouchableOpacity
                  style={styles.exploreButton}
                  onPress={() => router.push("/(protected)/explore")}
                >
                  <Text style={styles.exploreButtonText}>Go to Explore</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
      }

      return (
        <TouchableWithoutFeedback onPress={handleScreenTouch}>
          <View style={[styles.itemContainer, { height: windowHeight }]}>
            <VideoDisplay
              ref={(ref) => {
                playerRefs.current[item.id] = ref;
              }}
              uri={item.uri}
              preset="reels"
              shouldPlay={shouldPlay}
              isLooping
              useNativeControls={false}
              posterUri={item.thumbnail || undefined}
              style={styles.video}
              onPlaybackChange={(playing) =>
                setIsPlaying((prev) => ({ ...prev, [item.id]: playing }))
              }
              onStatus={(st: any) => {
                if (st?.isLoaded) {
                  setProgressById((prev) => ({
                    ...prev,
                    [item.id]: {
                      pos: st.positionMillis ?? 0,
                      dur: st.durationMillis ?? 0,
                    },
                  }));
                }
              }}
            />
            {/* Overlays */}
            {showControls && (
              <View style={styles.overlayContainer} pointerEvents="box-none">
                <View
                  style={[
                    styles.topBar,
                    { paddingTop: insets.top + spacing.lg },
                  ]}
                >
                  <TouchableOpacity onPress={() => router.back()}>
                    <BlurView intensity={23.5} style={styles.backButtonBlur}>
                      <Text style={styles.navBack}>{"< Back to Home"}</Text>
                    </BlurView>
                  </TouchableOpacity>
                </View>

                {/* Right side buttons */}
                <View style={styles.rightButtons}>
                  {item.seriesId && (
                    <TouchableOpacity
                      style={styles.rightButton}
                      onPress={() => handleToggleWatchlist(item.seriesId!)}
                    >
                      <Ionicons
                        name={
                          watchlistStatus[item.seriesId]
                            ? "checkmark-circle"
                            : "add-circle"
                        }
                        size={24}
                        color="#F5F5F5"
                      />
                      <Text style={styles.rightButtonText}>
                        {watchlistStatus[item.seriesId]
                          ? "Added"
                          : "Add to Watchlist"}
                      </Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.rightButton}
                    onPress={() => {
                      setSheetSeries({
                        id: item.seriesId,
                        title: item.seriesTitle,
                      });
                      setShowEpisodes(true);
                    }}
                  >
                    <Ionicons name="list" size={24} color="#F5F5F5" />
                    <Text style={styles.rightButtonText}>All Episodes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.rightButton}
                    onPress={() => console.log("Share episode:", item.title)}
                  >
                    <Ionicons name="share-outline" size={24} color="#F5F5F5" />
                    <Text style={styles.rightButtonText}>Share</Text>
                  </TouchableOpacity>
                </View>

                {/* Bottom gradient + blur overlay */}
                <View style={styles.bottomOverlay} pointerEvents="box-none">
                  <BlurView
                    intensity={26.5}
                    tint="dark"
                    style={styles.bottomBlur}
                  />
                  <LinearGradient
                    colors={[
                      "rgba(255,255,255,0.06)",
                      "rgba(255,255,255,0.04)",
                      "rgba(102,102,102,0)",
                    ]}
                    start={{ x: 0.5, y: 1 }}
                    end={{ x: 0.5, y: 0 }}
                    style={styles.bottomGradient}
                  />
                  <View style={styles.bottomBar}>
                    {!!item.seriesTitle && (
                      <Text style={styles.seriesTitle}>{item.seriesTitle}</Text>
                    )}
                    {!!item.title && (
                      <Text style={styles.episodeTitle}>{item.title}</Text>
                    )}
                    <View style={styles.controlsRow}>
                      <TouchableOpacity
                        style={styles.controlBoxLarge}
                        onPress={() => {
                          playerRefs.current[item.id]?.seekBy(-10);
                        }}
                      >
                        <Ionicons name="play-back" size={25} color="#FFFFFF" />
                        <Text style={styles.controlNumber}>10</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.controlBoxSmall}
                        onPress={() => {
                          playerRefs.current[item.id]?.toggle();
                        }}
                      >
                        <Ionicons
                          name={isPlaying[item.id] ? "pause" : "play"}
                          size={25}
                          color="#FFFFFF"
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.controlBoxLarge}
                        onPress={() => {
                          playerRefs.current[item.id]?.seekBy(10);
                        }}
                      >
                        <Text style={styles.controlNumber}>10</Text>
                        <Ionicons
                          name="play-forward"
                          size={25}
                          color="#FFFFFF"
                        />
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      style={styles.nextEpisode}
                      onPress={() => {}}
                    >
                      <Text style={styles.nextEpisodeText}>Next Episode</Text>
                    </TouchableOpacity>
                  </View>
                  {/* Bottom progress bar */}
                  <View style={styles.progressTrack} />
                  <View
                    style={[
                      styles.progressBar,
                      (() => {
                        const pr = progressById[item.id];
                        const ratio =
                          pr && pr.dur > 0
                            ? Math.min(1, Math.max(0, pr.pos / pr.dur))
                            : 0;
                        return { width: `${ratio * 100}%` } as any;
                      })(),
                    ]}
                  />
                </View>
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>
      );
    },
    [
      currentIndex,
      windowHeight,
      showControls,
      isPlaying,
      handleScreenTouch,
      router,
      watchlistStatus,
      checkWatchlistStatus,
      handleToggleWatchlist,
    ],
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        pagingEnabled
        initialNumToRender={1}
        maxToRenderPerBatch={3}
        windowSize={5}
        removeClippedSubviews
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />
      <EpisodesBottomSheet
        visible={showEpisodes}
        onClose={() => setShowEpisodes(false)}
        seriesId={sheetSeries.id || ""}
        seriesTitle={sheetSeries.title}
        onPurchased={() => {
          /* optional: toast or local state update */
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  itemContainer: {
    width: "100%",
    backgroundColor: "black",
  },
  video: {
    width: "100%",
    height: "100%",
    backgroundColor: "black",
  },
  overlayContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "space-between",
  },
  topBar: {
    paddingHorizontal: spacing.lg,
  },
  bottomOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 236,
  },
  bottomBlur: {
    ...(StyleSheet.absoluteFillObject as any),
  },
  bottomGradient: {
    ...(StyleSheet.absoluteFillObject as any),
  },
  backButtonBlur: {
    width: 177,
    height: 35,
    borderRadius: 17.5, // Half of height for perfect pill shape
    backgroundColor: "rgba(255, 255, 255, 0.27)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: "center",
    alignItems: "center", // Center content horizontally
    overflow: "hidden",
  },
  navBack: {
    color: colors.text.light,
    fontSize: 16,
    fontFamily: fonts.family,
    fontWeight: fonts.weight.semiBold,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowRadius: 8,
    lineHeight: 19,
  },
  bottomBar: {
    position: "absolute",
    left: spacing.xxl,
    right: spacing.xxl,
    bottom: 43,
    paddingHorizontal: 0,
    paddingBottom: 0,
    alignItems: "flex-start",
  },
  episodeTitle: {
    color: colors.text.light,
    fontSize: 16,
    fontFamily: fonts.family,
    fontWeight: fonts.weight.extraLight,
    textAlign: "left",
    lineHeight: 16,
    marginBottom: spacing.lg,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowRadius: 10,
  },
  seriesTitle: {
    color: colors.text.light,
    fontSize: 24,
    fontFamily: fonts.family,
    fontWeight: fonts.weight.regular,
    textAlign: "left",
    lineHeight: 24,
    marginBottom: spacing.lg,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowRadius: 10,
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
    width: "100%",
  },
  controlBoxLarge: {
    width: 132,
    padding: spacing.md,
    backgroundColor: "rgba(255, 255, 255, 0.22)",
    borderRadius: radii.sm,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm as any,
  },
  controlBoxSmall: {
    width: 49,
    padding: spacing.md,
    backgroundColor: "rgba(255, 255, 255, 0.22)",
    borderRadius: radii.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  controlText: {
    color: colors.text.light,
    fontSize: 16,
    fontFamily: fonts.family,
    fontWeight: fonts.weight.semiBold,
  },
  controlNumber: {
    color: colors.text.light,
    fontSize: 24,
    fontFamily: fonts.family,
    fontWeight: fonts.weight.bold,
  },
  controlIcon: {
    // Icon styling handled by Ionicons
  },
  rightButtons: {
    position: "absolute",
    right: spacing.lg,
    top: "50%",
    transform: [{ translateY: -50 }],
    alignItems: "center",
    gap: spacing.lg,
  },
  rightButton: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minWidth: 60,
    alignItems: "center",
    ...shadows.card,
  },
  rightButtonText: {
    color: colors.text.light,
    fontSize: 12,
    fontFamily: fonts.family,
    fontWeight: fonts.weight.semiBold,
    textAlign: "center",
    marginTop: 4,
    lineHeight: 14,
  },
  nextEpisode: {
    alignSelf: "stretch",
    padding: spacing.md,
    backgroundColor: "rgba(255, 255, 255, 0.22)",
    borderRadius: radii.sm,
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  nextEpisodeText: {
    color: colors.text.light,
    fontSize: 16,
    fontFamily: fonts.family,
    fontWeight: fonts.weight.regular,
    lineHeight: 16,
  },
  progressTrack: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: spacing.sm,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
  },
  progressBar: {
    position: "absolute",
    left: 0,
    bottom: spacing.sm,
    height: 4,
    backgroundColor: colors.brand.primary,
    borderRadius: 2,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  endOfSeriesContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "space-between",
    paddingBottom: 40,
    paddingHorizontal: spacing.xl,
  },
  backButton: {
    alignSelf: "flex-start",
  },
  backButtonText: {
    color: colors.text.light,
    fontSize: 16,
    fontFamily: fonts.family,
    fontWeight: fonts.weight.semiBold,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowRadius: 8,
    lineHeight: 19,
  },
  endContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  endIcon: {
    fontSize: 80,
    marginBottom: spacing.xxl,
  },
  endTitle: {
    color: colors.text.light,
    fontSize: 28,
    fontFamily: fonts.family,
    fontWeight: fonts.weight.bold,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  endSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 16,
    fontFamily: fonts.family,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
  },
  exploreButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    borderRadius: 25,
    minWidth: 200,
    alignItems: "center",
  },
  exploreButtonText: {
    color: colors.text.light,
    fontSize: 18,
    fontFamily: fonts.family,
    fontWeight: fonts.weight.semiBold,
  },
});
