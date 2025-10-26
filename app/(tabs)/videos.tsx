import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Modal,
} from "react-native";
import { VideoUpload } from "../../components/VideoUpload";
import { VideoList } from "../../components/VideoList";
import { VideoUpload as VideoUploadType } from "../../hooks/useVideoUpload";

export default function VideosScreen() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

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
      <View style={styles.header}>
        <Text style={styles.title}>My Videos</Text>
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => setShowUploadModal(true)}
        >
          <Text style={styles.uploadButtonText}>+ Upload</Text>
        </TouchableOpacity>
      </View>

      <VideoList key={refreshKey} onVideoPress={handleVideoPress} />

      <Modal
        visible={showUploadModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowUploadModal(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <VideoUpload onUploadComplete={handleUploadComplete} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  uploadButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  uploadButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  closeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: "#007AFF",
  },
  modalContent: {
    flex: 1,
  },
});
