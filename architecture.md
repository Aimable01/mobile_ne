# Mobile Dictionary Application Architecture

## System Architecture Overview

```mermaid
graph TB
    subgraph "Presentation Layer"
        A[SearchScreen] --> B[WordDetailsScreen]
        C[DrawerContent]
    end

    subgraph "Navigation Layer"
        D[Expo Router]
        D --> E[Drawer Navigation]
    end

    subgraph "Service Layer"
        F[dictionaryApi.ts]
    end

    subgraph "Utility Layer"
        G[searchHistory.ts]
    end

    subgraph "Data Persistence"
        H[AsyncStorage]
    end

    subgraph "External API"
        I[Dictionary API<br/>api.dictionaryapi.dev]
    end

    subgraph "Constants"
        J[theme.ts]
    end

    D --> A
    D --> B
    D --> C
    A --> F
    B --> F
    C --> F
    A --> G
    B --> G
    C --> G
    G --> H
    F --> I
    A --> J
    B --> J
    C --> J
```

```mermaid
graph TB
    subgraph "Frontend Framework"
        A[React Native]
        B[Expo SDK]
    end

    subgraph "Navigation"
        C[Expo Router]
        D[Drawer Navigation]
    end

    subgraph "State Management"
        E[React Hooks<br/>useState, useEffect]
    end

    subgraph "HTTP Client"
        F[Axios]
    end

    subgraph "Local Storage"
        G[AsyncStorage]
    end

    subgraph "Audio"
        H[expo-av]
    end

    subgraph "Language"
        I[TypeScript]
    end

    B --> A
    C --> D
    A --> E
    F --> C
    G --> E
    H --> A
    A --> I
```

## Layer Responsibilities

### Presentation Layer

- **SearchScreen**: Handles user input for word search, displays search interface
- **WordDetailsScreen**: Displays word definitions, phonetics, audio pronunciation, synonyms
- **DrawerContent**: Manages and displays search history, provides navigation

### Navigation Layer

- **Expo Router**: File-based routing system
- **Drawer Navigation**: Side drawer for search history access

### Service Layer

- **dictionaryApi**: Handles HTTP requests to external dictionary API, error handling, data transformation

### Utility Layer

- **searchHistory**: Manages local storage operations for search history (CRUD operations)

### Constants Layer

- **theme**: Centralized design system (colors, fonts, spacing, shadows, border radius)

### Data Persistence

- **AsyncStorage**: Local storage for search history persistence

### External API

- **Dictionary API**: External REST API for word definitions and related data
