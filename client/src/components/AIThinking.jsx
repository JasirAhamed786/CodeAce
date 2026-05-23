import React from 'react';
import { useState, useEffect } from 'react';

const steps = [
  'Classifying the problem pattern...',
  'Planning brute force approach...',
  'Generating optimal solution...',
  'Reflecting and critiquing...'
];

const AIThinking = ({ customSteps }) => {
  const [current, setCurrent] = useState(0);
  const list = customSteps || steps;

  useEffect(() => {
    const t = setInterval(() =>
      setCurrent(c => (c + 1) % list.length), 1500);
    return () => clearInterval(t);
  }, [list]);

  return (
    <div className="flex items-center gap-3 p-4 bg-slate-800
                    rounded-xl border border-purple-500/30">
      <div className="w-3 h-3 rounded-full bg-purple-500
                      animate-pulse flex-shrink-0" />
      <span className="text-purple-300 text-sm">{list[current]}</span>
    </div>
  );
};

export default AIThinking;
