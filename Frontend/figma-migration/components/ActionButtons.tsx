import svgPaths from "../imports/svg-vxmeud0kkj";

function AddExerciseIcon() {
  return (
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
  );
}





function EndWorkoutButton() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-row gap-2.5 h-14 items-center justify-center left-[22px] px-[136px] py-4 rounded top-[1049px] w-[394px]"
      data-name="end workout button"
    >
      <div className="absolute border border-[rgba(0,0,0,0.87)] border-solid inset-0 pointer-events-none rounded" />
      <div className="box-border content-stretch flex flex-row gap-[13px] items-center justify-start p-0 relative shrink-0">
        <div
          className="flex flex-col font-['Roboto:Medium',_sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#49454f] text-[16px] text-left tracking-[0.15px] w-[95px]"
          style={{ fontVariationSettings: "'wdth' 100" }}
        >
          <p className="adjustLetterSpacing block leading-[24px]">End workout</p>
        </div>
      </div>
    </div>
  );
}

export function ActionButtons() {
  return (
    <>
      <EndWorkoutButton />
    </>
  );
}