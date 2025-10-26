import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import ImageDisplay from "./ImageDisplay";
import { useEpisodeUpload } from "../hooks/useEpisodeUpload";
import { useEpisodes } from "../hooks/useEpisodes";

interface VideoUploadProps {
  onUploadComplete?: (video: any) => void;
}

export const VideoUpload: React.FC<VideoUploadProps> = ({
  onUploadComplete,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [seriesId, setSeriesId] = useState<string | "NEW" | undefined>(
    undefined,
  );
  const [newSeriesTitle, setNewSeriesTitle] = useState("");
  const [seriesOptions, setSeriesOptions] = useState<
    { id: string; title: string }[]
  >([]);
  const [newSeriesPosterUri, setNewSeriesPosterUri] = useState<string | null>(
    null,
  );
  const [newSeriesPosterMime, setNewSeriesPosterMime] =
    useState<string>("image/jpeg");
  const { uploadEpisode, isUploading, uploadProgress, error, clearError } =
    useEpisodeUpload();
  const { getSeries, createSeries, setSeriesPoster } = useEpisodes();

  useEffect(() => {
    (async () => {
      const list = await getSeries(50, 0);
      setSeriesOptions(list.map((s) => ({ id: s.id, title: s.title })));
    })();
  }, [getSeries]);

  const handleUpload = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title for your video");
      return;
    }

    clearError();
    let finalSeriesId: string | undefined = seriesId as string | undefined;

    // Create series if NEW selected
    if (seriesId === "NEW") {
      if (!newSeriesTitle.trim()) {
        Alert.alert("Error", "Please enter a name for the new series");
        return;
      }
      try {
        const created = await createSeries(newSeriesTitle.trim());
        finalSeriesId = created.id;
        if (newSeriesPosterUri) {
          try {
            await setSeriesPoster(
              created.id,
              newSeriesPosterUri,
              newSeriesPosterMime,
            );
          } catch (e: any) {
            console.warn("Poster upload failed:", e?.message);
          }
        }
      } catch (e: any) {
        Alert.alert("Error", e?.message || "Failed to create series");
        return;
      }
    }

    // Use default series when none selected
    if (!finalSeriesId) {
      try {
        const def = await createSeries("My Videos");
        finalSeriesId = def.id;
      } catch (e: any) {
        Alert.alert("Error", e?.message || "Failed to ensure default series");
        return;
      }
    }

    const result = await uploadEpisode(
      finalSeriesId,
      title.trim(),
      description.trim(),
    );

    if (result) {
      Alert.alert("Success", "Video uploaded successfully!");
      setTitle("");
      setDescription("");
      setSeriesId(undefined);
      setNewSeriesTitle("");
      setNewSeriesPosterUri(null);
      onUploadComplete?.(result);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Video</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter video title"
          editable={!isUploading}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Enter video description (optional)"
          multiline
          numberOfLines={3}
          editable={!isUploading}
        />
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {uploadProgress && (
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Uploading... {Math.round(uploadProgress.percentage)}%
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${uploadProgress.percentage}%` },
              ]}
            />
          </View>
        </View>
      )}

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Series</Text>
        <View style={styles.pickerContainer}>
          <TouchableOpacity
            style={[
              styles.pickerOption,
              seriesId === "NEW" && styles.pickerOptionSelected,
            ]}
            onPress={() => setSeriesId("NEW")}
            disabled={isUploading}
          >
            <Text
              style={[
                styles.pickerOptionText,
                seriesId === "NEW" && styles.pickerOptionTextSelected,
              ]}
            >
              New Series
            </Text>
          </TouchableOpacity>
          {seriesOptions.map((s) => (
            <TouchableOpacity
              key={s.id}
              style={[
                styles.pickerOption,
                seriesId === s.id && styles.pickerOptionSelected,
              ]}
              onPress={() => setSeriesId(s.id)}
              disabled={isUploading}
            >
              <Text
                style={[
                  styles.pickerOptionText,
                  seriesId === s.id && styles.pickerOptionTextSelected,
                ]}
              >
                {s.title}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[
              styles.pickerOption,
              !seriesId && styles.pickerOptionSelected,
            ]}
            onPress={() => setSeriesId(undefined)}
            disabled={isUploading}
          >
            <Text
              style={[
                styles.pickerOptionText,
                !seriesId && styles.pickerOptionTextSelected,
              ]}
            >
              My Videos (default)
            </Text>
          </TouchableOpacity>
        </View>
        {seriesId === "NEW" && (
          <View style={{ marginTop: 8 }}>
            <Text style={styles.label}>New series name</Text>
            <TextInput
              style={styles.input}
              value={newSeriesTitle}
              onChangeText={setNewSeriesTitle}
              placeholder="Enter series name"
              editable={!isUploading}
            />
            <View style={{ marginTop: 12 }}>
              <Text style={styles.label}>Series thumbnail</Text>
              <TouchableOpacity
                style={styles.thumbnailPicker}
                onPress={async () => {
                  try {
                    const picker = await import("expo-document-picker");
                    const res = await picker.getDocumentAsync({
                      type: ["image/jpeg", "image/png", "image/webp"],
                      copyToCacheDirectory: true,
                    });
                    if (!res.canceled) {
                      const asset = res.assets[0];
                      setNewSeriesPosterUri(asset.uri);
                      // Best-effort MIME detection from name
                      const name = asset.name || "";
                      if (name.endsWith(".png"))
                        setNewSeriesPosterMime("image/png");
                      else if (name.endsWith(".webp"))
                        setNewSeriesPosterMime("image/webp");
                      else setNewSeriesPosterMime("image/jpeg");
                    }
                  } catch (e) {
                    console.warn("Image pick failed", e);
                  }
                }}
                disabled={isUploading}
              >
                {newSeriesPosterUri ? (
                  <ImageDisplay uri={newSeriesPosterUri} preset="poster" />
                ) : (
                  <ImageDisplay
                    uri={null}
                    preset="poster"
                    placeholderLabel="Pick an image"
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.uploadButton,
          isUploading && styles.uploadButtonDisabled,
        ]}
        onPress={handleUpload}
        disabled={isUploading}
      >
        {isUploading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.uploadButtonText}>Upload Video</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "transparent",
    borderRadius: 12,
    margin: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: "LeagueSpartan",
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#F5F5F5",
  },
  inputContainer: {
    marginBottom: 16,
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
    height: 80,
    textAlignVertical: "top",
  },
  errorContainer: {
    backgroundColor: "rgba(235, 88, 140, 0.1)",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(235, 88, 140, 0.3)",
  },
  errorText: {
    color: "#EB588C",
    fontSize: 14,
    fontFamily: "LeagueSpartan",
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressText: {
    fontSize: 14,
    fontFamily: "LeagueSpartan",
    color: "#F5F5F5",
    marginBottom: 8,
    opacity: 0.8,
  },
  progressBar: {
    height: 4,
    backgroundColor: "rgba(245, 245, 245, 0.2)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#EB588C",
  },
  uploadButton: {
    backgroundColor: "#EB588C",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#EB588C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  uploadButtonDisabled: {
    backgroundColor: "rgba(245, 245, 245, 0.3)",
  },
  uploadButtonText: {
    color: "#F5F5F5",
    fontSize: 16,
    fontFamily: "LeagueSpartan",
    fontWeight: "600",
    lineHeight: 20,
    textAlign: "center",
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(245, 245, 245, 0.2)",
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: "rgba(245, 245, 245, 0.05)",
  },
  chipSelected: {
    backgroundColor: "#EB588C",
    borderColor: "#EB588C",
  },
  chipText: {
    color: "#F5F5F5",
    fontSize: 14,
    fontFamily: "LeagueSpartan",
  },
  chipTextSelected: {
    color: "#F5F5F5",
    fontWeight: "600",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "rgba(245, 245, 245, 0.2)",
    borderRadius: 8,
    backgroundColor: "rgba(245, 245, 245, 0.05)",
    overflow: "hidden",
  },
  pickerOption: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(245, 245, 245, 0.1)",
    backgroundColor: "transparent",
  },
  pickerOptionSelected: {
    backgroundColor: "rgba(235, 88, 140, 0.2)",
  },
  pickerOptionText: {
    color: "#F5F5F5",
    fontSize: 16,
    fontFamily: "LeagueSpartan",
  },
  pickerOptionTextSelected: {
    color: "#EB588C",
    fontWeight: "600",
  },
  thumbnailPicker: {
    height: 140,
    borderWidth: 1,
    borderColor: "rgba(245, 245, 245, 0.2)",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "rgba(245, 245, 245, 0.05)",
  },
  thumbnailPreview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  thumbnailPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  thumbnailPlaceholderText: {
    color: "#F5F5F5",
    fontFamily: "LeagueSpartan",
    opacity: 0.6,
  },
});
