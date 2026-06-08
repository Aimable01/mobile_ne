import { Ionicons } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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

import { useSearchHistory } from "../contexts/SearchHistoryContext";
import { dictionaryApi } from "../services/dictionaryApi";

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigation = useNavigation<any>();
  const { addToHistory } = useSearchHistory();

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

      await addToHistory(trimmedQuery);

      setSearchQuery("");

      router.push({
        pathname: "/word-details",
        params: {
          wordData: JSON.stringify(result[0]),
        },
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

  const openDrawer = () => {
    const drawerNav = navigation.getParent("drawer") || navigation;

    if (drawerNav && typeof drawerNav.toggleDrawer === "function") {
      drawerNav.toggleDrawer();
    }
  };

  return (
    <View style={styles.container}>
      {/* Drawer Button */}
      <TouchableOpacity
        style={styles.drawerButton}
        onPress={openDrawer}
        activeOpacity={0.7}
      >
        <Ionicons name="menu-outline" size={30} color={Colors.textPrimary} />
      </TouchableOpacity>

      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/Logomark.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>Dictionary</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Find word meanings, pronunciations, and examples
        </Text>

        {/* Search */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter a word"
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
              <ActivityIndicator color="#FFFFFF" />
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  drawerButton: {
    position: "absolute",
    top: 60,
    left: 20,
    zIndex: 100,
    padding: 4,
  },

  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 28,
  },

  logo: {
    width: 70,
    height: 70,
  },

  title: {
    textAlign: "center",
    fontSize: 28,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: 14,
    fontFamily: "Inter",
  },

  subtitle: {
    textAlign: "center",
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    lineHeight: 28,
    marginBottom: 40,
    fontFamily: "Inter",
    paddingHorizontal: 10,
  },

  searchContainer: {
    width: "100%",
  },

  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    marginBottom: 16,
    fontFamily: "Inter",
  },

  searchButton: {
    backgroundColor: Colors.brandPrimary,
    borderRadius: BorderRadius.lg,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.md,
  },

  searchButtonDisabled: {
    opacity: 0.7,
  },

  searchButtonText: {
    color: "#FFFFFF",
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    fontFamily: "Inter",
  },

  errorContainer: {
    marginTop: 24,
    backgroundColor: "#fee2e2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },

  errorText: {
    color: Colors.error,
    fontSize: FontSizes.sm,
    marginBottom: 8,
    fontFamily: "Inter",
  },

  retryButtonText: {
    color: Colors.brandPrimary,
    fontWeight: FontWeights.semibold,
    fontSize: FontSizes.sm,
    fontFamily: "Inter",
  },
});
