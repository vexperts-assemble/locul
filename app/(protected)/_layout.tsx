import { Stack, usePathname } from "expo-router";
import { View } from "react-native";
import { CustomBottomNav } from "../../components/CustomBottomNav";

export default function ProtectedLayout() {
  const pathname = usePathname();

  // Hide bottom nav on Explore and Series pages
  const shouldShowBottomNav =
    !pathname?.includes("/explore") && !pathname?.includes("/series");

  return (
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false, // Hide all headers by default
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="explore" />
        <Stack.Screen name="series" />
      </Stack>
      <CustomBottomNav visible={shouldShowBottomNav} />
    </View>
  );
}
