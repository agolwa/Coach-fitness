import { useState } from "react";
import svgPaths from "../imports/svg-i6zowjv679";

interface FilterDropdownsProps {
  selectedMuscle: string;
  selectedEquipment: string;
  onMuscleChange: (muscle: string) => void;
  onEquipmentChange: (equipment: string) => void;
  muscleOptions: string[];
  equipmentOptions: string[];
}

export function FilterDropdowns({ 
  selectedMuscle, 
  selectedEquipment, 
  onMuscleChange, 
  onEquipmentChange,
  muscleOptions,
  equipmentOptions
}: FilterDropdownsProps) {
  const [showMuscleDropdown, setShowMuscleDropdown] = useState(false);
  const [showEquipmentDropdown, setShowEquipmentDropdown] = useState(false);

  return (
    <div className="flex gap-4 w-full">
      {/* Muscle Filter */}
      <div className="relative flex-1">
        <button
          onClick={() => {
            setShowMuscleDropdown(!showMuscleDropdown);
            setShowEquipmentDropdown(false);
          }}
          className="bg-neutral-100 box-border content-stretch flex flex-row h-12 items-center justify-between px-3 py-[13px] w-full"
        >
          <div className="css-drekoo flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(0,0,0,0.6)] text-left text-nowrap">
            <p className="block leading-[21px] whitespace-pre">{selectedMuscle}</p>
          </div>
          <div className="h-1.5 relative shrink-0 w-2.5" data-name="icons">
            <svg
              className="block size-full"
              fill="none"
              preserveAspectRatio="none"
              viewBox="0 0 10 6"
            >
              <g id="icons" opacity="0.6">
                <path
                  d={svgPaths.p28abd300}
                  fill="var(--fill-0, #0F1111)"
                  id="Vector"
                />
              </g>
            </svg>
          </div>
        </button>
        
        {showMuscleDropdown && (
          <div className="absolute bg-white border border-gray-200 mt-1 rounded shadow-lg w-full z-20 max-h-48 overflow-y-auto">
            {muscleOptions.map((option) => (
              <button
                key={option}
                onClick={() => {
                  onMuscleChange(option);
                  setShowMuscleDropdown(false);
                }}
                className="block w-full px-3 py-2 text-left text-[14px] text-[rgba(0,0,0,0.6)] hover:bg-gray-50"
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Equipment Filter */}
      <div className="relative flex-1">
        <button
          onClick={() => {
            setShowEquipmentDropdown(!showEquipmentDropdown);
            setShowMuscleDropdown(false);
          }}
          className="bg-neutral-100 box-border content-stretch flex flex-row h-12 items-center justify-between px-3.5 py-[13px] w-full"
        >
          <div className="css-drekoo flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(0,0,0,0.6)] text-left text-nowrap">
            <p className="block leading-[21px] whitespace-pre">{selectedEquipment}</p>
          </div>
          <div className="h-1.5 relative shrink-0 w-2.5" data-name="icons">
            <svg
              className="block size-full"
              fill="none"
              preserveAspectRatio="none"
              viewBox="0 0 10 6"
            >
              <g id="icons" opacity="0.6">
                <path
                  d={svgPaths.p28abd300}
                  fill="var(--fill-0, #0F1111)"
                  id="Vector"
                />
              </g>
            </svg>
          </div>
        </button>
        
        {showEquipmentDropdown && (
          <div className="absolute bg-white border border-gray-200 mt-1 rounded shadow-lg w-full z-20 max-h-48 overflow-y-auto">
            {equipmentOptions.map((option) => (
              <button
                key={option}
                onClick={() => {
                  onEquipmentChange(option);
                  setShowEquipmentDropdown(false);
                }}
                className="block w-full px-3 py-2 text-left text-[14px] text-[rgba(0,0,0,0.6)] hover:bg-gray-50"
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}