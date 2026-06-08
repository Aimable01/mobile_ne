# Mobile Dictionary Data Flow Diagram

## Search Flow

```mermaid
sequenceDiagram
    participant User
    participant SearchScreen
    participant dictionaryApi
    participant ExternalAPI
    participant searchHistory
    participant AsyncStorage
    participant Router
    participant WordDetailsScreen
    
    User->>SearchScreen: Enter word & click Search
    SearchScreen->>SearchScreen: Validate input
    SearchScreen->>dictionaryApi: searchWord(word)
    dictionaryApi->>dictionaryApi: Trim & lowercase word
    dictionaryApi->>ExternalAPI: GET /api/v2/entries/en/{word}
    ExternalAPI-->>dictionaryApi: WordData[]
    dictionaryApi-->>SearchScreen: WordData[]
    SearchScreen->>searchHistory: addToHistory(word)
    searchHistory->>AsyncStorage: Get existing history
    AsyncStorage-->>searchHistory: HistoryItem[]
    searchHistory->>searchHistory: Remove duplicates & add new
    searchHistory->>searchHistory: Trim to max 50 items
    searchHistory->>AsyncStorage: Set updated history
    SearchScreen->>Router: push('/word-details', {wordData})
    Router->>WordDetailsScreen: Render with wordData
    WordDetailsScreen-->>User: Display word details
```

## Search History Flow

```mermaid
sequenceDiagram
    participant DrawerContent
    participant searchHistory
    participant AsyncStorage
    participant User
    
    DrawerContent->>searchHistory: getHistory()
    searchHistory->>AsyncStorage: getItem('@dictionary_search_history')
    AsyncStorage-->>searchHistory: JSON string
    searchHistory->>searchHistory: Parse JSON
    searchHistory->>searchHistory: Sort by timestamp (desc)
    searchHistory-->>DrawerContent: HistoryItem[]
    DrawerContent-->>User: Display history list
    
    User->>DrawerContent: Click history item
    DrawerContent->>DrawerContent: handleHistoryPress(word)
    DrawerContent->>dictionaryApi: searchWord(word)
    dictionaryApi-->>DrawerContent: WordData[]
    DrawerContent->>searchHistory: addToHistory(word)
    DrawerContent->>Router: push('/word-details', {wordData})
    
    User->>DrawerContent: Click "Clear All"
    DrawerContent->>searchHistory: clearHistory()
    searchHistory->>AsyncStorage: removeItem('@dictionary_search_history')
    
    User->>DrawerContent: Click remove item (✕)
    DrawerContent->>searchHistory: removeFromHistory(word)
    searchHistory->>AsyncStorage: Set filtered history
```

## Audio Playback Flow

```mermaid
sequenceDiagram
    participant User
    participant WordDetailsScreen
    participant expo-av
    participant AudioURL
    
    User->>WordDetailsScreen: Click "Listen" button
    WordDetailsScreen->>WordDetailsScreen: Check if protocol-relative URL
    WordDetailsScreen->>WordDetailsScreen: Convert to HTTPS if needed
    WordDetailsScreen->>expo-av: Sound.createAsync({uri})
    expo-av-->>WordDetailsScreen: Sound object
    WordDetailsScreen->>WordDetailsScreen: setSound(sound)
    WordDetailsScreen->>WordDetailsScreen: setIsPlaying(true)
    expo-av->>AudioURL: Fetch & play audio
    AudioURL-->>expo-av: Audio stream
    expo-av-->>User: Audio playback
    
    User->>WordDetailsScreen: Click "Pause"
    WordDetailsScreen->>expo-av: pauseAsync()
    WordDetailsScreen->>WordDetailsScreen: setIsPlaying(false)
    
    User->>WordDetailsScreen: Click "Resume"
    WordDetailsScreen->>expo-av: playAsync()
    WordDetailsScreen->>WordDetailsScreen: setIsPlaying(true)
    
    User->>WordDetailsScreen: Click "Stop"
    WordDetailsScreen->>expo-av: stopAsync()
    WordDetailsScreen->>expo-av: unloadAsync()
    WordDetailsScreen->>WordDetailsScreen: setSound(null)
    WordDetailsScreen->>WordDetailsScreen: setIsPlaying(false)
```

## Synonym Navigation Flow

```mermaid
sequenceDiagram
    participant User
    participant WordDetailsScreen
    participant dictionaryApi
    participant ExternalAPI
    participant searchHistory
    participant Router
    
    User->>WordDetailsScreen: Click synonym
    WordDetailsScreen->>WordDetailsScreen: handleHistoryWordPress(synonym)
    WordDetailsScreen->>dictionaryApi: searchWord(synonym)
    dictionaryApi->>ExternalAPI: GET /api/v2/entries/en/{synonym}
    ExternalAPI-->>dictionaryApi: WordData[]
    dictionaryApi-->>WordDetailsScreen: WordData[]
    WordDetailsScreen->>searchHistory: addToHistory(synonym)
    WordDetailsScreen->>Router: push('/word-details', {wordData})
    Router->>WordDetailsScreen: Render with new wordData
    WordDetailsScreen-->>User: Display synonym details
```

## Data Flow Architecture

```mermaid
graph TB
    subgraph "User Input"
        A[User enters word]
        B[User clicks search]
        C[User selects history item]
        D[User clicks synonym]
    end
    
    subgraph "Component Layer"
        E[SearchScreen]
        F[WordDetailsScreen]
        G[DrawerContent]
    end
    
    subgraph "Service Layer"
        H[dictionaryApi.searchWord]
    end
    
    subgraph "External API"
        I[Dictionary API]
    end
    
    subgraph "Utility Layer"
        J[searchHistory.addToHistory]
        K[searchHistory.getHistory]
        L[searchHistory.clearHistory]
        M[searchHistory.removeFromHistory]
    end
    
    subgraph "Persistence Layer"
        N[AsyncStorage]
    end
    
    subgraph "Navigation Layer"
        O[Router.push]
    end
    
    subgraph "Data Models"
        P[WordData]
        Q[HistoryItem]
    end
    
    A --> E
    B --> E
    C --> G
    D --> F
    
    E --> H
    G --> H
    F --> H
    
    H --> I
    I --> H
    H --> P
    
    E --> J
    F --> J
    G --> J
    
    J --> N
    K --> N
    L --> N
    M --> N
    
    N --> Q
    
    E --> O
    F --> O
    G --> O
    
    O --> F
    P --> F
```

## Error Handling Flow

```mermaid
graph TB
    A[API Call] --> B{Success?}
    B -->|Yes| C[Return WordData]
    B -->|No| D{Error Type}
    
    D -->|404| E[Word not found]
    D -->|Network Error| F[Connection failed]
    D -->|Other| G[Unexpected error]
    
    E --> H[Show error alert]
    F --> H
    G --> H
    
    H --> I[Display error message]
    I --> J[Enable retry button]
    
    J --> K[User clicks retry]
    K --> A
    
    C --> L[Save to history]
    L --> M[Navigate to details]
```

## State Management Flow

```mermaid
graph LR
    subgraph "SearchScreen State"
        A[searchQuery]
        B[isLoading]
        C[error]
    end
    
    subgraph "WordDetailsScreen State"
        D[data]
        E[isLoading]
        F[isPlaying]
        G[sound]
        H[currentAudioUrl]
    end
    
    subgraph "DrawerContent State"
        I[history]
        J[isLoading]
    end
    
    subgraph "Actions"
        K[setSearchQuery]
        L[setIsLoading]
        M[setError]
        N[setData]
        O[setIsPlaying]
        P[setSound]
        Q[setCurrentAudioUrl]
        R[setHistory]
    end
    
    K --> A
    L --> B
    L --> E
    L --> J
    M --> C
    N --> D
    O --> F
    P --> G
    Q --> H
    R --> I
```

## Data Persistence Flow

```mermaid
graph TB
    subgraph "Write Operations"
        A[addToHistory]
        B[clearHistory]
        C[removeFromHistory]
    end
    
    subgraph "Read Operations"
        D[getHistory]
    end
    
    subgraph "AsyncStorage"
        E[@dictionary_search_history]
    end
    
    subgraph "Data Format"
        F[JSON string]
        G[HistoryItem array]
    end
    
    A --> E
    B --> E
    C --> E
    D --> E
    
    E --> F
    F --> G
    G --> D
    
    A --> G
    B --> G
    C --> G
```
