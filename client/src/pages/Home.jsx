import React, { useEffect, useState } from 'react';
import { detectPattern } from '../services/agentAPI';

const FEATURES = [
  { name: 'Problem Solver', desc: '4-step reasoning chain to classify, plan, write, and critique code.', steps: 4, icon: '⚡', color: 'from-purple-500 to-indigo-500' },
  { name: 'Complexity Analyzer', desc: 'Line-by-line Big O annotations and optimization suggestions.', steps: 1, icon: '⏱️', color: 'from-teal-500 to-emerald-500' },
  { name: 'Pattern Recognizer', desc: 'Identifies DSA patterns and generates curated study templates.', steps: 2, icon: '🧩', color: 'from-blue-500 to-cyan-500' },
  { name: 'Code Reviewer', desc: 'Harsh FAANG-level critique with full production-ready refactors.', steps: 3, icon: '🕵️', color: 'from-rose-500 to-orange-500' },
  { name: 'Cheat Sheets', desc: 'Dynamically generated, topic-specific algorithms study guides.', steps: 2, icon: '📚', color: 'from-yellow-500 to-amber-500' },
  { name: 'Mock Interviews', desc: 'Simulated technical & behavioral interviews with an AI recruiter.', steps: 3, icon: '🎙️', color: 'from-pink-500 to-rose-500' },
];

export default function Home() {
  const [demo, setDemo] = useState('');
  const [demoResult, setDemoResult] = useState(null);
  const [demoLoading, setDemoLoading] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    setStreak(parseInt(localStorage.getItem('codeace_streak') || '0', 10));
  }, []);

  const runDemo = async () => {
    if (!demo.trim()) return;
    setDemoLoading(true);
    setDemoResult(null);
    try {
      const res = await detectPattern(demo, 'Python');
      setDemoResult(res.data.data.detection);
    } catch (err) {
      setDemoResult({ error: "API connection failed or rate limited." });
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-12">
      
      {/* Hero Section */}
      <div className="relative bg-slate-900 border border-slate-700/50 rounded-3xl p-10 overflow-hidden shadow-2xl">
        {/* Abstract Background Glow */}
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-purple-500/20 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 bg-blue-500/20 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              System Online
            </div>
            <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tight">
              CodeAce <br/>
              <span className="text-3xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                Agentic AI Interview Coach
              </span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed">
              Not just another chatbot. CodeAce is a multi-agent reasoning system that thinks step-by-step like a Senior Staff Engineer to help you master Data Structures and Algorithms.
            </p>
          </div>
          
          {/* Streak Counter */}
          <div className="bg-slate-800/80 backdrop-blur border border-slate-700 rounded-2xl p-6 text-center shadow-xl">
            <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-1">Current Streak</p>
            <div className="flex justify-center items-end gap-1">
              <span className="text-5xl font-black text-orange-400">{streak}</span>
              <span className="text-orange-500/50 mb-1 font-bold">Days</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Keep coding!</p>
          </div>
        </div>
      </div>

      {/* Grid of Agents (Bento Box style) */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-200 pl-2">Available Agents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div key={i} className="group relative bg-slate-800/40 hover:bg-slate-800/80 transition-all duration-300 rounded-2xl p-6 border border-slate-700/50 hover:border-slate-600 shadow-lg cursor-pointer overflow-hidden">
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${f.color} opacity-50 group-hover:opacity-100 transition-opacity`}></div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-2xl shadow-inner">
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-bold text-slate-200 group-hover:text-white transition-colors">{f.name}</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{f.steps}-Step Chain</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Live Demo Quick Try Area */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8 shadow-xl">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                <span>🎯</span> Quick Try: Pattern Radar
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                Paste a short problem description. Our Pattern Agent will instantly detect the core DSA concept.
              </p>
            </div>
            
            <div className="relative">
              <textarea 
                value={demo} 
                onChange={e => setDemo(e.target.value)} 
                className="w-full h-32 bg-slate-900/80 text-slate-200 p-4 rounded-xl border border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none font-mono placeholder:text-slate-600" 
                placeholder="Example: Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target..."
              />
              <button 
                onClick={runDemo} 
                disabled={demoLoading || !demo.trim()}
                className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded-lg text-sm font-bold transition-colors shadow-lg"
              >
                {demoLoading ? 'Scanning...' : 'Detect Pattern'}
              </button>
            </div>
          </div>

          <div className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-6 relative overflow-hidden flex flex-col justify-center min-h-[160px]">
            {/* Grid background for tech vibe */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            
            <div className="relative z-10">
              {!demoResult && !demoLoading && (
                <div className="text-center text-slate-500 text-sm italic">
                  Awaiting input data...
                </div>
              )}
              
              {demoLoading && (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-blue-400 font-mono text-sm">Agent computing...</span>
                </div>
              )}

              {demoResult && demoResult.primaryPattern && (
                <div className="animate-in fade-in slide-in-from-bottom-2 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span> Match Found
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {demoResult.primaryPattern}
                  </div>
                  <div className="text-sm font-mono text-blue-400 bg-blue-500/10 inline-block px-3 py-1 rounded-md border border-blue-500/20">
                    Confidence Level: {demoResult.confidence}%
                  </div>
                </div>
              )}

              {demoResult && demoResult.error && (
                <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded border border-red-500/20">
                  {demoResult.error}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}