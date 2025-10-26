import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { ImageDisplay } from "./ImageDisplay";
import { LoadingState } from "./LoadingState";
import { useEpisodes } from "../hooks/useEpisodes";

interface Series {
  id: string;
  title: string;
  description?: string;
  poster_url?: string;
  created_at: string;
  episode_count?: number;
}

export const SeriesManagement: React.FC = () => {
  const [series, setSeries] = useState<Series[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSeries, setEditingSeries] = useState<Series | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [posterUri, setPosterUri] = useState<string | null>(null);
  const [posterMime, setPosterMime] = useState<string>("image/jpeg");
  const [isSaving, setIsSaving] = useState(false);

  const { getSeries, createSeries, updateSeries, setSeriesPoster } =
    useEpisodes();

  const loadSeries = async () => {
    try {
      setIsLoading(true);
      const seriesList = await getSeries(50, 0);
      setSeries(seriesList as Series[]);
    } catch (error) {
      console.error("Failed to load series:", error);
      Alert.alert("Error", "Failed to load series");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSeries();
  }, []);

  const handleCreateSeries = () => {
    setEditingSeries(null);
    setTitle("");
    setDescription("");
    setPosterUri(null);
    setShowEditModal(true);
  };

  const handleEditSeries = (seriesItem: Series) => {
    setEditingSeries(seriesItem);
    setTitle(seriesItem.title);
    setDescription(seriesItem.description || "");
    setPosterUri(seriesItem.poster_url || null);
    setShowEditModal(true);
  };

  const handlePickImage = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setPosterUri(asset.uri);
        const name = asset.name || "";
        if (name.endsWith(".png")) setPosterMime("image/png");
        else if (name.endsWith(".webp")) setPosterMime("image/webp");
        else setPosterMime("image/jpeg");
      }
    } catch (error) {
      console.error("Image pick failed:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a series title");
      return;
    }

    try {
      setIsSaving(true);

      let seriesId: string;

      if (editingSeries) {
        // Update existing series
        await updateSeries(editingSeries.id, {
          title: title.trim(),
          description: description.trim() || undefined,
        });
        seriesId = editingSeries.id;
      } else {
        // Create new series
        const newSeries = await createSeries(
          title.trim(),
          description.trim() || undefined,
        );
        seriesId = newSeries.id;
      }

      // Upload poster if provided
      if (posterUri && seriesId) {
        await setSeriesPoster(seriesId, posterUri, posterMime);
      }

      setShowEditModal(false);
      loadSeries(); // Refresh list
    } catch (error) {
      console.error("Failed to save series:", error);
      Alert.alert("Error", "Failed to save series");
    } finally {
      setIsSaving(false);
    }
  };

  const renderSeriesItem = ({ item }: { item: Series }) => (
    <TouchableOpacity
      style={styles.seriesItem}
      onPress={() => handleEditSeries(item)}
    >
      <View style={styles.seriesImageContainer}>
        <ImageDisplay
          uri={item.poster_url}
          preset="poster"
          placeholderLabel="No Image"
        />
      </View>
      <View style={styles.seriesInfo}>
        <Text style={styles.seriesTitle}>{item.title}</Text>
        {item.description && (
          <Text style={styles.seriesDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        <Text style={styles.seriesEpisodeCount}>
          {item.episode_count || 0} episodes
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color="#F5F5F5"
        style={styles.chevron}
      />
    </TouchableOpacity>
  );

  if (isLoading) {
    return <LoadingState message="Loading series..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Manage Series</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateSeries}
        >
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.createButtonText}>New Series</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={series}
        renderItem={renderSeriesItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="film-outline"
              size={48}
              color="#F5F5F5"
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyText}>No series created yet</Text>
            <Text style={styles.emptySubtext}>
              Create your first series to get started
            </Text>
          </View>
        }
      />

      {/* Edit/Create Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Ionicons name="close" size={24} color="#F5F5F5" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingSeries ? "Edit Series" : "New Series"}
            </Text>
            <TouchableOpacity onPress={handleSave} disabled={isSaving}>
              <Text
                style={[
                  styles.saveButton,
                  isSaving && styles.saveButtonDisabled,
                ]}
              >
                Save
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            {/* Poster Upload */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Series Poster</Text>
              <TouchableOpacity
                style={styles.posterPicker}
                onPress={handlePickImage}
              >
                {posterUri ? (
                  <ImageDisplay uri={posterUri} preset="poster" />
                ) : (
                  <View style={styles.posterPlaceholder}>
                    <Ionicons name="image-outline" size={32} color="#F5F5F5" />
                    <Text style={styles.posterPlaceholderText}>
                      Tap to add poster
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Title Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Series Title *</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter series title"
                placeholderTextColor="rgba(245, 245, 245, 0.5)"
              />
            </View>

            {/* Description Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter series description"
                placeholderTextColor="rgba(245, 245, 245, 0.5)"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerTitle: {
    color: "#F5F5F5",
    fontSize: 24,
    fontFamily: "LeagueSpartan",
    fontWeight: "600",
    lineHeight: 24,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EB588C",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  createButtonText: {
    color: "#F5F5F5",
    fontSize: 14,
    fontFamily: "LeagueSpartan",
    fontWeight: "500",
  },
  list: {
    flex: 1,
  },
  seriesItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245, 245, 245, 0.05)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(245, 245, 245, 0.1)",
  },
  seriesImageContainer: {
    width: 60,
    height: 80,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 16,
  },
  seriesInfo: {
    flex: 1,
  },
  seriesTitle: {
    color: "#F5F5F5",
    fontSize: 18,
    fontFamily: "LeagueSpartan",
    fontWeight: "600",
    marginBottom: 4,
  },
  seriesDescription: {
    color: "#F5F5F5",
    fontSize: 14,
    fontFamily: "LeagueSpartan",
    opacity: 0.8,
    marginBottom: 4,
  },
  seriesEpisodeCount: {
    color: "#F5F5F5",
    fontSize: 12,
    fontFamily: "LeagueSpartan",
    opacity: 0.6,
  },
  chevron: {
    marginLeft: 8,
    opacity: 0.6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 48,
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
  modalContainer: {
    flex: 1,
    backgroundColor: "#020100",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(245, 245, 245, 0.1)",
  },
  modalTitle: {
    color: "#F5F5F5",
    fontSize: 18,
    fontFamily: "LeagueSpartan",
    fontWeight: "600",
  },
  saveButton: {
    color: "#EB588C",
    fontSize: 16,
    fontFamily: "LeagueSpartan",
    fontWeight: "600",
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontFamily: "LeagueSpartan",
    fontWeight: "600",
    marginBottom: 8,
    color: "#F5F5F5",
  },
  input: {
    borderWidth: 1,
    borderColor: "rgba(245, 245, 245, 0.2)",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: "LeagueSpartan",
    backgroundColor: "rgba(245, 245, 245, 0.05)",
    color: "#F5F5F5",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  posterPicker: {
    height: 160,
    borderWidth: 1,
    borderColor: "rgba(245, 245, 245, 0.2)",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "rgba(245, 245, 245, 0.05)",
  },
  posterPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  posterPlaceholderText: {
    color: "#F5F5F5",
    fontSize: 14,
    fontFamily: "LeagueSpartan",
    marginTop: 8,
    opacity: 0.6,
  },
});
