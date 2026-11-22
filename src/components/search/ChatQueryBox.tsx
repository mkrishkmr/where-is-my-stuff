"use client";

import React, { useState } from "react";
import { Search, Sparkles, Send, Loader2, Compass, MessageSquare } from "lucide-react";
import { ItemCard } from "./ItemCard";
import { Item, SearchQueryResponse } from "@/types";

interface ChatQueryBoxProps {
  userEmail: string;
  isDemoMode: boolean;
  prefillQuery?: string;
  onItemUpdated?: () => void;
}

const FAMILY_PROMPT_CHIPS = [
  "where did we put the spare house keys?",
  "that black cable for connecting my laptop to the TV",
  "where is my blue passport for the flight?",
  "where are the extra AA batteries?",
  "white fast charger for my phone in the bedroom",
];

export const ChatQueryBox: React.FC<ChatQueryBoxProps> = ({
  userEmail,
  isDemoMode,
  prefillQuery,
  onItemUpdated,
}) => {
  const [query, setQuery] = useState(prefillQuery || "");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SearchQueryResponse | null>(null);

  const handleSearch = async (queryText: string) => {
    if (!queryText.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: queryText.trim(),
          userEmail,
          isDemo: isDemoMode,
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Search query error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  return (
    <div className="space-y-4">
      
      {/* Title & Micro-Copy */}
      <div>
        <h2 className="text-base font-bold text-white flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Ask in Plain English</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Ask naturally like texting a family member. Opus 5.5 pinpoints the exact drawer with photo proof.
        </p>
      </div>

      {/* Google Pixel-Style Full-Bleed Search Pill */}
      <form onSubmit={handleFormSubmit} className="relative flex items-center">
        <div className="absolute left-4 text-indigo-400 flex items-center justify-center">
          <Search className="w-4 h-4 text-indigo-400" />
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. 'where is the TV cord?' or 'passport'"
          className="w-full h-13 pl-11 pr-24 py-3.5 bg-slate-900/90 border border-slate-700/80 focus:border-indigo-500 rounded-full text-xs text-white placeholder-slate-400 shadow-lg shadow-black/40 focus:outline-none transition-all"
        />

        <button
          type="submit"
          disabled={!query.trim() || isLoading}
          className="absolute right-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-bold rounded-full flex items-center space-x-1.5 shadow-md shadow-indigo-600/30 transition-all"
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              <span>Ask</span>
              <Send className="w-3 h-3" />
            </>
          )}
        </button>
      </form>

      {/* Tactile Suggestion Chips (Horizontally Scrollable) */}
      <div className="space-y-1.5">
        <div className="flex items-center space-x-1 text-[11px] font-semibold text-slate-400">
          <Compass className="w-3 h-3 text-indigo-400" />
          <span>Try asking:</span>
        </div>
        <div className="flex space-x-1.5 overflow-x-auto pb-1.5 scrollbar-none">
          {FAMILY_PROMPT_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => {
                setQuery(chip);
                handleSearch(chip);
              }}
              className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 hover:border-indigo-500/50 text-[11px] font-medium text-slate-300 hover:text-white whitespace-nowrap transition-all shrink-0"
            >
              &ldquo;{chip}&rdquo;
            </button>
          ))}
        </div>
      </div>

      {/* Assistant Conversational Answer */}
      {result && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-3.5 animate-fadeIn">
          
          {/* Warm Conversational Quote Card */}
          <div className="rounded-3xl bg-indigo-950/40 border border-indigo-500/30 p-4 shadow-xl space-y-2">
            <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-wider text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Opus 5.5 Assistant Response</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-medium">
              &ldquo;{result.answer}&rdquo;
            </p>
          </div>

          {/* Result Matching Item Cards */}
          {result.matches && result.matches.length > 0 && (
            <div className="space-y-2.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Verified Match & Visual Proof</span>
                <span className="text-emerald-400 font-mono text-[10px]">0ms Match</span>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {result.matches.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    currentUser={userEmail.split("@")[0]}
                    onItemUpdated={onItemUpdated}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
