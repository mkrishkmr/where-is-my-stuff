"use client";

import React, { useEffect, useState } from "react";
import { Clock, ArrowUpRight, X } from "lucide-react";
import { ProactiveNudge } from "@/types";

interface ProactiveBannerProps {
  onFocusItem?: (itemName: string) => void;
}

export const ProactiveBanner: React.FC<ProactiveBannerProps> = ({ onFocusItem }) => {
  const [nudges, setNudges] = useState<ProactiveNudge[]>([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch("/api/nudge")
      .then((res) => res.json())
      .then((data) => {
        if (data.nudges && data.nudges.length > 0) {
          setNudges(data.nudges);
        } else {
          setNudges([]);
        }
      })
      .catch((err) => console.error("Error loading proactive nudges:", err));
  }, []);

  if (nudges.length === 0 || dismissed) return null;

  const current = nudges[0];
  const isExpired = current.title.includes("Due");

  return (
    <div
      className={`rounded-2xl p-3.5 border shadow-lg transition-all ${
        isExpired
          ? "bg-gradient-to-r from-red-950/60 via-[#0F172A] to-red-950/40 border-red-500/30 shadow-red-950/20"
          : "bg-gradient-to-r from-amber-950/60 via-[#0F172A] to-amber-950/40 border-amber-500/30 shadow-amber-950/20"
      }`}
    >
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-start space-x-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border mt-0.5 ${
              isExpired
                ? "bg-red-500/20 text-red-400 border-red-500/30"
                : "bg-amber-500/20 text-amber-400 border-amber-500/30"
            }`}
          >
            <Clock className="w-4 h-4" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-1.5">
              <span
                className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                  isExpired
                    ? "bg-red-500/10 text-red-300 border-red-500/20"
                    : "bg-amber-500/10 text-amber-300 border-amber-500/20"
                }`}
              >
                {current.title}
              </span>
              <span className="text-[10px] text-slate-400">• Return Reminder</span>
            </div>

            <h4 className="text-xs font-bold text-white leading-tight">
              {current.triggerEvent}
            </h4>
            <p className="text-[11px] text-slate-300 leading-snug">
              {current.alertText}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-slate-500 hover:text-slate-300 p-1 shrink-0"
          title="Dismiss reminder"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {onFocusItem && (
        <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex justify-end">
          <button
            type="button"
            onClick={() => onFocusItem(current.suggestedItemName)}
            className="text-[11px] font-bold px-3 py-1 rounded-xl bg-amber-600 hover:bg-amber-500 text-white flex items-center space-x-1 shadow-md shadow-amber-600/30 transition-all"
          >
            <span>View Designated Spot</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};
