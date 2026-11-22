"use client";

import React, { useState } from "react";
import { MapPin, Plus } from "lucide-react";

interface LocationPickerProps {
  selectedLocation: string;
  onSelectLocation: (location: string, room: string) => void;
}

const PRESET_LOCATIONS = [
  { emoji: "🛋", room: "Living Room", spot: "TV Media Console", full: "Living Room — TV Media Console" },
  { emoji: "💼", room: "Office", spot: "Desk Drawer Left", full: "Office — Desk Drawer Left" },
  { emoji: "🚪", room: "Hallway", spot: "Console Top Drawer", full: "Hallway — Console Top Drawer" },
  { emoji: "🛏", room: "Bedroom", spot: "Nightstand Bottom", full: "Bedroom — Nightstand Bottom" },
  { emoji: "🍳", room: "Kitchen", spot: "Entry Key Bowl", full: "Kitchen — Entry Key Bowl" },
  { emoji: "📦", room: "Demo Box", spot: "Stage Demo Pouch", full: "Demo Box — Stage Demo Pouch" },
];

export const LocationPicker: React.FC<LocationPickerProps> = ({
  selectedLocation,
  onSelectLocation,
}) => {
  const [customInput, setCustomInput] = useState("");
  const [isAddingCustom, setIsAddingCustom] = useState(false);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      onSelectLocation(customInput.trim(), "Custom Area");
      setIsAddingCustom(false);
      setCustomInput("");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <label className="font-bold text-slate-300 flex items-center space-x-1.5 text-[11px] uppercase tracking-wider">
          <MapPin className="w-3.5 h-3.5 text-indigo-400" />
          <span>Storage Destination (1-Tap):</span>
        </label>
        <button
          type="button"
          onClick={() => setIsAddingCustom(!isAddingCustom)}
          className="text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 text-[11px] font-semibold"
        >
          <Plus className="w-3 h-3" />
          <span>{isAddingCustom ? "Presets" : "Custom spot"}</span>
        </button>
      </div>

      {!isAddingCustom ? (
        <div className="flex space-x-2 overflow-x-auto pb-1.5 scrollbar-none">
          {PRESET_LOCATIONS.map((loc) => {
            const isSelected = selectedLocation === loc.full;
            return (
              <button
                key={loc.full}
                type="button"
                onClick={() => onSelectLocation(loc.full, loc.room)}
                className={`px-3 py-2 rounded-2xl border text-xs text-left transition-all shrink-0 ${
                  isSelected
                    ? "bg-indigo-600 border-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30 scale-102"
                    : "bg-[#0F172A] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <span className="text-sm">{loc.emoji}</span>
                  <div>
                    <div className="text-[9px] uppercase tracking-wider font-bold opacity-80">{loc.room}</div>
                    <div className="truncate text-xs font-semibold">{loc.spot}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <form onSubmit={handleCustomSubmit} className="flex space-x-2">
          <input
            type="text"
            placeholder="e.g. Master Closet — Top Shelf Shoe Box"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            autoFocus
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-2xl shadow transition-all"
          >
            Save
          </button>
        </form>
      )}
    </div>
  );
};
