import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Modal,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { VideoUpload } from "../../../components/VideoUpload";
import { VideoList } from "../../../components/VideoList";
import { SeriesManagement } from "../../../components/SeriesManagement";
import { VideoUpload as VideoUploadType } from "../../../hooks/useVideoUpload";
import { colors, fonts, spacing, radii, shadows } from "../../../theme/tokens";
import { CustomBottomNav } from "../../../components/CustomBottomNav";

export default function UploadScreen() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<"episodes" | "series">("episodes");
  const insets = useSafeAreaInsets();

  const handleUploadComplete = (video: VideoUploadType) => {
    setShowUploadModal(false);
    // Trigger refresh of video list
    setRefreshKey((prev) => prev + 1);
  };

  const handleVideoPress = (video: VideoUploadType) => {
    // Handle video press - could navigate to full screen player
    console.log("Video pressed:", video.title);
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.logoText}>locul</Text>
        <TouchableOpacity style={styles.profileIcon}>
          <Ionicons
            name="settings-outline"
            size={24}
            color="rgba(255, 255, 255, 0.82)"
          />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "episodes" && styles.activeTab]}
          onPress={() => setActiveTab("episodes")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "episodes" && styles.activeTabText,
            ]}
          >
            Upload Episodes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "series" && styles.activeTab]}
          onPress={() => setActiveTab("series")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "series" && styles.activeTabText,
            ]}
          >
            Manage Series
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {activeTab === "episodes" ? (
          <>
            {/* Upload Section */}
            <View style={styles.uploadSection}>
              <Text style={styles.sectionTitle}>Upload Content</Text>
              <Text style={styles.sectionDescription}>
                Share your stories and connect with your audience
              </Text>

              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => setShowUploadModal(true)}
              >
                <View style={styles.iconContainer}>
                  <Ionicons name="videocam" size={24} color="white" />
                </View>
                <Text style={styles.uploadButtonText}>Create New Episode</Text>
              </TouchableOpacity>
            </View>

            {/* My Videos Section */}
            <View style={styles.videosSection}>
              <Text style={styles.sectionTitle}>My Episodes</Text>
              <VideoList key={refreshKey} onVideoPress={handleVideoPress} />
            </View>
          </>
        ) : (
          <SeriesManagement />
        )}
      </View>

      {/* Upload Modal */}
      <Modal
        visible={showUploadModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderContent}>
              <Text style={styles.modalTitle}>Create New Episode</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowUploadModal(false)}
              >
                <Ionicons name="close" size={20} color="#F5F5F5" />
              </TouchableOpacity>
            </View>
          </View>
          <ScrollView style={styles.modalContent}>
            <VideoUpload onUploadComplete={handleUploadComplete} />
          </ScrollView>
        </View>
      </Modal>

      <CustomBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.darkBg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  logoText: {
    color: colors.brand.primary,
    fontSize: 28,
    fontFamily: fonts.family,
    fontWeight: fonts.weight.bold,
  },
  profileIcon: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.sm,
    backgroundColor: "rgba(245, 245, 245, 0.05)",
    marginHorizontal: 4,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: colors.brand.primary,
  },
  tabText: {
    color: colors.text.light,
    fontSize: 14,
    fontFamily: fonts.family,
    fontWeight: fonts.weight.semiBold,
    opacity: 0.7,
  },
  activeTabText: {
    opacity: 1,
    fontWeight: fonts.weight.semiBold,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: 0,
    paddingBottom: 160, // Space for bottom navigation + 24px spacing
  },
  uploadSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    color: colors.text.light,
    fontSize: 24,
    fontFamily: fonts.family,
    fontWeight: fonts.weight.semiBold,
    lineHeight: 24,
    marginBottom: spacing.sm,
  },
  sectionDescription: {
    color: colors.text.light,
    fontSize: 17,
    fontFamily: fonts.family,
    fontWeight: fonts.weight.extraLight,
    lineHeight: 17,
    marginBottom: spacing.xxl,
    opacity: 0.8,
  },
  uploadButton: {
    height: 60,
    backgroundColor: colors.brand.primary,
    borderRadius: radii.md,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.md,
    ...shadows.card,
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: 24,
  },
  uploadButtonText: {
    color: colors.text.light,
    fontSize: 18,
    fontFamily: fonts.family,
    fontWeight: fonts.weight.semiBold,
    lineHeight: 22,
    textAlign: "center",
  },
  videosSection: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#020100",
  },
  modalHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(245, 245, 245, 0.1)",
  },
  modalHeaderContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    color: "#F5F5F5",
    fontSize: 20,
    fontFamily: "LeagueSpartan",
    fontWeight: "600",
    lineHeight: 20,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(245, 245, 245, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    flex: 1,
    backgroundColor: "#020100",
  },
});
