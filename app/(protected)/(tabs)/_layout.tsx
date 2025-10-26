import { Stack } from "expo-router";

export default function TabsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="videos"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="mystuff"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="featured"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
