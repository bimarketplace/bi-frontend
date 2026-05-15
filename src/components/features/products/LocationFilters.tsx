import React from "react";
import { State, LGA } from "@/lib/locations";
import CustomDropdown from "@/components/common/CustomDropdown";

interface LocationFiltersProps {
  locationStates: State[];
  locationLgas: LGA[];
  selectedStateId: string;
  selectedLgaId: string;
  handleStateChange: (stateId: string) => void;
  setSelectedLgaId: (lgaId: string) => void;
  isStateOpen: boolean;
  setIsStateOpen: (open: boolean) => void;
  isLgaOpen: boolean;
  setIsLgaOpen: (open: boolean) => void;
  setLocationLgas: (lgas: LGA[]) => void;
  setSelectedStateId: (id: string) => void;
}

export default function LocationFilters({
  locationStates,
  locationLgas,
  selectedStateId,
  selectedLgaId,
  handleStateChange,
  setSelectedLgaId,
  isStateOpen,
  setIsStateOpen,
  isLgaOpen,
  setIsLgaOpen,
  setLocationLgas,
  setSelectedStateId
}: LocationFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 mt-2">
      <CustomDropdown 
        placeholder="All States"
        value={selectedStateId}
        options={locationStates}
        onSelect={handleStateChange}
        isOpen={isStateOpen}
        setIsOpen={setIsStateOpen}
      />

      <CustomDropdown 
        placeholder="All LGAs"
        value={selectedLgaId}
        options={locationLgas}
        onSelect={setSelectedLgaId}
        isOpen={isLgaOpen}
        setIsOpen={setIsLgaOpen}
        disabled={!selectedStateId}
      />

      {(selectedStateId || selectedLgaId) && (
        <button
          onClick={() => {
            setSelectedStateId("");
            setSelectedLgaId("");
            setLocationLgas([]);
          }}
          className="px-4 py-2 text-[12px] font-bold text-red-500 hover:bg-red-50 rounded-full transition-colors flex items-center gap-1"
        >
          <span>✕</span> Clear Filters
        </button>
      )}
    </div>
  );
}
