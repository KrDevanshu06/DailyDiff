# Dashboard Components Architecture

## Overview
The Dashboard has been refactored into a modular architecture with clear separation of concerns. The main Dashboard component acts as a Controller, managing state and orchestrating child components that handle specific UI sections.

## Component Structure

```
src/components/
├── Dashboard.tsx                 # Main controller component
└── dashboard/
    ├── index.ts                 # Barrel export file
    ├── DashboardNavbar.tsx      # Navigation and user profile
    ├── DashboardHeader.tsx      # Welcome header with date
    ├── AutomationSettings.tsx   # Bot configuration panel
    ├── ContributionHistory.tsx  # GitHub activity grid
    ├── StreakCard.tsx          # GitHub streak display
    ├── ManualCheckIn.tsx       # Manual commit functionality
    └── MicroTaskGenerator.tsx   # AI task suggestions
```

## Component Responsibilities

### 1. Dashboard.tsx (Controller)
- **Purpose**: Main orchestrator component that manages application state and coordinates child components
- **Responsibilities**:
  - User authentication and profile management
  - Repository data fetching and caching
  - Automation settings (schedule, timezone, content strategy)
  - Toast notifications
  - API communication with backend
- **State Management**: All global dashboard state
- **Props**: `{ onLogout: () => void }`

### 2. DashboardNavbar.tsx (View Component)
- **Purpose**: Top navigation with user profile and logout functionality
- **Props**: 
  ```typescript
  {
    user: User | null;
    onSignOut: () => void;
  }
  ```
- **Features**:
  - User avatar display
  - Profile dropdown menu
  - GitHub profile link
  - Sign out functionality

### 3. DashboardHeader.tsx (View Component)
- **Purpose**: Welcome section with user greeting and current date
- **Props**:
  ```typescript
  {
    userProfile: UserProfile | null;
  }
  ```
- **Features**:
  - Personalized welcome message
  - Current date display
  - Responsive layout

### 4. AutomationSettings.tsx (Complex View Component)
- **Purpose**: Configuration panel for automated commit scheduling
- **Props**: Multiple props for state management and callbacks
- **Features**:
  - Repository selector with search
  - Time picker for scheduling
  - Timezone selector
  - Content strategy selection
  - Save/activate automation

### 5. ContributionHistory.tsx (Standalone Component)
- **Purpose**: GitHub contribution activity visualization
- **Props**: None (self-contained)
- **Features**:
  - 9-month contribution grid
  - Interactive hover tooltips
  - Client-side caching (1 hour)
  - Fallback to mock data
  - Color-coded activity levels

### 6. StreakCard.tsx (View Component)
- **Purpose**: Display current GitHub streak with refresh capability
- **Props**:
  ```typescript
  {
    streakData: StreakData | null;
    isLoadingStreak: boolean;
    refreshStreak: () => void;
    username: string;
  }
  ```
- **Features**:
  - Current streak display
  - Streak statistics
  - Manual refresh button
  - Loading states

### 7. ManualCheckIn.tsx (Action Component)
- **Purpose**: Manual commit functionality for immediate updates
- **Props**:
  ```typescript
  {
    onManualCommit: (message?: string) => Promise<void>;
  }
  ```
- **Features**:
  - Instant commit button
  - Custom commit message input
  - Success/error feedback
  - Cooldown handling

### 8. MicroTaskGenerator.tsx (Feature Component)
- **Purpose**: AI-powered task suggestion system for developers
- **Props**:
  ```typescript
  {
    targetRepo?: string;
  }
  ```
- **Features**:
  - Random task idea generation
  - Task categorization (code, docs, refactor, feature)
  - Difficulty levels
  - Time estimates
  - Copy to clipboard functionality

## Data Flow

```
Dashboard (Controller)
├── Manages all state
├── Handles API calls
├── Provides callbacks to children
└── Passes data down to components

Child Components (Views)
├── Receive props from Dashboard
├── Handle local UI interactions
├── Call parent callbacks for state changes
└── Focus on presentation and user interaction
```

## Key Features

### State Management
- Centralized state in main Dashboard component
- Clear prop interfaces for child components
- Type-safe with TypeScript interfaces

### API Integration
- RESTful API calls to backend
- Error handling and fallbacks
- Loading states for better UX

### Caching Strategy
- Client-side caching for contribution data
- 1-hour cache duration
- Graceful fallbacks when API fails

### Responsive Design
- Mobile-first approach
- Tailwind CSS for styling
- Glass morphism design system

### Error Handling
- Toast notifications for user feedback
- Try-catch blocks around API calls
- Graceful degradation

## Usage Example

```tsx
import Dashboard from './components/Dashboard';

function App() {
  const handleLogout = () => {
    // Handle logout logic
    console.log('User logged out');
  };

  return <Dashboard onLogout={handleLogout} />;
}
```

## Benefits of This Architecture

1. **Separation of Concerns**: Each component has a single responsibility
2. **Reusability**: Components can be easily reused or moved
3. **Maintainability**: Clear structure makes debugging and updates easier
4. **Testability**: Individual components can be tested in isolation
5. **Type Safety**: Full TypeScript support with proper interfaces
6. **Performance**: Optimized rendering with proper state management

## Development Guidelines

### Adding New Components
1. Create the component in `src/components/dashboard/`
2. Export it from `index.ts`
3. Import it in `Dashboard.tsx`
4. Pass required props from Dashboard state
5. Update this documentation

### State Management Rules
1. Keep state in Dashboard component
2. Pass data down via props
3. Use callbacks for child-to-parent communication
4. Avoid prop drilling - create focused interfaces

### Error Handling
1. Always wrap API calls in try-catch
2. Provide user feedback via toast notifications
3. Include fallback behavior for failed operations
4. Log errors to console for debugging
