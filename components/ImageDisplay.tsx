import React from "react";
import { View, Text, StyleSheet, Image, ImageResizeMode } from "react-native";

type ImagePreset = "thumbnail" | "poster" | "contain" | "cover" | "avatar";

interface ImageDisplayProps {
  uri?: string;
  preset?: ImagePreset;
  style?: any;
  placeholderLabel?: string;
  borderRadius?: number;
  onLoad?: () => void;
  onError?: (error: any) => void;
}

export const ImageDisplay: React.FC<ImageDisplayProps> = ({
  uri,
  preset = "thumbnail",
  style,
  placeholderLabel = "No image",
  borderRadius,
  onLoad,
  onError,
}) => {
  const { resizeMode, defaultStyle } = getPresetStyle(preset);
  const [failed, setFailed] = React.useState(false);
  const [retryCount, setRetryCount] = React.useState(0);
  const [imageKey, setImageKey] = React.useState(0);
  const retryTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    console.log("[ImageDisplay] uri", uri, "preset", preset);
    // Reset failed state and retry count when URI changes
    if (uri) {
      setFailed(false);
      setRetryCount(0);
      setImageKey((k) => k + 1);
    }
  }, [uri, preset]);

  const handleImageError = (e: any) => {
    const errorMsg = e.nativeEvent?.error?.toString() || "Unknown error";
    console.error("[ImageDisplay] failed to load", uri, errorMsg);

    // Retry logic: attempt up to 3 times with exponential backoff
    if (retryCount < 3 && errorMsg.includes("timed out")) {
      const delayMs = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
      console.log(
        `[ImageDisplay] Retrying in ${delayMs}ms (attempt ${retryCount + 1}/3)`,
      );

      retryTimeoutRef.current = setTimeout(() => {
        setImageKey((k) => k + 1); // Force re-render with new key
        setRetryCount((c) => c + 1);
      }, delayMs);
    } else {
      // All retries exhausted or non-timeout error
      setFailed(true);
      onError?.(e);
    }
  };

  const handleImageLoad = () => {
    console.log("[ImageDisplay] loaded successfully", uri);
    setFailed(false);
    setRetryCount(0);
    onLoad?.();
  };

  React.useEffect(() => {
    return () => {
      // Cleanup timeout on unmount
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  if (!uri || failed) {
    return (
      <View
        style={[
          styles.placeholder,
          defaultStyle,
          style,
          borderRadius != null ? { borderRadius } : null,
        ]}
      >
        <Text style={styles.placeholderText}>{placeholderLabel}</Text>
      </View>
    );
  }

  return (
    <Image
      key={imageKey}
      source={{ uri }}
      style={[
        styles.image,
        defaultStyle,
        style,
        borderRadius != null ? { borderRadius } : null,
      ]}
      resizeMode={resizeMode}
      onError={handleImageError}
      onLoad={handleImageLoad}
    />
  );
};

function getPresetStyle(preset: ImagePreset): {
  resizeMode: ImageResizeMode;
  defaultStyle: any;
} {
  switch (preset) {
    case "poster":
      return {
        resizeMode: "cover",
        defaultStyle: {
          width: "100%",
          aspectRatio: 2 / 3,
          backgroundColor: "#111",
        },
      };
    case "contain":
      return {
        resizeMode: "contain",
        defaultStyle: {
          width: "100%",
          height: "100%",
          backgroundColor: "#111",
        },
      };
    case "cover":
      return {
        resizeMode: "cover",
        defaultStyle: {
          width: "100%",
          height: "100%",
          backgroundColor: "#111",
        },
      };
    case "avatar":
      return {
        resizeMode: "cover",
        defaultStyle: {
          width: 64,
          height: 64,
          borderRadius: 999,
          backgroundColor: "#222",
        },
      };
    case "thumbnail":
    default:
      return {
        resizeMode: "cover",
        defaultStyle: { width: 100, height: 100, backgroundColor: "#111" },
      };
  }
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: "#000",
  },
  placeholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1f1f1f",
  },
  placeholderText: {
    color: "#888",
    fontSize: 14,
  },
});

export default ImageDisplay;
