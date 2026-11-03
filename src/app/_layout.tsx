import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#000" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "700", color: "#fff" },
        headerTitleAlign: "center",
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Secret Santa Elf" }} />
      <Stack.Screen name="me" options={{ title: "My Secret Santa" }} />
      <Stack.Screen name="events" options={{ title: "My Events" }} />
    </Stack>
  );
}