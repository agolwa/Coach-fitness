import { useState } from "react";
import { ArrowLeft, Check, ChevronDown, Search } from "lucide-react";
import { StatusBar } from "./StatusBar";

interface Exercise {
  id: number;
  name: string;
  muscle: string;
  equipment: string;
  emoji: string;
  selected: boolean;
}

interface AddExercisesScreenProps {
  onClose: () => void;
  onAddExercises: (exercises: Exercise[]) => void;
}

const exercises: Exercise[] = [
  { id: 1, name: "Barbell Squat", muscle: "Legs", equipment: "Barbell", emoji: "🏋🏼‍♂️", selected: false },
  { id: 2, name: "Bench Press", muscle: "Chest", equipment: "Barbell", emoji: "💪", selected: false },
  { id: 3, name: "Deadlift", muscle: "Back", equipment: "Barbell", emoji: "🔥", selected: false },
  { id: 4, name: "Pull-ups", muscle: "Back", equipment: "Bodyweight", emoji: "🤸‍♂️", selected: false },
  { id: 5, name: "Push-ups", muscle: "Chest", equipment: "Bodyweight", emoji: "🤲", selected: false },
  { id: 6, name: "Overhead Press", muscle: "Shoulders", equipment: "Barbell", emoji: "🏆", selected: false },
  { id: 7, name: "Dumbbell Curls", muscle: "Arms", equipment: "Dumbbells", emoji: "💪", selected: false },
  { id: 8, name: "Tricep Dips", muscle: "Arms", equipment: "Bodyweight", emoji: "🦾", selected: false },
  { id: 9, name: "Leg Press", muscle: "Legs", equipment: "Machine", emoji: "🦵", selected: false },
  { id: 10, name: "Lat Pulldown", muscle: "Back", equipment: "Machine", emoji: "⬇️", selected: false },
];

const muscleGroups = ["All", "Chest", "Back", "Legs", "Shoulders", "Arms"];
const equipmentTypes = ["All", "Barbell", "Dumbbells", "Machine", "Bodyweight"];

export function AddExercisesScreen({ onClose, onAddExercises }: AddExercisesScreenProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState("All");
  const [selectedEquipment, setSelectedEquipment] = useState("All");
  const [exerciseList, setExerciseList] = useState<Exercise[]>(exercises);
  const [showMuscleDropdown, setShowMuscleDropdown] = useState(false);
  const [showEquipmentDropdown, setShowEquipmentDropdown] = useState(false);

  const handleExerciseToggle = (exerciseId: number) => {
    setExerciseList(prev =>
      prev.map(exercise =>
        exercise.id === exerciseId
          ? { ...exercise, selected: !exercise.selected }
          : exercise
      )
    );
  };

  const filteredExercises = exerciseList.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMuscle = selectedMuscle === "All" || exercise.muscle === selectedMuscle;
    const matchesEquipment = selectedEquipment === "All" || exercise.equipment === selectedEquipment;
    return matchesSearch && matchesMuscle && matchesEquipment;
  });

  const selectedCount = exerciseList.filter(ex => ex.selected).length;

  const handleAddExercises = () => {
    onAddExercises(exerciseList);
  };

  return (
    <div className="bg-background relative w-full h-dvh max-w-[440px] mx-auto overflow-hidden flex flex-col">
      <StatusBar />
      
      {/* Header */}
      <div className="px-6 py-4 mt-14 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onClose}
              className="p-2 -m-2 rounded-lg"
            >
              <ArrowLeft className="w-6 h-6 text-foreground" />
            </button>
            <h1 className="text-foreground">Add exercises</h1>
          </div>
          {selectedCount > 0 && (
            <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
              {selectedCount}
            </span>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-6 py-4 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-uber w-full pl-12 pr-4 py-3"
          />
        </div>
      </div>

      {/* Filter Dropdowns */}
      <div className="px-6 py-2 flex-shrink-0">
        <div className="grid grid-cols-2 gap-4">
          {/* Muscle Group Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowMuscleDropdown(!showMuscleDropdown);
                setShowEquipmentDropdown(false);
              }}
              className="input-uber w-full flex items-center justify-between py-3"
            >
              <span className={selectedMuscle === "All" ? "text-muted-foreground" : "text-foreground"}>
                {selectedMuscle}
              </span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
            
            {showMuscleDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg z-10">
                {muscleGroups.map((muscle) => (
                  <button
                    key={muscle}
                    onClick={() => {
                      setSelectedMuscle(muscle);
                      setShowMuscleDropdown(false);
                    }}
                    className={`w-full px-3 py-2 text-left first:rounded-t-lg last:rounded-b-lg ${
                      selectedMuscle === muscle ? "bg-primary/10 text-primary" : "text-foreground"
                    }`}
                  >
                    {muscle}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Equipment Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowEquipmentDropdown(!showEquipmentDropdown);
                setShowMuscleDropdown(false);
              }}
              className="input-uber w-full flex items-center justify-between py-3"
            >
              <span className={selectedEquipment === "All" ? "text-muted-foreground" : "text-foreground"}>
                {selectedEquipment}
              </span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
            
            {showEquipmentDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg z-10">
                {equipmentTypes.map((equipment) => (
                  <button
                    key={equipment}
                    onClick={() => {
                      setSelectedEquipment(equipment);
                      setShowEquipmentDropdown(false);
                    }}
                    className={`w-full px-3 py-2 text-left hover:bg-accent transition-colors first:rounded-t-lg last:rounded-b-lg ${
                      selectedEquipment === equipment ? "bg-primary/10 text-primary" : "text-foreground"
                    }`}
                  >
                    {equipment}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Exercise List */}
      <div className="flex-1 px-6 overflow-y-auto">
        <div className="py-4 space-y-3 pb-6">
          {filteredExercises.map((exercise) => (
            <button
              key={exercise.id}
              onClick={() => handleExerciseToggle(exercise.id)}
              className={`card-uber w-full p-4 text-left ${
                exercise.selected
                  ? "ring-2 ring-primary bg-primary/5"
                  : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {/* Exercise Emoji */}
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">{exercise.emoji}</span>
                  </div>
                  
                  {/* Exercise Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-foreground mb-1">{exercise.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{exercise.muscle}</span>
                      <span>•</span>
                      <span>{exercise.equipment}</span>
                    </div>
                  </div>
                </div>
                
                {/* Selection Checkbox */}
                <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                  exercise.selected
                    ? "bg-primary border-primary"
                    : "border-border"
                }`}>
                  {exercise.selected && (
                    <Check className="w-4 h-4 text-primary-foreground" />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Add Button */}
      {selectedCount > 0 && (
        <div className="px-6 py-4 flex-shrink-0">
          <button
            onClick={handleAddExercises}
            className="button-uber-primary w-full h-14"
          >
            Add {selectedCount} exercise{selectedCount > 1 ? 's' : ''}
          </button>
        </div>
      )}
    </div>
  );
}