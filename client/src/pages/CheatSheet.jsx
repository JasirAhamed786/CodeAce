import React from 'react';
import { useState } from 'react';
import useAgent from '../hooks/useAgent';
import { generateCheatSheet } from '../services/agentAPI';

export default function CheatSheet(){
  const [topic, setTopic] = useState('');
  const { loading, result, error, run } = useAgent(generateCheatSheet);

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">Cheat Sheets</h1>
      <p className="text-slate-400">Generate a printable cheat sheet for a topic.</p>
      <input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="E.g., Graph algorithms"
        className="w-full bg-slate-800 p-3 rounded border border-slate-700 text-sm text-white" />
      <button onClick={() => run(topic,'Python')} disabled={!topic || loading}
        className="bg-purple-600 px-4 py-2 rounded text-white">Generate</button>

      {loading && <div className="text-slate-400">Generating…</div>}
      {result && (
        <div className="bg-slate-800 p-4 rounded border border-slate-700">
          <h3 className="text-white font-medium">{topic} — Cheat Sheet</h3>
          <div className="text-slate-300 text-sm mt-3 whitespace-pre-wrap">{result.sheet}</div>
        </div>
      )}
      {error && <div className="text-red-300">{error}</div>}
    </div>
  );
}
