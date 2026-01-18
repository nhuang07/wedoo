import { Text, View } from "@/components/Themed";
import { createGroup, supabase } from "@/lib/supabase";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";

export default function CreateGroupScreen() {
  const [code, setCode] = useState("");
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);
  const [groupCreated, setGroupCreated] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    if (!groupName.trim()) {
      Alert.alert("Error", "Please enter a group name");
      return;
    }

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert("Error", "You must be logged in");
        return;
      }

      const group = await createGroup(groupName.trim(), user.id);
      setCode(group.invite_code.toUpperCase());
      setGroupCreated(true);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(code);
    Alert.alert("Copied! 🎉", "Group code copied to clipboard.");
  };

  const goToGroup = () => {
    router.replace("/(tabs)");
  };

  return (
    <ImageBackground
      source={require("../../assets/images/auth-bg-1.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace("/connect-page")}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title}>Create Group</Text>

          {!groupCreated ? (
            <>
              <Text style={styles.label}>Group name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter group name..."
                placeholderTextColor="rgba(19,19,19,0.5)"
                value={groupName}
                onChangeText={setGroupName}
              />

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleCreate}
                activeOpacity={0.8}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#131313" />
                ) : (
                  <Text style={styles.primaryButtonText}>Create Group</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.subtitle}>
                Share this code so others can join:
              </Text>

              <View style={styles.codeBox}>
                <Text style={styles.codeText}>{code}</Text>
              </View>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleCopy}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>Copy Code</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={goToGroup}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonText}>Go To Group Page</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
    padding: 24,
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 24,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  backButtonText: {
    color: "#131313",
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    backgroundColor: "transparent",
    gap: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#131313",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    color: "#131313",
    fontSize: 16,
    textAlign: "center",
    opacity: 0.8,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: "#131313",
    marginBottom: 4,
    marginLeft: 4,
  },
  input: {
    height: 44,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "rgba(19,19,19,0.12)",
    paddingHorizontal: 16,
    backgroundColor: "rgba(255, 255, 255, 0.55)",
    marginBottom: 12,
  },
  codeBox: {
    alignSelf: "center",
    paddingVertical: 24,
    paddingHorizontal: 40,
    borderRadius: 24,
    backgroundColor: "rgba(83, 212, 216, 0.35)",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  codeText: {
    color: "#131313",
    fontSize: 36,
    letterSpacing: 8,
    fontWeight: "700",
  },
  primaryButton: {
    height: 52,
    borderRadius: 100,
    backgroundColor: "rgba(120, 120, 128, 0.16)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#131313",
  },
  secondaryButton: {
    height: 52,
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#131313",
  },
});
