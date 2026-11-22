"use client";

import React, { useState, useRef } from "react";
import { Camera, Sparkles, CheckCircle2, ArrowRight, RefreshCw, Zap, Edit3, Check } from "lucide-react";
import { LocationPicker } from "./LocationPicker";
import { Item } from "@/types";

interface CameraCaptureProps {
  onCaptureSuccess: (newItems: Item[]) => void;
  isDemoMode: boolean;
}

// Client-side lightweight image compressor (resizes to max 640px, JPEG 0.72 quality for fast, reliable storage)
function compressImage(file: File, maxDim = 640, quality = 0.72): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedDataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onCaptureSuccess,
  isDemoMode,
}) => {
  // Stages: "capture" (camera view) | "analyzing" (model thinking) | "review" (confirm item details)
  const [stage, setStage] = useState<"capture" | "analyzing" | "review">("capture");
  
  // Image state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Review & Confirm Item state (populated automatically by Divyam Opus 5.5)
  const [itemName, setItemName] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemLocation, setItemLocation] = useState("Living Room — TV Media Console");
  const [itemRoom, setItemRoom] = useState("Living Room");
  const [itemTags, setItemTags] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [detectedConfidence, setDetectedConfidence] = useState<number>(0.95);

  // Automatically sends picture to Opus 5.5 model as soon as image is loaded
  const analyzeImageAutomatically = async (base64OrUrl: string) => {
    setImagePreview(base64OrUrl);
    setStage("analyzing");

    try {
      const res = await fetch("/api/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64OrUrl,
          location: itemLocation,
          room: itemRoom,
          isDemo: isDemoMode,
          commit: false, // Do not add to catalog yet; let user confirm first!
        }),
      });

      const data = await res.json();
      if (data.candidateItem) {
        setItemName(data.candidateItem.name);
        setItemDescription(data.candidateItem.description);
        setItemTags(data.candidateItem.tags || []);
        setDetectedConfidence(data.candidateItem.confidence || 0.95);
        if (data.candidateItem.location) setItemLocation(data.candidateItem.location);
        if (data.candidateItem.room) setItemRoom(data.candidateItem.room);
        setStage("review");
      } else {
        setItemName("Captured Item");
        setItemDescription("Identified belonging from photo");
        setStage("review");
      }
    } catch (err) {
      console.error("Auto-analysis error:", err);
      setItemName("Household Belonging");
      setItemDescription("Photo captured item");
      setStage("review");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Compress image client-side to <200KB for fast, reliable vision API transport
        const compressedBase64 = await compressImage(file, 1024, 0.82);
        analyzeImageAutomatically(compressedBase64);
      } catch (err) {
        console.error("Compression fallback:", err);
        const reader = new FileReader();
        reader.onloadend = () => {
          analyzeImageAutomatically(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const loadDemoPhoto = () => {
    const sampleImg = "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80"; // Scented candle sample
    analyzeImageAutomatically(sampleImg);
  };

  const handleResetToCapture = () => {
    setImagePreview(null);
    setItemName("");
    setItemDescription("");
    setStage("capture");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // User confirms the item -> Saves to catalog and transitions to catalog view
  const handleConfirmAndSave = async () => {
    if (!itemName.trim() || !imagePreview) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: itemName.trim(),
          description: itemDescription.trim(),
          location: itemLocation,
          room: itemRoom,
          photoUrl: imagePreview,
          tags: itemTags,
        }),
      });

      const data = await res.json();
      if (data.item) {
        // Notify parent to append to catalog & switch tab to "browse"
        onCaptureSuccess([data.item]);
      }
    } catch (err) {
      console.error("Failed to commit item:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // =========================================================================
  // VIEW 1: DEDICATED REVIEW & CONFIRM SCREEN (ONLY FOR THIS ITEM)
  // =========================================================================
  if (stage === "review" && imagePreview) {
    return (
      <div className="space-y-4 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                AI Detected ({Math.round(detectedConfidence * 100)}% match)
              </span>
            </div>
            <h2 className="text-base font-extrabold text-white mt-1">
              Confirm Item & Spot
            </h2>
          </div>

          <button
            type="button"
            onClick={handleResetToCapture}
            className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 transition-all flex items-center space-x-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retake</span>
          </button>
        </div>

        {/* Prompt Card for User */}
        <div className="rounded-2xl bg-indigo-950/30 border border-indigo-500/30 p-3 text-xs text-slate-300 leading-snug">
          <span className="text-indigo-400 font-bold">✨ Opus 5.5 Auto-Identified:</span> Review what the model found below. You can edit the name, description, or tap any storage pill to change its destination.
        </div>

        {/* Item Photo Preview */}
        <div className="relative rounded-3xl overflow-hidden aspect-video bg-black border border-slate-800 shadow-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imagePreview}
            alt={itemName}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur text-[10px] font-bold text-white border border-white/10">
            Photo Proof
          </div>
        </div>

        {/* Form Fields: What is this item? */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-4 space-y-3 shadow-xl">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
              <Edit3 className="w-3 h-3 text-indigo-400" />
              <span>Item Name (What is this?)</span>
            </label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-2xl py-2.5 px-3 text-xs font-bold text-white focus:outline-none transition-all"
              placeholder="e.g. Scented Candle in Glass Jar"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Description & Visual Details
            </label>
            <textarea
              rows={2}
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-2xl py-2 px-3 text-xs text-slate-300 focus:outline-none transition-all resize-none"
              placeholder="Color, distinguishing features..."
            />
          </div>

          {/* Location Picker (Where is it kept?) */}
          <div className="pt-2 border-t border-slate-800/80">
            <LocationPicker
              selectedLocation={itemLocation}
              onSelectLocation={(loc, rm) => {
                setItemLocation(loc);
                setItemRoom(rm);
              }}
            />
          </div>
        </div>

        {/* Primary Confirmation Action */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            disabled={isSaving || !itemName.trim()}
            onClick={handleConfirmAndSave}
            className="w-full py-3.5 px-4 rounded-2xl font-bold text-xs sm:text-sm bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:opacity-95 text-white flex items-center justify-center space-x-2 shadow-xl shadow-emerald-500/20 active:scale-98 transition-all"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Adding to Household Catalogue...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Confirm & Add to Catalogue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleResetToCapture}
            className="w-full py-2.5 text-xs text-slate-400 hover:text-slate-200 transition-colors text-center"
          >
            Cancel & Retake Photo
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: ANALYZING STATE (OPUS 5.5 AUTO-DETECTING)
  // =========================================================================
  if (stage === "analyzing") {
    return (
      <div className="rounded-3xl bg-[#0F172A] border border-slate-800 p-8 flex flex-col items-center justify-center text-center space-y-4 min-h-[380px] shadow-2xl animate-fadeIn">
        <div className="relative flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-pink-500/20 animate-ping"></div>
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-xl shadow-pink-500/40 z-10">
            <Sparkles className="w-8 h-8 text-white animate-pulse" />
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-extrabold text-white">
            Divyam Opus 5.5 Is Analyzing Photo...
          </h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Detecting the item, visual features, and location. Your review screen will load in a moment.
          </p>
        </div>

        <div className="text-[11px] font-mono text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
          Automated Instant Vision Pipeline
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: CAMERA VIEWFINDER & SHUTTER (INITIAL CAPTURE SCREEN)
  // =========================================================================
  return (
    <div className="space-y-4">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-white flex items-center space-x-2">
            <Camera className="w-4 h-4 text-pink-400" />
            <span>Take Picture to Catalog</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Taking or selecting a photo immediately sends it to Opus 5.5 for review.
          </p>
        </div>

        <button
          type="button"
          onClick={loadDemoPhoto}
          className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all"
        >
          Sample Candle
        </button>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Viewfinder Frame (Google Camera Style) */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="rounded-3xl overflow-hidden bg-black/90 border-2 border-slate-800 relative aspect-[4/3] flex flex-col justify-between p-4 shadow-2xl cursor-pointer group hover:border-pink-500/40 transition-all"
      >
        {/* Reticle Corner Guides */}
        <div className="absolute inset-4 border border-white/10 rounded-2xl pointer-events-none flex flex-col justify-between p-2">
          <div className="flex justify-between">
            <span className="w-3.5 h-3.5 border-t-2 border-l-2 border-pink-500"></span>
            <span className="w-3.5 h-3.5 border-t-2 border-r-2 border-pink-500"></span>
          </div>
          <div className="text-center text-[10px] font-mono text-pink-400/80 bg-black/70 px-2.5 py-0.5 rounded-full mx-auto backdrop-blur">
            OPUS 5.5 REAL-TIME MULTIMODAL INGESTION
          </div>
          <div className="flex justify-between">
            <span className="w-3.5 h-3.5 border-b-2 border-l-2 border-pink-500"></span>
            <span className="w-3.5 h-3.5 border-b-2 border-r-2 border-pink-500"></span>
          </div>
        </div>

        {/* Top Controls Strip */}
        <div className="flex justify-between items-center z-10 text-[10px]">
          <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur text-white font-medium flex items-center space-x-1">
            <Zap className="w-3 h-3 text-yellow-400" />
            <span>Flash Auto</span>
          </span>
          <span className="text-[10px] text-pink-400 font-bold bg-pink-500/10 px-2 py-0.5 rounded-full border border-pink-500/20">
            Live Opus Model
          </span>
        </div>

        {/* Viewfinder Center Prompt */}
        <div className="flex-1 flex flex-col items-center justify-center text-center z-10 space-y-2 py-6">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 text-pink-400 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform shadow-lg shadow-pink-500/20">
            <Camera className="w-8 h-8" />
          </div>
          <div className="text-sm font-extrabold text-white">Tap to Snap or Upload</div>
          <div className="text-[11px] text-slate-400 max-w-xs">
            Sends picture automatically to Opus 5.5 and opens dedicated confirmation screen.
          </div>
        </div>

        {/* Bottom Shutter Affordance */}
        <div className="z-10 flex flex-col items-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 p-0.5 shadow-xl shadow-pink-500/40 flex items-center justify-center group-hover:scale-105 active:scale-95 transition-all">
            <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center text-white text-lg">
              📸
            </div>
          </div>
          <div className="text-[10px] text-slate-400">Tap to upload scented candle or any item</div>
        </div>
      </div>
    </div>
  );
};
