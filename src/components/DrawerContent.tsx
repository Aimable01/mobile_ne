import { router, useNavigation } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";
import {
  BorderRadius,
  Colors,
  FontSizes,
  FontWeights,
  Spacing,
} from "../constants/theme";
import { useSearchHistory } from "../contexts/SearchHistoryContext";
import { dictionaryApi } from "../services/dictionaryApi";

export default function DrawerContent() {
  const navigation = useNavigation<any>();
  const { history, isLoading, addToHistory, clearHistory, removeFromHistory } =
    useSearchHistory();

  const handleHistoryPress = async (word: string) => {
    try {
      const result = await dictionaryApi.searchWord(word);

      await addToHistory(word);

      // Fixed: Cleanly call closeDrawer on the drawer layout instance parent
      const drawerNav = navigation.getParent("drawer") || navigation;
      if (drawerNav && typeof drawerNav.closeDrawer === "function") {
        drawerNav.closeDrawer();
      }

      router.push({
        pathname: "/word-details",
        params: { wordData: JSON.stringify(result[0]) },
      });
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Unexpected error",
      );
    }
  };

  const handleClearHistory = async () => {
    Alert.alert("Clear History", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          await clearHistory();
        },
      },
    ]);
  };

  const handleRemoveItem = async (word: string) => {
    await removeFromHistory(word);
  };

  return (
    <View style={{ flex: 1, paddingVertical: 50, paddingHorizontal: 20 }}>
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>Search History</Text>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {isLoading ? (
          <ActivityIndicator color={Colors.brandPrimary} />
        ) : history.length === 0 ? (
          <Text>No history yet</Text>
        ) : (
          history.map((item, index) => (
            <View
              key={index}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingVertical: 10,
              }}
            >
              <TouchableOpacity onPress={() => handleHistoryPress(item.word)}>
                <Text style={{ fontSize: 16 }}>{item.word}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleRemoveItem(item.word)}>
                <Ionicons name="close-circle" size={20} color={Colors.error} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      <View style={{ gap: 15, marginTop: 20 }}>
        {history.length > 0 && (
          <TouchableOpacity onPress={handleClearHistory}>
            <Text style={{ color: "red", fontWeight: "600" }}>Clear All</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => {
            const drawerNav = navigation.getParent("drawer") || navigation;
            if (drawerNav && typeof drawerNav.closeDrawer === "function") {
              drawerNav.closeDrawer();
            }
            router.replace("/");
          }}
        >
          <Text style={{ color: "#007AFF", fontWeight: "600" }}>
            Back to Search
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    fontFamily: "Inter",
  },
  centerContainer: {
    padding: Spacing.xl,
    alignItems: "center",
  },
  emptyContainer: {
    padding: Spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    fontFamily: "Inter",
  },
  emptySubtext: {
    fontSize: FontSizes.sm,
    color: Colors.textPlaceholder,
    fontFamily: "Inter",
  },
  historyList: {
    flex: 1,
  },
  historyListContent: {
    paddingBottom: Spacing.md,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  historyItemContent: {
    flex: 1,
  },
  historyWord: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    fontFamily: "Inter",
  },
  historyTime: {
    fontSize: FontSizes.xs,
    color: Colors.textPlaceholder,
    fontFamily: "Inter",
  },
  removeButton: {
    padding: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  removeButtonText: {
    fontSize: FontSizes.md,
    color: Colors.textPlaceholder,
    fontFamily: "Inter",
  },
  clearButton: {
    marginBottom: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: "#fee2e2",
    borderRadius: BorderRadius.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  clearButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.error,
    fontFamily: "Inter",
  },
  drawerItemLabel: {
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    fontFamily: "Inter",
  },
  backButton: {
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  backButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
    fontFamily: "Inter",
  },
});
