import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  Dimensions,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { SvgXml } from "react-native-svg";

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

const { width } = Dimensions.get("window");

export default function FeaturedShowcasePage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0.47); // 47% progress
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleRewind = () => {
    // Rewind functionality
    console.log("Rewind 10 seconds");
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleEpisodes = () => {
    // Navigate to episodes list
    console.log("Navigate to episodes");
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Hero Image/Video Section */}
      <View style={styles.heroSection}>
        <Image
          source={require("../../../assets/e8bda3e3af22116533e5e4173709b018be2d4b18.png")}
          style={styles.heroImage}
          resizeMode="cover"
        />

        {/* Gradient Overlay */}
        <LinearGradient
          colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.7)", "rgba(0,0,0,1)"]}
          locations={[0, 0.5, 1]}
          style={styles.gradientOverlay}
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
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleBookmark}
          >
            <Ionicons
              name={isBookmarked ? "checkmark" : "add"}
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.episodesButton} onPress={handleEpisodes}>
            <Ionicons name="list" size={20} color="#FFFFFF" />
            <Text style={styles.episodesText}>Episodes</Text>
          </TouchableOpacity>
        </View>

        {/* Episode Info and Controls */}
        <View style={styles.controlsContainer}>
          <View style={styles.episodeInfo}>
            <Text style={styles.episodeTitle} numberOfLines={1}>
              Episode 1: The Beginning
            </Text>
            <Text style={styles.episodeSubtitle} numberOfLines={1}>
              A young man attempts to learn...
            </Text>
          </View>

          {/* Playback Controls */}
          <View style={styles.playbackControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleRewind}
            >
              <SvgXml xml={rewindIcon} width={24} height={24} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.playPauseButton}
              onPress={handlePlayPause}
            >
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={32}
                color="#FFFFFF"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleRewind}
            >
              <SvgXml xml={forwardIcon} width={24} height={24} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
        </View>
      </View>

      {/* Bottom Navigation Bar */}
      <BlurView
        intensity={23.5}
        style={[
          styles.bottomNav,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        <TouchableOpacity style={styles.navItem} disabled>
          <Ionicons name="home-outline" size={24} color="#F3F4F6" />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} disabled>
          <Ionicons name="play-circle-outline" size={24} color="#F3F4F6" />
          <Text style={styles.navLabel}>Explore</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} disabled>
          <Ionicons name="videocam-outline" size={24} color="#F3F4F6" />
          <Text style={styles.navLabel}>Upload</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, styles.navItemActive]}
          disabled
        >
          <Ionicons name="star" size={24} color="#E50059" />
          <Text style={[styles.navLabel, styles.navLabelActive]}>Featured</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} disabled>
          <Ionicons name="bookmark-outline" size={24} color="#F3F4F6" />
          <Text style={styles.navLabel}>My Stuff</Text>
        </TouchableOpacity>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  heroSection: {
    flex: 1,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
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
    fontFamily: "LeagueSpartan",
    fontWeight: "400",
  },
  controlsContainer: {
    position: "absolute",
    bottom: 120,
    left: 32,
    right: 32,
    width: width - 64,
  },
  episodeInfo: {
    marginBottom: 16,
  },
  episodeTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontFamily: "LeagueSpartan",
    fontWeight: "600",
    marginBottom: 4,
  },
  episodeSubtitle: {
    color: "#B0B0B0",
    fontSize: 16,
    fontFamily: "LeagueSpartan",
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
    backgroundColor: "#E50059",
  },
  progressContainer: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    height: 8,
  },
  progressBar: {
    width: "100%",
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#E50059",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingHorizontal: 16,
  },
  navItem: {
    alignItems: "center",
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  navItemActive: {
    opacity: 1,
  },
  navLabel: {
    fontSize: 12,
    fontFamily: "LeagueSpartan",
    fontWeight: "400",
    color: "#F3F4F6",
  },
  navLabelActive: {
    color: "#E50059",
  },
});
