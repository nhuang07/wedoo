import { getMyGroup, supabase } from "@/lib/supabase";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.replace("/auth");
      return;
    }

    // User is logged in — check if they have a group
    const group = await getMyGroup(session.user.id);

    if (group) {
      router.replace("/(tabs)");
    } else {
      router.replace("/connect-page"); // or wherever they pick create/join
    }

    setLoading(false);
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#6366F1" />
    </View>
  );
}
