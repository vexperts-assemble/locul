import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function EndOfSeriesScreen() {
  const { id: seriesId } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Back button */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.navBack}>{"< Back to My Stuff"}</Text>
        </TouchableOpacity>
      </View>

      {/* Main content */}
      <View style={styles.content}>
        <Ionicons
          name="film"
          size={48}
          color="#EB588C"
          style={styles.endIcon}
        />
        <Text style={styles.title}>End of Series</Text>
        <Text style={styles.subtitle}>
          You've reached the end of this series.{"\n"}
          Ready to discover more content?
        </Text>

        <TouchableOpacity
          style={styles.exploreButton}
          onPress={() => router.push("/(protected)/explore")}
        >
          <Text style={styles.exploreButtonText}>Go to Explore</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Back to Series</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  topBar: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  navBack: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  endIcon: {
    fontSize: 80,
    marginBottom: 24,
  },
  title: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
  },
  exploreButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    marginBottom: 16,
    minWidth: 200,
    alignItems: "center",
  },
  exploreButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  backButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    minWidth: 200,
    alignItems: "center",
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
