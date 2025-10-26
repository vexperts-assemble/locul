import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, fonts } from "../../theme/tokens";
import { Ionicons } from "@expo/vector-icons";

interface HeroOverlayProps {
  title: string;
  description?: string;
  rightContent?: React.ReactNode; // e.g., + button
  showCTAStack?: boolean; // when rightContent not provided, render default +/play stack
  onPressAdd?: () => void;
  onPressPlay?: () => void;
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  descriptionStyle?: TextStyle;
}

export const HeroOverlay: React.FC<HeroOverlayProps> = ({
  title,
  description,
  rightContent,
  showCTAStack = true,
  onPressAdd,
  onPressPlay,
  containerStyle,
  titleStyle,
  descriptionStyle,
}) => {
  return (
    <View
      style={[styles.heroOverlayContainer, containerStyle]}
      pointerEvents="box-none"
    >
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
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View style={styles.contentRow}>
        <View style={styles.textCol}>
          <Text style={[styles.title, titleStyle]} numberOfLines={1}>
            {title}
          </Text>
          {!!description && (
            <Text
              style={[styles.description, descriptionStyle]}
              numberOfLines={2}
            >
              {description}
            </Text>
          )}
        </View>
        {rightContent ??
          (showCTAStack ? (
            <View style={styles.buttonStack}>
              <TouchableOpacity
                style={styles.addButton}
                onPress={onPressAdd}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="add" size={48} color={colors.text.light} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.playButton} onPress={onPressPlay}>
                <Ionicons name="play" size={20} color={colors.text.light} />
              </TouchableOpacity>
            </View>
          ) : null)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heroOverlayContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  textCol: {
    flex: 1,
    marginRight: 16,
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
    backgroundColor: colors.brand.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: colors.text.light,
    fontSize: 24,
    fontFamily: fonts.family,
    fontWeight: fonts.weight.regular,
    marginBottom: 4,
  },
  description: {
    color: colors.text.secondary,
    fontSize: 17,
    fontFamily: fonts.family,
    fontWeight: fonts.weight.extraLight,
    lineHeight: 20,
  },
});

export default HeroOverlay;
