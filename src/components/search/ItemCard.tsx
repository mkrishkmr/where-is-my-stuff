"use client";

import React, { useState } from "react";
import { MapPin, Calendar, Clock, Share2, Check, RotateCcw, AlertTriangle } from "lucide-react";
import { Item } from "@/types";

interface ItemCardProps {
  item: Item;
  currentUser: string;
  onItemUpdated?: () => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, currentUser, onItemUpdated }) => {
  const [copied, setCopied] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleShare = () => {
    const url = `${window.location.origin}?item=${item.id}&find=${encodeURIComponent(item.name)}&sender=${encodeURIComponent(currentUser)}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBorrow = async (minutes: number) => {
    setIsUpdating(true);
    try {
      await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "borrow",
          itemId: item.id,
          borrowedBy: currentUser,
          timerMinutes: minutes,
        }),
      });
      if (onItemUpdated) onItemUpdated();
    } catch (e) {
      console.error("Borrow error:", e);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReturn = async () => {
    setIsUpdating(true);
    try {
      await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "return",
          itemId: item.id,
        }),
      });
      if (onItemUpdated) onItemUpdated();
    } catch (e) {
      console.error("Return error:", e);
    } finally {
      setIsUpdating(false);
    }
  };

  const isBorrowed = Boolean(item.borrowedBy);
  const isExpired = item.returnTimerExpiresAt
    ? new Date(item.returnTimerExpiresAt).getTime() < Date.now()
    : false;

  return (
    <div className="bg-[#0F172A] border border-slate-800/90 hover:border-slate-700 rounded-3xl overflow-hidden shadow-xl transition-all space-y-3 p-4 group">
      
      {/* Top Header: Room Tag & Date */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
          {item.room}
        </span>
        <span className="text-[10px] text-slate-500 flex items-center space-x-1">
          <Calendar className="w-3 h-3" />
          <span>{new Date(item.capturedAt).toLocaleDateString()}</span>
        </span>
      </div>

      {/* Item Main Info & Thumbnail */}
      <div className="flex space-x-3.5">
        {/* Photo Proof Thumbnail */}
        {item.photoUrl && (
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-black/50 shrink-0 relative border border-slate-800 shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.photoUrl}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-full bg-black/75 backdrop-blur text-[8px] font-bold text-white border border-white/10">
              Proof
            </div>
          </div>
        )}

        {/* Item Title & Description */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white truncate leading-tight">{item.name}</h3>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-snug">
              {item.description}
            </p>
          </div>

          {/* Active Borrow Pill */}
          {isBorrowed && (
            <div
              className={`mt-1.5 inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                isExpired
                  ? "bg-rose-950/70 text-rose-300 border-rose-500/40 animate-pulse"
                  : "bg-amber-950/70 text-amber-300 border-amber-500/40"
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>{isExpired ? "⚠️ Return Overdue!" : `Borrowed by ${item.borrowedBy}`}</span>
            </div>
          )}
        </div>
      </div>

      {/* Verified Location Breadcrumb */}
      <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center space-x-2 text-xs font-semibold text-emerald-300">
        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span className="truncate">{item.location}</span>
      </div>

      {/* Action Strip: Borrow Timers & Family Share */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-1.5">
          {!isBorrowed ? (
            <div className="flex items-center space-x-1">
              <span className="text-[10px] text-slate-400 font-medium">Borrow:</span>
              <button
                disabled={isUpdating}
                onClick={() => handleBorrow(60)}
                className="text-[10px] font-bold px-2 py-1 bg-slate-900 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-lg border border-slate-700/80 transition-all"
              >
                1h
              </button>
              <button
                disabled={isUpdating}
                onClick={() => handleBorrow(1440)}
                className="text-[10px] font-bold px-2 py-1 bg-slate-900 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-lg border border-slate-700/80 transition-all"
              >
                24h
              </button>
            </div>
          ) : (
            <button
              disabled={isUpdating}
              onClick={handleReturn}
              className="text-xs font-bold px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center space-x-1 shadow-md shadow-emerald-600/20 transition-all"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Return to Spot</span>
            </button>
          )}
        </div>

        {/* Family Share Link Button */}
        <button
          onClick={handleShare}
          className={`text-xs font-semibold px-3 py-1 rounded-xl border flex items-center space-x-1.5 transition-all ${
            copied
              ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
              : "bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
          }`}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Share Link</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};
