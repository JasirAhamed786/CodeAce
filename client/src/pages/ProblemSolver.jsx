import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import useAgent from '../hooks/useAgent';
import AIThinking from '../components/AIThinking';
import { solveProblem } from '../services/agentAPI';

const LANGUAGES = ['Python', 'JavaScript', 'Java', 'C++', 'Go'];

export default function ProblemSolver() {
  const [problem, setProblem] = useState('');
  const [language, setLanguage] = useState('Python');
  const [tab, setTab] = useState('optimal');
  const { loading, error, result, run } = useAgent(solveProblem);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
          Problem Solver
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl">
          Paste any coding problem. Our AI agent runs a 4-step reasoning chain to classify the pattern, plan the approach, write the code, and critique edge cases.
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 p-6 rounded-2xl shadow-xl space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
            Problem Description
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-slate-900 text-slate-200 px-4 py-2 rounded-lg border border-slate-700 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
          >
            {LANGUAGES.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </div>

        <textarea
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          placeholder="Paste your LeetCode, HackerRank, or assignment text here..."
          className="w-full h-40 bg-slate-900/50 text-slate-200 p-4 rounded-xl border border-slate-700 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-purple-500/50 font-mono"
        />

        <div className="flex justify-end">
          <button
            onClick={() => run(problem, language)}
            disabled={loading || !problem}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-purple-500/20 flex items-center gap-2"
          >
            {loading ? (
              <span className="animate-pulse">Agent is thinking...</span>
            ) : (
              <span>Solve Problem ⚡</span>
            )}
          </button>
        </div>
      </div>

      {/* AI Thinking State */}
      {loading && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <AIThinking
            customSteps={[
              'Step 1: Analyzing and classifying DSA pattern...',
              'Step 2: Planning brute force and optimal approaches...',
              'Step 3: Generating code and calculating Big O...',
              'Step 4: Critiquing edge cases like a Principal Engineer...',
            ]}
          />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl flex items-center gap-3 animate-in fade-in">
          <span className="text-red-400 text-xl">⚠️</span>
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Results Section */}
      {result && !loading && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          {/* Top Row: Classification & Reasoning Trail */}
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Pattern Card */}
            <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Classification</h3>
              <div className="flex items-center gap-3">
                <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-4 py-1.5 rounded-full text-sm font-semibold">
                  {result?.classification?.pattern || 'Analysis pending'}
                </span>
                <span className="text-slate-400 text-sm flex items-center gap-1">
                  🎯 {result?.classification?.confidence || 0}% Match
                </span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                {result?.classification?.reasoning || 'No reasoning provided.'}
              </p>
            </div>

            {/* Reasoning Trail */}
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Agent Trail</h3>
              <div className="space-y-3">
                {[
                  `Identified pattern: ${result?.classification?.pattern || 'Unknown'}`,
                  `Insight: ${result?.plan?.keyInsight || 'N/A'}`,
                  `Brute Force: O(${result?.solutions?.brute?.timeComplexity || '?'}) → Optimal: O(${result?.solutions?.optimal?.timeComplexity || '?'})`,
                  `Found ${(result?.critique?.edgeCases || []).length} critical edge cases`,
                ].map((s, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-[10px] text-slate-400 flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <span className="text-slate-300">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Code Solutions Area */}
          <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
            {/* Tabs */}
            <div className="flex bg-slate-800/50 border-b border-slate-700">
              {['brute', 'optimal'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 px-6 py-4 text-sm font-bold transition-all ${
                    tab === t
                      ? 'text-purple-400 border-b-2 border-purple-500 bg-slate-800/80'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
                  }`}
                >
                  {t === 'brute' ? 'Brute Force Approach' : 'Optimal Approach'}
                </button>
              ))}
            </div>

            {/* Code Content */}
            <div className="p-6 space-y-6">
              {/* Complexities */}
              <div className="flex gap-4">
                <div className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-lg flex items-center gap-2">
                  <span className="text-lg">⏱️</span>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Time</p>
                    <p className="text-sm text-slate-200 font-mono">O({result?.solutions?.[tab]?.timeComplexity || '?'})</p>
                  </div>
                </div>
                <div className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-lg flex items-center gap-2">
                  <span className="text-lg">💾</span>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Space</p>
                    <p className="text-sm text-slate-200 font-mono">O({result?.solutions?.[tab]?.spaceComplexity || '?'})</p>
                  </div>
                </div>
              </div>

              {/* Editor */}
              <div className="rounded-xl overflow-hidden border border-slate-700">
                <Editor
                  height="300px"
                  language={language.toLowerCase()}
                  value={result?.solutions?.[tab]?.code || '// Code not generated properly'}
                  theme="vs-dark"
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 14,
                    padding: { top: 16 },
                    scrollBeyondLastLine: false,
                  }}
                />
              </div>

              {/* Explanation */}
              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
                <p className="text-slate-300 text-sm leading-relaxed">
                  <span className="font-bold text-slate-200 mr-2">How it works:</span>
                  {result?.solutions?.[tab]?.explanation || 'No explanation provided.'}
                </p>
              </div>
            </div>
          </div>

          {/* Feedback Section */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-800/40 rounded-2xl p-6 border border-slate-700/50">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <span>⚠️</span> Edge Cases to Consider
              </h3>
              <ul className="space-y-3">
                {(result?.critique?.edgeCases || []).length > 0 ? (
                  result.critique.edgeCases.map((e, i) => (
                    <li key={i} className="text-slate-400 text-sm flex items-start gap-3">
                      <span className="text-slate-600 mt-0.5">•</span> {e}
                    </li>
                  ))
                ) : (
                  <li className="text-slate-500 text-sm italic">No edge cases identified.</li>
                )}
              </ul>
            </div>

            <div className="bg-slate-800/40 rounded-2xl p-6 border border-slate-700/50">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <span>💡</span> Senior Interview Tips
              </h3>
              <ul className="space-y-3">
                {(result?.critique?.interviewTips || []).length > 0 ? (
                  result.critique.interviewTips.map((t, i) => (
                    <li key={i} className="text-slate-400 text-sm flex items-start gap-3">
                      <span className="text-green-500 mt-0.5">✓</span> {t}
                    </li>
                  ))
                ) : (
                  <li className="text-slate-500 text-sm italic">No interview tips available.</li>
                )}
              </ul>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}