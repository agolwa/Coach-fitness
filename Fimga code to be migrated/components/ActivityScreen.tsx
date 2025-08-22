import { useState } from "react";
import { Calendar, Clock, Activity, Plus, ChevronDown, Loader2 } from "lucide-react";
import { StatusBar } from "./StatusBar";
import { BottomNavigation } from "./BottomNavigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";

interface WorkoutHistoryItem {
  id: number;
  title: string;
  date: string;
  day: string;
  time: string;
  duration: string;
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

interface CurrentWorkout {
  title: string;
  exercises: any[];
}

interface ActivityScreenProps {
  onHomeClick: () => void;
  onProfileClick: () => void;
  onWorkoutClick: (workout: WorkoutHistoryItem) => void;
  onAddToCurrentSession: (exercises: any[]) => void;
  currentWorkout?: CurrentWorkout;
  workoutHistory?: WorkoutHistoryItem[];
  isSignedIn: boolean;
}

export function ActivityScreen({ 
  onHomeClick, 
  onProfileClick, 
  onWorkoutClick, 
  onAddToCurrentSession,
  currentWorkout,
  workoutHistory: propWorkoutHistory,
  isSignedIn 
}: ActivityScreenProps) {
  const [dateFilter, setDateFilter] = useState<'all' | 'week' | 'month'>('all');
  const [displayedWorkouts, setDisplayedWorkouts] = useState<WorkoutHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const WORKOUTS_PER_PAGE = 3;

  // Extended mock workout history data with detailed sets for pagination
  const allWorkoutHistory: WorkoutHistoryItem[] = [
    {
      id: 1,
      title: "Push Day Workout",
      date: "21st June",
      day: "Monday",
      time: "6:30 AM",
      duration: "1h 15m",
      exercises: [
        { 
          name: "Bench Press", 
          sets: 4, 
          totalReps: 32, 
          maxWeight: 185,
          detailSets: [
            { set: 1, weight: 185, reps: 8, notes: "Feeling strong" },
            { set: 2, weight: 185, reps: 8, notes: "" },
            { set: 3, weight: 175, reps: 8, notes: "Dropped weight" },
            { set: 4, weight: 175, reps: 8, notes: "" }
          ]
        },
        { 
          name: "Squats", 
          sets: 4, 
          totalReps: 40, 
          maxWeight: 225,
          detailSets: [
            { set: 1, weight: 225, reps: 10, notes: "Good form" },
            { set: 2, weight: 225, reps: 10, notes: "" },
            { set: 3, weight: 225, reps: 10, notes: "" },
            { set: 4, weight: 225, reps: 10, notes: "Last set tough" }
          ]
        },
        { 
          name: "Deadlifts", 
          sets: 3, 
          totalReps: 15, 
          maxWeight: 275,
          detailSets: [
            { set: 1, weight: 275, reps: 5, notes: "Heavy but good" },
            { set: 2, weight: 275, reps: 5, notes: "" },
            { set: 3, weight: 275, reps: 5, notes: "PR!" }
          ]
        },
        { 
          name: "Pull-ups", 
          sets: 3, 
          totalReps: 24, 
          maxWeight: 0,
          detailSets: [
            { set: 1, weight: 0, reps: 8, notes: "Bodyweight" },
            { set: 2, weight: 0, reps: 8, notes: "" },
            { set: 3, weight: 0, reps: 8, notes: "Perfect form" }
          ]
        }
      ]
    },
    {
      id: 2,
      title: "Shoulder Focused",
      date: "19th June",
      day: "Saturday",
      time: "8:15 AM",
      duration: "55m",
      exercises: [
        { 
          name: "Shoulder Press", 
          sets: 4, 
          totalReps: 40, 
          maxWeight: 135,
          detailSets: [
            { set: 1, weight: 135, reps: 10, notes: "Warm up set" },
            { set: 2, weight: 135, reps: 10, notes: "" },
            { set: 3, weight: 135, reps: 10, notes: "" },
            { set: 4, weight: 135, reps: 10, notes: "Good session" }
          ]
        },
        { 
          name: "Lateral Raises", 
          sets: 3, 
          totalReps: 36, 
          maxWeight: 25,
          detailSets: [
            { set: 1, weight: 25, reps: 12, notes: "Light weight" },
            { set: 2, weight: 25, reps: 12, notes: "" },
            { set: 3, weight: 25, reps: 12, notes: "Burn!" }
          ]
        }
      ]
    },
    {
      id: 3,
      title: "Leg Day",
      date: "17th June",
      day: "Thursday",
      time: "7:00 AM",
      duration: "1h 5m",
      exercises: [
        { 
          name: "Romanian Deadlifts", 
          sets: 4, 
          totalReps: 32, 
          maxWeight: 205,
          detailSets: [
            { set: 1, weight: 205, reps: 8, notes: "Good stretch" },
            { set: 2, weight: 205, reps: 8, notes: "" },
            { set: 3, weight: 205, reps: 8, notes: "" },
            { set: 4, weight: 205, reps: 8, notes: "Hamstrings on fire" }
          ]
        }
      ]
    },
    {
      id: 4,
      title: "Full Body Circuit",
      date: "15th June",
      day: "Tuesday",
      time: "5:45 PM",
      duration: "40m",
      exercises: [
        { 
          name: "Burpees", 
          sets: 3, 
          totalReps: 30, 
          maxWeight: 0,
          detailSets: [
            { set: 1, weight: 0, reps: 10, notes: "Cardio blast" },
            { set: 2, weight: 0, reps: 10, notes: "" },
            { set: 3, weight: 0, reps: 10, notes: "Exhausted" }
          ]
        },
        { 
          name: "Mountain Climbers", 
          sets: 3, 
          totalReps: 60, 
          maxWeight: 0,
          detailSets: [
            { set: 1, weight: 0, reps: 20, notes: "Fast pace" },
            { set: 2, weight: 0, reps: 20, notes: "" },
            { set: 3, weight: 0, reps: 20, notes: "Core burning" }
          ]
        }
      ]
    },
    {
      id: 5,
      title: "Upper Body Focus",
      date: "13th June",
      day: "Sunday",
      time: "9:00 AM",
      duration: "50m",
      exercises: [
        { 
          name: "Incline Dumbbell Press", 
          sets: 4, 
          totalReps: 36, 
          maxWeight: 65,
          detailSets: [
            { set: 1, weight: 65, reps: 9, notes: "Good range" },
            { set: 2, weight: 65, reps: 9, notes: "" },
            { set: 3, weight: 65, reps: 9, notes: "" },
            { set: 4, weight: 65, reps: 9, notes: "Chest pumped" }
          ]
        }
      ]
    },
    {
      id: 6,
      title: "Core & Cardio",
      date: "11th June",
      day: "Friday",
      time: "6:00 PM",
      duration: "35m",
      exercises: [
        { 
          name: "Plank", 
          sets: 3, 
          totalReps: 180, 
          maxWeight: 0,
          detailSets: [
            { set: 1, weight: 0, reps: 60, notes: "60 seconds" },
            { set: 2, weight: 0, reps: 60, notes: "60 seconds" },
            { set: 3, weight: 0, reps: 60, notes: "60 seconds" }
          ]
        }
      ]
    }
  ];

  // Filter workouts based on date filter
  const getFilteredWorkouts = () => {
    const historyToUse = propWorkoutHistory && propWorkoutHistory.length > 0 
      ? propWorkoutHistory 
      : allWorkoutHistory;
    
    // For demo purposes, return all workouts regardless of filter
    // In a real app, you'd filter by actual dates
    return historyToUse;
  };

  const allWorkouts = getFilteredWorkouts();

  // Initialize displayed workouts on first load
  if (!hasInitialized && allWorkouts.length > 0) {
    setDisplayedWorkouts(allWorkouts.slice(0, WORKOUTS_PER_PAGE));
    setHasInitialized(true);
  }

  // Load more workouts function
  const loadMoreWorkouts = async () => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const currentCount = displayedWorkouts.length;
    const nextWorkouts = allWorkouts.slice(currentCount, currentCount + WORKOUTS_PER_PAGE);
    
    setDisplayedWorkouts(prev => [...prev, ...nextWorkouts]);
    setIsLoading(false);
  };

  // Check if there are more workouts to load
  const hasMoreWorkouts = displayedWorkouts.length < allWorkouts.length;

  // Use displayed workouts for rendering
  const workoutHistory = displayedWorkouts;

  const formatWeight = (weight: number) => {
    return weight > 0 ? `${weight} lbs` : "Bodyweight";
  };

  const getTotalExercises = (exercises: WorkoutHistoryItem['exercises']) => {
    return exercises.length;
  };

  const getTotalSets = (exercises: WorkoutHistoryItem['exercises']) => {
    return exercises.reduce((total, exercise) => total + exercise.sets, 0);
  };

  const handleAddToCurrentSession = (workout: WorkoutHistoryItem) => {
    // Convert workout exercises to the format expected by the home screen
    const exercisesToAdd = workout.exercises.map(exercise => ({
      id: Date.now() + Math.random(),
      name: exercise.name,
      sets: exercise.detailSets.map((set, index) => ({
        set: (index + 1).toString(),
        weight: set.weight.toString(),
        reps: set.reps.toString(),
        notes: set.notes
      })),
      detailSets: exercise.detailSets.map((set, index) => ({
        id: index + 1,
        weight: set.weight,
        reps: set.reps,
        notes: set.notes
      }))
    }));
    
    onAddToCurrentSession(exercisesToAdd);
  };



  return (
    <div className="bg-background relative w-full h-dvh max-w-[440px] mx-auto overflow-hidden flex flex-col">
      <StatusBar />
      
      {/* Header */}
      <div className="px-6 py-4 mt-14 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-primary" />
          <h1 className="text-foreground">Workout History</h1>
        </div>
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 pb-6">
          {/* Date Filter */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-muted-foreground">Statistics</h3>
              <Select value={dateFilter} onValueChange={(value: 'all' | 'week' | 'month') => setDateFilter(value)}>
                <SelectTrigger className="w-32 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All time</SelectItem>
                  <SelectItem value="week">This week</SelectItem>
                  <SelectItem value="month">This month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="card-uber p-4 text-center">
                <div className="text-2xl text-primary mb-1">{allWorkouts.length}</div>
                <div className="text-muted-foreground text-sm">Workouts</div>
              </div>
              <div className="card-uber p-4 text-center">
                <div className="text-2xl text-primary mb-1">
                  {allWorkouts.reduce((total, workout) => total + getTotalSets(workout.exercises), 0)}
                </div>
                <div className="text-muted-foreground text-sm">Total Sets</div>
              </div>
              <div className="card-uber p-4 text-center">
                <div className="text-2xl text-primary mb-1">
                  {allWorkouts.length > 0 ? Math.round(allWorkouts.reduce((total, workout) => {
                    const duration = parseFloat(workout.duration.replace(/[hm]/g, ''));
                    return total + duration;
                  }, 0) / allWorkouts.length) : 0}m
                </div>
                <div className="text-muted-foreground text-sm">Avg Time</div>
              </div>
            </div>
          </div>

          {/* Current Workout Preview */}
          {currentWorkout && currentWorkout.exercises.length > 0 && (
            <div className="mb-6">
              <h3 className="text-muted-foreground mb-4">Current Session</h3>
              <div className="card-uber p-4 border-primary/20 bg-primary/5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-lg">🔥</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate" title={currentWorkout.title || "Untitled Workout"}>
                      <h4 className="text-foreground truncate">
                        {currentWorkout.title || "Untitled Workout"}
                      </h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {currentWorkout.exercises.length} exercises added
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Workout History List */}
          <div className="space-y-4">
            <h3 className="text-muted-foreground mb-4">Recent Sessions</h3>
            
            {/* Guest user message */}
            {!isSignedIn && workoutHistory.length === 0 && (
              <div className="card-uber p-6 text-center border-muted/50">
                <div className="text-muted-foreground mb-2">📊</div>
                <h4 className="text-foreground mb-2">No Workout History</h4>
                <p className="text-muted-foreground text-sm">
                  Sign up to save your workouts and track your progress over time
                </p>
              </div>
            )}
            
            {workoutHistory.map((workout) => (
              <div 
                key={workout.id} 
                onClick={() => onWorkoutClick(workout)}
                className="card-uber p-6 cursor-pointer"
              >
                {/* Simplified Workout Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">🏋🏼‍♂️</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 
                        className="text-foreground truncate mb-1"
                        title={workout.title}
                      >
                        {workout.title}
                      </h4>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{workout.date}</span>
                        <span>•</span>
                        <span>{workout.duration}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button 
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 rounded opacity-60"
                      >
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCurrentSession(workout);
                        }}
                        className="cursor-pointer"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add to Current Session
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Exercise Summary */}
                <div className="text-sm text-muted-foreground mb-3">
                  {getTotalExercises(workout.exercises)} exercises • {getTotalSets(workout.exercises)} sets
                </div>

                {/* Exercise Preview */}
                <div className="space-y-2">
                  {workout.exercises.slice(0, 3).map((exercise, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex-1 min-w-0">
                        <div className="text-foreground truncate" title={exercise.name}>{exercise.name}</div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4 text-muted-foreground">
                        {exercise.sets} sets
                      </div>
                    </div>
                  ))}
                  {workout.exercises.length > 3 && (
                    <div className="text-sm text-muted-foreground">
                      +{workout.exercises.length - 3} more exercises
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Load More Button */}
            {hasMoreWorkouts && (
              <div className="py-4">
                <button 
                  onClick={loadMoreWorkouts}
                  disabled={isLoading}
                  className="button-uber-secondary w-full h-12 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More Sessions'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="flex-shrink-0">
        <BottomNavigation 
          onHomeClick={onHomeClick}
          onProfileClick={onProfileClick}
          currentScreen="activity"
        />
      </div>
    </div>
  );
}