import svgPaths from "../imports/svg-vxmeud0kkj";

interface BottomNavigationProps {
  onProfileClick?: () => void;
  onHomeClick?: () => void;
  onActivityClick?: () => void;
  currentScreen?: string;
}

export function BottomNavigation({ onProfileClick, onHomeClick, onActivityClick, currentScreen = 'home' }: BottomNavigationProps) {
  return (
    <div className="relative bg-background">
      {/* Bottom border line */}
      <div className="absolute h-0 left-0 top-0 w-full">
        <div className="absolute bottom-0 left-0 right-0 top-[-1px]">
          <svg
            className="block size-full text-border"
            fill="none"
            preserveAspectRatio="none"
            viewBox="0 0 439 1"
          >
            <line
              id="Line 2"
              stroke="currentColor"
              className="text-border"
              x2="439"
              y1="0.5"
              y2="0.5"
            />
          </svg>
        </div>
      </div>
      
      {/* Navigation Icons */}
      <div className="relative h-14 flex items-center justify-between px-8">
        <button 
          onClick={onHomeClick}
          className={`size-6 hover:opacity-80 transition-opacity ${
            currentScreen === 'home' ? 'text-foreground' : 'text-muted-foreground'
          }`}
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
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
              <path
                d="M9 22V12H15V22"
                id="Vector_2"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </g>
          </svg>
        </button>
        
        <button 
          onClick={onActivityClick}
          className={`size-6 hover:opacity-80 transition-opacity ${
            currentScreen === 'activity' ? 'text-foreground' : 'text-muted-foreground'
          }`}
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
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </g>
          </svg>
        </button>
        
        <button 
          onClick={onProfileClick}
          className={`size-6 hover:opacity-80 transition-opacity ${
            currentScreen === 'profile' ? 'text-foreground' : 'text-muted-foreground'
          }`}
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
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
              <path
                d={svgPaths.p2c19cb00}
                id="Vector_2"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </g>
          </svg>
        </button>
      </div>
    </div>
  );
}