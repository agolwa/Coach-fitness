import svgPaths from "../imports/svg-i6zowjv679";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function SearchBar({ searchQuery, onSearchChange }: SearchBarProps) {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex flex-col gap-2.5 h-12 items-start justify-start px-3 py-2 w-full">
      <div className="box-border content-stretch flex flex-row gap-2.5 items-center justify-start p-0 relative shrink-0 w-full">
        <div
          className="box-border content-stretch flex flex-col items-center justify-center overflow-clip p-0 relative rounded-[80px] shrink-0 w-8"
          data-name="Content"
        >
          <div
            className="box-border content-stretch flex flex-row h-8 items-center justify-center p-0 relative shrink-0 w-full"
            data-name="State-layer"
          >
            <div className="relative shrink-0 size-[19.2px]" data-name="Icon">
              <svg
                className="block size-full"
                fill="none"
                preserveAspectRatio="none"
                viewBox="0 0 20 20"
              >
                <g id="Icon">
                  <path
                    d={svgPaths.p35c33d00}
                    fill="var(--fill-0, black)"
                    fillOpacity="0.6"
                    id="icon"
                  />
                </g>
              </svg>
            </div>
          </div>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search"
          className="css-drekoo flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(0,0,0,0.6)] text-left bg-transparent border-none outline-none flex-1"
        />
      </div>
    </div>
  );
}