import React, { useState, useEffect } from 'react';

const DEFAULT_STEPS = [
  'Initializing AI Agent...',
  'Parsing context and parameters...',
  'Generating structured response...',
  'Finalizing output formatting...'
];

export default function AIThinking({ customSteps }) {
  const [current, setCurrent] = useState(0);
  const list = customSteps || DEFAULT_STEPS;

  useEffect(() => {
    const t = setInterval(() => {
      setCurrent(c => (c + 1) % list.length);
    }, 2000); // 2 seconds feels more deliberate and realistic
    return () => clearInterval(t);
  }, [list]);

  return (
    <div className="relative overflow-hidden bg-slate-900/80 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-5 shadow-xl shadow-purple-500/10 max-w-lg w-full">
      {/* Animated Gradient Edge */}
      <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-purple-500 via-blue-500 to-cyan-500 animate-pulse" />
      
      <div className="flex items-center gap-5 pl-2">
        {/* Spinner */}
        <div className="relative flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-slate-700"></div>
          <div className="absolute w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin"></div>
        </div>
        
        {/* Text Area */}
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">
            Agent Processing
          </span>
          <span className="text-sm font-medium text-slate-200 animate-pulse">
            {list[current]}
          </span>
        </div>
      </div>
    </div>
  );
}