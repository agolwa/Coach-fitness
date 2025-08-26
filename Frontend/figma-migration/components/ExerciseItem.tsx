import svgPaths from "../imports/svg-i6zowjv679";

interface Exercise {
  id: number;
  name: string;
  muscle: string;
  equipment: string;
  selected: boolean;
}

interface ExerciseItemProps {
  exercise: Exercise;
  onToggleSelection: (exerciseId: number) => void;
}

export function ExerciseItem({ exercise, onToggleSelection }: ExerciseItemProps) {
  const isSelected = exercise.selected;
  
  return (
    <button
      onClick={() => onToggleSelection(exercise.id)}
      className={`rounded-lg w-full ${isSelected ? 'bg-[#f7feff]' : 'bg-[#ffffff]'} border ${isSelected ? 'border-[#2fa8bd]' : 'border-[#d9d9d9]'} text-left`}
      data-name="Frame"
    >
      <div className="box-border content-stretch flex flex-col gap-4 items-start justify-start overflow-clip p-4 relative w-full">
        <div
          className="box-border content-stretch flex flex-row gap-2 items-center justify-center p-0 relative shrink-0 w-full"
          data-name="Top bar"
        >
          <div
            className="basis-0 box-border content-stretch flex flex-row gap-2 grow items-center justify-start min-h-px min-w-px p-0 relative shrink-0"
            data-name="icon and exercise name"
          >
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
            <div
              className="basis-0 box-border content-stretch flex flex-col font-['Inter:Regular',_sans-serif] font-normal gap-1 grow items-center justify-center leading-[0] min-h-px min-w-px not-italic p-0 relative shrink-0 text-left"
              data-name="Exercise name"
            >
              <div className="css-1xjrhd flex flex-col justify-center overflow-ellipsis overflow-hidden relative shrink-0 text-[16px] text-[rgba(32,32,32,0.87)] text-nowrap w-full">
                <p className="[text-overflow:inherit] [text-wrap-mode:inherit]\' [white-space-collapse:inherit] block leading-[24px] overflow-inherit">
                  {exercise.name}
                </p>
              </div>
              <div className="flex flex-col justify-center relative shrink-0 text-[12px] text-[rgba(32,32,32,0.6)] w-full">
                <p className="block leading-[18px]">{exercise.muscle}</p>
              </div>
            </div>
            <div className="relative shrink-0 size-5" data-name="edit frame">
              <svg
                className="block size-full"
                fill="none"
                preserveAspectRatio="none"
                viewBox="0 0 20 20"
              >
                <g id="edit frame">
                  {isSelected ? (
                    <>
                      <path
                        d={svgPaths.p371e6400}
                        id="Vector"
                        stroke="var(--stroke-0, #1B97AC)"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                      <path
                        d="M7 7L13 13"
                        id="Vector_2"
                        stroke="var(--stroke-0, #1B97AC)"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                      <path
                        d="M13 7L7 13"
                        id="Vector_3"
                        stroke="var(--stroke-0, #1B97AC)"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                    </>
                  ) : (
                    <path
                      d={svgPaths.p371e6400}
                      id="Square icon"
                      stroke="var(--stroke-0, #202020)"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeOpacity="0.6"
                      strokeWidth="2"
                    />
                  )}
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}