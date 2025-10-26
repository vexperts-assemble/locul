import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useEpisodes } from "../../../hooks/useEpisodes";
import { useWatchlist } from "../../../hooks/useWatchlist";
import { useMediaCache } from "../../../hooks/useMediaCache";
import { ImageDisplay } from "../../../components/ImageDisplay";
import { CustomBottomNav } from "../../../components/CustomBottomNav";
import { LoadingState } from "../../../components/LoadingState";
import VideoDisplay, {
  VideoDisplayHandle,
} from "../../../components/VideoDisplay";

const { width } = Dimensions.get("window");

interface SeriesData {
  id: string;
  title: string;
  description?: string;
  poster_url?: string;
  episode_count?: number;
}

interface HeroVideoData extends SeriesData {
  mux_playback_id?: string;
}

export default function HomePage() {
  const insets = useSafeAreaInsets();
  const { getSeries, getEpisodes } = useEpisodes();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const mediaCache = useMediaCache();

  const [featuredSeries, setFeaturedSeries] = useState<SeriesData[]>([]);
  const [heroSeries, setHeroSeries] = useState<HeroVideoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);
  const [showThumbnail, setShowThumbnail] = useState(true);
  const [heroVideoUri, setHeroVideoUri] = useState<string | null>(null);
  const [imageLoadFailed, setImageLoadFailed] = useState(false);
  const [videoLoadAttempts, setVideoLoadAttempts] = useState(0);
  const videoRef = React.useRef<VideoDisplayHandle>(null);
  const timerStartedRef = React.useRef<string | null>(null);
  const [videoProgress, setVideoProgress] = useState(0); // 0 to 1 (normalized progress)
  const [videoDuration, setVideoDuration] = useState(0); // milliseconds
  const [heroWatchlistStatus, setHeroWatchlistStatus] = useState(false);

  const checkHeroWatchlistStatus = useCallback(async () => {
    if (heroSeries) {
      try {
        const inWatchlist = await isInWatchlist(heroSeries.id);
        setHeroWatchlistStatus(inWatchlist);
      } catch (error) {
        console.error("Failed to check watchlist status:", error);
      }
    }
  }, [heroSeries, isInWatchlist]);

  const handleToggleWatchlist = useCallback(async () => {
    if (heroSeries) {
      try {
        if (heroWatchlistStatus) {
          await removeFromWatchlist(heroSeries.id);
          setHeroWatchlistStatus(false);
          console.log("Removed from watchlist:", heroSeries.title);
        } else {
          await addToWatchlist(heroSeries.id);
          setHeroWatchlistStatus(true);
          console.log("Added to watchlist:", heroSeries.title);
        }
      } catch (error) {
        console.error("Failed to toggle watchlist:", error);
      }
    }
  }, [heroSeries, heroWatchlistStatus, addToWatchlist, removeFromWatchlist]);

  const loadSeriesData = async () => {
    try {
      console.log("[HomePage] Starting loadSeriesData()");
      setIsLoading(true);

      console.log("[HomePage] Calling getSeries(10, 0)...");
      const allSeries = (await getSeries(10, 0)) as SeriesData[];

      console.log("[HomePage] getSeries returned", allSeries.length, "series");
      if (allSeries.length > 0) {
        console.log("[HomePage] First series:", {
          id: allSeries[0].id,
          title: allSeries[0].title,
          has_poster: !!allSeries[0].poster_url,
        });
      }

      // Filter series with posters for hero rotation
      const seriesWithPosters = allSeries.filter((s) => s.poster_url);
      console.log(
        "[HomePage] Filtered to",
        seriesWithPosters.length,
        "series with posters",
      );

      if (seriesWithPosters.length > 0) {
        const newHeroSeries =
          seriesWithPosters[heroIndex % seriesWithPosters.length];
        console.log("[HomePage] Setting heroSeries:", {
          id: newHeroSeries.id,
          title: newHeroSeries.title,
          heroIndex: heroIndex,
        });
        setHeroSeries(newHeroSeries as HeroVideoData);
        setFeaturedSeries(seriesWithPosters.slice(0, 8));
        console.log(
          "[HomePage] Featured series set:",
          seriesWithPosters.slice(0, 8).length,
          "items",
        );
        setImageLoadFailed(false);
        setVideoLoadAttempts(0);

        // Load hero video immediately (independent of image)
        console.log(
          "[HomePage] Calling loadHeroVideo() for series:",
          newHeroSeries.id,
        );
        loadHeroVideo(newHeroSeries.id);

        // Prefetch featured images for carousel
        console.log("[HomePage] Prefetching featured images...");
        seriesWithPosters.slice(0, 8).forEach((series) => {
          if (series.poster_url) {
            mediaCache.prefetchMedia(series.poster_url, "image");
          }
        });

        // OPTIMIZATION: Dismiss loading state immediately after UI updates
        console.log("[HomePage] Dismissing loading state");
        setIsLoading(false);
      } else {
        console.warn("[HomePage] No series with posters found!");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("[HomePage] Error in loadSeriesData:", error);
      setIsLoading(false);
    }
  };

  const loadHeroVideo = useCallback(
    async (seriesId: string) => {
      try {
        console.log("[HomePage] loadHeroVideo() called for series:", seriesId);

        // OPTIMIZATION: Only fetch episodes for this series, limit to 1
        console.log("[HomePage] Calling getEpisodes(", seriesId, ", 1, 0)...");
        const episodes = await getEpisodes(seriesId, 1, 0);
        console.log(
          "[HomePage] getEpisodes returned",
          episodes.length,
          "episode(s)",
        );

        const firstEpisode = episodes[0];

        if (firstEpisode) {
          console.log("[HomePage] First episode found:", {
            id: firstEpisode.id,
            title: firstEpisode.title,
            has_playback_id: !!firstEpisode.mux_playback_id,
          });
        } else {
          console.warn("[HomePage] No episodes found for series:", seriesId);
        }

        if (firstEpisode?.mux_playback_id) {
          const videoUri = `https://stream.mux.com/${firstEpisode.mux_playback_id}.m3u8`;
          console.log("[HomePage] Video URI:", videoUri);

          // Check cache first
          if (mediaCache.isCached(videoUri)) {
            console.log(
              "[HomePage] Video found in cache, using cached version",
            );
            setHeroVideoUri(videoUri);
          } else {
            // Mark as loading and set URI to start loading
            console.log("[HomePage] Video not in cache, marking as loading");
            mediaCache.setLoading(videoUri);
            setHeroVideoUri(videoUri);
            console.log("[HomePage] Starting video load:", videoUri);
          }
        } else {
          console.warn("[HomePage] No mux_playback_id in first episode");
        }
      } catch (error) {
        console.error("[HomePage] Error in loadHeroVideo:", error);
      }
    },
    [getEpisodes, mediaCache],
  );

  useEffect(() => {
    console.log(
      "[HomePage] useEffect: Initial load - calling loadSeriesData()",
    );
    loadSeriesData();
  }, []);

  // Check watchlist status when heroSeries changes
  useEffect(() => {
    console.log(
      "[HomePage] useEffect: heroSeries changed, new series:",
      heroSeries?.title,
    );
    if (heroSeries) {
      checkHeroWatchlistStatus();
    }
  }, [heroSeries, checkHeroWatchlistStatus]);

  // Show thumbnail for 3 seconds, then play video
  // Only trigger once per new video URI
  useEffect(() => {
    console.log(
      "[HomePage] useEffect: Thumbnail timer - heroSeries:",
      heroSeries?.title,
      "showThumbnail:",
      showThumbnail,
      "heroVideoUri:",
      heroVideoUri ? "SET" : "NOT SET",
    );
    if (!heroSeries || !showThumbnail || !heroVideoUri) return;

    // Only start timer if this is a new video URI
    if (timerStartedRef.current === heroVideoUri) {
      console.log(
        "[HomePage] useEffect: Timer already started for this video URI",
      );
      return;
    }
    timerStartedRef.current = heroVideoUri;
    console.log("[HomePage] useEffect: Starting 3-second thumbnail timer");

    const thumbnailTimer = setTimeout(() => {
      console.log(
        "[HomePage] useEffect: Thumbnail timer complete, hiding thumbnail",
      );
      setShowThumbnail(false);
    }, 3000);

    return () => clearTimeout(thumbnailTimer);
  }, [showThumbnail, heroVideoUri]);

  const handleVideoEnd = () => {
    // Move to next series
    setHeroIndex((prev) => prev + 1);
    setShowThumbnail(true);
    timerStartedRef.current = null; // Reset the timer started ref
  };

  const handleWatchNow = async () => {
    if (heroSeries) {
      try {
        // Get episodes for this series to find the first one
        const episodes = await getEpisodes();
        const firstEpisode = episodes.find(
          (ep) => ep.series_id === heroSeries.id && ep.mux_playback_id,
        );

        if (firstEpisode) {
          // Navigate directly to the episode player (ReelsScroller)
          router.push({
            pathname: "/(protected)/series/[id]/episode/[episodeId]",
            params: {
              id: heroSeries.id,
              episodeId: firstEpisode.id,
            },
          });
        } else {
          // Fallback to series detail if no episodes found
          router.push({
            pathname: "/(protected)/series/[id]",
            params: { id: heroSeries.id },
          });
        }
      } catch (error) {
        console.error("Failed to load episodes:", error);
        // Fallback to series detail on error
        router.push({
          pathname: "/(protected)/series/[id]",
          params: { id: heroSeries.id },
        });
      }
    }
  };

  const handleSeriesPress = (seriesId: string) => {
    router.push({
      pathname: "/(protected)/series/[id]",
      params: { id: seriesId },
    });
  };

  // Update hero when index changes
  useEffect(() => {
    console.log(
      "[HomePage] useEffect: Hero index changed to",
      heroIndex,
      "featured series count:",
      featuredSeries.length,
    );
    if (featuredSeries.length > 0) {
      timerStartedRef.current = null; // Reset timer ref when changing series
      const newHeroSeries = featuredSeries[heroIndex % featuredSeries.length];
      console.log(
        "[HomePage] useEffect: Setting new hero series:",
        newHeroSeries.title,
      );
      setHeroSeries(newHeroSeries as HeroVideoData);
      setShowThumbnail(true);
      setHeroVideoUri(null);
      loadHeroVideo(newHeroSeries.id);
    }
  }, [heroIndex, featuredSeries, loadHeroVideo]);

  // Cleanup: Stop video playback when component unmounts
  useEffect(() => {
    return () => {
      setHeroVideoUri(null);
      setShowThumbnail(true);
    };
  }, []);

  const handleImageError = useCallback(() => {
    console.warn("[HomePage] Hero image failed to load");
    setImageLoadFailed(true);
    // IMPORTANT: Do NOT set video URI to null
    // Video should continue playing regardless of image load failure
  }, []);

  const handleImageLoad = useCallback(() => {
    console.log("[HomePage] Hero image loaded successfully");
    setImageLoadFailed(false);
    if (heroSeries?.poster_url) {
      mediaCache.setCached(heroSeries.poster_url, "image");
    }
  }, [heroSeries, mediaCache]);

  const handleVideoLoad = useCallback(() => {
    console.log("[HomePage] Hero video loaded successfully");
    if (heroVideoUri) {
      mediaCache.setCached(heroVideoUri, "video");
      setVideoLoadAttempts(0); // Reset attempts on success
    }
  }, [heroVideoUri, mediaCache]);

  const handleVideoError = useCallback(() => {
    console.error("[HomePage] Hero video failed to load");
    // Retry logic for videos (up to 2 retries)
    if (videoLoadAttempts < 2) {
      setVideoLoadAttempts((prev) => prev + 1);
      // The VideoDisplay component handles retries internally
      console.log("[HomePage] Video retry attempt", videoLoadAttempts + 1);
    }
  }, [videoLoadAttempts]);

  // Reduce render logging noise - only log during initial states
  if (isLoading || !heroSeries) {
    console.log(
      "[HomePage] render - isLoading:",
      isLoading,
      "heroSeries:",
      heroSeries?.title,
    );
  }

  if (isLoading) {
    return <LoadingState message="Loading content..." />;
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Black Background Container */}
      <View style={styles.background}>
        {heroSeries ? (
          <>
            {/* Hero Section - Full Bleed Image with Overlays */}
            <View style={styles.heroContainer}>
              {/* Video Player - Hidden behind thumbnail initially */}
              {heroVideoUri && !showThumbnail && (
                <VideoDisplay
                  ref={videoRef}
                  uri={heroVideoUri}
                  preset="cover"
                  shouldPlay={true}
                  isLooping={false}
                  isMuted={false}
                  useNativeControls={false}
                  onStatus={(status: any) => {
                    if (status?.didJustFinish) {
                      handleVideoEnd();
                    }
                    // Track video progress (capped at 30 seconds)
                    if (status?.durationMillis && status?.positionMillis) {
                      const cappedDuration = Math.min(
                        status.durationMillis,
                        30000,
                      );
                      const cappedPosition = Math.min(
                        status.positionMillis,
                        30000,
                      );
                      setVideoDuration(cappedDuration);
                      setVideoProgress(cappedPosition / cappedDuration);

                      // End video after 30 seconds
                      if (status.positionMillis >= 30000) {
                        handleVideoEnd();
                      }
                    }
                  }}
                  style={styles.heroVideo}
                  key={heroVideoUri}
                  onLoad={handleVideoLoad}
                  onError={handleVideoError}
                />
              )}

              {/* Hero Background Image - Thumbnail Placeholder */}
              {showThumbnail && (
                <ImageDisplay
                  uri={heroSeries.poster_url}
                  preset="cover"
                  style={styles.heroImage}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
              )}

              {/* Gradient Overlay - blends from black at bottom to transparent */}
              <LinearGradient
                colors={[
                  "rgba(0,0,0,0)",
                  "rgba(0,0,0,0.3)",
                  "rgba(0,0,0,0.85)",
                  "rgba(0,0,0,1)",
                ]}
                locations={[0, 0.5, 0.8, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.gradientOverlay}
              />

              {/* Header - Top Bar */}
              <View style={[styles.topBar, { paddingTop: insets.top + 16 }]}>
                {/* Top Bar Gradient Overlay */}
                <LinearGradient
                  colors={[
                    "rgba(0,0,0,1)",
                    "rgba(0,0,0,0.64)",
                    "rgba(0,0,0,0)",
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.topBarGradient}
                />
                <View style={styles.topBarContent}>
                  <Text style={styles.logoText}>locul</Text>
                </View>
              </View>

              {/* Title and Description - Positioned at Bottom */}
              <View style={styles.heroContent}>
                <View style={styles.heroTextBlock}>
                  <Text style={styles.heroTitle} numberOfLines={1}>
                    {heroSeries.title}
                  </Text>
                  <Text style={styles.heroDescription} numberOfLines={2}>
                    {heroSeries.description ||
                      "Discover amazing stories and content."}
                  </Text>
                </View>

                {/* Stacked Buttons */}
                <View style={styles.buttonStack}>
                  {/* Add/Remove from Watchlist Button */}
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleToggleWatchlist}
                  >
                    <Ionicons
                      name={heroWatchlistStatus ? "checkmark-circle" : "add"}
                      size={48}
                      color="white"
                    />
                  </TouchableOpacity>

                  {/* Play Button */}
                  <TouchableOpacity
                    style={styles.playButton}
                    onPress={handleWatchNow}
                  >
                    <Ionicons name="play" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Featured Section - Overlaps with hero */}
            <View style={styles.featuredWrapper}>
              <View style={styles.featuredTitleContainer}>
                <Text style={styles.featuredTitle}>Featured</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.featuredCarousel}
                scrollEventThrottle={16}
              >
                {featuredSeries.map((series) => {
                  const isHighlighted = series.id === heroSeries.id;
                  return (
                    <View key={series.id} style={styles.featuredCardWrapper}>
                      <TouchableOpacity
                        style={[
                          styles.featuredCard,
                          isHighlighted && styles.featuredCardHighlighted,
                        ]}
                        onPress={() => handleSeriesPress(series.id)}
                      >
                        <ImageDisplay
                          uri={series.poster_url}
                          preset="poster"
                          style={styles.featuredImage}
                        />
                        {isHighlighted && !showThumbnail && (
                          <View style={styles.progressContainer}>
                            <View style={styles.progressCircleTrack} />
                            <View
                              style={[
                                styles.progressCircleProgress,
                                {
                                  borderLeftColor:
                                    videoProgress >= 0
                                      ? `rgba(229, 0, 89, ${Math.min(videoProgress * 4, 1)})`
                                      : "transparent",
                                  borderTopColor:
                                    videoProgress >= 0.25
                                      ? `rgba(229, 0, 89, ${Math.min((videoProgress - 0.25) * 4, 1)})`
                                      : "transparent",
                                  borderRightColor:
                                    videoProgress >= 0.5
                                      ? `rgba(229, 0, 89, ${Math.min((videoProgress - 0.5) * 4, 1)})`
                                      : "transparent",
                                  borderBottomColor:
                                    videoProgress >= 0.75
                                      ? `rgba(229, 0, 89, ${Math.min((videoProgress - 0.75) * 4, 1)})`
                                      : "transparent",
                                },
                              ]}
                            />
                          </View>
                        )}
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="film-outline"
              size={48}
              color="#F5F5F5"
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyText}>No content available</Text>
            <Text style={styles.emptySubtext}>
              Create your first series to get started
            </Text>
          </View>
        )}
      </View>

      {/* Bottom Navigation Bar */}
      <CustomBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  background: {
    flex: 1,
    backgroundColor: "#000",
  },
  heroContainer: {
    width: "100%",
    height: 575,
    position: "relative",
    overflow: "hidden",
  },
  heroVideo: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  heroImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    transform: [{ scale: 1.5 }],
  },
  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 400,
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 16,
    zIndex: 10,
  },
  topBarGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  topBarContent: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    zIndex: 2,
  },
  logoText: {
    fontSize: 32,
    fontFamily: "LeagueSpartan",
    fontWeight: "bold",
    color: "#E50059",
  },
  heroContent: {
    position: "absolute",
    bottom: 60,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  heroTextBlock: {
    flex: 1,
    marginRight: 16,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontFamily: "LeagueSpartan",
    fontWeight: "400",
    marginBottom: 4,
  },
  heroDescription: {
    color: "#B0B0B0",
    fontSize: 17,
    fontFamily: "LeagueSpartan",
    fontWeight: "200",
    lineHeight: 20,
  },
  buttonStack: {
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    marginTop: -16,
  },
  addButton: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E50059",
    justifyContent: "center",
    alignItems: "center",
  },
  featuredWrapper: {
    marginTop: -60,
    flex: 1,
    paddingTop: 20,
    paddingBottom: 104, // 80px (bottom nav) + 24px spacing
    position: "relative",
  },
  featuredTitleContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  featuredTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontFamily: "LeagueSpartan",
    fontWeight: "600",
  },
  featuredCarousel: {
    paddingLeft: 20,
    paddingRight: 60,
    gap: 16,
  },
  featuredCard: {
    width: width * 0.32,
    aspectRatio: 3 / 4,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#b3b3b3",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.37,
    shadowRadius: 20.5,
    elevation: 10,
  },
  featuredCardHighlighted: {
    transform: [{ scale: 1.1 }],
    zIndex: 5,
    overflow: "hidden",
    borderRadius: 8,
  },
  featuredImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    aspectRatio: 3 / 4,
  },
  featuredCardWrapper: {
    justifyContent: "flex-end",
    height: width * 0.32 * (4 / 3),
    borderRadius: 8,
    overflow: "hidden",
  },
  progressContainer: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 22.4,
    height: 22.4,
    zIndex: 10,
  },
  progressCircleTrack: {
    position: "absolute",
    width: 22.4,
    height: 22.4,
    borderRadius: 11.2,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  progressCircleProgress: {
    position: "absolute",
    width: 22.4,
    height: 22.4,
    borderRadius: 11.2,
    borderWidth: 2,
    borderColor: "transparent",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.6,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#F5F5F5",
    marginBottom: 8,
    fontFamily: "LeagueSpartan",
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#F5F5F5",
    fontFamily: "LeagueSpartan",
    opacity: 0.6,
    textAlign: "center",
  },
});
