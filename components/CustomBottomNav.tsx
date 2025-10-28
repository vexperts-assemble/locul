import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { router, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

interface NavItem {
  name: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  route: string;
}

const navItems: NavItem[] = [
  {
    name: "home",
    label: "locul",
    icon: "home-outline",
    activeIcon: "home",
    route: "/(protected)/(tabs)",
  },
  {
    name: "explore",
    label: "explore",
    icon: "play-circle-outline",
    activeIcon: "play-circle",
    route: "/(protected)/explore",
  },
  {
    name: "upload",
    label: "upload",
    icon: "videocam-outline",
    activeIcon: "videocam",
    route: "/(protected)/(tabs)/videos",
  },
  {
    name: "featured",
    label: "featured",
    icon: "star-outline",
    activeIcon: "star",
    route: "/(protected)/(tabs)/featured",
  },
  {
    name: "profile",
    label: "profile",
    icon: "person-outline",
    activeIcon: "person",
    route: "/(protected)/(tabs)/profile",
  },
];

interface CustomBottomNavProps {
  visible?: boolean;
}

export const CustomBottomNav: React.FC<CustomBottomNavProps> = ({
  visible = true,
}) => {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  // Hide bottom nav on explore and episodes pages (like in the design)
  const shouldHide =
    pathname === "/(protected)/explore" ||
    pathname?.includes("/episode/") ||
    pathname?.includes("/series/");

  if (!visible || shouldHide) return null;

  const isActive = React.useCallback(
    (route: string) => {
      const normalize = (p?: string) => (p || "").replace(/\/+$/, "");
      const current = normalize(pathname);
      const target = normalize(route);

      // Home tab: check for index, root, or empty paths
      if (target === "/(protected)/(tabs)") {
        return (
          current === "/(protected)/(tabs)" ||
          current === "/(protected)/(tabs)/index" ||
          current === "/" ||
          current === "" ||
          current === "/index"
        );
      }

      // For other tabs, check both the full path and the simplified path
      // Expo Router's usePathname() may return simplified paths like "/profile" instead of "/(protected)/(tabs)/profile"
      
      // Featured tab
      if (target === "/(protected)/(tabs)/featured") {
        return current === "/(protected)/(tabs)/featured" || current === "/featured";
      }

      // Upload/Videos tab
      if (target === "/(protected)/(tabs)/videos") {
        return current === "/(protected)/(tabs)/videos" || current === "/videos";
      }

      // Profile tab
      if (target === "/(protected)/(tabs)/profile") {
        return current === "/(protected)/(tabs)/profile" || current === "/profile";
      }

      // Explore tab (nav is hidden on this page anyway)
      if (target === "/(protected)/explore") {
        return current === "/(protected)/explore" || current === "/explore";
      }

      return false;
    },
    [pathname],
  );

  return (
    <BlurView
      intensity={23.5}
      style={[styles.container, { paddingBottom: insets.bottom }]}
    >
      <View style={styles.navItems}>
        {navItems.map((item) => {
          const active = isActive(item.route);
          return (
            <View key={item.name} style={styles.navItemWrapper}>
              {active && <View style={styles.glowEffect} />}
              <TouchableOpacity
                style={[styles.navItem, active && styles.navItemActive]}
                onPress={
                  active ? undefined : () => router.push(item.route as any)
                }
                disabled={active}
              >
                <Ionicons
                  name={active ? item.activeIcon : item.icon}
                  size={24}
                  color={active ? "#FFFFFF" : "#E5E7EB"}
                />
                {active && (
                  <Text style={[styles.navLabel, active && styles.navLabelActive]}>
                    {item.label}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  // Fixed bottom navigation bar with blur effect
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingHorizontal: 16,
  },
  // Navigation items container
  navItems: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  // Wrapper for each nav item to contain the glow effect
  navItemWrapper: {
    position: "relative",
  },
  // Soft pink glow effect behind active tab
  glowEffect: {
    position: "absolute",
    top: -20,
    left: -25,
    right: -25,
    bottom: -20,
    backgroundColor: "rgba(235, 88, 140, 0.10)",
    borderRadius: 50,
    zIndex: -1,
  },
  // Individual navigation item (inactive - just icon, circular)
  navItem: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 27,
  },
  // Active navigation item styling (horizontal pill shape with pink background)
  navItemActive: {
    flexDirection: "row",
    backgroundColor: "rgba(61.26, 0, 21.67, 0.49)",
    borderRadius: 43,
    paddingHorizontal: 16,
    paddingVertical: 10,
    width: "auto",
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "rgba(235, 88, 140, 0.20)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 14.55,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(229, 231, 235, 0.07)",
  },
  // Active label styling
  navLabel: {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: "LeagueSpartan",
    fontWeight: "700",
    lineHeight: 20,
  },
  navLabelActive: {
    color: "#FFFFFF",
  },
});
