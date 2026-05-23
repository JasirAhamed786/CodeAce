import React from 'react';

export default function AgentError({ message }) {
  if (!message) return null;

  return (
    <div className="animate-in fade-in slide-in-from-top-2 flex items-start gap-4 p-4 bg-rose-950/40 border border-rose-500/30 rounded-xl shadow-lg max-w-2xl w-full">
      <div className="bg-rose-500/20 text-rose-400 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border border-rose-500/30">
        <span className="text-lg font-bold">!</span>
      </div>
      <div className="flex flex-col">
        <h4 className="text-sm font-bold text-rose-300 uppercase tracking-wide mb-1">
          Agent Execution Failed
        </h4>
        <p className="text-sm text-rose-200/80 leading-relaxed font-mono">
          {message}
        </p>
      </div>
    </div>
  );
}