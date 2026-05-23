import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

const links = [
  { to: '/',          label: 'Home',              icon: '⌂' },
  { to: '/solver',    label: 'Problem Solver',     icon: '⚡' },
  { to: '/analyzer',  label: 'Complexity Analyzer',icon: '📊' },
  { to: '/patterns',  label: 'Pattern Recognizer', icon: '🧠' },
  { to: '/review',    label: 'Code Review',         icon: '🔍' },
  { to: '/cheatsheet',label: 'Cheat Sheet',         icon: '📄' },
  { to: '/mock',      label: 'Mock Interview',      icon: '🎯' },
  { to: '/history',   label: 'History',             icon: '📈' },
];

export default function Layout() {
  const [aiStatus, setAiStatus] = useState('checking');

  useEffect(() => {
    axios.get('http://localhost:5001/api/health')
      .then(() => setAiStatus('online'))
      .catch(() => setAiStatus('offline'));
  }, []);

  return (
    <div className="flex h-screen bg-slate-900 text-white">
      <aside className="w-64 bg-slate-950 flex flex-col
                        border-r border-slate-800 flex-shrink-0">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold text-purple-400">CodeAce</h1>
          <p className="text-xs text-slate-500 mt-1">Agentic AI Interview Coach</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {links.map(l => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                 transition-colors ${isActive
                   ? 'bg-purple-600 text-white'
                   : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`
              }>
              <span>{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <div className={`w-2 h-2 rounded-full ${
              aiStatus === 'online' ? 'bg-green-500' :
              aiStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
            }`} />
            AI {aiStatus === 'online' ? 'Online' :
                aiStatus === 'offline' ? 'Offline' : 'Checking...'}
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
