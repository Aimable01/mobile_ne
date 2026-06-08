import { useAudioPlayer } from "expo-audio";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  BorderRadius,
  Colors,
  FontSizes,
  FontWeights,
  Shadows,
  Spacing,
} from "../constants/theme";
import { Definition, Meaning, WordData } from "../services/dictionaryApi";
import { searchHistory } from "../utils/searchHistory";

export default function WordDetailsScreen() {
  const { wordData } = useLocalSearchParams<{ wordData: string }>();
  const [data, setData] = useState<WordData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);

  // Initialize the native expo-audio player instance
  const player = useAudioPlayer(
    currentAudioUrl
      ? currentAudioUrl.startsWith("//")
        ? `https:${currentAudioUrl}`
        : currentAudioUrl
      : "",
  );

  useEffect(() => {
    if (wordData) {
      try {
        const parsedData = JSON.parse(wordData) as WordData;
        setData(parsedData);
      } catch (error) {
        console.error("Error parsing word data:", error);
        Alert.alert("Error", "Failed to load word data");
      } finally {
        setIsLoading(false);
      }
    }
  }, [wordData]);

  const handleAudioPress = async (audioUrl: string) => {
    try {
      if (currentAudioUrl === audioUrl) {
        if (player.playing) {
          player.pause();
        } else {
          player.play();
        }
      } else {
        // Change the source and playback immediately
        setCurrentAudioUrl(audioUrl);
        player.play();
      }
    } catch (error) {
      console.error("Error handling audio playback:", error);
      Alert.alert("Error", "Failed to play audio pronunciation");
    }
  };

  const stopAudio = () => {
    try {
      player.replace("");
      setCurrentAudioUrl(null);
    } catch (error) {
      console.error("Error stopping audio:", error);
    }
  };

  const handleHistoryWordPress = async (word: string) => {
    try {
      const { dictionaryApi } = await import("../services/dictionaryApi");
      const result = await dictionaryApi.searchWord(word);
      await searchHistory.addToHistory(word);
      router.push({
        pathname: "/word-details",
        params: { wordData: JSON.stringify(result[0]) },
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      Alert.alert("Error", errorMessage);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaProvider style={styles.safeArea}>
        <View style={styles.navHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.navTitle} numberOfLines={1}>
            Loading…
          </Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.brandPrimary} />
        </View>
      </SafeAreaProvider>
    );
  }

  if (!data) {
    return (
      <SafeAreaProvider style={styles.safeArea}>
        <View style={styles.navHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.navTitle} numberOfLines={1}>
            Word Details
          </Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>No word data available</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  const audioPhonetics = data.phonetics.filter(
    (p) => p.audio && p.audio.trim() !== "",
  );
  const hasAudio = audioPhonetics.length > 0;

  return (
    <SafeAreaProvider style={styles.safeArea}>
      {/* Nav header */}
      <View style={styles.navHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>
          {data.word}
        </Text>
        {/* Right spacer keeps title centred */}
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.header}>
          <Text style={styles.word}>{data.word}</Text>
          {data.phonetic && (
            <Text style={styles.phonetic}>{data.phonetic}</Text>
          )}

          {hasAudio && (
            <View style={styles.audioContainer}>
              <Text style={styles.audioLabel}>Pronunciation:</Text>
              {audioPhonetics.map((phonetic, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.audioButton,
                    currentAudioUrl === phonetic.audio &&
                      styles.audioButtonActive,
                  ]}
                  onPress={() => handleAudioPress(phonetic.audio!)}
                >
                  <Text style={styles.audioButtonText}>
                    {currentAudioUrl === phonetic.audio && player.playing
                      ? "⏸️ Pause"
                      : currentAudioUrl === phonetic.audio && !player.playing
                        ? "▶️ Resume"
                        : "🔊 Listen"}
                  </Text>
                </TouchableOpacity>
              ))}

              {currentAudioUrl && player.playing && (
                <TouchableOpacity style={styles.stopButton} onPress={stopAudio}>
                  <Text style={styles.stopButtonText}>⏹️ Stop</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {data.meanings.map((meaning: Meaning, index: number) => (
          <View key={index} style={styles.meaningContainer}>
            <Text style={styles.partOfSpeech}>{meaning.partOfSpeech}</Text>

            {meaning.definitions.map(
              (definition: Definition, defIndex: number) => (
                <View key={defIndex} style={styles.definitionContainer}>
                  <Text style={styles.definitionNumber}>{defIndex + 1}.</Text>
                  <View style={styles.definitionContent}>
                    <Text style={styles.definition}>
                      {definition.definition}
                    </Text>
                    {definition.example && (
                      <Text style={styles.example}>
                        Example: {definition.example}
                      </Text>
                    )}
                  </View>
                </View>
              ),
            )}

            {meaning.synonyms && meaning.synonyms.length > 0 && (
              <View style={styles.synonymsContainer}>
                <Text style={styles.synonymsLabel}>Synonyms:</Text>
                <View style={styles.synonymsList}>
                  {meaning.synonyms.slice(0, 5).map((synonym, synIndex) => (
                    <TouchableOpacity
                      key={synIndex}
                      onPress={() => handleHistoryWordPress(synonym)}
                    >
                      <Text style={styles.synonym}>{synonym}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        ))}

        {data.origin && (
          <View style={styles.originContainer}>
            <Text style={styles.originLabel}>Origin:</Text>
            <Text style={styles.origin}>{data.origin}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  navHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backArrow: {
    fontSize: 24,
    color: Colors.brandPrimary,
    fontWeight: FontWeights.bold,
  },
  navTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    fontFamily: "Inter",
    textTransform: "capitalize",
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: Spacing.xl,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  errorText: {
    fontSize: FontSizes.md,
    color: Colors.error,
    fontFamily: "Inter",
  },
  header: {
    marginBottom: Spacing.xl,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  word: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    fontFamily: "Inter",
  },
  phonetic: {
    fontSize: FontSizes.lg,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    fontFamily: "Inter",
  },
  audioContainer: {
    marginTop: Spacing.md,
  },
  audioLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    fontFamily: "Inter",
  },
  audioButton: {
    backgroundColor: Colors.brandPrimary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
    alignSelf: "flex-start",
    ...Shadows.sm,
  },
  audioButtonActive: {
    backgroundColor: Colors.success,
  },
  audioButtonText: {
    color: Colors.background,
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    fontFamily: "Inter",
  },
  stopButton: {
    backgroundColor: Colors.error,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignSelf: "flex-start",
    ...Shadows.sm,
  },
  stopButtonText: {
    color: Colors.background,
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    fontFamily: "Inter",
  },
  meaningContainer: {
    marginBottom: Spacing.xl,
  },
  partOfSpeech: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    color: Colors.brandPrimary,
    marginBottom: Spacing.md,
    textTransform: "capitalize",
    fontFamily: "Inter",
  },
  definitionContainer: {
    flexDirection: "row",
    marginBottom: Spacing.md,
  },
  definitionNumber: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.textSecondary,
    marginRight: Spacing.sm,
    fontFamily: "Inter",
  },
  definitionContent: {
    flex: 1,
  },
  definition: {
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    lineHeight: 22,
    fontFamily: "Inter",
  },
  example: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontStyle: "italic",
    fontFamily: "Inter",
  },
  synonymsContainer: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
  },
  synonymsLabel: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    fontFamily: "Inter",
  },
  synonymsList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  synonym: {
    fontSize: FontSizes.sm,
    color: Colors.brandPrimary,
    marginRight: Spacing.md,
    marginBottom: Spacing.xs,
    fontFamily: "Inter",
  },
  originContainer: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
  },
  originLabel: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    fontFamily: "Inter",
  },
  origin: {
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
    fontFamily: "Inter",
  },
});
