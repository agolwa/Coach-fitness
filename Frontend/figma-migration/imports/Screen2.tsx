import svgPaths from "./svg-vxmeud0kkj";

function MicFrame() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-4 items-center justify-start p-0 relative size-full"
      data-name="mic frame"
    >
      <div className="flex items-center justify-center relative shrink-0">
        <div className="flex-none rotate-[180deg] scale-y-[-100%]">
          <div className="relative size-[180px]">
            <svg
              className="block size-full"
              fill="none"
              preserveAspectRatio="none"
              viewBox="0 0 180 180"
            >
              <circle
                cx="90"
                cy="90"
                fill="var(--fill-0, #3DB7CC)"
                id="Ellipse 1"
                r="90"
              />
            </svg>
          </div>
        </div>
      </div>
      <div
        className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] min-w-full not-italic relative shrink-0 text-[16px] text-[rgba(0,0,0,0.87)] text-center"
        style={{ width: "min-content" }}
      >
        <p className="block leading-[1.4]">tap to speak/add exercise</p>
      </div>
      <div
        className="absolute left-[74px] overflow-clip size-12 top-[71px]"
        data-name="Mic"
      >
        <div
          className="absolute bottom-[4.167%] left-[20.833%] right-[20.833%] top-[4.167%]"
          data-name="Icon"
        >
          <div
            className="absolute bottom-[-4.545%] left-[-7.143%] right-[-7.143%] top-[-4.545%]"
            style={
              { "--stroke-0": "rgba(255, 255, 255, 1)" } as React.CSSProperties
            }
          >
            <svg
              className="block size-full"
              fill="none"
              preserveAspectRatio="none"
              role="presentation"
              viewBox="0 0 32 48"
            >
              <path
                d={svgPaths.p168c4100}
                id="Icon"
                stroke="var(--stroke-0, white)"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="4"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Wifi() {
  return (
    <div
      className="[grid-area:1_/_1] ml-0 mt-0 relative size-[17px]"
      data-name="Wifi"
    >
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 17 17"
      >
        <g id="Wifi">
          <g id="Path"></g>
          <g id="Rectangle"></g>
          <g id="Path_2"></g>
          <path
            d={svgPaths.p34567080}
            fill="var(--fill-0, #1D1B20)"
            id="Path_3"
            opacity="0.1"
          />
        </g>
      </svg>
    </div>
  );
}

function Signal() {
  return (
    <div
      className="[grid-area:1_/_1] ml-[34.783%] mt-0 relative size-[17px]"
      data-name="Signal"
    >
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 17 17"
      >
        <g id="Signal">
          <g id="Path"></g>
          <path
            d={svgPaths.p112c6500}
            fill="var(--fill-0, #1D1B20)"
            id="Path_2"
          />
        </g>
      </svg>
    </div>
  );
}

function Battery() {
  return (
    <div
      className="[grid-area:1_/_1] h-[15px] ml-[38px] mt-px relative w-2"
      data-name="Battery"
    >
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 8 15"
      >
        <g id="Battery">
          <path
            d={svgPaths.p2dfd100}
            fill="var(--fill-0, #1D1B20)"
            id="Base"
            opacity="0.3"
          />
          <path
            d={svgPaths.p2657cc00}
            fill="var(--fill-0, #1D1B20)"
            id="Charge"
          />
        </g>
      </svg>
    </div>
  );
}

function RightIcons() {
  return (
    <div
      className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0"
      data-name="right icons"
    >
      <Wifi />
      <Signal />
      <Battery />
    </div>
  );
}

function BuildingBlocksStatusBar() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-row h-[52px] items-end justify-between left-[-0.5px] px-6 py-2.5 top-0 w-[440px]"
      data-name=".Building Blocks/status-bar"
    >
      <div
        className="css-mrh0t0 flex flex-col font-['Roboto:Medium',_sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#1d1b20] text-[14px] text-left text-nowrap tracking-[0.14px]"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="adjustLetterSpacing block leading-[20px] whitespace-pre">
          9:30
        </p>
      </div>
      <RightIcons />
      <div
        className="absolute left-1/2 size-6 top-[18px] translate-x-[-50%]"
        data-name="Camera Cutout"
      >
        <svg
          className="block size-full"
          fill="none"
          preserveAspectRatio="none"
          role="presentation"
          viewBox="0 0 24 24"
        >
          <path
            clipRule="evenodd"
            d={svgPaths.p34df7200}
            fill="var(--fill-0, #1D1B20)"
            fillRule="evenodd"
            id="Camera Cutout"
          />
        </svg>
      </div>
    </div>
  );
}

function Frame8() {
  return (
    <div className="box-border content-stretch flex flex-row gap-[13px] items-center justify-center p-0 relative shrink-0">
      <div className="relative shrink-0 size-3.5" data-name="icon">
        <svg
          className="block size-full"
          fill="none"
          preserveAspectRatio="none"
          role="presentation"
          viewBox="0 0 14 14"
        >
          <path d={svgPaths.p2ccb20} fill="var(--fill-0, #49454F)" id="icon" />
        </svg>
      </div>
      <div
        className="flex flex-col font-['Roboto:Medium',_sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#49454f] text-[16px] text-left text-nowrap tracking-[0.15px]"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="adjustLetterSpacing block leading-[24px] whitespace-pre">
          Add exercise
        </p>
      </div>
    </div>
  );
}

function AddExerciseButton() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-row gap-2.5 h-14 items-center justify-center left-6 px-[136px] py-4 rounded top-[427px] w-[394px]"
      data-name="add exercise button"
    >
      <div className="absolute border border-[rgba(0,0,0,0.87)] border-solid inset-0 pointer-events-none rounded" />
      <Frame8 />
    </div>
  );
}

function Frame9() {
  return (
    <div className="box-border content-stretch flex flex-row gap-[13px] items-center justify-start p-0 relative shrink-0">
      <div
        className="flex flex-col font-['Roboto:Medium',_sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#49454f] text-[16px] text-left tracking-[0.15px] w-[95px]"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="adjustLetterSpacing block leading-[24px]">End workout</p>
      </div>
    </div>
  );
}

function EndWorkoutButton() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-row gap-2.5 h-14 items-center justify-center left-[22px] px-[136px] py-4 rounded top-[1049px] w-[394px]"
      data-name="end workout button"
    >
      <div className="absolute border border-[rgba(0,0,0,0.87)] border-solid inset-0 pointer-events-none rounded" />
      <Frame9 />
    </div>
  );
}

function ExerciseFrame() {
  return (
    <div className="relative shrink-0 size-12" data-name="exercise frame">
      <div
        className="absolute flex flex-col font-['Roboto:Medium',_sans-serif] font-medium justify-center leading-[0] left-[12.667px] text-[#000000] text-[22.667px] text-left text-nowrap top-[26px] tracking-[0.2125px] translate-y-[-50%]"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="adjustLetterSpacing block leading-[34px] whitespace-pre">
          🏋🏼‍♂️
        </p>
      </div>
    </div>
  );
}

function ExerciseName() {
  return (
    <div
      className="basis-0 box-border content-stretch flex flex-row gap-2.5 grow items-center justify-center min-h-px min-w-px p-0 relative shrink-0"
      data-name="Exercise name"
    >
      <div className="basis-0 css-bjxpgb flex flex-col font-['Inter:SemiBold',_sans-serif] grow justify-center leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[16px] text-[rgba(0,0,0,0.87)] text-left">
        <p className="block leading-[24px]">
          Alternating bicep curl with dumbells
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
            stroke="var(--stroke-0, black)"
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

function IconAndExerciseName() {
  return (
    <div
      className="basis-0 box-border content-stretch flex flex-row gap-2 grow items-center justify-start min-h-px min-w-px p-0 relative shrink-0"
      data-name="icon and exercise name"
    >
      <ExerciseFrame />
      <ExerciseName />
      <EditFrame />
    </div>
  );
}

function TopBar() {
  return (
    <div
      className="box-border content-stretch flex flex-row gap-2 items-center justify-start p-0 relative shrink-0 w-full"
      data-name="Top bar"
    >
      <IconAndExerciseName />
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

function Frame20() {
  return (
    <div className="box-border content-stretch flex flex-col font-['Open_Sans:Regular',_sans-serif] font-normal gap-2 h-full items-center justify-start leading-[0] p-0 relative shrink-0 text-center tracking-[0.5px] w-[18px]">
      <div
        className="flex flex-col justify-center relative shrink-0 text-[10px] text-[rgba(0,0,0,0.47)] w-full"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="block leading-[16px]">SET</p>
      </div>
      <div
        className="flex flex-col justify-center relative shrink-0 text-[12px] text-[rgba(0,0,0,0.87)] w-full"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="block leading-[16px]">01</p>
      </div>
      <div
        className="flex flex-col justify-center relative shrink-0 text-[12px] text-[rgba(0,0,0,0.87)] w-full"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="block leading-[16px]">01</p>
      </div>
      <div
        className="flex flex-col justify-center relative shrink-0 text-[12px] text-[rgba(0,0,0,0.87)] w-full"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="block leading-[16px]">01</p>
      </div>
    </div>
  );
}

function Frame24() {
  return (
    <div className="box-border content-stretch flex flex-col font-['Open_Sans:Regular',_sans-serif] font-normal gap-2 items-center justify-start leading-[0] p-0 relative shrink-0 text-center tracking-[0.5px] w-[47px]">
      <div
        className="flex flex-col justify-center relative shrink-0 text-[10px] text-[rgba(0,0,0,0.47)] w-full"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="block leading-[16px]">WEIGHTS</p>
      </div>
      <div
        className="flex flex-col justify-center relative shrink-0 text-[12px] text-[rgba(0,0,0,0.87)] w-full"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="block leading-[16px]">50 kg</p>
      </div>
      <div
        className="flex flex-col justify-center relative shrink-0 text-[12px] text-[rgba(0,0,0,0.87)] w-full"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="block leading-[16px]">50 kg</p>
      </div>
      <div
        className="flex flex-col justify-center relative shrink-0 text-[12px] text-[rgba(0,0,0,0.87)] w-full"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="block leading-[16px]">50 kg</p>
      </div>
      <div
        className="flex flex-col justify-center relative shrink-0 text-[12px] text-[rgba(0,0,0,0.87)] w-full"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="block leading-[16px]">50 kg</p>
      </div>
    </div>
  );
}

function Frame21() {
  return (
    <div className="box-border content-stretch flex flex-col font-['Open_Sans:Regular',_sans-serif] font-normal gap-2 h-full items-center justify-start leading-[0] p-0 relative shrink-0 text-center tracking-[0.5px] w-[25px]">
      <div
        className="flex flex-col justify-center relative shrink-0 text-[10px] text-[rgba(0,0,0,0.47)] w-full"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="block leading-[16px]">REPS</p>
      </div>
      <div
        className="flex flex-col justify-center relative shrink-0 text-[12px] text-[rgba(0,0,0,0.87)] w-full"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="block leading-[16px]">10</p>
      </div>
      <div
        className="flex flex-col justify-center relative shrink-0 text-[12px] text-[rgba(0,0,0,0.87)] w-full"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="block leading-[16px]">20</p>
      </div>
    </div>
  );
}

function Frame22() {
  return (
    <div className="box-border content-stretch flex flex-col font-['Open_Sans:Regular',_sans-serif] font-normal gap-2 h-full items-center justify-start leading-[0] p-0 relative shrink-0 text-left tracking-[0.5px] w-[178px]">
      <div
        className="flex flex-col justify-center relative shrink-0 text-[10px] text-[rgba(0,0,0,0.47)] w-full"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="block leading-[16px]">Notes</p>
      </div>
      <div
        className="flex flex-col justify-center relative shrink-0 text-[12px] text-[rgba(0,0,0,0.87)] w-full"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="block leading-[16px]">this is only 1 line container</p>
      </div>
      <div
        className="flex flex-col justify-center relative shrink-0 text-[12px] text-[rgba(0,0,0,0.87)] w-full"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="block leading-[16px]">this is only 1 line container</p>
      </div>
    </div>
  );
}

function Frame26() {
  return (
    <div className="box-border content-stretch flex flex-row items-center justify-between p-0 relative shrink-0 w-full">
      <div className="flex flex-row items-center self-stretch">
        <Frame20 />
      </div>
      <Frame24 />
      <div className="flex flex-row items-center self-stretch">
        <Frame21 />
      </div>
      <div className="flex flex-row items-center self-stretch">
        <Frame22 />
      </div>
    </div>
  );
}

function ExerciseLogCardMaster() {
  return (
    <div
      className="bg-[#ffffff] relative rounded-lg shrink-0 w-full"
      data-name="exercise log card- master"
    >
      <div className="overflow-clip relative size-full">
        <div className="box-border content-stretch flex flex-col gap-4 items-start justify-start px-[15px] py-4 relative w-full">
          <TopBar />
          <Divider />
          <Frame26 />
        </div>
      </div>
      <div className="absolute border border-[#d9d9d9] border-solid inset-0 pointer-events-none rounded-lg" />
    </div>
  );
}

function ExerciseFrame1() {
  return (
    <div className="relative shrink-0 size-12" data-name="exercise frame">
      <div
        className="absolute flex flex-col font-['Roboto:Medium',_sans-serif] font-medium justify-center leading-[0] left-[12.667px] text-[#000000] text-[22.667px] text-left text-nowrap top-[26px] tracking-[0.2125px] translate-y-[-50%]"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="adjustLetterSpacing block leading-[34px] whitespace-pre">
          🏋🏼‍♂️
        </p>
      </div>
    </div>
  );
}

function ExerciseName1() {
  return (
    <div
      className="basis-0 box-border content-stretch flex flex-row gap-2.5 grow items-center justify-center min-h-px min-w-px p-0 relative shrink-0"
      data-name="Exercise name"
    >
      <div className="basis-0 css-bjxpgb flex flex-col font-['Inter:SemiBold',_sans-serif] grow justify-center leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[16px] text-[rgba(0,0,0,0.87)] text-left">
        <p className="block leading-[24px]">
          Alternating bicep curl with dumbells
        </p>
      </div>
    </div>
  );
}

function EditIcon1() {
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
            stroke="var(--stroke-0, black)"
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

function EditFrame1() {
  return (
    <div className="relative shrink-0 size-8" data-name="edit frame">
      <EditIcon1 />
    </div>
  );
}

function IconAndExerciseName1() {
  return (
    <div
      className="basis-0 box-border content-stretch flex flex-row gap-2 grow items-center justify-start min-h-px min-w-px p-0 relative shrink-0"
      data-name="icon and exercise name"
    >
      <ExerciseFrame1 />
      <ExerciseName1 />
      <EditFrame1 />
    </div>
  );
}

function TopBar1() {
  return (
    <div
      className="box-border content-stretch flex flex-row gap-2 items-center justify-start p-0 relative shrink-0 w-full"
      data-name="Top bar"
    >
      <IconAndExerciseName1 />
    </div>
  );
}

function Divider1() {
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

function Frame23() {
  return (
    <div className="box-border content-stretch flex flex-col font-['Open_Sans:Regular',_sans-serif] font-normal gap-2 items-center justify-start leading-[0] p-0 relative shrink-0 text-center tracking-[0.5px] w-[18px]">
      <div
        className="flex flex-col justify-center relative shrink-0 text-[10px] text-[rgba(0,0,0,0.47)] w-full"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="block leading-[16px]">SET</p>
      </div>
      <div
        className="flex flex-col justify-center relative shrink-0 text-[12px] text-[rgba(0,0,0,0.87)] w-full"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="block leading-[16px]">01</p>
      </div>
      <div
        className="flex flex-col justify-center relative shrink-0 text-[12px] text-[rgba(0,0,0,0.87)] w-full"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="block leading-[16px]">01</p>
      </div>
    </div>
  );
}

function Frame27() {
  return (
    <div className="box-border content-stretch flex flex-col font-['Open_Sans:Regular',_sans-serif] font-normal gap-2 items-center justify-start leading-[0] p-0 relative shrink-0 text-center tracking-[0.5px] w-[47px]">
      <div
        className="flex flex-col justify-center relative shrink-0 text-[10px] text-[rgba(0,0,0,0.47)] w-full"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="block leading-[16px]">WEIGHTS</p>
      </div>
      <div
        className="flex flex-col justify-center relative shrink-0 text-[12px] text-[rgba(0,0,0,0.87)] w-full"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="block leading-[16px]">50 kg</p>
      </div>
      <div
        className="flex flex-col justify-center relative shrink-0 text-[12px] text-[rgba(0,0,0,0.87)] w-full"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="block leading-[16px]">50 kg</p>
      </div>
    </div>
  );
}

function Frame28() {
  return (
    <div className="box-border content-stretch flex flex-col font-['Open_Sans:Regular',_sans-serif] font-normal gap-2 items-center justify-start leading-[0] p-0 relative shrink-0 text-center tracking-[0.5px] w-[25px]">
      <div
        className="flex flex-col justify-center relative shrink-0 text-[10px] text-[rgba(0,0,0,0.47)] w-full"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="block leading-[16px]">REPS</p>
      </div>
      <div
        className="flex flex-col justify-center relative shrink-0 text-[12px] text-[rgba(0,0,0,0.87)] w-full"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="block leading-[16px]">10</p>
      </div>
      <div
        className="flex flex-col justify-center relative shrink-0 text-[12px] text-[rgba(0,0,0,0.87)] w-full"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="block leading-[16px]">20</p>
      </div>
    </div>
  );
}

function Frame29() {
  return (
    <div className="box-border content-stretch flex flex-col font-['Open_Sans:Regular',_sans-serif] font-normal gap-2 items-center justify-start leading-[0] p-0 relative shrink-0 text-left tracking-[0.5px] w-[178px]">
      <div
        className="flex flex-col justify-center relative shrink-0 text-[10px] text-[rgba(0,0,0,0.47)] w-full"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="block leading-[16px]">Notes</p>
      </div>
      <div
        className="flex flex-col justify-center relative shrink-0 text-[12px] text-[rgba(0,0,0,0.87)] w-full"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="block leading-[16px]">this is only 1 line container</p>
      </div>
      <div
        className="flex flex-col justify-center relative shrink-0 text-[12px] text-[rgba(0,0,0,0.87)] w-full"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="block leading-[16px]">this is only 1 line container</p>
      </div>
    </div>
  );
}

function Frame30() {
  return (
    <div className="box-border content-stretch flex flex-row items-start justify-between p-0 relative shrink-0 w-full">
      <Frame23 />
      <Frame27 />
      <Frame28 />
      <Frame29 />
    </div>
  );
}

function ExerciseLogCardMaster1() {
  return (
    <div
      className="bg-[#ffffff] relative rounded-lg shrink-0 w-full"
      data-name="exercise log card- master"
    >
      <div className="overflow-clip relative size-full">
        <div className="box-border content-stretch flex flex-col gap-4 items-start justify-start px-[15px] py-4 relative w-full">
          <TopBar1 />
          <Divider1 />
          <Frame30 />
        </div>
      </div>
      <div className="absolute border border-[#d9d9d9] border-solid inset-0 pointer-events-none rounded-lg" />
    </div>
  );
}

function Frame25() {
  return (
    <div className="absolute box-border content-stretch flex flex-col gap-4 items-start justify-start left-6 p-0 top-[541px] w-[392px]">
      <div className="css-lluqhi flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-[rgba(0,0,0,0.6)] text-left w-full">
        <p className="block leading-[24px]">today’s log</p>
      </div>
      <ExerciseLogCardMaster />
      <ExerciseLogCardMaster1 />
    </div>
  );
}

function Activity1() {
  return (
    <div
      className="absolute left-[204px] size-6 top-[1210px]"
      data-name="activity 1"
    >
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 24 24"
      >
        <g id="activity 1">
          <path
            d="M22 12H18L15 21L9 3L6 12H2"
            id="Vector"
            stroke="var(--stroke-0, black)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.37"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function User2() {
  return (
    <div
      className="absolute left-[369px] size-6 top-[1210px]"
      data-name="user 2"
    >
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 24 24"
      >
        <g id="user 2">
          <path
            d={svgPaths.p82039c0}
            id="Vector"
            stroke="var(--stroke-0, black)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.37"
            strokeWidth="2"
          />
          <path
            d={svgPaths.p2c19cb00}
            id="Vector_2"
            stroke="var(--stroke-0, black)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.37"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function Home1() {
  return (
    <div
      className="absolute left-[39px] size-6 top-[1210px]"
      data-name="home 1"
    >
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 24 24"
      >
        <g id="home 1">
          <path
            d={svgPaths.p3039c600}
            id="Vector"
            stroke="var(--stroke-0, black)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d="M9 22V12H15V22"
            id="Vector_2"
            stroke="var(--stroke-0, black)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

export default function Screen2() {
  return (
    <div className="bg-[#ffffff] relative size-full" data-name="Screen 2">
      <BuildingBlocksStatusBar />
      <AddExerciseButton />
      <EndWorkoutButton />
      <div
        className="absolute box-border content-stretch flex flex-col gap-4 items-center justify-start left-[122px] p-0 top-[158px] w-[196px]"
        data-name="mic frame"
      >
        <MicFrame />
      </div>
      <div className="absolute css-1o0wta flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] left-6 not-italic text-[20px] text-[rgba(0,0,0,0.87)] text-left text-nowrap top-24 translate-y-[-50%]">
        <p className="block leading-[30px] whitespace-pre">21st June, Monday</p>
      </div>
      <Frame25 />
      <div className="absolute h-0 left-0 top-[1192px] w-[439px]">
        <div className="absolute bottom-0 left-0 right-0 top-[-1px]">
          <svg
            className="block size-full"
            fill="none"
            preserveAspectRatio="none"
            viewBox="0 0 439 1"
          >
            <line
              id="Line 2"
              stroke="var(--stroke-0, #D9D9D9)"
              x2="439"
              y1="0.5"
              y2="0.5"
            />
          </svg>
        </div>
      </div>
      <Activity1 />
      <User2 />
      <Home1 />
    </div>
  );
}