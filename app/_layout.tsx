// app/_layout.tsx
import { Stack } from "expo-router";

export default function RootLayout() {
  // Let Expo Router auto-register all screens from the app/ folder
  return <Stack screenOptions={{ headerShown: false }} />;
}