"use client";

import React, { useState } from "react";
import { Users, Mail, ArrowRight, ShieldCheck, Home } from "lucide-react";

interface EmailWallProps {
  onLogin: (email: string, name: string) => void;
}

const FAMILY_PRESETS = [
  { email: "alex@family.com", name: "Alex", role: "Household Admin", initial: "A", color: "from-indigo-600 to-purple-600" },
  { email: "mom@family.com", name: "Sarah (Mom)", role: "Family Member", initial: "S", color: "from-purple-600 to-pink-600" },
  { email: "sam@family.com", name: "Sam (Kid)", role: "Family Member", initial: "K", color: "from-pink-600 to-rose-600" },
];

export const EmailWall: React.FC<EmailWallProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      const derivedName = name.trim() || email.split("@")[0];
      onLogin(email.trim().toLowerCase(), derivedName);
    }
  };

  const handleSelectPreset = (presetEmail: string, presetName: string) => {
    onLogin(presetEmail, presetName);
  };

  return (
    <div className="min-h-screen bg-[#080D1A] flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-[#0F172A] border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5">
        
        {/* App Logo & Header */}
        <div className="text-center space-y-2">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Home className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">Where Is My Stuff</h1>
            <p className="text-xs text-slate-400 mt-1">
              The Sharma Household • 1-Tap Login
            </p>
          </div>
        </div>

        {/* 1-Tap Family Member Profiles */}
        <div className="space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>Select Your Profile:</span>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            {FAMILY_PRESETS.map((p) => (
              <button
                key={p.email}
                type="button"
                onClick={() => handleSelectPreset(p.email, p.name)}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 text-left transition-all active:scale-98 group shadow-sm"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${p.color} flex items-center justify-center text-xs font-bold text-white shadow-sm`}>
                    {p.initial}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-indigo-300">
                      {p.name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">{p.email}</div>
                  </div>
                </div>

                <span className="text-[9px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                  {p.role}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="relative flex py-0.5 items-center">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-2 text-[10px] font-medium text-slate-500 uppercase">or custom email</span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {/* Custom Email Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative flex items-center">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3.5" />
            <input
              type="email"
              required
              placeholder="name@family.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-2xl py-2.5 pl-10 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-2xl flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-600/30 transition-all active:scale-98"
          >
            <span>Enter Household</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="text-center text-[10px] text-slate-500 flex items-center justify-center space-x-1 pt-1">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>Email-walled family session</span>
        </div>

      </div>
    </div>
  );
};
