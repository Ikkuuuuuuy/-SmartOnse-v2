'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { RotateCcw, Volume2, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

interface RealCaptchaProps {
  onVerify: (isValid: boolean) => void;
  onAnswerChange?: (answer: string) => void;
  className?: string;
}

// Characters that are clear and avoid confusing pairs (0 vs O, 1 vs I vs l)
const CAPTCHA_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';

function generateRandomCode(length = 6): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += CAPTCHA_CHARS.charAt(Math.floor(Math.random() * CAPTCHA_CHARS.length));
  }
  return result;
}

export default function RealCaptcha({ onVerify, onAnswerChange, className = '' }: RealCaptchaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [captchaCode, setCaptchaCode] = useState('');
  const [userInput, setUserInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Draw the distorted, noisy visual CAPTCHA on canvas
  const renderCaptcha = useCallback((code: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // 1. Background gradient with security tint
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#f8fafc');
    bgGradient.addColorStop(0.5, '#f1f5f9');
    bgGradient.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // 2. Add background noise dots
    for (let i = 0; i < 45; i++) {
      ctx.fillStyle = `rgba(${Math.floor(Math.random() * 150)}, ${Math.floor(Math.random() * 150)}, ${Math.floor(Math.random() * 150)}, 0.3)`;
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 2 + 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Add random curved interference strike lines
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = `rgba(${Math.floor(Math.random() * 180 + 30)}, ${Math.floor(Math.random() * 60)}, ${Math.floor(Math.random() * 60)}, 0.45)`;
      ctx.lineWidth = Math.random() * 1.5 + 1;
      ctx.beginPath();
      ctx.moveTo(Math.random() * 20, Math.random() * height);
      ctx.bezierCurveTo(
        Math.random() * width * 0.5,
        Math.random() * height,
        Math.random() * width * 0.8,
        Math.random() * height,
        width - Math.random() * 20,
        Math.random() * height
      );
      ctx.stroke();
    }

    // 4. Draw each character with random rotation, color, and font size
    const fonts = ['Georgia', 'Courier New', 'Verdana', 'Trebuchet MS', 'Arial'];
    const charSpacing = width / (code.length + 1);

    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      const fontName = fonts[Math.floor(Math.random() * fonts.length)];
      const fontSize = Math.floor(Math.random() * 6) + 24; // 24-30px
      const angle = (Math.random() * 40 - 20) * (Math.PI / 180); // -20 to +20 degrees

      ctx.save();
      const x = charSpacing * (i + 1) + (Math.random() * 6 - 3);
      const y = height / 2 + (Math.random() * 8 - 4) + 8;

      ctx.translate(x, y);
      ctx.rotate(angle);

      // Random distinct dark color per character for anti-OCR resistance
      const colors = ['#9C2007', '#1E3A8A', '#0F172A', '#047857', '#7C2D12', '#4338CA', '#831843'];
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.font = `bold ${fontSize}px ${fontName}, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.15)';
      ctx.shadowBlur = 2;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      ctx.fillText(char, 0, 0);
      ctx.restore();
    }

    // 5. Light grid overlay lines
    ctx.strokeStyle = 'rgba(156, 32, 7, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 15; x < width; x += 25) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
  }, []);

  // Regenerate new challenge code
  const refresh = useCallback(() => {
    const newCode = generateRandomCode(6);
    setCaptchaCode(newCode);
    setUserInput('');
    setStatus('idle');
    onVerify(false);
    if (onAnswerChange) onAnswerChange('');
    renderCaptcha(newCode);
  }, [onVerify, onAnswerChange, renderCaptcha]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Handle user typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();
    setUserInput(val);
    if (onAnswerChange) onAnswerChange(val);

    // Case-insensitive match for citizen-friendly UX while retaining security
    if (val.length === captchaCode.length) {
      if (val.toLowerCase() === captchaCode.toLowerCase()) {
        setStatus('success');
        onVerify(true);
      } else {
        setStatus('error');
        onVerify(false);
      }
    } else {
      setStatus('idle');
      onVerify(false);
    }
  };

  // Audio pronunciation for accessibility
  const handleSpeak = () => {
    if (!('speechSynthesis' in window) || !captchaCode) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(true);

    const spokenText = captchaCode
      .split('')
      .map((c) => {
        if (/[A-Z]/.test(c)) return `Capital ${c}`;
        if (/[a-z]/.test(c)) return `Small ${c}`;
        return c;
      })
      .join(', ');

    const utterance = new SpeechSynthesisUtterance(`Security code verification: ${spokenText}`);
    utterance.rate = 0.85;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Visual CAPTCHA Canvas & Controls */}
      <div className="flex items-center gap-2">
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-blue-900/60 shadow-inner bg-slate-100 dark:bg-slate-900 shrink-0">
          <canvas
            ref={canvasRef}
            width={180}
            height={50}
            className="block select-none cursor-pointer"
            onClick={refresh}
            title="Click image to reload security code"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={refresh}
            title="Generate new security code"
            className="p-1.5 rounded-xl bg-slate-50 dark:bg-[#152747] border border-slate-200 dark:border-blue-900/60 text-slate-600 dark:text-slate-300 hover:text-[#9C2007] dark:hover:text-rose-400 hover:border-[#9C2007] transition cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleSpeak}
            disabled={isSpeaking}
            title="Audio challenge for accessibility"
            className="p-1.5 rounded-xl bg-slate-50 dark:bg-[#152747] border border-slate-200 dark:border-blue-900/60 text-slate-600 dark:text-slate-300 hover:text-[#9C2007] dark:hover:text-rose-400 hover:border-[#9C2007] transition cursor-pointer shadow-xs disabled:opacity-50"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* User Input Field */}
        <div className="relative flex-1">
          <input
            type="text"
            required
            autoComplete="off"
            spellCheck="false"
            maxLength={6}
            value={userInput}
            onChange={handleInputChange}
            placeholder="Type code..."
            className={`w-full px-3.5 py-3.5 bg-slate-50 dark:bg-[#152747] border rounded-2xl text-sm font-mono font-black uppercase tracking-widest text-center outline-none transition ${
              status === 'success'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20'
                : status === 'error'
                ? 'border-rose-500 text-rose-600 dark:text-rose-400 ring-2 ring-rose-500/20'
                : 'border-slate-200 dark:border-blue-900/40 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#9C2007]/50'
            }`}
          />
          {status === 'success' && (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          )}
          {status === 'error' && (
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          )}
        </div>
      </div>

      {/* Helper text */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 px-1">
        <span>Enter the 6 characters shown in the image</span>
        {status === 'success' && (
          <span className="font-bold text-emerald-600 dark:text-emerald-400">✓ Verified</span>
        )}
        {status === 'error' && (
          <span className="font-bold text-rose-600 dark:text-rose-400">✗ Code mismatch</span>
        )}
      </div>
    </div>
  );
}

