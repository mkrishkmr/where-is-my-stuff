"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/shared/Header";
import { EmailWall } from "@/components/auth/EmailWall";
import { CameraCapture } from "@/components/capture/CameraCapture";
import { ChatQueryBox } from "@/components/search/ChatQueryBox";
import { ProactiveBanner } from "@/components/search/ProactiveBanner";
import { ItemCard } from "@/components/search/ItemCard";
import { Item } from "@/types";
import { Camera, Search, Layers, Home } from "lucide-react";

export default function HomePage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("Family Member");
  const [activeTab, setActiveTab] = useState<"search" | "capture" | "browse">("search");
  const [items, setItems] = useState<Item[]>([]);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [filterRoom, setFilterRoom] = useState<string>("All");
  const [searchPrefill, setSearchPrefill] = useState<string>("");

  const loadItems = async () => {
    let localList: Item[] = [];
    try {
      const stored = localStorage.getItem("household_user_items");
      if (stored) localList = JSON.parse(stored);
    } catch {
      // ignore
    }

    try {
      const res = await fetch("/api/items");
      const data = await res.json();
      if (data.items) {
        const serverIds = new Set(data.items.map((i: Item) => i.id));
        const merged = [...data.items, ...localList.filter((i: Item) => !serverIds.has(i.id))];
        setItems(merged);
        return;
      }
    } catch (e) {
      console.error("Failed to load items:", e);
    }

    if (localList.length > 0) {
      setItems(localList);
    }
  };

  useEffect(() => {
    // Check saved session
    const savedEmail = localStorage.getItem("household_user_email");
    const savedName = localStorage.getItem("household_user_name");
    if (savedEmail) {
      setUserEmail(savedEmail);
      if (savedName) setUserName(savedName);
    }

    loadItems();

    // Check URL parameters for stage demo & family share link
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("demo") === "true") {
        setIsDemoMode(true);
      }
      const findParam = params.get("find");
      if (findParam) {
        setSearchPrefill(findParam);
        setActiveTab("search");
      }
    }
  }, []);

  const handleLogin = (email: string, name: string) => {
    setUserEmail(email);
    setUserName(name);
    localStorage.setItem("household_user_email", email);
    localStorage.setItem("household_user_name", name);
  };

  const handleLogout = () => {
    setUserEmail(null);
    localStorage.removeItem("household_user_email");
    localStorage.removeItem("household_user_name");
  };

  const handleCaptureSuccess = (newItems: Item[]) => {
    setItems((prev) => {
      const existingIds = new Set(prev.map((i) => i.id));
      const filteredNew = newItems.filter((i) => !existingIds.has(i.id));
      const updated = [...filteredNew, ...prev];
      try {
        localStorage.setItem("household_user_items", JSON.stringify(updated));
      } catch (err) {
        console.warn("LocalStorage save warning:", err);
      }
      return updated;
    });
    setActiveTab("browse");
  };

  if (!userEmail) {
    return <EmailWall onLogin={handleLogin} />;
  }

  const rooms = ["All", ...Array.from(new Set(items.map((i) => i.room)))];
  const filteredItems = filterRoom === "All" ? items : items.filter((i) => i.room === filterRoom);

  return (
    <div className="min-h-screen bg-[#080D1A] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <Header
        userEmail={userEmail}
        userName={userName}
        onLogout={handleLogout}
        isDemoMode={isDemoMode}
        onToggleDemoMode={() => setIsDemoMode(!isDemoMode)}
        itemCount={items.length}
      />

      {/* Mobile-First Main Content Container */}
      <main className="flex-1 max-w-md w-full mx-auto p-4 space-y-4 pb-28">
        
        {/* Proactive Context & Return Timer Banner */}
        <ProactiveBanner
          onFocusItem={(itemName) => {
            setSearchPrefill(itemName);
            setActiveTab("search");
          }}
        />

        {/* Tab 1: Conversational Search & Recall */}
        {activeTab === "search" && (
          <div className="space-y-4 animate-fadeIn">
            <ChatQueryBox
              userEmail={userEmail}
              isDemoMode={isDemoMode}
              prefillQuery={searchPrefill}
              onItemUpdated={loadItems}
            />
          </div>
        )}

        {/* Tab 2: Smooth 1-Tap Location Capture */}
        {activeTab === "capture" && (
          <div className="space-y-4 animate-fadeIn">
            <CameraCapture
              onCaptureSuccess={handleCaptureSuccess}
              isDemoMode={isDemoMode}
            />
          </div>
        )}

        {/* Tab 3: Household Catalog with Return Timers & Share */}
        {activeTab === "browse" && (
          <div className="space-y-3.5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Household Inventory</h3>
                <p className="text-[11px] text-slate-400">Borrow with return timers or share links</p>
              </div>

              {/* Room Filter Chips */}
              <div className="flex space-x-1.5 overflow-x-auto pb-1 max-w-[55%] scrollbar-none">
                {rooms.map((rm) => (
                  <button
                    key={rm}
                    onClick={() => setFilterRoom(rm)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all shrink-0 ${
                      filterRoom === rm
                        ? "bg-indigo-600 border-indigo-500 text-white shadow-sm"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {rm}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {filteredItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  currentUser={userName}
                  onItemUpdated={loadItems}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Google Pixel-Style Floating Bottom Pill Dock (Thumb Zone) */}
      <nav className="fixed bottom-4 left-4 right-4 max-w-md mx-auto h-16 rounded-full bg-[#0F172A]/85 backdrop-blur-xl border border-slate-700/60 shadow-2xl flex items-center justify-around px-4 z-50">
        
        {/* Tab 1: Ask & Find */}
        <button
          onClick={() => setActiveTab("search")}
          className={`flex flex-col items-center space-y-0.5 transition-all ${
            activeTab === "search"
              ? "text-indigo-400 font-bold scale-105"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px]">Ask & Find</span>
        </button>

        {/* Center Elevated Shutter Action Button */}
        <div className="relative -top-5">
          <button
            onClick={() => setActiveTab("capture")}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white shadow-xl shadow-pink-500/40 border-4 border-[#080D1A] flex items-center justify-center text-xl hover:scale-105 active:scale-95 transition-all"
            title="1-Tap Smooth Capture"
          >
            <Camera className="w-6 h-6" />
          </button>
        </div>

        {/* Tab 3: Household Catalog */}
        <button
          onClick={() => setActiveTab("browse")}
          className={`flex flex-col items-center space-y-0.5 transition-all ${
            activeTab === "browse"
              ? "text-indigo-400 font-bold scale-105"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px]">Household ({items.length})</span>
        </button>

      </nav>
    </div>
  );
}
