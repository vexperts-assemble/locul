import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

const { width } = Dimensions.get("window");

// Static featured items for display (no data wiring)
const FEATURED_ITEMS = [
  {
    id: "1",
    image: require("../../../assets/a8f5b0823315e214a77a21062ee3cc97ecb80118.png"),
  },
  {
    id: "2",
    image: require("../../../assets/ef52dfe92c6bfe99dcd2568b0d65aa8729c23e3f.png"),
  },
  {
    id: "3",
    image: require("../../../assets/e8bda3e3af22116533e5e4173709b018be2d4b18.png"),
  },
  {
    id: "4",
    image: require("../../../assets/e8bda3e3af22116533e5e4173709b018be2d4b18.png"),
  },
];

export default function FeaturedShowcasePage() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Black Background Container */}
      <View style={styles.background}>
        {/* Hero Section - Full Bleed Image with Overlays */}
        <View style={styles.heroContainer}>
          {/* Hero Background Image - scaled and zoomed */}
          <Image
            source={require("../../../assets/e8bda3e3af22116533e5e4173709b018be2d4b18.png")}
            style={styles.heroImage}
            resizeMode="cover"
          />

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
            <View style={styles.topBarContent}>
              <Text style={styles.logoText}>locul</Text>
            </View>
          </View>

          {/* Title and Description - Positioned at Bottom */}
          <View style={styles.heroContent}>
            <View style={styles.heroTextBlock}>
              <Text style={styles.heroTitle}>Chronicles of Kwa-Zulu</Text>
              <Text style={styles.heroDescription}>
                A young man attempts to learn the culture and tradition of a
                clan...
              </Text>
            </View>

            {/* Stacked Buttons */}
            <View style={styles.buttonStack}>
              {/* Add Button */}
              <TouchableOpacity style={styles.addButton}>
                <Ionicons name="add" size={48} color="white" />
              </TouchableOpacity>

              {/* Play Button */}
              <TouchableOpacity style={styles.playButton}>
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
            {FEATURED_ITEMS.map((item, index) => (
              <View
                key={item.id}
                style={[styles.featuredCard, index === 0 && { marginLeft: 0 }]}
              >
                <Image source={item.image} style={styles.featuredImage} />
              </View>
            ))}
          </ScrollView>
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
  background: {
    flex: 1,
    backgroundColor: "#000",
  },
  heroContainer: {
    width: "100%",
    height: 650,
    position: "relative",
    overflow: "hidden",
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
  topBarContent: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
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
  featuredImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
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
