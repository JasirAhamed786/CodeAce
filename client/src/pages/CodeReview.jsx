import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import useAgent from '../hooks/useAgent';
import { reviewCode } from '../services/agentAPI';
import AIThinking from '../components/AIThinking';

const LANGUAGES = ['JavaScript', 'Python', 'Java', 'C++', 'Go'];

export default function CodeReview() {
  const [problem, setProblem] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('JavaScript');
  
  // Note: Your useAgent wrapper needs to pass (code, problem, language) to the API
  const { loading, result, error, run } = useAgent(reviewCode);

  // Helper to color-code the overall score
  const getScoreColor = (score) => {
    if (score >= 85) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400">
          Code Review
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl">
          Paste your solution and the problem context. Our AI will act as a strict Principal Engineer, grading your code, finding bugs, and providing a production-ready refactor.
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 p-6 rounded-2xl shadow-xl space-y-4">
        
        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
            Problem Context
          </label>
          <input 
            placeholder="e.g., Find the longest palindromic substring in a string..." 
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            className="w-full bg-slate-900/50 text-slate-200 p-3 rounded-xl border border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50" 
          />
        </div>

        <div className="flex justify-between items-end pt-2">
          <label className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
            Candidate Solution
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-slate-900 text-slate-200 px-4 py-2 rounded-lg border border-slate-700 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all"
          >
            {LANGUAGES.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </div>

        <div className="rounded-xl overflow-hidden border border-slate-700">
          <Editor 
            height="300px" 
            language={language.toLowerCase()} 
            value={code} 
            onChange={(v) => setCode(v || '')}
            theme="vs-dark" 
            options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 16 } }} 
          />
        </div>

        <div className="flex justify-end">
          <button 
            onClick={() => run(code, problem, language)} 
            disabled={!code || !problem || loading}
            className="bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-rose-500/20 flex items-center gap-2"
          >
            {loading ? (
              <span className="animate-pulse">Reviewing Code...</span>
            ) : (
              <span>Submit for Review 🕵️</span>
            )}
          </button>
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <AIThinking 
            customSteps={[
              'Step 1: Parsing logic and intent against problem constraints...',
              'Step 2: Conducting strict FAANG-style code review...',
              'Step 3: Rewriting to production-level standards...'
            ]} 
          />
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl flex items-center gap-3 animate-in fade-in">
          <span className="text-red-400 text-xl">⚠️</span>
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Results Section */}
      {result && !loading && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          {/* Top Level: Score & Verdict */}
          <div className="grid md:grid-cols-3 gap-6">
            
            {/* Scorecard */}
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 flex items-center justify-between shadow-xl">
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Overall Grade</h3>
                <div className={`text-5xl font-black ${getScoreColor(result?.critique?.overallScore || 0)}`}>
                  {result?.critique?.overallScore || 0}<span className="text-2xl text-slate-600">/100</span>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-xl font-bold text-sm border ${result?.understanding?.isCorrect ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
                {result?.understanding?.isCorrect ? '✓ LOGIC CORRECT' : '✕ LOGIC FLAWED'}
              </div>
            </div>

            {/* Understanding Synopsis */}
            <div className="md:col-span-2 bg-slate-800/60 border border-slate-700 rounded-2xl p-6 shadow-xl">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Reviewer's Understanding</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                {result?.understanding?.understanding || 'No understanding provided.'}
              </p>
            </div>
          </div>

          {/* Critique Section */}
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Bugs & Issues */}
            <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
              <div className="bg-red-500/10 border-b border-slate-700 p-4">
                <h3 className="text-sm font-bold text-red-400 uppercase tracking-wide flex items-center gap-2">
                  <span>🐛</span> Bugs & Logic Flaws
                </h3>
              </div>
              <div className="p-0">
                {(result?.critique?.bugs || []).length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-sm">No critical bugs found. Great job!</div>
                ) : (
                  <ul className="divide-y divide-slate-800">
                    {result.critique.bugs.map((bug, i) => (
                      <li key={i} className="p-4 hover:bg-slate-800/30 transition-colors">
                        <div className="flex gap-3 mb-2">
                          <span className="bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded border border-slate-700 h-fit whitespace-nowrap">
                            Line {bug.line}
                          </span>
                          <span className="text-slate-300 text-sm font-medium">{bug.issue}</span>
                        </div>
                        <div className="pl-14 text-sm text-green-400 flex items-start gap-2">
                          <span>↳</span> {bug.fix}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Style & Edge Cases */}
            <div className="space-y-6">
              <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 shadow-xl">
                <h3 className="text-sm font-bold text-orange-400 uppercase tracking-wide mb-3">Edge Cases Missed</h3>
                <ul className="space-y-2">
                  {(result?.critique?.edgeCasesMissed || []).length === 0 ? (
                    <li className="text-slate-500 text-sm">All edge cases handled.</li>
                  ) : (
                    result.critique.edgeCasesMissed.map((ec, i) => (
                      <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                        <span className="text-orange-500 mt-0.5">⚠</span> {ec}
                      </li>
                    ))
                  )}
                </ul>
              </div>

              <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 shadow-xl">
                <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-wide mb-3">Style & Best Practices</h3>
                <ul className="space-y-2">
                  {(result?.critique?.styleIssues || []).length === 0 ? (
                    <li className="text-slate-500 text-sm">Code style looks professional.</li>
                  ) : (
                    result.critique.styleIssues.map((style, i) => (
                      <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                        <span className="text-slate-500 mt-0.5">•</span> {style}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Refactor Section */}
          <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-slate-800/80 p-4 border-b border-slate-700 flex justify-between items-center">
              <h3 className="text-sm font-bold text-green-400 uppercase tracking-wide flex items-center gap-2">
                <span>✨</span> Production-Ready Refactor
              </h3>
            </div>
            
            <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-700">
              {/* Code Editor */}
              <div className="md:col-span-2">
                <Editor 
                  height="350px" 
                  language={language.toLowerCase()} 
                  value={result?.refactor?.refactoredCode || '// No refactor provided'} 
                  theme="vs-dark" 
                  options={{ readOnly: true, minimap: { enabled: false }, fontSize: 14, padding: { top: 16 } }} 
                />
              </div>
              
              {/* Refactor Notes */}
              <div className="p-6 space-y-6 bg-slate-800/30">
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Why this is better</h4>
                  <ul className="space-y-3">
                    {(result?.refactor?.changesExplained || []).length === 0 ? (
                      <li className="text-sm text-slate-500 italic">No explanation provided.</li>
                    ) : (
                      result.refactor.changesExplained.map((change, i) => (
                        <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span> {change}
                        </li>
                      ))
                    )}
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Senior Tips</h4>
                  <ul className="space-y-3">
                    {(result?.refactor?.seniorTips || []).length === 0 ? (
                      <li className="text-sm text-slate-500 italic">No tips provided.</li>
                    ) : (
                      result.refactor.seniorTips.map((tip, i) => (
                        <li key={i} className="text-sm text-slate-300 bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                          <span className="font-bold text-purple-400 mr-1">Tip:</span> {tip}
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}