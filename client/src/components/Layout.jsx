import React, { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import axios from 'axios';

const links = [
  { to: '/',          label: 'Home',                icon: '⌂' },
  { to: '/solver',    label: 'Problem Solver',      icon: '⚡' },
  { to: '/analyzer',  label: 'Complexity Analyzer', icon: '📊' },
  { to: '/patterns',  label: 'Pattern Recognizer',  icon: '🧠' },
  { to: '/review',    label: 'Code Review',         icon: '🔍' },
  { to: '/cheatsheet',label: 'Cheat Sheet',         icon: '📄' },
  { to: '/mock',      label: 'Mock Interview',      icon: '🎯' },
  { to: '/history',   label: 'History',             icon: '📈' },
];

export default function Layout() {
  const [aiStatus, setAiStatus] = useState('checking');

  // Ping the backend to check if the Mega-Prompt engine is reachable
  useEffect(() => {
    // Note: Ensure this port matches your server/.env PORT! (usually 5000 or 5001)
    axios.get('http://localhost:5001/api/health')
      .then(() => setAiStatus('online'))
      .catch(() => setAiStatus('offline')); // Fails gracefully if no health route exists yet
  }, []);

  return (
    <div className="flex h-screen bg-[#0a0f18] text-white overflow-hidden font-sans">
      
      {/* Premium Glassmorphism Sidebar */}
      <aside className="w-64 bg-slate-900/50 backdrop-blur-2xl flex flex-col border-r border-slate-800/80 flex-shrink-0 z-20 shadow-2xl">
        
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/80">
          <h1 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400">
            CodeAce
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1.5">
            Agentic AI Coach
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {links.map((l) => (
            <NavLink 
              key={l.to} 
              to={l.to} 
              end={l.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-500/10 to-blue-500/10 text-white border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.05)]'
                    : 'text-slate-400 border border-transparent hover:bg-slate-800/50 hover:text-slate-200'
                }`
              }
            >
              <span className="text-lg opacity-80 group-hover:opacity-100 transition-opacity">{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Server Status Footer */}
        <div className="p-5 border-t border-slate-800/80 bg-slate-900/30">
          <div className="flex items-center gap-3 bg-slate-950/50 border border-slate-800 px-3 py-2 rounded-lg">
            <div className="relative flex h-2.5 w-2.5">
              {aiStatus === 'online' && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                aiStatus === 'online' ? 'bg-emerald-500' :
                aiStatus === 'offline' ? 'bg-rose-500' : 'bg-amber-500'
              }`}></span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">System Status</span>
              <span className={`text-xs font-semibold ${
                aiStatus === 'online' ? 'text-emerald-400' :
                aiStatus === 'offline' ? 'text-rose-400' : 'text-amber-400'
              }`}>
                {aiStatus === 'online' ? 'Engine Online' :
                 aiStatus === 'offline' ? 'Engine Offline' : 'Connecting...'}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area with Subtle Glowing Background */}
      <main className="flex-1 overflow-y-auto relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0f18] to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 to-transparent opacity-20 pointer-events-none"></div>
        <div className="relative z-10 p-10 h-full">
          <Outlet />
        </div>
      </main>

    </div>
  );
}