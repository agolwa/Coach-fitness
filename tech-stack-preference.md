# User Requested Tech Stack Documentation

The preferred tech stack for this React Native fitness tracking application is documented below.

You are permitted to expand upon it with new tools, but you can't replace any of these without first getting explicit permission.

For anything not explicitly outlined, always prefer built-in Expo solutions.

## Frontend

### Core

- React Native 0.79.5 via Expo SDK 53 (already configured)
- TypeScript ~5.8.3
- React 19.0.0 with overrides for compatibility
- EAS Build for production builds

### Data Flow & State

- **Zustand ^5.0.8**: Used for **client-side-only** state, such as UI state (e.g., loading spinners, modal visibility), active session data that is not yet saved, and device-specific settings.
- **@tanstack/react-query ^5.85.5**: The source of truth for all data persisted on the server. Used for all data fetching, caching, and server-side mutations.
- **React Hook Form ^7.62.0**: For form state and validation.
- **@react-native-async-storage/async-storage 2.1.2**: For local data persistence, primarily managed via Zustand's persistence middleware.

### Navigation

- Expo Router ^5.1.5 for file-based routing system
- @react-navigation/bottom-tabs ^7.3.10 for tab navigation
- @react-navigation/native ^7.1.6 for core navigation
- Expo Linking ^7.1.7 for deep linking support

### UI, Styling, & Interactivity

- NativeWind ^4.1.23 for styling approach (Tailwind CSS for React Native)
- React Native Reanimated ~3.17.4 for animations and transitions
- React Native Gesture Handler ~2.24.0 for gesture recognition
- Expo Haptics ~14.1.4 for haptic feedback
- Custom HSL-based design token system with dark/light theme support
- @expo/vector-icons ^14.1.0 for core icon library
- Lucide React Native ^0.540.0 for extended icon set
- Expo Blur ~14.1.5 for blur effects
- React Native SVG 15.11.2 for custom graphics

### Networking

- A singleton API client (see "API Client Configuration" section) wrapping the built-in Fetch API for HTTP requests.
- @tanstack/react-query for managing the request lifecycle (caching, retries, synchronization).
- Expo Web Browser ~14.2.0 for OAuth flows.

### Data Storage

- @react-native-async-storage/async-storage for local key-value storage.
- Zustand persistence middleware for automatic state hydration.
- Future: External database integration via React Query (ready for backend).

### Authentication & Authorization

- Expo Auth Session ~6.2.1 for OAuth implementations.
- JWT (JSON Web Tokens) for authenticating API requests (see "API Client Configuration").
- Expo Crypto ~14.1.5 for cryptographic operations.
- Guest mode support with conditional routing.
- Future: Ready for backend authentication integration.

### Media & Camera

- Expo Image ~2.4.0 for optimized image handling
- Future: Expo Camera and Expo ImageManipulator (when media features are needed)

### Testing & Quality Assurance

- Jest ~29.7.0 for unit testing
- @testing-library/react-native ^13.3.1 for component testing
- @testing-library/jest-native ^5.4.3 for React Native testing utilities
- Detox ^20.40.2 for E2E testing
- ESLint ^9.25.0 with expo config for code quality
- TypeScript strict mode for type safety

### Development & Build Tools

- Metro React Native Babel Preset for bundling
- Tailwind CSS ^3.3.0 for NativeWind styling
- Babel Core ^7.25.2 for JavaScript compilation
- React Test Renderer ^19.0.0 for testing

### Other Expo Modules

- Expo Constants ~17.1.7 for app constants
- Expo Font ~13.3.2 for custom fonts
- Expo Speech ^13.1.7 for text-to-speech capabilities
- Expo Splash Screen ~0.30.10 for app launch screen
- Expo Status Bar ~2.2.3 for status bar customization
- Expo System UI ^5.0.11 for system UI theming
- Expo Symbols ~0.4.5 for system symbols (iOS)

## Backend Architecture

The backend will be a REST API built with Python and **FastAPI**. It will **strictly adhere** to the data contracts (requests, responses, models) defined in the "Backend Types" section of this document. This ensures type safety and a predictable integration between the frontend and backend.

Pydantic models will be used on the backend to enforce this adherence at runtime, providing automatic data validation for all incoming and outgoing data. The API will use a **camelCase** JSON naming strategy for all keys to align with JavaScript conventions, while the ORM will map these to **snake_case** for the database schema.

### Core
- **FastAPI**: The core web framework for building the API.
- **Pydantic**: Used for data validation, settings management, and enforcing API contracts.
- **Python 3.11+**: The required version of Python.

### Database
- **Supabase (PostgreSQL)** : The primary database provider.
- **Prisma Python**: The preferred ORM for simplified and type-safe database access.

### API Design
- **REST only**: The architectural style for the API.
- **OpenAPI/Swagger**: For automatic and interactive API documentation.

### AI/ML (Post-MVP / V2 Feature)
*Note: The following components are planned for a future release and are not part of the initial backend integration.*
- **OpenAI SDK** : For direct interactions with OpenAI models.
- **LangChain**: For orchestrating complex AI workflows and chains.
- **Instructor**: For ensuring structured, validated outputs from language models.

### Background Jobs
- **Celery + Redis**: For more robust, heavy-duty asynchronous jobs.
- **OR Supabase Edge Functions**: For lightweight, serverless background tasks.

### Deployment
- **Railway or Render**: Recommended beginner-friendly hosting platforms.
- **Skip Docker initially**: Managed platforms like Railway handle containerization, simplifying the initial setup.

## Development Guidelines

### Environment Management
The application will use `.env` files to manage environment-specific variables like the backend API URL.
- `.env.development`: For local development.
- `.env.production`: For production builds.
These variables will be loaded via Expo's configuration and made available through `expo-constants`.

### API Client Configuration
A singleton API client will be created to handle all communication with the backend. This client will be responsible for:
1.  Reading the backend API URL from the environment variables.
2.  Attaching the JWT from the Zustand `userStore` to the `Authorization: Bearer <token>` header for all authenticated requests.
3.  Standardizing error handling and response parsing.
4.  Potentially handling automatic token refresh logic.

This centralized client will be used by all React Query hooks to ensure consistency.

### Data Synchronization Strategy
This section defines how server state (from the backend) and client state (on the device) are managed.
1.  **Fetching Data (Read):** All server data (e.g., workout history, user profile) will be fetched using React Query's `useQuery` hooks. These hooks will manage caching, background refetching, and making server state available to all UI components.
2.  **Mutating Data (Write):** All creates, updates, and deletes will be performed using React Query's `useMutation` hooks. These hooks will handle the API call, loading/error states, and invalidating relevant `useQuery` caches to trigger automatic refetches.
3.  **UI Components:** UI components will primarily consume data directly from React Query hooks to display server state.
4.  **Zustand for Active/UI State:** Zustand stores will be used for state that is not persisted on the server, including:
    -   UI state (e.g., which modal is open, loading spinners).
    -   Active session data. For example, when a user is actively logging a workout, all new sets and reps are stored in the `workoutStore` for maximum UI responsiveness without waiting for an API call.
5.  **Saving Active State:** When a user completes an action (e.g., presses "Save Workout"), an action in the Zustand store will trigger the appropriate React Query `useMutation` hook, sending the collected active state to the backend. On a successful API response, the active state in the Zustand store will be cleared.

### Architecture Principles

1. **Expo-First**: Always prefer built-in Expo solutions before third-party alternatives.
2. **TypeScript Everywhere**: Maintain strict TypeScript usage across the codebase.
3. **Component-Based**: Use React Native components exclusively (never HTML elements).
4. **Performance-Focused**: Utilize React Native Reanimated for smooth 60fps animations.
5. **Accessibility-Aware**: Implement proper accessibility props and support.

### State Management Pattern

- **Zustand Stores**: Use for all **client-side-only** state.
- **React Query**: Handle all **server state** and data fetching.
- **React Hook Form**: Manage all form state and validation.
- **Store Structure**: Separate stores for user, workout, exercise, theme, and navigation state.

### Styling Approach

- **NativeWind v4**: Primary styling system with nested color object structure.
- **Design Tokens**: HSL-based color system with comprehensive theme support.
- **Responsive Design**: Mobile-first approach with proper safe area handling.
- **Theme System**: Automatic dark/light mode switching with user preference persistence.

### Testing Strategy

- **Unit Tests**: Jest + React Testing Library for component and utility testing.
- **Integration Tests**: Store interactions and component integration testing.
- **Visual Tests**: Component rendering and styling validation.
- **E2E Tests**: Complete user workflows with Detox.
- **Coverage Target**: Maintain >90% test coverage for critical business logic.

### Performance Considerations

- **Bundle Optimization**: Use Expo CLI for optimized production builds.
- **Image Optimization**: Leverage Expo Image for efficient image handling.
- **Memory Management**: Proper cleanup of subscriptions and listeners.
- **Animation Performance**: Use React Native Reanimated worklets for UI thread animations.
- **Data Loading**: Implement proper loading states and error boundaries.

## Migration & Upgrade Policy

### Version Management

- **React Native**: Follow Expo SDK release cycle for React Native updates.
- **Dependencies**: Use exact versions for critical dependencies, allow minor updates for others.
- **Breaking Changes**: Always test in development environment before production deployment.

### Compatibility Requirements

- **iOS**: Support iOS 13.4+ (minimum Expo requirement).
- **Android**: Support Android API 21+ (Android 5.0).
- **Node.js**: Require Node.js 18+ for development environment.

## Security Guidelines

- **No Secrets in Code**: Never commit API keys, tokens, or credentials to repository.
- **Secure Storage**: Use AsyncStorage for non-sensitive data only.
- **Input Validation**: Validate all user inputs with React Hook Form and TypeScript.
- **Authentication**: Implement proper JWT handling and secure token storage.
- **Updates**: Keep dependencies updated for security patches.

## Getting Started

To maintain consistency with this tech stack:

1. Use `npx create-expo-app` with TypeScript template for new projects.
2. Install required dependencies from the package.json in `Frontend/coach/`.
3. Follow the established store patterns in `stores/` directory.
4. Use NativeWind v4 styling patterns from existing components.
5. Implement proper testing patterns from `__tests__/` directory.
6. Follow authentication flow patterns from `app/(auth)/` implementation.

This tech stack has been validated through comprehensive development and testing of the VoiceLog fitness tracking application, achieving 98% project completion with production-ready stability.

---

## Type System & Contracts

To assist future developers and AI agents working with this codebase, the following TypeScript interfaces define the core data structures and contracts used throughout the application.

### Frontend Types

#### Core Domain Models
```typescript
// User and Authentication
interface User {
  id: string;
  email: string;
  displayName?: string;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

interface UserPreferences {
  weightUnit: 'kg' | 'lbs';
  theme: 'light' | 'dark' | 'auto';
  defaultRestTimer: number; // seconds
  hapticFeedback: boolean;
}

interface AuthState {
  status: 'guest' | 'authenticated' | 'loading';
  user?: User;
  token?: string;
  expiresAt?: string;
}

// Workout Domain
interface Workout {
  id: string;
  userId: string;
  title: string;
  exercises: Exercise[];
  startedAt: string;
  completedAt?: string;
  duration?: number; // seconds
  isActive: boolean;
}

interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  bodyPart: string[];
  equipment: string[];
  sets: Set[];
  notes?: string;
}

interface Set {
  id: string;
  reps?: number;
  weight?: number;
  duration?: number; // seconds for time-based exercises
  distance?: number; // meters for cardio
  completed: boolean;
  restTime?: number; // seconds
}

type ExerciseCategory = 
  | 'strength' 
  | 'cardio' 
  | 'flexibility' 
  | 'balance' 
  | 'bodyweight';
```

#### Component Props Interfaces
```typescript
// UI Component Props
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
}

interface WorkoutCardProps {
  workout: Workout;
  onPress: (workoutId: string) => void;
  onEdit: (workoutId: string) => void;
  onDelete: (workoutId: string) => void;
  showActions?: boolean;
}

interface ExerciseLogCardProps {
  exercise: Exercise;
  onUpdateSet: (setId: string, updates: Partial<Set>) => void;
  onAddSet: () => void;
  onDeleteSet: (setId: string) => void;
  editable?: boolean;
}

interface TabNavigationProps {
  currentTab: TabName;
  onTabPress: (tab: TabName) => void;
  badge?: { [key in TabName]?: number };
}
```

#### Store Interfaces
```typescript
// Zustand Store Types
interface UserStore {
  // State
  authState: AuthState;
  preferences: UserPreferences;
  isLoading: boolean;
  error?: string;
  
  // Actions
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  setGuestMode: () => void;
  initialize: () => Promise<void>;
}

interface WorkoutStore {
  // State
  activeWorkout?: Workout;
  workoutHistory: Workout[];
  isLoading: boolean;
  
  // Actions
  startWorkout: (title: string) => void;
  endWorkout: () => Promise<void>;
  addExercise: (exercise: Exercise) => void;
  removeExercise: (exerciseId: string) => void;
  updateExercise: (exerciseId: string, updates: Partial<Exercise>) => void;
  addSet: (exerciseId: string) => void;
  updateSet: (exerciseId: string, setId: string, updates: Partial<Set>) => void;
  deleteSet: (exerciseId: string, setId: string) => void;
}

interface ExerciseStore {
  // State
  exercises: Exercise[];
  categories: ExerciseCategory[];
  searchQuery: string;
  selectedCategory?: ExerciseCategory;
  
  // Actions
  loadExercises: () => Promise<void>;
  searchExercises: (query: string) => void;
  filterByCategory: (category: ExerciseCategory) => void;
  addCustomExercise: (exercise: Omit<Exercise, 'id'>) => void;
}

interface ThemeStore {
  // State
  theme: 'light' | 'dark' | 'auto';
  colors: any; // ThemeColors;
  
  // Actions
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  toggleTheme: () => void;
}
```

#### Navigation Types
```typescript
// Expo Router Navigation
type RootStackParamList = {
  '(tabs)': undefined;
  '(auth)': undefined;
  '(modal)': {
    screen: keyof ModalStackParamList;
    params?: ModalStackParamList[keyof ModalStackParamList];
  };
};

type TabStackParamList = {
  index: undefined; // Home tab
  activity: undefined;
  profile: undefined;
};

type ModalStackParamList = {
  'add-exercises': undefined;
  'exercise-detail': { exerciseId: string };
  'workout-detail': { workoutId: string };
  terms: undefined;
  privacy: undefined;
  contact: undefined;
  feedback: undefined;
};

type TabName = keyof TabStackParamList;
```

### Backend Types

#### Database Models (snake_case)
*These interfaces represent the database schema. The ORM is responsible for mapping these to the camelCase API contracts.*
```typescript
// Supabase Table Schemas
interface UserTable {
  id: string; // UUID primary key
  email: string; // unique
  display_name: string | null;
  preferences: UserPreferences; // JSONB
  created_at: string; // timestamp
  updated_at: string; // timestamp
}

interface WorkoutTable {
  id: string; // UUID primary key
  user_id: string; // foreign key to users
  title: string;
  started_at: string; // timestamp
  completed_at: string | null; // timestamp
  duration: number | null; // seconds
  is_active: boolean;
  created_at: string; // timestamp
  updated_at: string; // timestamp
}

interface ExerciseTable {
  id: string; // UUID primary key
  workout_id: string; // foreign key to workouts
  name: string;
  category: ExerciseCategory;
  body_part: string[]; // array
  equipment: string[]; // array
  notes: string | null;
  order_index: number;
  created_at: string; // timestamp
}

interface SetTable {
  id: string; // UUID primary key
  exercise_id: string; // foreign key to exercises
  reps: number | null;
  weight: number | null;
  duration: number | null; // seconds
  distance: number | null; // meters
  completed: boolean;
  rest_time: number | null; // seconds
  order_index: number;
  created_at: string; // timestamp
}
```

#### API Contracts (camelCase)
*These interfaces define the exact shape of the JSON data sent to and from the API.*
```typescript
// FastAPI Request/Response Types
interface CreateWorkoutRequest {
  title: string;
  exercises?: CreateExerciseRequest[];
}

interface CreateWorkoutResponse {
  id: string;
  title: string;
  startedAt: string;
  isActive: boolean;
}

interface CreateExerciseRequest {
  name: string;
  category: ExerciseCategory;
  bodyPart: string[];
  equipment: string[];
  sets?: CreateSetRequest[];
}

interface CreateSetRequest {
  reps?: number;
  weight?: number;
  duration?: number;
  distance?: number;
}

interface UpdateWorkoutRequest {
  title?: string;
  completedAt?: string;
  isActive?: boolean;
}

interface WorkoutResponse {
  id: string;
  userId: string;
  title: string;
  exercises: ExerciseResponse[];
  startedAt: string;
  completedAt?: string;
  duration?: number;
  isActive: boolean;
}

interface ExerciseResponse {
  id: string;
  name: string;
  category: ExerciseCategory;
  bodyPart: string[];
  equipment: string[];
  sets: SetResponse[];
  notes?: string;
}

interface SetResponse {
  id: string;
  reps?: number;
  weight?: number;
  duration?: number;
  distance?: number;
  completed: boolean;
  restTime?: number;
}

// Authentication API
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: UserResponse;
  expiresAt: string;
}

interface UserResponse {
  id: string;
  email: string;
  displayName?: string;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}
```

#### Service Layer Types
```typescript
// Business Logic Service Interfaces
interface WorkoutService {
  createWorkout(userId: string, request: CreateWorkoutRequest): Promise<WorkoutResponse>;
  getWorkout(id: string): Promise<WorkoutResponse>;
  updateWorkout(id: string, request: UpdateWorkoutRequest): Promise<WorkoutResponse>;
  deleteWorkout(id: string): Promise<void>;
  getUserWorkouts(userId: string, limit?: number, offset?: number): Promise<WorkoutResponse[]>;
  completeWorkout(id: string): Promise<WorkoutResponse>;
}

interface ExerciseService {
  getExerciseLibrary(category?: ExerciseCategory): Promise<ExerciseResponse[]>;
  searchExercises(query: string): Promise<ExerciseResponse[]>;
  createCustomExercise(userId: string, exercise: CreateExerciseRequest): Promise<ExerciseResponse>;
  addExerciseToWorkout(workoutId: string, exercise: CreateExerciseRequest): Promise<ExerciseResponse>;
  updateExercise(exerciseId: string, updates: Partial<CreateExerciseRequest>): Promise<ExerciseResponse>;
  deleteExercise(exerciseId: string): Promise<void>;
}

interface UserService {
  createUser(email: string, password: string): Promise<UserResponse>;
  authenticateUser(email: string, password: string): Promise<LoginResponse>;
  updateUser(userId: string, updates: Partial<UserResponse>): Promise<UserResponse>;
  updatePreferences(userId: string, preferences: UserPreferences): Promise<UserResponse>;
  deleteUser(userId: string): Promise<void>;
}

// AI/ML Service Types (Post-MVP / V2 Feature)
interface AIWorkoutService {
  generateWorkoutPlan(userId: string, preferences: WorkoutPreferences): Promise<WorkoutPlan>;
  suggestExercises(currentExercises: Exercise[], targetMuscleGroups: string[]): Promise<Exercise[]>;
  analyzeWorkoutPerformance(workouts: Workout[]): Promise<PerformanceAnalysis>;
}

interface WorkoutPreferences {
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  goals: ('strength' | 'endurance' | 'weight_loss' | 'muscle_gain')[];
  availableEquipment: string[];
  timeLimit: number; // minutes
  targetMuscleGroups?: string[];
}

interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  exercises: Exercise[];
  estimatedDuration: number; // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  targetMuscleGroups: string[];
}

interface PerformanceAnalysis {
  totalWorkouts: number;
  averageWorkoutDuration: number; // minutes
  strengthProgress: { [exerciseName: string]: number }; // percentage improvement
  consistencyScore: number; // 0-100
  recommendations: string[];
  achievements: Achievement[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  unlockedAt: string;
  category: 'strength' | 'consistency' | 'milestone' | 'personal_record';
}
```

#### Error Handling Types
```typescript
// API Error Types
interface APIError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

interface ValidationError extends APIError {
  field: string;
  value: any;
  constraint: string;
}

type APIResponse<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: APIError;
};

// HTTP Status Codes
type HTTPStatus = 200 | 201 | 400 | 401 | 403 | 404 | 422 | 500;
```

These type definitions provide a comprehensive contract system that ensures type safety across the full stack, from React Native components to FastAPI endpoints and Supabase database operations. They serve as documentation and enable better IDE support, error checking, and AI agent understanding of the codebase structure.
