import { ExerciseLogCard } from "./ExerciseLogCard";

interface Set {
  set: string;
  weight: string;
  reps: string;
  notes: string;
}

interface WorkoutExercise {
  id: number;
  name: string;
  sets: Set[];
}

interface TodaysLogProps {
  exercises: WorkoutExercise[];
}

export function TodaysLog({ exercises }: TodaysLogProps) {
  return (
    <div className="absolute box-border content-stretch flex flex-col gap-4 items-start justify-start left-6 p-0 top-[541px] w-[392px]">
      <div className="css-lluqhi flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-[rgba(32,32,32,0.6)] text-left w-full">
        <p className="block leading-[24px]">today's log</p>
      </div>
      {exercises.length === 0 ? (
        <div className="css-lluqhi flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(32,32,32,0.4)] text-left w-full">
          <p className="block leading-[21px]">No exercises added yet. Click "Add exercise" to get started.</p>
        </div>
      ) : (
        exercises.map((exercise) => (
          <ExerciseLogCard key={exercise.id} exercise={exercise} />
        ))
      )}
    </div>
  );
}