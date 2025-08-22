import { useState, useEffect, useRef } from "react";
import {
  MoreVertical,
  Plus,
  Trash2,
  Edit2,
} from "lucide-react";
import { StatusBar } from "./components/StatusBar";
import { MicrophoneSection } from "./components/MicrophoneSection";
import { BottomNavigation } from "./components/BottomNavigation";
import { AddExercisesScreen } from "./components/AddExercisesScreen";
import { ExerciseDetailScreen } from "./components/ExerciseDetailScreen";
import { ProfileScreen } from "./components/ProfileScreen";
import { ActivityScreen } from "./components/ActivityScreen";
import { WorkoutDetailScreen } from "./components/WorkoutDetailScreen";
import { SuggestFeatureScreen } from "./components/SuggestFeatureScreen";
import { TermsAndConditionsScreen } from "./components/TermsAndConditionsScreen";
import { ContactUsScreen } from "./components/ContactUsScreen";
import { PrivacyPolicyScreen } from "./components/PrivacyPolicyScreen";
import { SignupScreen } from "./components/SignupScreen";
import { ThemeProvider } from "./components/ThemeProvider";
import { WeightUnitProvider } from "./components/WeightUnitProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./components/ui/alert-dialog";
import { toast } from "sonner@2.0.3";
import { motion } from "motion/react";
import { useWeightUnit } from "./components/WeightUnitProvider";

// Define the exercise types
interface Set {
  set: string;
  weight: string;
  reps: string;
  notes: string;
}

interface DetailSet {
  id: number;
  weight: number;
  reps: number;
  notes: string;
}

interface WorkoutExercise {
  id: number;
  name: string;
  sets: Set[];
  detailSets?: DetailSet[];
  weightUnit?: "kg" | "lbs";
}

interface SelectedExercise {
  id: number;
  name: string;
  muscle: string;
  equipment: string;
  selected: boolean;
}

interface WorkoutHistoryItem {
  id: number;
  title: string;
  date: string;
  day: string;
  time: string;
  duration: string;
  weightUnit: "kg" | "lbs";
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

function AppContent() {
  // Authentication state
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  // Weight unit management
  const { weightUnit, setCanChangeWeightUnit } =
    useWeightUnit();

  const [currentScreen, setCurrentScreen] = useState<
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
    | "privacyPolicy"
  >("signup");
  const [
    selectedExerciseForDetail,
    setSelectedExerciseForDetail,
  ] = useState<WorkoutExercise | null>(null);
  const [
    selectedWorkoutForDetail,
    setSelectedWorkoutForDetail,
  ] = useState<WorkoutHistoryItem | null>(null);
  const [workoutExercises, setWorkoutExercises] = useState<
    WorkoutExercise[]
  >([]);
  const [workoutTitle, setWorkoutTitle] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] =
    useState(false);
  const [exerciseToDelete, setExerciseToDelete] =
    useState<WorkoutExercise | null>(null);
  const [showEndWorkoutDialog, setShowEndWorkoutDialog] =
    useState(false);
  const [workoutHistory, setWorkoutHistory] = useState<
    WorkoutHistoryItem[]
  >([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showCharacterCounter, setShowCharacterCounter] =
    useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Character limit for workout title
  const MAX_TITLE_LENGTH = 30;

  const handleAddExercises = (
    selectedExercises: SelectedExercise[],
  ) => {
    // Convert selected exercises to workout exercises with empty sets
    const newExercises: WorkoutExercise[] = selectedExercises
      .filter((ex) => ex.selected)
      .map((ex) => ({
        id: Date.now() + ex.id, // Generate unique ID to avoid conflicts
        name: ex.name,
        sets: [
          { set: "", weight: "", reps: "", notes: "" },
          { set: "", weight: "", reps: "", notes: "" },
          { set: "", weight: "", reps: "", notes: "" },
          { set: "", weight: "", reps: "", notes: "" },
        ],
        detailSets: [],
        weightUnit: weightUnit, // Lock the weight unit for this workout
      }));

    // Add new exercises to the workout
    setWorkoutExercises((prev) => [...prev, ...newExercises]);
    setCurrentScreen("home");
  };

  const handleExerciseCardClick = (
    exercise: WorkoutExercise,
  ) => {
    setSelectedExerciseForDetail(exercise);
    setCurrentScreen("exerciseDetail");
  };

  const handleUpdateExerciseSets = (
    updatedSets: DetailSet[],
  ) => {
    if (!selectedExerciseForDetail) return;

    setWorkoutExercises((prev) =>
      prev.map((exercise) =>
        exercise.id === selectedExerciseForDetail.id
          ? { ...exercise, detailSets: updatedSets }
          : exercise,
      ),
    );
  };

  const handleDeleteClick = (exercise: WorkoutExercise) => {
    setExerciseToDelete(exercise);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (exerciseToDelete) {
      setWorkoutExercises((prev) =>
        prev.filter(
          (exercise) => exercise.id !== exerciseToDelete.id,
        ),
      );
      setExerciseToDelete(null);
    }
    setShowDeleteDialog(false);
  };

  const handleCancelDelete = () => {
    setExerciseToDelete(null);
    setShowDeleteDialog(false);
  };

  const handleWorkoutTitleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newValue = e.target.value;

    // Enforce character limit
    if (newValue.length <= MAX_TITLE_LENGTH) {
      setWorkoutTitle(newValue);

      // Show character counter if at 80% of limit
      if (
        newValue.length >= Math.ceil(MAX_TITLE_LENGTH * 0.8)
      ) {
        setShowCharacterCounter(true);

        // Clear existing timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout to hide counter after user stops typing
        typingTimeoutRef.current = setTimeout(() => {
          setShowCharacterCounter(false);
        }, 2500); // Hide after 2.5 seconds of inactivity
      } else {
        // Hide counter if below 80% threshold
        setShowCharacterCounter(false);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      }
    }
  };

  // Cleanup timeout on component unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Track workout state and update weight unit change permission
  useEffect(() => {
    const hasActiveWorkout = workoutExercises.length > 0;
    setCanChangeWeightUnit(!hasActiveWorkout);
  }, [workoutExercises, setCanChangeWeightUnit]);

  const handleWorkoutClick = (workout: WorkoutHistoryItem) => {
    setSelectedWorkoutForDetail(workout);
    setCurrentScreen("workoutDetail");
  };

  const handleAddToCurrentSession = (
    exercises: WorkoutExercise[],
  ) => {
    // Add exercises to current workout
    setWorkoutExercises((prev) => [...prev, ...exercises]);
    setCurrentScreen("home");
    toast(
      `Added ${exercises.length} exercises to current workout`,
    );
  };

  const handleStartNewSession = (
    workout: WorkoutHistoryItem,
  ) => {
    // Convert workout to current workout format
    const newExercises: WorkoutExercise[] =
      workout.exercises.map((exercise) => ({
        id: Date.now() + Math.random(),
        name: exercise.name,
        sets: exercise.detailSets.map((set, index) => ({
          set: (index + 1).toString(),
          weight: set.weight.toString(),
          reps: set.reps.toString(),
          notes: set.notes,
        })),
        detailSets: exercise.detailSets.map((set, index) => ({
          id: index + 1,
          weight: set.weight,
          reps: set.reps,
          notes: set.notes,
        })),
        weightUnit: workout.weightUnit, // Use the historical workout's weight unit
      }));

    // Start new session with the workout data
    setWorkoutExercises(newExercises);
    setWorkoutTitle(workout.title);
    setCurrentScreen("home");
    toast(`Started new session: ${workout.title}`);
  };

  // Helper function to check if any exercise has sets with actual data
  const hasAnySetsWithData = () => {
    return workoutExercises.some((exercise) => {
      if (
        !exercise.detailSets ||
        exercise.detailSets.length === 0
      ) {
        return false;
      }

      return exercise.detailSets.some((set) => {
        const hasReps = set.reps > 0;
        const hasWeight = set.weight > 0;
        const hasNotes = set.notes.trim().length > 0;
        return hasReps || hasWeight || hasNotes;
      });
    });
  };

  // Handle clear exercises
  const handleClearExercises = () => {
    setWorkoutExercises([]);
    setWorkoutTitle("");
    toast("All exercises cleared");
  };

  const handleEndWorkoutClick = () => {
    setShowEndWorkoutDialog(true);
  };

  const handleConfirmEndWorkout = () => {
    // Filter exercises that have at least one set with reps and weight
    const exercisesWithSets = workoutExercises.filter(
      (exercise) => {
        if (
          !exercise.detailSets ||
          exercise.detailSets.length === 0
        ) {
          return false;
        }

        // Check if exercise has at least one set with valid reps
        return exercise.detailSets.some((set) => {
          const hasReps = set.reps > 0;
          const hasWeight = set.weight > 0;
          const isBodyweight =
            exercise.name.toLowerCase().includes("pull-up") ||
            exercise.name.toLowerCase().includes("push-up") ||
            exercise.name.toLowerCase().includes("dip") ||
            exercise.name.toLowerCase().includes("squat");

          return hasReps && (hasWeight || isBodyweight);
        });
      },
    );

    // Only save if there's at least one exercise with valid sets
    if (exercisesWithSets.length === 0) {
      toast(
        "No exercises with completed sets found. Add some sets before ending workout.",
      );
      return;
    }

    // If user is not signed in (guest mode), don't save workout
    if (!isSignedIn) {
      // Clear current workout but don't save to history
      setWorkoutExercises([]);
      setWorkoutTitle("");
      setShowEndWorkoutDialog(false);
      toast("Workout cleared. Sign up to save your workouts!");
      return;
    }

    // Create workout history item (only for signed-in users)
    const now = new Date();
    const workoutHistoryItem: WorkoutHistoryItem = {
      id: Date.now(),
      title: workoutTitle || "Untitled Workout",
      date: now
        .toLocaleDateString("en-US", {
          day: "numeric",
          month: "long",
        })
        .replace(",", ""),
      day: now.toLocaleDateString("en-US", { weekday: "long" }),
      time: now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      duration: "45m", // Could calculate based on start time
      weightUnit:
        exercisesWithSets[0]?.weightUnit || weightUnit, // Use the workout's weight unit
      exercises: exercisesWithSets.map((exercise) => ({
        name: exercise.name,
        sets: exercise.detailSets?.length || 0,
        totalReps:
          exercise.detailSets?.reduce(
            (total, set) => total + set.reps,
            0,
          ) || 0,
        maxWeight: Math.max(
          ...(exercise.detailSets?.map((set) => set.weight) || [
            0,
          ]),
        ),
        detailSets:
          exercise.detailSets?.map((set, index) => ({
            set: index + 1,
            weight: set.weight,
            reps: set.reps,
            notes: set.notes,
          })) || [],
      })),
    };

    // Add to workout history
    setWorkoutHistory((prev) => [workoutHistoryItem, ...prev]);

    // Show celebration animation
    setShowCelebration(true);

    // Clear current workout after celebration
    setTimeout(() => {
      setWorkoutExercises([]);
      setWorkoutTitle("");
      setShowCelebration(false);
      toast("Workout saved to history!");
    }, 3000);

    setShowEndWorkoutDialog(false);
  };

  const handleCancelEndWorkout = () => {
    setShowEndWorkoutDialog(false);
  };

  const handleUpdateWorkoutTitle = (
    workoutId: number,
    newTitle: string,
  ) => {
    setWorkoutHistory((prev) =>
      prev.map((workout) =>
        workout.id === workoutId
          ? { ...workout, title: newTitle }
          : workout,
      ),
    );

    // Also update the selected workout for detail if it's currently being viewed
    if (
      selectedWorkoutForDetail &&
      selectedWorkoutForDetail.id === workoutId
    ) {
      setSelectedWorkoutForDetail((prev) =>
        prev ? { ...prev, title: newTitle } : prev,
      );
    }
  };

  const handleGoogleSignup = () => {
    // TODO: Implement Google authentication logic
    console.log("Google signup clicked");
    // Set user as signed in and navigate to home
    setIsSignedIn(true);
    setIsGuest(false);
    setCurrentScreen("home");
    toast("Welcome to VoiceLog! 🎉");
  };

  const handleTryWithoutSignup = () => {
    // Set user as guest and navigate to home
    setIsGuest(true);
    setIsSignedIn(false);
    setCurrentScreen("home");
    toast("Welcome! Sign up anytime to save your workouts.");
  };

  const handleSignOut = () => {
    // Reset auth state and navigate back to signup
    setIsSignedIn(false);
    setIsGuest(false);
    setCurrentScreen("signup");
    // Clear current workout and history
    setWorkoutExercises([]);
    setWorkoutTitle("");
    setWorkoutHistory([]);
    toast("Signed out successfully");
  };

  const handleSignUpFromGuest = () => {
    // Navigate back to signup screen
    setCurrentScreen("signup");
  };

  // Helper function to get character count info
  const getCharacterCountInfo = () => {
    const remaining = MAX_TITLE_LENGTH - workoutTitle.length;
    const isNearLimit = remaining <= 10;
    const isAtLimit = remaining === 0;
    const isAt80Percent =
      workoutTitle.length >= Math.ceil(MAX_TITLE_LENGTH * 0.8); // 24 characters

    return {
      remaining,
      isNearLimit,
      isAtLimit,
      isAt80Percent,
      current: workoutTitle.length,
      max: MAX_TITLE_LENGTH,
    };
  };

  // Helper function to convert detailSets to display format
  const getDisplaySets = (exercise: WorkoutExercise): Set[] => {
    if (
      !exercise.detailSets ||
      exercise.detailSets.length === 0
    ) {
      // Return one empty row if no detail sets exist to show the structure
      return [{ set: "", weight: "", reps: "", notes: "" }];
    }

    // Convert detailSets to display format - only show rows with actual data
    const displaySets = exercise.detailSets
      .filter(
        (detailSet) =>
          detailSet.reps > 0 ||
          detailSet.weight > 0 ||
          detailSet.notes.trim().length > 0,
      )
      .map((detailSet, index) => ({
        set: (index + 1).toString(),
        weight: detailSet.weight.toString(),
        reps: detailSet.reps.toString(),
        notes: detailSet.notes,
      }));

    // If no sets have data, show one empty row
    if (displaySets.length === 0) {
      return [{ set: "", weight: "", reps: "", notes: "" }];
    }

    return displaySets;
  };

  // Convert workout history item to workout detail format
  const convertToWorkoutDetail = (
    workout: WorkoutHistoryItem,
  ) => {
    return {
      ...workout,
      exercises: workout.exercises.map((exercise) => ({
        name: exercise.name,
        sets: exercise.detailSets || [],
      })),
    };
  };

  // Screen routing
  if (currentScreen === "signup") {
    return (
      <SignupScreen
        onGoogleSignup={handleGoogleSignup}
        onTryWithoutSignup={handleTryWithoutSignup}
      />
    );
  }

  if (currentScreen === "addExercises") {
    return (
      <AddExercisesScreen
        onClose={() => setCurrentScreen("home")}
        onAddExercises={handleAddExercises}
      />
    );
  }

  if (
    currentScreen === "exerciseDetail" &&
    selectedExerciseForDetail
  ) {
    return (
      <ExerciseDetailScreen
        exerciseName={selectedExerciseForDetail.name}
        sets={selectedExerciseForDetail.detailSets || []}
        onBack={() => {
          setCurrentScreen("home");
          setSelectedExerciseForDetail(null);
        }}
        onUpdateSets={handleUpdateExerciseSets}
      />
    );
  }

  if (currentScreen === "profile") {
    return (
      <ProfileScreen
        onBack={() => setCurrentScreen("home")}
        onHomeClick={() => setCurrentScreen("home")}
        onActivityClick={() => setCurrentScreen("activity")}
        onSuggestFeature={() =>
          setCurrentScreen("suggestFeature")
        }
        onTermsAndConditions={() =>
          setCurrentScreen("termsAndConditions")
        }
        onContactUs={() => setCurrentScreen("contactUs")}
        onPrivacyPolicy={() =>
          setCurrentScreen("privacyPolicy")
        }
        isSignedIn={isSignedIn}
        isGuest={isGuest}
        onSignOut={handleSignOut}
        onSignUp={handleSignUpFromGuest}
      />
    );
  }

  if (currentScreen === "suggestFeature") {
    return (
      <SuggestFeatureScreen
        onBack={() => setCurrentScreen("profile")}
      />
    );
  }

  if (currentScreen === "termsAndConditions") {
    return (
      <TermsAndConditionsScreen
        onBack={() => setCurrentScreen("profile")}
      />
    );
  }

  if (currentScreen === "contactUs") {
    return (
      <ContactUsScreen
        onBack={() => setCurrentScreen("profile")}
      />
    );
  }

  if (currentScreen === "privacyPolicy") {
    return (
      <PrivacyPolicyScreen
        onBack={() => setCurrentScreen("profile")}
      />
    );
  }

  if (currentScreen === "activity") {
    return (
      <ActivityScreen
        onHomeClick={() => setCurrentScreen("home")}
        onProfileClick={() => setCurrentScreen("profile")}
        onWorkoutClick={handleWorkoutClick}
        onAddToCurrentSession={handleAddToCurrentSession}
        currentWorkout={{
          title: workoutTitle,
          exercises: workoutExercises,
        }}
        workoutHistory={workoutHistory}
        isSignedIn={isSignedIn}
      />
    );
  }

  if (
    currentScreen === "workoutDetail" &&
    selectedWorkoutForDetail
  ) {
    return (
      <WorkoutDetailScreen
        workout={convertToWorkoutDetail(
          selectedWorkoutForDetail,
        )}
        onBack={() => {
          setCurrentScreen("activity");
          setSelectedWorkoutForDetail(null);
        }}
        onHomeClick={() => setCurrentScreen("home")}
        onProfileClick={() => setCurrentScreen("profile")}
        onAddToCurrentSession={handleAddToCurrentSession}
        onUpdateWorkoutTitle={handleUpdateWorkoutTitle}
      />
    );
  }

  const characterInfo = getCharacterCountInfo();
  const hasSetsData = hasAnySetsWithData();

  // Celebration Animation Component
  const CelebrationScreen = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-primary/10 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.2,
        }}
        className="bg-background rounded-2xl p-8 text-center shadow-2xl border border-primary/20"
      >
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, -10, 10, 0],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            repeatDelay: 1,
          }}
          className="text-6xl mb-4"
        >
          🎉
        </motion.div>

        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-2xl text-primary mb-2"
        >
          Great Job!
        </motion.h2>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-muted-foreground"
        >
          Workout completed successfully
        </motion.p>
      </motion.div>
    </motion.div>
  );

  // Home screen with new fixed bottom layout
  return (
    <div className="bg-background relative w-full h-dvh max-w-[440px] mx-auto overflow-hidden flex flex-col">
      <StatusBar />

      {/* Top Section - Scrollable Content Area (75% of available space) */}
      <div className="flex-1 mt-14 overflow-y-auto">
        <div className="px-6">
          {/* Date Display */}
          <div className="py-3">
            <p className="text-muted-foreground text-sm">
              21st June, Monday
            </p>
          </div>

          {workoutExercises.length === 0 ? (
            /* Empty State Message - Centered in available space */
            <div className="flex items-center justify-center min-h-[300px]">
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No exercises added yet. Click "Add exercise"
                  or log via voice.
                </p>
              </div>
            </div>
          ) : (
            /* Exercise Content when exercises exist */
            <div className="pb-6">
              {/* Today's Log Heading */}
              <h4 className="text-muted-foreground mb-6">
                Today's log
              </h4>

              <div className="space-y-4">
                {/* Workout Title Input Card */}
                <div className="card-uber p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Edit2 className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Add workout name"
                          value={workoutTitle}
                          onChange={handleWorkoutTitleChange}
                          maxLength={MAX_TITLE_LENGTH}
                          className="w-full bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-lg font-medium pr-12"
                        />

                        {/* Character counter - only show when at 80% of limit and user is typing */}
                        {showCharacterCounter &&
                          characterInfo.isAt80Percent && (
                            <div className="absolute right-0 top-0 text-xs text-muted-foreground">
                              <span
                                className={
                                  characterInfo.isNearLimit
                                    ? "text-orange-500"
                                    : "text-muted-foreground"
                                }
                              >
                                {characterInfo.current}/
                                {characterInfo.max}
                              </span>
                            </div>
                          )}
                      </div>

                      <div className="flex items-center justify-end mt-1">
                        {/* Character limit warning */}
                        {showCharacterCounter &&
                          characterInfo.isNearLimit && (
                            <p
                              className={`text-xs ${characterInfo.isAtLimit ? "text-destructive" : "text-orange-500"}`}
                            >
                              {characterInfo.isAtLimit
                                ? "Character limit reached"
                                : `${characterInfo.remaining} chars left`}
                            </p>
                          )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Exercise Cards */}
                {workoutExercises.map((exercise) => {
                  const displaySets = getDisplaySets(exercise);
                  return (
                    <div
                      key={exercise.id}
                      className="card-uber w-full text-left p-6 transition-all duration-200 relative"
                    >
                      {/* Exercise Header */}
                      <div className="flex items-center justify-between mb-4">
                        <button
                          onClick={() =>
                            handleExerciseCardClick(exercise)
                          }
                          className="flex items-center gap-4 flex-1"
                        >
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-2xl">🏋🏼‍♂️</span>
                          </div>
                          <h4 className="text-foreground">
                            {exercise.name}
                          </h4>
                        </button>

                        {/* Three-dot menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-2 rounded-lg transition-colors">
                              <MoreVertical className="w-5 h-5 text-muted-foreground" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-40"
                          >
                            <DropdownMenuItem
                              onClick={() =>
                                handleDeleteClick(exercise)
                              }
                              className="text-destructive focus:text-destructive cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Divider */}
                      <div
                        onClick={() =>
                          handleExerciseCardClick(exercise)
                        }
                        className="cursor-pointer"
                      >
                        <div className="h-px bg-border mb-4"></div>

                        {/* Data Table */}
                        <div className="grid grid-cols-12 gap-2 text-sm">
                          {/* Headers */}
                          <div className="col-span-1 text-muted-foreground font-medium uppercase tracking-wider text-xs">
                            Set
                          </div>
                          <div className="col-span-2 text-muted-foreground font-medium uppercase tracking-wider text-xs text-center">
                            WGT
                          </div>
                          <div className="col-span-2 text-muted-foreground font-medium uppercase tracking-wider text-xs text-center">
                            Reps
                          </div>
                          <div className="col-span-7 text-muted-foreground font-medium uppercase tracking-wider text-xs">
                            Notes
                          </div>

                          {/* Data Rows */}
                          {displaySets.length === 1 &&
                          !displaySets[0].set &&
                          !displaySets[0].weight &&
                          !displaySets[0].reps &&
                          !displaySets[0].notes &&
                          !hasSetsData ? (
                            // Show "No sets added" message when exercise has no data AND no other exercise has data
                            <div className="col-span-12 py-3 text-center text-muted-foreground text-sm">
                              No sets added yet. Tap to add
                              sets.
                            </div>
                          ) : (
                            displaySets.map((set, index) => (
                              <div
                                key={index}
                                className="col-span-12 grid grid-cols-12 gap-2 py-1"
                              >
                                <div className="col-span-1 text-foreground text-center">
                                  {set.set}
                                </div>
                                <div className="col-span-2 text-foreground text-center">
                                  {set.weight}
                                </div>
                                <div className="col-span-2 text-foreground text-center">
                                  {set.reps}
                                </div>
                                <div
                                  className="col-span-7 text-foreground truncate"
                                  title={set.notes}
                                >
                                  {set.notes}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Conditional End Workout / Clear Exercises Button */}
                <div className="pt-4 pb-6">
                  {hasSetsData ? (
                    <button
                      onClick={handleEndWorkoutClick}
                      className="button-uber-tertiary w-full h-14"
                    >
                      End workout
                    </button>
                  ) : (
                    <button
                      onClick={handleClearExercises}
                      className="button-uber-secondary w-full h-14"
                    >
                      Clear exercises
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Section - Always visible (Microphone + Add Exercise Button) */}
      <div className="flex-shrink-0 bg-background border-t border-border px-6 py-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05),0_-2px_4px_-1px_rgba(0,0,0,0.06)]">
        <div className="flex flex-col gap-4">
          {/* Microphone Section - Always accessible */}
          <div>
            <MicrophoneSection
              onAddExercise={() =>
                setCurrentScreen("addExercises")
              }
            />
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      >
        <AlertDialogContent className="max-w-[320px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Exercise</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "
              {exerciseToDelete?.name}"? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel
              onClick={handleCancelDelete}
              className="button-uber-secondary w-full sm:w-auto"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* End Workout Confirmation Dialog - Conditional messaging based on auth state */}
      <AlertDialog
        open={showEndWorkoutDialog}
        onOpenChange={setShowEndWorkoutDialog}
      >
        <AlertDialogContent className="max-w-[320px]">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isSignedIn
                ? "End Workout"
                : "Sign up to save workout"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isSignedIn
                ? "Are you sure you want to end this workout? Your progress will be saved to your workout history."
                : "Your workout will be cleared unless you sign up. Create an account to save your workouts and track your progress over time."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel
              onClick={handleCancelEndWorkout}
              className="button-uber-secondary w-full sm:w-auto"
            >
              Cancel
            </AlertDialogCancel>
            {isSignedIn ? (
              <AlertDialogAction
                onClick={handleConfirmEndWorkout}
                className="button-uber-primary w-full sm:w-auto"
              >
                End Workout
              </AlertDialogAction>
            ) : (
              <>
                <AlertDialogAction
                  onClick={handleConfirmEndWorkout}
                  className="bg-muted text-muted-foreground hover:bg-muted/80 w-full sm:w-auto"
                >
                  Clear Workout
                </AlertDialogAction>
                <AlertDialogAction
                  onClick={() => {
                    setShowEndWorkoutDialog(false);
                    setCurrentScreen("signup");
                  }}
                  className="button-uber-primary w-full sm:w-auto"
                >
                  Sign Up
                </AlertDialogAction>
              </>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bottom Navigation - Fixed at bottom */}
      <div className="flex-shrink-0">
        <BottomNavigation
          onHomeClick={() => setCurrentScreen("home")}
          onActivityClick={() => setCurrentScreen("activity")}
          onProfileClick={() => setCurrentScreen("profile")}
          currentScreen={currentScreen}
        />
      </div>

      {/* Celebration Overlay */}
      {showCelebration && <CelebrationScreen />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <WeightUnitProvider>
        <AppContent />
      </WeightUnitProvider>
    </ThemeProvider>
  );
}