import { router } from 'expo-router';
import DrawerContentScrollView from 'expo-router/drawer';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { BorderRadius, Colors, FontSizes, FontWeights, Spacing } from '../constants/theme';
import { dictionaryApi } from '../services/dictionaryApi';
import { HistoryItem, searchHistory } from '../utils/searchHistory';

interface DrawerContentProps {
  navigation: any;
}

export default function DrawerContent({ navigation }: DrawerContentProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const historyData = await searchHistory.getHistory();
      setHistory(historyData);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHistoryPress = async (word: string) => {
    try {
      const result = await dictionaryApi.searchWord(word);
      await searchHistory.addToHistory(word);
      navigation.closeDrawer();
      router.push({
        pathname: '/word-details',
        params: { wordData: JSON.stringify(result[0]) },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleClearHistory = async () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all search history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await searchHistory.clearHistory();
            setHistory([]);
          },
        },
      ]
    );
  };

  const handleRemoveItem = async (word: string) => {
    await searchHistory.removeFromHistory(word);
    const updatedHistory = history.filter(item => item.word !== word);
    setHistory(updatedHistory);
  };

  return (
    <View style={styles.container}>
      <DrawerContentScrollView>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search History</Text>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="small" color={Colors.brandPrimary} />
        </View>
      ) : history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No search history yet</Text>
          <Text style={styles.emptySubtext}>Search for words to see them here</Text>
        </View>
      ) : (
        <ScrollView style={styles.historyList}>
          {history.map((item, index) => (
            <View key={index} style={styles.historyItem}>
              <TouchableOpacity
                style={styles.historyItemContent}
                onPress={() => handleHistoryPress(item.word)}
              >
                <Text style={styles.historyWord}>{item.word}</Text>
                <Text style={styles.historyTime}>
                  {new Date(item.timestamp).toLocaleDateString()}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveItem(item.word)}
              >
                <Text style={styles.removeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {history.length > 0 && (
        <TouchableOpacity style={styles.clearButton} onPress={handleClearHistory}>
          <Text style={styles.clearButtonText}>Clear All History</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          navigation.closeDrawer();
          router.push('/');
        }}
      >
        <Text style={styles.backButtonText}>Back to Search</Text>
      </TouchableOpacity>
      </DrawerContentScrollView>
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
    fontFamily: 'Inter',
  },
  centerContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    fontFamily: 'Inter',
  },
  emptySubtext: {
    fontSize: FontSizes.sm,
    color: Colors.textPlaceholder,
    fontFamily: 'Inter',
  },
  historyList: {
    flex: 1,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontFamily: 'Inter',
  },
  historyTime: {
    fontSize: FontSizes.xs,
    color: Colors.textPlaceholder,
    fontFamily: 'Inter',
  },
  removeButton: {
    padding: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  removeButtonText: {
    fontSize: FontSizes.md,
    color: Colors.textPlaceholder,
    fontFamily: 'Inter',
  },
  clearButton: {
    margin: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: '#fee2e2',
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  clearButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.error,
    fontFamily: 'Inter',
  },
  drawerItemLabel: {
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    fontFamily: 'Inter',
  },
  backButton: {
    margin: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  backButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
    fontFamily: 'Inter',
  },
});
