import React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { colors, fonts } from "../../theme/tokens";

interface TopGradientBarProps {
  leftBadgeValue?: string | number;
  rightBadgeValue?: string | number;
  showBadges?: boolean;
  logoText?: string;
  paddingHorizontal?: number; // defaults to 30
  paddingVertical?: number; // defaults to 31
  gradientHeight?: number; // defaults to 15
  containerStyle?: ViewStyle;
  logoStyle?: TextStyle;
}

export const TopGradientBar: React.FC<TopGradientBarProps> = ({
  leftBadgeValue = "39",
  rightBadgeValue = "39",
  showBadges = false,
  logoText = "locul",
  paddingHorizontal = 30,
  paddingVertical = 31,
  gradientHeight = 15,
  containerStyle,
  logoStyle,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.topBar,
        {
          paddingHorizontal,
          paddingTop: paddingVertical + insets.top,
          paddingBottom: paddingVertical,
        },
        containerStyle,
      ]}
      pointerEvents="box-none"
    >
      <LinearGradient
        colors={["rgba(0,0,0,1)", "rgba(0,0,0,0.64)", "rgba(0,0,0,0)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[
          styles.gradientBar,
          { top: paddingVertical, height: gradientHeight },
        ]}
        pointerEvents="none"
      />

      <View style={styles.topBarContent}>
        {showBadges ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{leftBadgeValue}</Text>
          </View>
        ) : (
          <View style={{ width: 32 }} />
        )}

        <Text style={[styles.logoText, logoStyle]}>{logoText}</Text>

        {showBadges ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{rightBadgeValue}</Text>
          </View>
        ) : (
          <View style={{ width: 32 }} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  gradientBar: {
    position: "absolute",
    left: 0,
    right: 0,
  },
  topBarContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    width: "100%",
    paddingBottom: 10,
  },
  badge: {
    minWidth: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.badge.blue,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  badgeText: {
    color: colors.text.light,
    fontSize: 14,
    fontFamily: fonts.family,
    fontWeight: fonts.weight.semiBold,
  },
  logoText: {
    color: colors.brand.primary,
    fontSize: 32,
    fontFamily: fonts.family,
    fontWeight: "bold",
  },
});

export default TopGradientBar;
