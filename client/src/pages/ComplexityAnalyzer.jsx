import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import useAgent from '../hooks/useAgent';
import { analyzeCode } from '../services/agentAPI';
import AIThinking from '../components/AIThinking';

const LANGUAGES = ['javascript', 'python', 'java', 'cpp', 'go'];

export default function ComplexityAnalyzer() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const { loading, result, error, run } = useAgent(analyzeCode);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
          Complexity Analyzer
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl">
          Paste any function. Our AI acts as a computer science professor, breaking down your Time and Space complexity line-by-line and finding bottlenecks.
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 p-6 rounded-2xl shadow-xl space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
            Source Code
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-slate-900 text-slate-200 px-4 py-2 rounded-lg border border-slate-700 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all"
          >
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
            ))}
          </select>
        </div>

        <div className="rounded-xl overflow-hidden border border-slate-700">
          <Editor
            height="300px"
            language={language}
            value={code}
            onChange={(val) => setCode(val || '')}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              padding: { top: 16 },
            }}
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => run(code, language)}
            disabled={!code || loading}
            className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-teal-500/20 flex items-center gap-2"
          >
            {loading ? (
              <span className="animate-pulse">Analyzing Code...</span>
            ) : (
              <span>Calculate Big O ⚡</span>
            )}
          </button>
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <AIThinking 
            customSteps={[
              'Step 1: Parsing Abstract Syntax Tree...',
              'Step 2: Calculating loops and recursive depth...',
              'Step 3: Identifying dominant terms and bottlenecks...',
              'Step 4: Formulating optimization suggestions...'
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
          
          {/* Top Metrics Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 flex flex-col justify-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Time Complexity</span>
              <span className="text-2xl font-mono text-teal-400">O({result?.timeComplexity || '?'})</span>
            </div>
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 flex flex-col justify-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Space Complexity</span>
              <span className="text-2xl font-mono text-emerald-400">O({result?.spaceComplexity || '?'})</span>
            </div>
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 flex flex-col justify-center col-span-2">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Bottleneck / Dominant Term</span>
              <span className="text-sm font-medium text-slate-200">{result?.bottleneck || 'None identified'}</span>
              <span className="text-xs text-slate-400 mt-1 font-mono">Term: {result?.dominantTerm || 'N/A'}</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            
            {/* Line-by-Line Table (Takes up 2 columns) */}
            <div className="md:col-span-2 bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
              <div className="bg-slate-800/80 p-4 border-b border-slate-700">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide">Line-by-Line Breakdown</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800">
                      <th className="py-3 px-4 text-xs font-semibold text-slate-500 w-1/2">Code Segment</th>
                      <th className="py-3 px-4 text-xs font-semibold text-slate-500">Operation</th>
                      <th className="py-3 px-4 text-xs font-semibold text-slate-500">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-sm">
                    {(result?.lineByLineAnalysis || []).length > 0 ? (
                      result.lineByLineAnalysis.map((item, i) => (
                        <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-4 text-slate-300 font-mono text-xs">{item.line}</td>
                          <td className="py-3 px-4 text-slate-400">{item.operation}</td>
                          <td className="py-3 px-4">
                            <span className="bg-slate-800 text-teal-400 border border-slate-700 px-2 py-1 rounded text-xs font-mono">
                              {item.complexityContribution}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="py-4 text-center text-slate-500 text-xs italic">
                          No line-by-line data available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Suggestions Column */}
            <div className="space-y-6">
              <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 shadow-xl">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <span>💡</span> Optimizations
                </h3>
                <div className="space-y-4">
                  {(result?.optimizationSuggestions || []).length > 0 ? (
                    result.optimizationSuggestions.map((opt, i) => (
                      <div key={i} className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                        <p className="text-sm text-slate-300 mb-2">{opt.suggestion}</p>
                        <span className="text-xs text-emerald-400 font-medium bg-emerald-400/10 px-2 py-1 rounded">
                          Expected: {opt.expectedImprovement}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-xs italic">No optimizations suggested.</p>
                  )}
                </div>
              </div>
            </div>
            
          </div>

          {/* Improved Code Display */}
          {result?.improvedCode && (
            <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
              <div className="bg-slate-800/80 p-4 border-b border-slate-700 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide">Optimized Code Output</h3>
              </div>
              <Editor
                height="250px"
                language={language}
                value={result.improvedCode}
                theme="vs-dark"
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 14,
                  padding: { top: 16 },
                }}
              />
            </div>
          )}

        </div>
      )}
    </div>
  );
}