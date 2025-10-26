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
    label: "Home",
    icon: "home-outline",
    activeIcon: "home",
    route: "/(protected)/(tabs)",
  },
  {
    name: "explore",
    label: "Explore",
    icon: "play-circle-outline",
    activeIcon: "play-circle",
    route: "/(protected)/explore",
  },
  {
    name: "upload",
    label: "Upload",
    icon: "videocam-outline",
    activeIcon: "videocam",
    route: "/(protected)/(tabs)/videos",
  },
  {
    name: "featured",
    label: "Featured",
    icon: "star-outline",
    activeIcon: "star",
    route: "/(protected)/(tabs)/featured",
  },
  {
    name: "profile",
    label: "Profile",
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

      // Home tab: treat index route as active or root '/'
      if (target === "/(protected)/(tabs)") {
        return (
          current === "/(protected)/(tabs)" ||
          current === "/(protected)/(tabs)/index" ||
          current === "/(protected)/(tabs)/" ||
          current === "/" ||
          current === ""
        );
      }

      // Featured tab: treat featured route as active
      if (target === "/(protected)/(tabs)/featured") {
        return current === "/(protected)/(tabs)/featured";
      }

      // Explore tab: exact match
      if (target === "/(protected)/explore") {
        return current === "/(protected)/explore";
      }

      // For other tabs, check if current path matches exactly
      if (current === target) return true;

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
            <TouchableOpacity
              key={item.name}
              style={[styles.navItem, active && styles.navItemActive]}
              onPress={
                active ? undefined : () => router.push(item.route as any)
              }
              disabled={active}
            >
              <Ionicons
                name={active ? item.activeIcon : item.icon}
                size={24}
                color={active ? "#E50059" : "#F3F4F6"}
              />
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
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
    justifyContent: "space-around",
    alignItems: "center",
  },
  // Individual navigation item
  navItem: {
    alignItems: "center",
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  // Active navigation item styling
  navItemActive: {
    opacity: 1,
  },
  // Navigation labels
  navLabel: {
    fontSize: 12,
    fontFamily: "LeagueSpartan",
    fontWeight: "400",
    color: "#F3F4F6", // Light gray instead of inactive gray
  },
  navLabelActive: {
    color: "#E50059",
  },
});
