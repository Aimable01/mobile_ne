import { router, useNavigation } from "expo-router";
// import { DrawerActions } from "expo-router/react-navigation";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  BorderRadius,
  Colors,
  FontSizes,
  FontWeights,
  Shadows,
  Spacing,
} from "../constants/theme";

import { dictionaryApi } from "../services/dictionaryApi";
import { searchHistory } from "../utils/searchHistory";

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigation = useNavigation<any>();

  const handleSearch = async () => {
    const trimmedQuery = searchQuery.trim();

    if (!trimmedQuery) {
      Alert.alert("Validation Error", "Please enter a word to search");
      return;
    }

    Keyboard.dismiss();
    setIsLoading(true);
    setError(null);

    try {
      const result = await dictionaryApi.searchWord(trimmedQuery);

      await searchHistory.addToHistory(trimmedQuery);

      router.push({
        pathname: "/word-details",
        params: { wordData: JSON.stringify(result[0]) },
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";

      setError(errorMessage);
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => {
            // Fixed: Safely dynamic resolve layout parent drawer toggle execution
            const drawerNav = navigation.getParent("drawer") || navigation;
            if (drawerNav && typeof drawerNav.toggleDrawer === "function") {
              drawerNav.toggleDrawer();
            }
          }}
        >
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
        </TouchableOpacity>

        <Text style={styles.topBarTitle}>Dictionary</Text>

        <View style={styles.menuButton} />
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>
          Find word meanings, pronunciations, and examples
        </Text>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter a word..."
            placeholderTextColor={Colors.textPlaceholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />

          <TouchableOpacity
            style={[
              styles.searchButton,
              isLoading && styles.searchButtonDisabled,
            ]}
            onPress={handleSearch}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.background} />
            ) : (
              <Text style={styles.searchButtonText}>Search</Text>
            )}
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={handleSearch}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>💡 Try searching for words like:</Text>
          <Text style={styles.exampleWord}>hello</Text>
          <Text style={styles.exampleWord}>computer</Text>
          <Text style={styles.exampleWord}>beautiful</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: Spacing.xl,
    justifyContent: "center",
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    fontFamily: "Inter",
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.xxl,
    fontFamily: "Inter",
  },
  searchContainer: {
    marginBottom: Spacing.lg,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    fontFamily: "Inter",
  },
  searchButton: {
    backgroundColor: Colors.brandPrimary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: "center",
    ...Shadows.md,
  },
  searchButtonDisabled: {
    opacity: 0.6,
  },
  searchButtonText: {
    color: Colors.background,
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    fontFamily: "Inter",
  },
  errorContainer: {
    backgroundColor: "#fee2e2",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  errorText: {
    color: Colors.error,
    fontSize: FontSizes.sm,
    marginBottom: Spacing.sm,
    fontFamily: "Inter",
  },
  retryButton: {
    alignSelf: "flex-start",
  },
  retryButtonText: {
    color: Colors.brandPrimary,
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    fontFamily: "Inter",
  },
  infoContainer: {
    marginTop: Spacing.xl,
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
  },
  infoText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    fontFamily: "Inter",
  },
  exampleWord: {
    fontSize: FontSizes.md,
    color: Colors.brandPrimary,
    fontWeight: FontWeights.medium,
    marginBottom: Spacing.xs,
    fontFamily: "Inter",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  topBarTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    fontFamily: "Inter",
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    gap: 5,
    paddingHorizontal: 4,
  },
  menuLine: {
    height: 2,
    backgroundColor: Colors.textPrimary,
    borderRadius: 2,
  },
});
