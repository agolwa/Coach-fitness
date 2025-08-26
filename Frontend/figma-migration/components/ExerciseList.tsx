import { ExerciseItem } from "./ExerciseItem";

interface Exercise {
  id: number;
  name: string;
  muscle: string;
  equipment: string;
  selected: boolean;
}

interface ExerciseListProps {
  exercises: Exercise[];
  onToggleSelection: (exerciseId: number) => void;
}

export function ExerciseList({ exercises, onToggleSelection }: ExerciseListProps) {
  return (
    <div className="w-full space-y-4">
      {exercises.map((exercise) => (
        <ExerciseItem
          key={exercise.id}
          exercise={exercise}
          onToggleSelection={onToggleSelection}
        />
      ))}
    </div>
  );
}