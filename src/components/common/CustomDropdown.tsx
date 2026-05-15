"use client";
import React, { useEffect, useRef } from "react";
import { Location01Icon, ArrowDown01Icon } from "hugeicons-react";

const CustomDropdown = ({ 
  value, 
  options, 
  onSelect, 
  isOpen, 
  setIsOpen, 
  placeholder = "Select option",
  disabled = false 
}: { 
  value: string; 
  options: { id: string | number; name: string }[]; 
  onSelect: (val: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsOpen]);

  const selectedOption = options.find(opt => opt.id.toString() === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full sm:w-[180px] px-4 py-2.5 bg-white border rounded-full transition-all duration-200 text-left
          ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:border-[#008000] hover:shadow-sm cursor-pointer'}
          ${isOpen ? 'border-[#008000] ring-4 ring-[#008000]/5' : 'border-gray-200'}
        `}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <Location01Icon size={16} className={value ? "text-[#008000]" : "text-gray-400"} />
          <span className={`text-[13px] font-semibold truncate ${value ? "text-gray-900" : "text-gray-500"}`}>
            {selectedOption ? selectedOption.name : placeholder}
          </span>
        </div>
        <ArrowDown01Icon size={16} className={`transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180 text-[#008000]" : "text-gray-400"}`} />
      </button>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 mt-2 w-full sm:w-[240px] bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-[280px] overflow-y-auto no-scrollbar">
            <button
              onClick={() => { onSelect(""); setIsOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-gray-500 hover:bg-gray-50 hover:text-[#008000] transition-colors"
            >
              {placeholder}
            </button>
            {options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => { onSelect(opt.id.toString()); setIsOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-[13px] font-semibold transition-colors
                  ${value === opt.id.toString() 
                    ? "bg-[#008000]/5 text-[#008000]" 
                    : "text-gray-700 hover:bg-gray-50 hover:text-[#008000]"}
                `}
              >
                {opt.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
