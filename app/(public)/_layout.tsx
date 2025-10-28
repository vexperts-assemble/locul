import { Stack } from "expo-router";

export default function PublicLayout() {
  return (
    <Stack initialRouteName="invite-code">
      <Stack.Screen
        name="invite-code"
        options={{
          title: "Invite Code",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="welcome"
        options={{
          title: "Welcome",
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="sign-up"
        options={{
          title: "Sign Up",
          headerTransparent: true,
          headerLargeTitle: true,
          headerBackButtonDisplayMode: "minimal",
        }}
      />
      <Stack.Screen
        name="sign-in"
        options={{
          title: "Sign In",
          headerTransparent: true,
          headerLargeTitle: true,
          headerBackButtonDisplayMode: "minimal",
        }}
      />
    </Stack>
  );
}
