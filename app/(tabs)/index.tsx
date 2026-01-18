import MenuDrawer from "@/components/MenuDrawer";
import TodoItem from "@/components/TodoItem";
import { generateTasksForUser } from "@/lib/gemini";
import {
  getGroupMembers,
  getMyGroup,
  getMyTasks,
  supabase,
} from "@/lib/supabase";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ImageBackground,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function TabOneScreen() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [group, setGroup] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [members, setMembers] = useState<any[]>([]);

  // For generating tasks
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);

  const groups = ["Study Buddies", "Fitness Friends", "Project Team"];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const myGroup = await getMyGroup(user.id);
      setGroup(myGroup);

      if (myGroup) {
        const myTasks = await getMyTasks(user.id, (myGroup as any).id);
        setTasks(myTasks);

        const groupMembers = await getGroupMembers((myGroup as any).id);
        setMembers(groupMembers);
      }
    } catch (error) {
      console.log("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTasks = async () => {
    if (!prompt.trim() || !userId || !group) return;

    setGenerating(true);
    try {
      const generatedTasks = await generateTasksForUser(prompt);

      const tasksToInsert = generatedTasks.map((description: string) => ({
        group_id: group.id,
        user_id: userId,
        description,
        completed: false,
      }));

      const { error } = await supabase.from("tasks").insert(tasksToInsert);
      if (error) throw error;

      const myTasks = await getMyTasks(userId, group.id);
      setTasks(myTasks);
      setPrompt("");
    } catch (error) {
      console.log("Error generating tasks:", error);
    } finally {
      setGenerating(false);
    }
  };

  const toggleTask = async (taskId: string, currentStatus: boolean) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !currentStatus } : task,
      ),
    );
  };

  const goToProfile = () => {
    router.push("/profile");
  };

  const getCreatureImage = () => {
    return "https://png.pngtree.com/png-vector/20231017/ourmid/pngtree-cute-cartoon-happy-dog-png-file-png-image_10201723.png";
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ImageBackground
      source={require("../../assets/images/auth-bg-1.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={styles.container}>
        {/* Menu Drawer */}
        <Modal visible={menuOpen} animationType="slide" transparent>
          <View style={{ flex: 1, flexDirection: "row" }}>
            <MenuDrawer
              groups={groups}
              onClose={() => setMenuOpen(false)}
              onProfile={goToProfile}
              onCreateGroup={() => router.push("/create-group")}
              onJoinGroup={() => router.push("/join-group")}
            />
            <TouchableOpacity
              style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.3)" }}
              onPress={() => setMenuOpen(false)}
            />
          </View>
        </Modal>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => setMenuOpen(true)}
            style={styles.menuButton}
          >
            <Text style={styles.menuButtonText}>☰</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{group?.name || "My Pet"}</Text>
        </View>

        {/* Mascot Image */}
        <View style={styles.mascotContainer}>
          <View style={styles.mascotBox}>
            <Image source={{ uri: getCreatureImage() }} style={styles.mascot} />
          </View>
          <Text style={styles.moodText}>
            Mood: {group?.creature_mood || 50}%
          </Text>
        </View>

        {/* Group Members */}
        <View style={styles.membersContainer}>
          <Text style={styles.sectionTitle}>Team ({members.length})</Text>
          <View style={styles.membersRow}>
            {members.map((member) => (
              <View key={member.user_id} style={styles.memberChip}>
                <Text style={styles.memberChipText}>
                  {(member.profiles as any)?.username || "User"}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Task Generation */}
        {tasks.length === 0 && (
          <View style={styles.promptContainer}>
            <Text style={styles.promptLabel}>
              What's on your mind? What do you want to improve?
            </Text>
            <TextInput
              value={prompt}
              onChangeText={setPrompt}
              placeholder="I've been stressed about..."
              placeholderTextColor="rgba(19, 19, 19, 0.5)"
              style={styles.promptInput}
              multiline
            />
            <TouchableOpacity
              onPress={handleGenerateTasks}
              style={styles.generateButton}
              disabled={generating}
            >
              {generating ? (
                <ActivityIndicator color="#131313" />
              ) : (
                <Text style={styles.generateButtonText}>Generate My Tasks</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Todo List */}
        <View style={styles.todoContainer}>
          <Text style={styles.sectionTitle}>My Tasks</Text>
          <FlatList
            data={tasks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TodoItem
                text={item.description}
                done={item.completed}
                onToggle={() => toggleTask(item.id, item.completed)}
              />
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                No tasks yet. Tell us what's on your mind!
              </Text>
            }
            style={styles.taskList}
          />
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuButtonText: {
    fontSize: 24,
    color: "#131313",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#131313",
  },
  mascotContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  mascotBox: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 24,
    padding: 20,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.6)",
  },
  mascot: {
    width: 150,
    height: 150,
  },
  moodText: {
    color: "#131313",
    marginTop: 8,
    fontSize: 16,
  },
  membersContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  membersRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  memberChip: {
    backgroundColor: "#6366F1",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  memberChipText: {
    color: "#fff",
  },
  promptContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  promptLabel: {
    color: "#131313",
    marginBottom: 8,
  },
  promptInput: {
    backgroundColor: "rgba(83, 212, 216, 0.35)",
    borderRadius: 12,
    padding: 12,
    minHeight: 80,
    color: "#131313",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  generateButton: {
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(120, 120, 128, 0.16)",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  generateButtonText: {
    color: "#131313",
    fontWeight: "600",
  },
  todoContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#131313",
    marginBottom: 12,
  },
  taskList: {
    flex: 1,
  },
  emptyText: {
    color: "rgba(19, 19, 19, 0.5)",
    textAlign: "center",
  },
});
