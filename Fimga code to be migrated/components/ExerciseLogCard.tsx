import svgPaths from "../imports/svg-vxmeud0kkj";

interface Set {
  set: string;
  weight: string;
  reps: string;
  notes: string;
}

interface Exercise {
  id: number;
  name: string;
  sets: Set[];
}

interface ExerciseLogCardProps {
  exercise: Exercise;
}

function ExerciseIcon() {
  return (
    <div className="relative shrink-0 size-12" data-name="exercise frame">
      <div
        className="absolute flex flex-col font-['Roboto:Medium',_sans-serif] font-medium justify-center leading-[0] left-[12.667px] text-[#202020] text-[22.667px] text-left text-nowrap top-[26px] tracking-[0.2125px] translate-y-[-50%]"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="adjustLetterSpacing block leading-[34px] whitespace-pre">
          🏋🏼‍♂️
        </p>
      </div>
    </div>
  );
}

function EditIcon() {
  return (
    <div className="absolute left-2 size-4 top-2" data-name="edit icon">
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 16 16"
      >
        <g clipPath="url(#clip0_2_225)" id="edit icon">
          <path
            d={svgPaths.p5049ff0}
            id="Vector"
            stroke="var(--stroke-0, #202020)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.6"
            strokeWidth="2"
          />
        </g>
        <defs>
          <clipPath id="clip0_2_225">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function EditFrame() {
  return (
    <div className="relative shrink-0 size-8" data-name="edit frame">
      <EditIcon />
    </div>
  );
}

function TopBar({ exerciseName }: { exerciseName: string }) {
  return (
    <div
      className="box-border content-stretch flex flex-row gap-2 items-center justify-start p-0 relative shrink-0 w-full"
      data-name="Top bar"
    >
      <div
        className="basis-0 box-border content-stretch flex flex-row gap-2 grow items-center justify-start min-h-px min-w-px p-0 relative shrink-0"
        data-name="icon and exercise name"
      >
        <ExerciseIcon />
        <div
          className="basis-0 box-border content-stretch flex flex-row gap-2.5 grow items-center justify-center min-h-px min-w-px p-0 relative shrink-0"
          data-name="Exercise name"
        >
          <div className="basis-0 css-bjxpgb flex flex-col font-['Inter:SemiBold',_sans-serif] grow justify-center leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[16px] text-[rgba(32,32,32,0.87)] text-left">
            <p className="block leading-[24px]">{exerciseName}</p>
          </div>
        </div>
        <EditFrame />
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div className="h-0 relative shrink-0 w-full" data-name="divider">
      <div className="absolute bottom-0 left-0 right-0 top-[-0.5px]">
        <svg
          className="block size-full"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 362 1"
        >
          <g id="divider">
            <line
              id="Line 1"
              stroke="var(--stroke-0, #D9D9D9)"
              strokeWidth="0.5"
              x2="362"
              y1="0.75"
              y2="0.75"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}

function DataTable({ sets }: { sets: Set[] }) {
  const maxRows = Math.max(sets.length, 4);
  const paddedSets = [...sets];
  while (paddedSets.length < maxRows) {
    paddedSets.push({ set: "", weight: "", reps: "", notes: "" });
  }

  return (
    <div className="box-border content-stretch flex flex-row items-start justify-between p-0 relative shrink-0 w-full">
      {/* SET Column */}
      <div className="box-border content-stretch flex flex-col font-['Open_Sans:Regular',_sans-serif] font-normal gap-2 items-center justify-start leading-[0] p-0 relative shrink-0 text-center tracking-[0.5px] w-[18px]">
        <div
          className="flex flex-col justify-center relative shrink-0 text-[10px] text-[rgba(32,32,32,0.47)] w-full"
          style={{ fontVariationSettings: "'wdth' 100" }}
        >
          <p className="block leading-[16px]">SET</p>
        </div>
        {paddedSets.map((set, index) => (
          <div
            key={index}
            className="flex flex-col justify-center relative shrink-0 text-[12px] text-[rgba(32,32,32,0.87)] w-full"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            <p className="block leading-[16px]">{set.set}</p>
          </div>
        ))}
      </div>

      {/* WGT Column */}
      <div className="box-border content-stretch flex flex-col font-['Open_Sans:Regular',_sans-serif] font-normal gap-2 items-center justify-start leading-[0] p-0 relative shrink-0 text-center tracking-[0.5px] w-[30px]">
        <div
          className="flex flex-col justify-center relative shrink-0 text-[10px] text-[rgba(32,32,32,0.47)] w-full"
          style={{ fontVariationSettings: "'wdth' 100" }}
        >
          <p className="block leading-[16px]">WGT</p>
        </div>
        {paddedSets.map((set, index) => (
          <div
            key={index}
            className="flex flex-col justify-center relative shrink-0 text-[12px] text-[rgba(32,32,32,0.87)] w-full"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            <p className="block leading-[16px]">{set.weight}</p>
          </div>
        ))}
      </div>

      {/* REPS Column */}
      <div className="box-border content-stretch flex flex-col font-['Open_Sans:Regular',_sans-serif] font-normal gap-2 items-center justify-start leading-[0] p-0 relative shrink-0 text-center tracking-[0.5px] w-[25px]">
        <div
          className="flex flex-col justify-center relative shrink-0 text-[10px] text-[rgba(32,32,32,0.47)] w-full"
          style={{ fontVariationSettings: "'wdth' 100" }}
        >
          <p className="block leading-[16px]">REPS</p>
        </div>
        {paddedSets.map((set, index) => (
          <div
            key={index}
            className="flex flex-col justify-center relative shrink-0 text-[12px] text-[rgba(32,32,32,0.87)] w-full"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            <p className="block leading-[16px]">{set.reps}</p>
          </div>
        ))}
      </div>

      {/* Notes Column */}
      <div className="box-border content-stretch flex flex-col font-['Open_Sans:Regular',_sans-serif] font-normal gap-2 items-start justify-start leading-[0] p-0 relative shrink-0 text-left tracking-[0.5px] w-[195px]">
        <div
          className="flex flex-col justify-center relative shrink-0 text-[10px] text-[rgba(32,32,32,0.47)] w-full"
          style={{ fontVariationSettings: "'wdth' 100" }}
        >
          <p className="block leading-[16px]">Notes</p>
        </div>
        {paddedSets.map((set, index) => (
          <div
            key={index}
            className="flex flex-col justify-center relative shrink-0 text-[12px] text-[rgba(32,32,32,0.87)] w-full"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            <p className="block leading-[16px]">{set.notes}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ExerciseLogCard({ exercise }: ExerciseLogCardProps) {
  return (
    <div
      className="bg-[#ffffff] relative rounded-lg shrink-0 w-full"
      data-name="exercise log card- master"
    >
      <div className="overflow-clip relative size-full">
        <div className="box-border content-stretch flex flex-col gap-4 items-start justify-start px-[15px] py-4 relative w-full">
          <TopBar exerciseName={exercise.name} />
          <Divider />
          <DataTable sets={exercise.sets} />
        </div>
      </div>
      <div className="absolute border border-[#d9d9d9] border-solid inset-0 pointer-events-none rounded-lg" />
    </div>
  );
}