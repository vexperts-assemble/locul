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
import { SvgXml } from "react-native-svg";
import VideoDisplay, { VideoDisplayHandle } from "./VideoDisplay";
import { useRouter } from "expo-router";
import { useWatchlist } from "../hooks/useWatchlist";
import EpisodesBottomSheet from "./EpisodesBottomSheet";
import { colors, fonts, spacing, radii, shadows } from "../theme/tokens";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const rewindIcon = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1.99902 6.49805L3.61824 11.498L8.99902 9.98763" stroke="#E5E7EB" stroke-width="2" stroke-linecap="round"/>
<path d="M12.9984 20.5V11.5511C13 11.5414 12.9984 11.5315 12.994 11.523C12.9896 11.5144 12.9826 11.5076 12.9741 11.5037C12.9656 11.4998 12.9561 11.4989 12.9472 11.5014C12.9382 11.5038 12.9302 11.5093 12.9246 11.517C12.9246 11.517 11.7332 13.3107 10.999 13.8405" stroke="#E5E7EB" stroke-width="2" stroke-linecap="round"/>
<path d="M19.0017 11.5H18.9964C17.341 11.5 15.999 12.7159 15.999 14.2157V17.7843C15.999 19.2841 17.341 20.5 18.9964 20.5H19.0017C20.6571 20.5 21.999 19.2841 21.999 17.7843V14.2157C21.999 12.7159 20.6571 11.5 19.0017 11.5Z" stroke="#E5E7EB" stroke-width="2"/>
<path d="M3.56783 11.0345C4.76945 8.03856 7.01835 5.56495 9.90831 4.0605C12.7983 2.55604 16.1388 2.11994 19.3264 2.83097C22.514 3.54199 25.3386 5.35326 27.2899 7.93761C29.2413 10.522 30.1908 13.709 29.9668 16.923C29.7429 20.1371 28.3603 23.1662 26.0689 25.4633C23.7774 27.7605 20.7281 29.1741 17.4718 29.4488C14.2155 29.7236 10.9669 28.8414 8.31273 26.9616C5.65856 25.0818 3.77385 22.3284 2.99902 19.1986" stroke="#E5E7EB" stroke-width="2" stroke-linecap="round"/>
</svg>`;

const forwardIcon = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.9994 20.5V11.5511C13.001 11.5414 12.9994 11.5315 12.995 11.523C12.9906 11.5144 12.9836 11.5076 12.9751 11.5037C12.9666 11.4998 12.9571 11.4989 12.9481 11.5014C12.9392 11.5038 12.9312 11.5093 12.9255 11.517C12.9255 11.517 11.7342 13.3107 11 13.8405" stroke="#E5E7EB" stroke-width="2" stroke-linecap="round"/>
<path d="M19.0026 11.5H18.9974C17.342 11.5 16 12.7159 16 14.2157V17.7843C16 19.2841 17.342 20.5 18.9974 20.5H19.0026C20.658 20.5 22 19.2841 22 17.7843V14.2157C22 12.7159 20.658 11.5 19.0026 11.5Z" stroke="#E5E7EB" stroke-width="2"/>
<path d="M29.999 6.49805L28.3798 11.498L22.999 9.98763" stroke="#E5E7EB" stroke-width="2" stroke-linecap="round"/>
<path d="M28.4302 11.0345C27.2286 8.03856 24.9797 5.56495 22.0897 4.0605C19.1998 2.55604 15.8593 2.11994 12.6717 2.83097C9.48405 3.54199 6.65946 5.35326 4.70811 7.93761C2.75676 10.522 1.8073 13.709 2.03123 16.923C2.25516 20.1371 3.63772 23.1662 5.92917 25.4633C8.22063 27.7605 11.2699 29.1741 14.5262 29.4488C17.7825 29.7236 21.0311 28.8414 23.6853 26.9616C26.3395 25.0818 28.2242 22.3284 28.999 19.1986" stroke="#E5E7EB" stroke-width="2" stroke-linecap="round"/>
</svg>`;

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
                style={styles.endBackButton}
                onPress={() => router.back()}
              >
                <BlurView intensity={23.5} style={styles.endBackButtonBlur}>
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
                {/* Gradient Overlay */}
                <LinearGradient
                  colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.7)", "rgba(0,0,0,1)"]}
                  locations={[0, 0.5, 1]}
                  style={styles.gradientOverlay}
                  pointerEvents="none"
                />

                {/* Back Button */}
                <TouchableOpacity
                  style={[styles.backButton, { top: insets.top + 15 }]}
                  onPress={() => router.back()}
                >
                  <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>

                {/* Right Side Action Buttons */}
                <View style={styles.rightActions}>
                  {item.seriesId && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleToggleWatchlist(item.seriesId!)}
                    >
                      <Ionicons
                        name={
                          watchlistStatus[item.seriesId]
                            ? "checkmark"
                            : "add"
                        }
                        size={24}
                        color="#FFFFFF"
                      />
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.episodesButton}
                    onPress={() => {
                      if (item.seriesId) {
                        router.push({
                          pathname: "/(protected)/series/[id]",
                          params: { id: item.seriesId },
                        });
                      }
                    }}
                  >
                    <Ionicons name="list" size={20} color="#FFFFFF" />
                    <Text style={styles.episodesText}>Episodes</Text>
                  </TouchableOpacity>
                </View>

                {/* Episode Info and Controls */}
                <View style={styles.controlsContainer}>
                  <View style={styles.episodeInfo}>
                    {!!item.title && (
                      <Text style={styles.newEpisodeTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                    )}
                    {!!item.seriesTitle && (
                      <Text style={styles.episodeSubtitle} numberOfLines={1}>
                        {item.seriesTitle}
                      </Text>
                    )}
                  </View>

                  {/* Playback Controls */}
                  <View style={styles.playbackControls}>
                    <TouchableOpacity
                      style={styles.controlButton}
                      onPress={() => {
                        playerRefs.current[item.id]?.seekBy(-10);
                      }}
                    >
                      <SvgXml xml={rewindIcon} width={24} height={24} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.playPauseButton}
                      onPress={() => {
                        playerRefs.current[item.id]?.toggle();
                      }}
                    >
                      <Ionicons
                        name={isPlaying[item.id] ? "pause" : "play"}
                        size={32}
                        color="#FFFFFF"
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.controlButton}
                      onPress={() => {
                        playerRefs.current[item.id]?.seekBy(10);
                      }}
                    >
                      <SvgXml xml={forwardIcon} width={24} height={24} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressTrack}>
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
  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backButton: {
    position: "absolute",
    left: 15,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  rightActions: {
    position: "absolute",
    right: 15,
    bottom: 304,
    alignItems: "flex-end",
    gap: 24,
  },
  actionButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  episodesButton: {
    alignItems: "center",
    gap: 8,
  },
  episodesText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: fonts.family,
    fontWeight: "400",
  },
  controlsContainer: {
    position: "absolute",
    bottom: 120,
    left: 32,
    right: 32,
  },
  episodeInfo: {
    marginBottom: 16,
  },
  newEpisodeTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontFamily: fonts.family,
    fontWeight: fonts.weight.semiBold,
    marginBottom: 4,
  },
  episodeSubtitle: {
    color: "#B0B0B0",
    fontSize: 16,
    fontFamily: fonts.family,
    fontWeight: "400",
  },
  playbackControls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 32,
  },
  controlButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  playPauseButton: {
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 28,
    backgroundColor: colors.brand.primary,
  },
  progressContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 8,
  },
  progressTrack: {
    width: "100%",
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  progressBar: {
    height: "100%",
    backgroundColor: colors.brand.primary,
  },
  endOfSeriesContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "space-between",
    paddingBottom: 40,
    paddingHorizontal: spacing.xl,
  },
  endBackButton: {
    alignSelf: "flex-start",
  },
  endBackButtonBlur: {
    width: 177,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: "rgba(255, 255, 255, 0.27)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
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
