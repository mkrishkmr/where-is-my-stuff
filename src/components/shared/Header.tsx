"use client";

import React from "react";
import { ShieldCheck, User, LogOut, Home, Sparkles } from "lucide-react";

interface HeaderProps {
  userEmail: string;
  userName: string;
  onLogout: () => void;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
  itemCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  userEmail,
  userName,
  onLogout,
  isDemoMode,
  onToggleDemoMode,
  itemCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#080D1A]/85 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
        
        {/* Brand & Dynamic Household Status */}
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
            <Home className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-sm tracking-tight text-white">Where Is My Stuff</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <div className="text-[10px] font-medium text-slate-400 flex items-center space-x-1">
              <span>The Sharma Household</span>
              <span>•</span>
              <span className="text-indigo-400">{itemCount} items</span>
            </div>
          </div>
        </div>

        {/* User Pill & Stage Mode Toggle */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={onToggleDemoMode}
            className={`px-2 py-1 rounded-full text-[10px] font-bold border transition-all flex items-center space-x-1 ${
              isDemoMode
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/20"
                : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
            title="Toggle Stage Safe Mode"
          >
            <ShieldCheck className="w-3 h-3 text-amber-400" />
            <span>{isDemoMode ? "Safe Mode" : "Live"}</span>
          </button>

          {/* User Profile Pill */}
          <div className="flex items-center space-x-1.5 pl-2 border-l border-slate-800/80">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={onLogout}
              title="Logout / Switch Profile"
              className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};
