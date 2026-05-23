import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import useAgent from '../hooks/useAgent';
import { detectPattern } from '../services/agentAPI';
import AIThinking from '../components/AIThinking';

const LANGUAGES = ['Python', 'JavaScript', 'Java', 'C++', 'Go'];

export default function PatternRecognizer() {
  const [problem, setProblem] = useState('');
  const [language, setLanguage] = useState('Python');
  const { loading, result, error, run } = useAgent(detectPattern);

  // Helper to color-code difficulty
  const getDifficultyColor = (diff) => {
    const d = diff.toLowerCase();
    if (d === 'easy') return 'text-green-400 bg-green-400/10 border-green-500/20';
    if (d === 'medium') return 'text-yellow-400 bg-yellow-400/10 border-yellow-500/20';
    if (d === 'hard') return 'text-red-400 bg-red-400/10 border-red-500/20';
    return 'text-slate-400 bg-slate-800 border-slate-700';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
          Pattern Recognizer
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl">
          Don't know where to start? Paste a problem description and our AI will detect the underlying DSA pattern, providing the core template to solve it.
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
            className="bg-slate-900 text-slate-200 px-4 py-2 rounded-lg border border-slate-700 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
          >
            {LANGUAGES.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </div>

        <textarea
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          placeholder="e.g., Given an array of integers, return the maximum sum of a contiguous subarray of size k..."
          className="w-full h-32 bg-slate-900/50 text-slate-200 p-4 rounded-xl border border-slate-700 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono"
        />

        <div className="flex justify-end">
          <button
            onClick={() => run(problem, language)}
            disabled={!problem || loading}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
          >
            {loading ? (
              <span className="animate-pulse">Scanning Data...</span>
            ) : (
              <span>Detect Pattern 🧩</span>
            )}
          </button>
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <AIThinking 
            customSteps={[
              'Step 1: Analyzing problem constraints and keywords...',
              'Step 2: Cross-referencing 20+ core DSA patterns...',
              'Step 3: Generating language-specific code template...',
              'Step 4: Finding similar LeetCode problems...'
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
          
          {/* Top Row: Primary Detection */}
          <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
            <div className="bg-blue-500/10 border-b border-slate-700 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Primary Match</h2>
                <div className="text-3xl font-black text-white">{result.detection.primaryPattern}</div>
              </div>
              <div className="bg-slate-900 border border-slate-700 px-4 py-2 rounded-xl flex items-center gap-3 shadow-inner">
                <span className="text-sm text-slate-400">Confidence</span>
                <span className="text-xl font-bold text-blue-400">{result.detection.confidence}%</span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-sm font-bold text-slate-300 mb-2">Why this pattern?</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{result.detection.whyThisPattern}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            
            {/* Left Column: Template & Explanation */}
            <div className="md:col-span-2 space-y-6">
              
              <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
                <div className="bg-slate-800/80 p-4 border-b border-slate-700 flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide">
                    Base Template ({language})
                  </h3>
                </div>
                <Editor
                  height="300px"
                  language={language.toLowerCase()}
                  value={result.expansion.patternTemplate}
                  theme="vs-dark"
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 14,
                    padding: { top: 16 },
                    scrollBeyondLastLine: false,
                  }}
                />
                <div className="p-5 bg-slate-800/40 border-t border-slate-700/50">
                  <p className="text-sm text-slate-300 mb-3">
                    <span className="font-bold text-slate-200">How it works:</span> {result.expansion.templateExplanation}
                  </p>
                  <p className="text-xs text-slate-400 font-mono bg-slate-900 p-3 rounded-lg border border-slate-700">
                    <span className="text-blue-400 font-bold mr-2">Key Variables:</span> 
                    {result.expansion.keyVariables}
                  </p>
                </div>
              </div>

            </div>

            {/* Right Column: Alternative Patterns & Similar Problems */}
            <div className="space-y-6">
              
              {/* Similar Problems */}
              <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 shadow-xl">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide mb-4">
                  Practice Problems
                </h3>
                <div className="space-y-3">
                  {result.expansion.similarProblems.map((prob, i) => (
                    <div key={i} className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/50 hover:border-blue-500/50 transition-colors cursor-pointer group">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-bold text-slate-200 group-hover:text-blue-400 transition-colors">
                          {prob.number ? `${prob.number}. ` : ''}{prob.name}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${getDifficultyColor(prob.difficulty)}`}>
                          {prob.difficulty}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2">{prob.whySimilar}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alternative Patterns */}
              {result.detection.alternativePatterns && result.detection.alternativePatterns.length > 0 && (
                <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 shadow-xl">
                  <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <span className="text-slate-500">🔍</span> Also Considered
                  </h3>
                  <div className="space-y-3">
                    {result.detection.alternativePatterns.map((alt, i) => (
                      <div key={i} className="border-l-2 border-slate-600 pl-3 py-1">
                        <h4 className="text-sm font-bold text-slate-300">{alt.name}</h4>
                        <p className="text-xs text-slate-500 mt-1">{alt.reason}</p>
                        <p className="text-xs text-slate-400 mt-1 italic">Tradeoff: {alt.tradeoff}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}