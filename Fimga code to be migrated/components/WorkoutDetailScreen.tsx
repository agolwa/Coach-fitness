import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Calendar, Clock, Activity, Plus, Edit2, Check, X } from "lucide-react";
import { StatusBar } from "./StatusBar";
import { BottomNavigation } from "./BottomNavigation";

interface WorkoutDetailItem {
  id: number;
  title: string;
  date: string;
  day: string;
  time: string;
  duration: string;
  exercises: {
    name: string;
    sets: {
      set: number;
      weight: number;
      reps: number;
      notes: string;
    }[];
  }[];
}

interface WorkoutDetailScreenProps {
  workout: WorkoutDetailItem;
  onBack: () => void;
  onHomeClick: () => void;
  onProfileClick: () => void;
  onAddToCurrentSession: (exercises: any[]) => void;
  onUpdateWorkoutTitle: (workoutId: number, newTitle: string) => void;
}

export function WorkoutDetailScreen({ 
  workout, 
  onBack, 
  onHomeClick, 
  onProfileClick, 
  onAddToCurrentSession,
  onUpdateWorkoutTitle
}: WorkoutDetailScreenProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(workout.title);
  const inputRef = useRef<HTMLInputElement>(null);

  const formatWeight = (weight: number) => {
    return weight > 0 ? `${weight} lbs` : "BW";
  };

  const handleAddToCurrentSession = () => {
    // Convert workout exercises to the format expected by the home screen
    const exercisesToAdd = workout.exercises.map(exercise => ({
      id: Date.now() + Math.random(), // Generate unique ID
      name: exercise.name,
      sets: exercise.sets.map((set, index) => ({
        set: (index + 1).toString(),
        weight: set.weight.toString(),
        reps: set.reps.toString(),
        notes: set.notes
      })),
      detailSets: exercise.sets.map((set, index) => ({
        id: index + 1,
        weight: set.weight,
        reps: set.reps,
        notes: set.notes
      }))
    }));
    
    onAddToCurrentSession(exercisesToAdd);
  };



  const getTotalSets = () => {
    if (!workout.exercises || workout.exercises.length === 0) return 0;
    return workout.exercises.reduce((total, exercise) => {
      if (!exercise.sets || !Array.isArray(exercise.sets)) return total;
      return total + exercise.sets.length;
    }, 0);
  };

  const getTotalReps = () => {
    if (!workout.exercises || workout.exercises.length === 0) return 0;
    return workout.exercises.reduce((total, exercise) => {
      if (!exercise.sets || !Array.isArray(exercise.sets)) return total;
      return total + exercise.sets.reduce((setTotal, set) => setTotal + (set.reps || 0), 0);
    }, 0);
  };

  const getTotalVolume = () => {
    if (!workout.exercises || workout.exercises.length === 0) return 0;
    return workout.exercises.reduce((total, exercise) => {
      if (!exercise.sets || !Array.isArray(exercise.sets)) return total;
      return total + exercise.sets.reduce((setTotal, set) => setTotal + ((set.weight || 0) * (set.reps || 0)), 0);
    }, 0);
  };

  const handleEditTitle = () => {
    setIsEditingTitle(true);
    setEditedTitle(workout.title);
  };

  const handleSaveTitle = () => {
    const trimmedTitle = editedTitle.trim();
    if (trimmedTitle && trimmedTitle !== workout.title) {
      onUpdateWorkoutTitle(workout.id, trimmedTitle);
    }
    setIsEditingTitle(false);
  };

  const handleCancelEdit = () => {
    setIsEditingTitle(false);
    setEditedTitle(workout.title);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  // Auto-focus the input when editing starts
  useEffect(() => {
    if (isEditingTitle && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingTitle]);

  return (
    <div className="bg-background relative w-full h-dvh max-w-[440px] mx-auto overflow-hidden flex flex-col">
      <StatusBar />
      
      {/* Header */}
      <div className="px-6 py-4 mt-14 flex-shrink-0">
        <div className="flex items-center">
          <button 
            onClick={onBack}
            className="p-2 -m-2 hover:bg-accent rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
        </div>
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 pb-6">
          {/* Workout Header Info */}
          <div className="card-uber p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-3xl">🏋🏼‍♂️</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {isEditingTitle ? (
                    <>
                      <input
                        ref={inputRef}
                        type="text"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        onKeyDown={handleKeyDown}
                        maxLength={30}
                        className="flex-1 bg-transparent text-foreground text-xl font-medium border-b border-border focus:border-primary outline-none"
                      />
                      <button
                        onClick={handleSaveTitle}
                        className="p-1 hover:bg-accent rounded-md transition-colors"
                      >
                        <Check className="w-4 h-4 text-primary" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-1 hover:bg-accent rounded-md transition-colors"
                      >
                        <X className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </>
                  ) : (
                    <>
                      <h2 className="text-foreground flex-1">{workout.title}</h2>
                      <button
                        onClick={handleEditTitle}
                        className="p-1 hover:bg-accent rounded-md transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{workout.date}, {workout.day}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{workout.time}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Activity className="w-4 h-4" />
                    <span>{workout.duration}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
              <div className="text-center">
                <div className="text-xl text-foreground">{getTotalSets()}</div>
                <div className="text-xs text-muted-foreground">Sets</div>
              </div>
              <div className="text-center">
                <div className="text-xl text-foreground">{getTotalReps()}</div>
                <div className="text-xs text-muted-foreground">Reps</div>
              </div>
              <div className="text-center">
                <div className="text-xl text-foreground">{getTotalVolume().toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Volume</div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="mb-6">
            <button
              onClick={handleAddToCurrentSession}
              className="button-uber-secondary w-full h-12 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add to Current Session</span>
            </button>
          </div>

          {/* Exercise Details */}
          <div className="space-y-4">
            <h3 className="text-muted-foreground">Exercise Details</h3>
            
            {workout.exercises && workout.exercises.length > 0 ? workout.exercises.map((exercise, exerciseIndex) => {
              const exerciseSets = exercise.sets || [];
              return (
                <div key={exerciseIndex} className="card-uber p-6">
                  {/* Exercise Header */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-2xl">💪</span>
                    </div>
                    <div>
                      <h4 className="text-foreground">{exercise.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {exerciseSets.length} sets completed
                      </p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-border mb-4"></div>

                  {exerciseSets.length > 0 ? (
                    <>
                      {/* Sets Table */}
                      <div className="space-y-2">
                        {/* Headers */}
                        <div className="grid grid-cols-12 gap-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                          <div className="col-span-1">Set</div>
                          <div className="col-span-2 text-center">WGT</div>
                          <div className="col-span-2 text-center">Reps</div>
                          <div className="col-span-7">Notes</div>
                        </div>

                        {/* Data Rows */}
                        {exerciseSets.map((set, setIndex) => (
                          <div key={setIndex} className="grid grid-cols-12 gap-2 py-2 text-sm">
                            <div className="col-span-1 text-center text-muted-foreground">
                              {set.set || setIndex + 1}
                            </div>
                            <div className="col-span-2 text-center text-foreground">
                              {formatWeight(set.weight || 0)}
                            </div>
                            <div className="col-span-2 text-center text-foreground">
                              {set.reps || 0}
                            </div>
                            <div className="col-span-7 text-foreground text-sm">
                              {set.notes || '-'}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Exercise Summary */}
                      <div className="mt-4 pt-3 border-t border-border">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Total Sets: </span>
                            <span className="text-foreground">{exerciseSets.length}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Total Reps: </span>
                            <span className="text-foreground">
                              {exerciseSets.reduce((total, set) => total + (set.reps || 0), 0)}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Max Weight: </span>
                            <span className="text-foreground">
                              {formatWeight(exerciseSets.length > 0 ? Math.max(...exerciseSets.map(set => set.weight || 0)) : 0)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No sets recorded for this exercise
                    </div>
                  )}
                </div>
              );
            }) : (
              <div className="text-center py-8 text-muted-foreground">
                No exercises found in this workout
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