import { useState } from "react";
import { ArrowLeft, Minus, Plus } from "lucide-react";
import { StatusBar } from "./StatusBar";

interface Set {
  id: number;
  weight: number;
  reps: number;
  notes: string;
}

interface ExerciseDetailScreenProps {
  exerciseName: string;
  sets: Set[];
  onBack: () => void;
  onUpdateSets: (sets: Set[]) => void;
}

export function ExerciseDetailScreen({ exerciseName, sets, onBack, onUpdateSets }: ExerciseDetailScreenProps) {
  const [weight, setWeight] = useState(50);
  const [reps, setReps] = useState(8);
  const [notes, setNotes] = useState("");
  const [selectedSetId, setSelectedSetId] = useState<number | null>(null);
  const [currentSets, setCurrentSets] = useState<Set[]>(sets);
  
  // States for input editing
  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [isEditingReps, setIsEditingReps] = useState(false);
  const [weightInput, setWeightInput] = useState(weight.toString());
  const [repsInput, setRepsInput] = useState(reps.toString());
  
  // States for tracking original values to detect changes
  const [originalWeight, setOriginalWeight] = useState<number | null>(null);
  const [originalReps, setOriginalReps] = useState<number | null>(null);
  const [originalNotes, setOriginalNotes] = useState<string>("");

  const validateNumericInput = (value: string): boolean => {
    // Allow empty string, numbers, and single decimal point
    return /^$|^\d*\.?\d*$/.test(value) && (value.match(/\./g) || []).length <= 1;
  };

  const handleWeightChange = (delta: number) => {
    setWeight(prev => Math.max(0, prev + delta));
  };

  const handleRepsChange = (delta: number) => {
    setReps(prev => Math.max(0, prev + delta));
  };

  const handleWeightInputChange = (value: string) => {
    if (validateNumericInput(value)) {
      setWeightInput(value);
    }
  };

  const handleRepsInputChange = (value: string) => {
    if (validateNumericInput(value)) {
      setRepsInput(value);
    }
  };

  const handleWeightInputSubmit = () => {
    const numValue = parseFloat(weightInput);
    if (!isNaN(numValue) && numValue >= 0) {
      setWeight(numValue);
    } else {
      setWeightInput(weight.toString());
    }
    setIsEditingWeight(false);
  };

  const handleRepsInputSubmit = () => {
    const numValue = parseInt(repsInput);
    if (!isNaN(numValue) && numValue >= 0) {
      setReps(numValue);
    } else {
      setRepsInput(reps.toString());
    }
    setIsEditingReps(false);
  };

  const handleWeightClick = () => {
    setWeightInput(weight.toString());
    setIsEditingWeight(true);
  };

  const handleRepsClick = () => {
    setRepsInput(reps.toString());
    setIsEditingReps(true);
  };

  const handleSetSelect = (setId: number) => {
    // If the same set is already selected, deselect it (toggle functionality)
    if (selectedSetId === setId) {
      setSelectedSetId(null);
      setWeight(50);
      setReps(8);
      setNotes("");
      setWeightInput("50");
      setRepsInput("8");
      setOriginalWeight(null);
      setOriginalReps(null);
      setOriginalNotes("");
      return;
    }

    // Select new set and store original values for change detection
    const selectedSet = currentSets.find(set => set.id === setId);
    if (selectedSet) {
      setSelectedSetId(setId);
      setWeight(selectedSet.weight);
      setReps(selectedSet.reps);
      setNotes(selectedSet.notes);
      setWeightInput(selectedSet.weight.toString());
      setRepsInput(selectedSet.reps.toString());
      
      // Store original values for change detection
      setOriginalWeight(selectedSet.weight);
      setOriginalReps(selectedSet.reps);
      setOriginalNotes(selectedSet.notes);
    }
  };

  const handleAddSet = () => {
    const newSet: Set = {
      id: Date.now(),
      weight,
      reps,
      notes
    };
    const updatedSets = [...currentSets, newSet];
    setCurrentSets(updatedSets);
    onUpdateSets(updatedSets);
    
    // Reset form
    setWeight(50);
    setReps(8);
    setNotes("");
    setWeightInput("50");
    setRepsInput("8");
  };

  const handleUpdateSet = () => {
    if (selectedSetId === null) return;
    
    const updatedSets = currentSets.map(set => 
      set.id === selectedSetId 
        ? { ...set, weight, reps, notes }
        : set
    );
    setCurrentSets(updatedSets);
    onUpdateSets(updatedSets);
    
    // Reset selection and form
    setSelectedSetId(null);
    setWeight(50);
    setReps(8);
    setNotes("");
    setWeightInput("50");
    setRepsInput("8");
    setOriginalWeight(null);
    setOriginalReps(null);
    setOriginalNotes("");
  };

  const handleDeleteSet = () => {
    if (selectedSetId === null) return;
    
    const updatedSets = currentSets.filter(set => set.id !== selectedSetId);
    setCurrentSets(updatedSets);
    onUpdateSets(updatedSets);
    
    // Reset selection and form
    setSelectedSetId(null);
    setWeight(50);
    setReps(8);
    setNotes("");
    setWeightInput("50");
    setRepsInput("8");
    setOriginalWeight(null);
    setOriginalReps(null);
    setOriginalNotes("");
  };

  const handleScreenClick = () => {
    if (selectedSetId !== null) {
      setSelectedSetId(null);
      setWeight(50);
      setReps(8);
      setNotes("");
      setWeightInput("50");
      setRepsInput("8");
      setOriginalWeight(null);
      setOriginalReps(null);
      setOriginalNotes("");
    }
    // Close any open inputs
    if (isEditingWeight) {
      handleWeightInputSubmit();
    }
    if (isEditingReps) {
      handleRepsInputSubmit();
    }
  };

  const isUpdateMode = selectedSetId !== null;
  const isDeleteEnabled = selectedSetId !== null;
  
  // Helper function to detect if any changes were made
  const hasChanges = () => {
    if (!isUpdateMode || originalWeight === null || originalReps === null) {
      return false;
    }
    
    return (
      weight !== originalWeight ||
      reps !== originalReps ||
      notes !== originalNotes
    );
  };
  
  const isUpdateEnabled = isUpdateMode && hasChanges();

  return (
    <div 
      className="bg-background relative w-full h-dvh max-w-[440px] mx-auto overflow-hidden flex flex-col"
      onClick={handleScreenClick}
    >
      <StatusBar />
      
      {/* Header */}
      <div className="px-6 py-4 mt-14 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 -m-2 hover:bg-accent rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <h1 className="text-foreground">{exerciseName}</h1>
        </div>
      </div>

      {/* Today Section */}
      <div className="px-6 py-4 flex-shrink-0">
        <div className="relative inline-block">
          <h2 className="text-muted-foreground pb-2">Today</h2>
          <div className="absolute bottom-0 left-0 w-12 h-1 bg-primary rounded-full"></div>
        </div>
      </div>

      {/* Weight and Reps Controls */}
      <div className="px-6 py-6 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        <div className="grid grid-cols-2 gap-8">
          {/* Weight Control */}
          <div className="space-y-4">
            <label className="block text-muted-foreground uppercase tracking-wider">
              Weight (KG)
            </label>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => handleWeightChange(-1)}
                className="w-12 h-12 border border-border rounded-lg flex items-center justify-center hover:bg-accent transition-colors"
              >
                <Minus className="w-5 h-5 text-muted-foreground" />
              </button>
              
              {isEditingWeight ? (
                <input
                  type="text"
                  value={weightInput}
                  onChange={(e) => handleWeightInputChange(e.target.value)}
                  onBlur={handleWeightInputSubmit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleWeightInputSubmit();
                    } else if (e.key === 'Escape') {
                      setWeightInput(weight.toString());
                      setIsEditingWeight(false);
                    }
                  }}
                  className="text-4xl font-medium text-foreground min-w-[80px] text-center bg-transparent border-b-2 border-primary outline-none"
                  autoFocus
                />
              ) : (
                <button
                  onClick={handleWeightClick}
                  className="text-4xl font-medium text-foreground min-w-[80px] text-center hover:bg-accent/50 rounded px-2 py-1 transition-colors"
                >
                  {weight}
                </button>
              )}
              
              <button
                onClick={() => handleWeightChange(1)}
                className="w-12 h-12 border border-border rounded-lg flex items-center justify-center hover:bg-accent transition-colors"
              >
                <Plus className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Reps Control */}
          <div className="space-y-4">
            <label className="block text-muted-foreground uppercase tracking-wider">
              Reps
            </label>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => handleRepsChange(-1)}
                className="w-12 h-12 border border-border rounded-lg flex items-center justify-center hover:bg-accent transition-colors"
              >
                <Minus className="w-5 h-5 text-muted-foreground" />
              </button>
              
              {isEditingReps ? (
                <input
                  type="text"
                  value={repsInput}
                  onChange={(e) => handleRepsInputChange(e.target.value)}
                  onBlur={handleRepsInputSubmit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleRepsInputSubmit();
                    } else if (e.key === 'Escape') {
                      setRepsInput(reps.toString());
                      setIsEditingReps(false);
                    }
                  }}
                  className="text-4xl font-medium text-foreground min-w-[80px] text-center bg-transparent border-b-2 border-primary outline-none"
                  autoFocus
                />
              ) : (
                <button
                  onClick={handleRepsClick}
                  className="text-4xl font-medium text-foreground min-w-[80px] text-center hover:bg-accent/50 rounded px-2 py-1 transition-colors"
                >
                  {reps}
                </button>
              )}
              
              <button
                onClick={() => handleRepsChange(1)}
                className="w-12 h-12 border border-border rounded-lg flex items-center justify-center hover:bg-accent transition-colors"
              >
                <Plus className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Input */}
      <div className="px-6 py-4 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        <div className="space-y-3">
          <label className="block text-muted-foreground uppercase tracking-wider">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this set..."
            className="input-uber w-full h-20 resize-none placeholder:text-muted-foreground"
            rows={3}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 py-4 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={isUpdateMode ? handleUpdateSet : handleAddSet}
            disabled={isUpdateMode && !isUpdateEnabled}
            className={`h-12 transition-colors ${
              isUpdateMode
                ? isUpdateEnabled
                  ? "button-uber-primary"
                  : "button-uber-secondary opacity-50 cursor-not-allowed"
                : "button-uber-primary"
            }`}
          >
            {isUpdateMode ? "Update" : "Add"}
          </button>
          <button
            onClick={handleDeleteSet}
            disabled={!isDeleteEnabled}
            className={`h-12 rounded-md border transition-colors ${
              isDeleteEnabled 
                ? "border-destructive text-destructive bg-transparent hover:bg-destructive/5" 
                : "border-border text-muted-foreground bg-muted cursor-not-allowed"
            }`}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Sets List */}
      <div className="flex-1 px-6 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="space-y-3 pt-3 pb-6">
          {currentSets.map((set, index) => (
            <button
              key={set.id}
              onClick={(e) => {
                e.stopPropagation();
                handleSetSelect(set.id);
              }}
              className={`card-uber w-full p-4 text-left transition-all duration-200 relative ${
                selectedSetId === set.id
                  ? "ring-2 ring-primary bg-primary/5"
                  : "hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5"
              }`}
              style={{ zIndex: selectedSetId === set.id ? 10 : 1 }}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {index + 1}
                      </span>
                    </div>
                    <span className="text-foreground">
                      {set.weight} kg
                    </span>
                  </div>
                  <span className="text-foreground">
                    {set.reps} reps
                  </span>
                </div>
                {set.notes && (
                  <div className="text-sm text-muted-foreground truncate pl-12">
                    {set.notes}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>


    </div>
  );
}