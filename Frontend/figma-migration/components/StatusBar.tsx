import svgPaths from "../imports/svg-vxmeud0kkj";

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
            fill="currentColor"
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
            fill="currentColor"
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
            fill="currentColor"
            id="Base"
            opacity="0.3"
          />
          <path
            d={svgPaths.p2657cc00}
            fill="currentColor"
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

export function StatusBar() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-row h-[52px] items-end justify-between left-[-0.5px] px-6 py-2.5 top-0 w-[440px]"
      data-name=".Building Blocks/status-bar"
    >
      <div
        className="css-mrh0t0 flex flex-col font-['Roboto:Medium',_sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-foreground text-[14px] text-left text-nowrap tracking-[0.14px]"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="adjustLetterSpacing block leading-[20px] whitespace-pre">
          9:30
        </p>
      </div>
      <div className="text-foreground">
        <RightIcons />
      </div>
      <div
        className="absolute left-1/2 size-6 top-[18px] translate-x-[-50%] text-foreground"
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
            fill="currentColor"
            fillRule="evenodd"
            id="Camera Cutout"
          />
        </svg>
      </div>
    </div>
  );
}