'use client';

import React, { useState } from 'react';
import { 
  Eye, 
  Type, 
  Sparkles, 
  RotateCcw, 
  X, 
  Check, 
  Volume2, 
  Sliders, 
  SunMedium,
  HeartHandshake
} from 'lucide-react';
import { useAccessibility, ColorVisionMode, TextSizeMode } from '@/contexts/AccessibilityContext';

export default function AccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    colorVision,
    setColorVision,
    textSize,
    setTextSize,
    reducedMotion,
    setReducedMotion,
    screenReaderFriendly,
    setScreenReaderFriendly,
    resetAccessibility,
  } = useAccessibility();

  const colorModes: { id: ColorVisionMode; label: string; desc: string; preview: string }[] = [
    { id: 'normal', label: 'Default Vision', desc: 'Standard color palette', preview: 'bg-[#9C2007]' },
    { id: 'high-contrast', label: 'High Contrast (Max Visibility)', desc: 'Optimized for low-vision and sunlight readability', preview: 'bg-black border border-yellow-400' },
    { id: 'protanopia', label: 'Protanopia (Red-Blind)', desc: 'Optimized contrast for red-weak or red-blind vision', preview: 'bg-[#1D4ED8]' },
    { id: 'deuteranopia', label: 'Deuteranopia (Green-Blind)', desc: 'Optimized contrast for green-weak or green-blind vision', preview: 'bg-[#D97706]' },
    { id: 'tritanopia', label: 'Tritanopia (Blue-Blind)', desc: 'Optimized contrast for blue-yellow vision deficiency', preview: 'bg-[#E11D48]' },
    { id: 'monochrome', label: 'Monochrome (Achromatopsia)', desc: 'Complete grayscale with distinct luminance contrasts', preview: 'bg-slate-700' },
  ];

  return (
    <>
      {/* Floating Accessibility Trigger Pill */}
      <div className="fixed bottom-6 left-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open Accessibility & Color Blindness Controls"
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xl hover:scale-105 active:scale-95 transition-all border border-slate-700/50 dark:border-slate-200 cursor-pointer group"
        >
          <div className="w-6 h-6 rounded-full bg-rose-600 dark:bg-[#9C2007] text-white flex items-center justify-center">
            <HeartHandshake className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider hidden sm:inline">
            Accessibility &amp; Vision
          </span>
        </button>
      </div>

      {/* Accessibility Control Modal / Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-[#0E1B33] rounded-[2rem] border border-slate-200 dark:border-blue-900/60 shadow-2xl overflow-hidden text-slate-800 dark:text-slate-100 space-y-5 p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-blue-900/40 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/40 flex items-center justify-center text-[#9C2007] dark:text-rose-400">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black uppercase tracking-tight text-slate-900 dark:text-white">
                    Accessibility &amp; PWD Controls
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Barangay Onse Inclusive Public Governance Support
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 1. Color Blindness / Vision Filter */}
            <div className="space-y-2.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-[#9C2007] dark:text-rose-400" />
                <span>Color Vision Deficiency (CVD) Filters</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {colorModes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setColorVision(mode.id)}
                    className={`flex items-start gap-2.5 p-3 rounded-2xl border text-left transition cursor-pointer ${
                      colorVision === mode.id
                        ? 'border-[#9C2007] dark:border-rose-400 bg-rose-50 dark:bg-rose-950/50 shadow-xs'
                        : 'border-slate-200 dark:border-blue-900/40 hover:bg-slate-50 dark:hover:bg-[#152747]'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full shrink-0 mt-0.5 ${mode.preview}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                        {mode.label}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                        {mode.desc}
                      </div>
                    </div>
                    {colorVision === mode.id && <Check className="w-4 h-4 text-[#9C2007] dark:text-rose-400 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Text Sizing for Seniors */}
            <div className="space-y-2.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Type className="w-4 h-4 text-[#9C2007] dark:text-rose-400" />
                <span>Text Sizing (Senior Citizens &amp; Low-Vision)</span>
              </label>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'normal' as TextSizeMode, label: 'Standard (100%)' },
                  { id: 'large' as TextSizeMode, label: 'Large (120%)' },
                  { id: 'extra-large' as TextSizeMode, label: 'Extra Large (140%)' },
                ].map((size) => (
                  <button
                    key={size.id}
                    onClick={() => setTextSize(size.id)}
                    className={`py-3 px-2 rounded-2xl border text-center text-xs font-bold transition cursor-pointer ${
                      textSize === size.id
                        ? 'border-[#9C2007] dark:border-rose-400 bg-rose-50 dark:bg-rose-950/50 text-[#9C2007] dark:text-rose-400 shadow-xs'
                        : 'border-slate-200 dark:border-blue-900/40 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#152747]'
                    }`}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Motion & Screen Reader Toggles */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-blue-900/40">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#152747]/60 border border-slate-200/60 dark:border-blue-900/30">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Reduce Animations &amp; Motion</div>
                  <div className="text-[10px] text-slate-500">Stops fast transitions for vestibular and seizure sensitivity.</div>
                </div>
                <button
                  type="button"
                  onClick={() => setReducedMotion(!reducedMotion)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition ${
                    reducedMotion ? 'bg-[#9C2007]' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                    reducedMotion ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#152747]/60 border border-slate-200/60 dark:border-blue-900/30">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Screen Reader Optimization</div>
                  <div className="text-[10px] text-slate-500">Expands high-contrast outlines and semantic aria-attributes.</div>
                </div>
                <button
                  type="button"
                  onClick={() => setScreenReaderFriendly(!screenReaderFriendly)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition ${
                    screenReaderFriendly ? 'bg-[#9C2007]' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                    screenReaderFriendly ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={resetAccessibility}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Default</span>
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-[#9C2007] text-white text-xs font-black uppercase tracking-wider hover:bg-[#8B1A05] transition cursor-pointer shadow-md"
              >
                Apply &amp; Close
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

