'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { MessageSquare, X, Send, Bot, Sparkles, HelpCircle } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export default function BarangayAiAssistant() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      text: 'Mabuhay! Ano ang maitutulong ko tungkol sa mga serbisyo, clearances, o impormasyon sa Barangay Onse?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const defaultQuickQuestions = [
    'Requirements sa Barangay Clearance?',
    'Libre ba ang Certificate of Indigency?',
    'Sino ang Barangay Captain at SK?',
    'Where is Barangay Onse located?',
    'Paano mag-track ng request?',
    'Saan makikita ang mga opisyal at link?',
    'Emergency Hotlines sa Onse?',
  ];

  const [quickQuestions, setQuickQuestions] = useState<string[]>(defaultQuickQuestions);

  // Helper to parse `inline code` and **bold**
  const renderTextSegment = (text: string, keyPrefix: string) => {
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
    return parts.map((part, pIdx) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={`${keyPrefix}-c-${pIdx}`}
            className="px-1.5 py-0.5 rounded bg-slate-100 text-[#9C2007] font-mono text-[11px] font-bold"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={`${keyPrefix}-b-${pIdx}`} className="font-bold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <React.Fragment key={`${keyPrefix}-t-${pIdx}`}>{part}</React.Fragment>;
    });
  };

  // Formats text with markdown links [Text](url), **bold**, and `code`
  const renderFormattedText = (rawText: string) => {
    const lines = rawText.split('\n');
    return lines.map((line, lineIdx) => {
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      const elements: React.ReactNode[] = [];
      let lastIndex = 0;
      let match;

      while ((match = linkRegex.exec(line)) !== null) {
        const textBefore = line.slice(lastIndex, match.index);
        if (textBefore) {
          elements.push(...renderTextSegment(textBefore, `${lineIdx}-pre-${match.index}`));
        }

        const linkLabel = match[1];
        const linkUrl = match[2];
        const isExternal = linkUrl.startsWith('http');

        elements.push(
          <a
            key={`${lineIdx}-link-${match.index}`}
            href={linkUrl}
            target={isExternal ? '_blank' : '_self'}
            rel={isExternal ? 'noopener noreferrer' : undefined}
            className="inline-flex items-center gap-0.5 font-bold text-[#9C2007] hover:text-[#7A1805] underline underline-offset-2 decoration-1 hover:decoration-2 transition-colors mx-0.5"
          >
            <span>{linkLabel}</span>
            <span className="text-[10px] no-underline">↗</span>
          </a>
        );

        lastIndex = match.index + match[0].length;
      }

      const textAfter = line.slice(lastIndex);
      if (textAfter) {
        elements.push(...renderTextSegment(textAfter, `${lineIdx}-post-${lastIndex}`));
      }

      return (
        <span key={lineIdx} className="block min-h-[1.15em]">
          {elements.length > 0 ? elements : '\u00A0'}
        </span>
      );
    });
  };

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const [res] = await Promise.all([
        fetch('/api/chatbot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text.trim(), history: historyPayload }),
        }),
        // Humanized natural response delay (600ms) to show typing indicator
        new Promise((resolve) => setTimeout(resolve, 600)),
      ]);

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: data.reply || "Maaari kayong magsadya sa Barangay Onse Hall mula Lunes hanggang Biyernes, 8:00 AM hanggang 5:00 PM.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        const merged = [
          ...data.suggestions,
          ...defaultQuickQuestions.filter((q) => !data.suggestions.includes(q)),
        ];
        setQuickQuestions(merged.slice(0, 7));
      }

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: 'Kasalukuyang nagre-refresh ang OnseBot. Tumawag sa Barangay Desk sa (02) 8723-0011 / (02) 8123-4567.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Hide the citizen chatbot completely from all admin dashboards and pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#9C2007] to-[#B52508] hover:from-[#c5321f] hover:to-[#9C2007] text-white shadow-2xl shadow-red-950/40 hover:scale-110 active:scale-95 transition-all flex items-center justify-center relative group cursor-pointer"
          aria-label="Open OnseBot AI Assistant"
          title="Ask OnseBot AI (24/7)"
        >
          <div className="relative flex items-center justify-center">
            <Bot className="w-7 h-7" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#9C2007] animate-pulse" />
          </div>
        </button>
      )}


      {isOpen && (
        <div className="w-[90vw] sm:w-[380px] h-[520px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-gradient-to-r from-[#8B1A05] via-[#9C2007] to-[#8B1A05] p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                <Bot className="w-5 h-5 text-amber-200" />
              </div>
              <div>
                <h3 className="font-black text-sm uppercase tracking-wide flex items-center gap-1.5">
                  OnseBot Assistant
                  <span className="text-[9px] bg-white/20 text-white px-1.5 py-0.2 rounded font-bold">AI</span>
                </h3>
                <p className="text-[11px] text-rose-100">Barangay Onse Virtual Desk</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-[#9C2007] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#9C2007] text-white rounded-tr-none'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-2xs'
                  }`}
                >
                  <div className="space-y-1">
                    {renderFormattedText(msg.text)}
                  </div>
                  <span
                    className={`block text-[9px] mt-1 text-right ${
                      msg.sender === 'user' ? 'text-rose-200' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 justify-start items-end animate-in fade-in-50 duration-150">
                <div className="w-6 h-6 rounded-full bg-[#9C2007] text-white flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white text-slate-800 border border-slate-200 rounded-2xl rounded-tl-none px-3.5 py-2.5 shadow-2xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9C2007] animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9C2007] animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9C2007] animate-bounce" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-3 py-2 bg-slate-100/70 border-t border-slate-200 overflow-x-auto whitespace-nowrap flex gap-1.5 no-scrollbar">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                disabled={loading}
                className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white hover:bg-rose-50 text-slate-700 hover:text-[#9C2007] border border-slate-200 transition shrink-0 cursor-pointer disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              disabled={loading}
              onChange={(e) => setInput(e.target.value)}
              placeholder={loading ? 'Nagsusulat si OnseBot...' : 'Magtanong tungkol sa serbisyo, lokasyon...'}
              className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#9C2007] disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2 rounded-xl bg-[#9C2007] hover:bg-[#8B1A05] disabled:opacity-50 text-white transition shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
