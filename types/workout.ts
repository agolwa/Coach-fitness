/**
 * Workout Types for VoiceLog Fitness App
 * Comprehensive TypeScript definitions for all workout-related state
 */

// Weight unit type
export type WeightUnit = 'kg' | 'lbs';

// Authentication state
export type AuthState = 'guest' | 'signed-in' | 'pending';

// Core workout data structures
export interface Set {
  set: string;
  weight: string;
  reps: string;
  notes: string;
}

export interface DetailSet {
  id: number;
  weight: number;
  reps: number;
  notes: string;
}

export interface WorkoutExercise {
  id: number;
  name: string;
  sets: Set[];
  detailSets?: DetailSet[];
  weightUnit?: WeightUnit;
}

export interface SelectedExercise {
  id: number;
  name: string;
  muscle: string;
  equipment: string;
  selected: boolean;
}

export interface WorkoutHistoryItem {
  id: number;
  title: string;
  date: string;
  day: string;
  time: string;
  duration: string;
  weightUnit: WeightUnit;
  exercises: {
    name: string;
    sets: number;
    totalReps: number;
    maxWeight: number;
    detailSets: {
      set: number;
      weight: number;
      reps: number;
      notes: string;
    }[];
  }[];
}

// Screen navigation types
export type ScreenType =
  | "signup"
  | "home"
  | "addExercises"
  | "exerciseDetail"
  | "profile"
  | "activity"
  | "workoutDetail"
  | "suggestFeature"
  | "termsAndConditions"
  | "contactUs"
  | "privacyPolicy";

// User preferences
export interface UserPreferences {
  weightUnit: WeightUnit;
  canChangeWeightUnit: boolean;
  authState: AuthState;
  isSignedIn: boolean;
  isGuest: boolean;
}

// Workout session state
export interface WorkoutSession {
  exercises: WorkoutExercise[];
  title: string;
  startTime?: Date;
  isActive: boolean;
  hasUnsavedChanges: boolean;
}

// UI state for modals and dialogs
export interface UIState {
  currentScreen: ScreenType;
  showDeleteDialog: boolean;
  showEndWorkoutDialog: boolean;
  showCelebration: boolean;
  showCharacterCounter: boolean;
  selectedExerciseForDetail: WorkoutExercise | null;
  selectedWorkoutForDetail: WorkoutHistoryItem | null;
  exerciseToDelete: WorkoutExercise | null;
}

// Exercise database structure
export interface ExerciseDatabase {
  exercises: SelectedExercise[];
  selectedExercises: SelectedExercise[];
  filters: {
    muscle: string[];
    equipment: string[];
    searchTerm: string;
  };
}

// Store action types for better type safety
export interface WorkoutActions {
  // Exercise management
  addExercises: (exercises: SelectedExercise[]) => void;
  updateExerciseSets: (exerciseId: number, sets: DetailSet[]) => void;
  deleteExercise: (exerciseId: number) => void;
  clearAllExercises: () => void;

  // Workout management
  updateWorkoutTitle: (title: string) => void;
  startWorkout: () => void;
  endWorkout: () => void;
  saveWorkout: () => Promise<void>;

  // History management
  addToHistory: (workout: WorkoutHistoryItem) => void;
  updateWorkoutInHistory: (workoutId: number, updates: Partial<WorkoutHistoryItem>) => void;
  deleteFromHistory: (workoutId: number) => void;
  loadWorkoutFromHistory: (workout: WorkoutHistoryItem) => void;
  addToCurrentSession: (exercises: WorkoutExercise[]) => void;

  // Utility functions
  hasAnySetsWithData: () => boolean;
  validateWorkout: () => boolean;
  calculateWorkoutDuration: () => string;
}

export interface UserActions {
  // Weight unit management
  setWeightUnit: (unit: WeightUnit) => void;
  setCanChangeWeightUnit: (canChange: boolean) => void;

  // Authentication
  signIn: () => void;
  signOut: () => void;
  continueAsGuest: () => void;

  // Preferences
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  resetPreferences: () => void;
}

export interface ExerciseActions {
  // Exercise database
  loadExercises: () => Promise<void>;
  searchExercises: (term: string) => void;
  filterByMuscle: (muscles: string[]) => void;
  filterByEquipment: (equipment: string[]) => void;
  clearFilters: () => void;

  // Exercise selection
  toggleExerciseSelection: (exerciseId: number) => void;
  selectAllExercises: () => void;
  clearSelection: () => void;
  getSelectedExercises: () => SelectedExercise[];
}

export interface UIActions {
  // Navigation
  setCurrentScreen: (screen: ScreenType) => void;
  goBack: () => void;

  // Modal management
  showDeleteDialog: (exercise: WorkoutExercise) => void;
  hideDeleteDialog: () => void;
  showEndWorkoutDialog: () => void;
  hideEndWorkoutDialog: () => void;
  showCelebration: () => void;
  hideCelebration: () => void;

  // Exercise detail management
  setSelectedExerciseForDetail: (exercise: WorkoutExercise | null) => void;
  setSelectedWorkoutForDetail: (workout: WorkoutHistoryItem | null) => void;

  // UI helpers
  showCharacterCounter: (show: boolean) => void;
  resetUIState: () => void;
}

// Combined store interfaces
export interface WorkoutStore extends WorkoutSession, WorkoutActions {
  history: WorkoutHistoryItem[];
  lastSavedAt?: Date;
  isLoading: boolean;
  error: string | null;
}

export interface UserStore extends UserPreferences, UserActions {
  lastUpdated?: Date;
  isLoading: boolean;
  error: string | null;
}

export interface ExerciseStore extends ExerciseDatabase, ExerciseActions {
  isLoading: boolean;
  error: string | null;
  lastUpdated?: Date;
}

export interface UIStore extends UIState, UIActions {
  navigationHistory: ScreenType[];
}

// Constants
export const WORKOUT_CONSTANTS = {
  MAX_TITLE_LENGTH: 30,
  DEFAULT_SETS_COUNT: 4,
  MIN_WEIGHT: 0,
  MAX_WEIGHT: 999,
  MIN_REPS: 0,
  MAX_REPS: 999,
  CELEBRATION_DURATION: 3000, // 3 seconds
  CHARACTER_COUNTER_TIMEOUT: 2500, // 2.5 seconds
  DEFAULT_WORKOUT_DURATION: '45m',
} as const;

// Storage keys for persistence
export const STORAGE_KEYS = {
  WORKOUT_HISTORY: '@workout_history',
  USER_PREFERENCES: '@user_preferences', 
  CURRENT_WORKOUT: '@current_workout',
  EXERCISE_DATABASE: '@exercise_database',
  APP_STATE: '@app_state',
} as const;

// Default values
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  weightUnit: 'kg',
  canChangeWeightUnit: true,
  authState: 'pending',
  isSignedIn: false,
  isGuest: false,
};

export const DEFAULT_WORKOUT_SESSION: WorkoutSession = {
  exercises: [],
  title: '',
  isActive: false,
  hasUnsavedChanges: false,
};

export const DEFAULT_UI_STATE: UIState = {
  currentScreen: 'signup',
  showDeleteDialog: false,
  showEndWorkoutDialog: false,
  showCelebration: false,
  showCharacterCounter: false,
  selectedExerciseForDetail: null,
  selectedWorkoutForDetail: null,
  exerciseToDelete: null,
};