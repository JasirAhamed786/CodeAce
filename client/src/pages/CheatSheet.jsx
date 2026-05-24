import React, { useState, useRef } from 'react';
import useAgent from '../hooks/useAgent';
import { generateCheatSheet } from '../services/agentAPI';
import html2pdf from 'html2pdf.js';

export default function CheatSheet() {
  const [topic, setTopic] = useState('');
  const [language, setLanguage] = useState('Python');
  const sheetRef = useRef(null);
  const { loading, result, error, run } = useAgent(generateCheatSheet);

  const languages = ['Python', 'JavaScript', 'Java', 'C++', 'Go'];

  // This creates a 1-click direct download!
  const downloadDirectPDF = () => {
    const element = sheetRef.current;
    
    const opt = {
      margin:       10,
      filename:     `${topic.replace(/\s+/g, '_') || 'CheatSheet'}_${language}.pdf`,
      image:        { type: 'jpeg', quality: 1 }, // Max quality
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Generates and downloads the PDF instantly
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="max-w-4xl space-y-6 p-6">
      
      {/* ── UI CONTROLS ── */}
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-white">Cheat Sheet Generator</h1>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <input 
            value={topic} 
            onChange={e => setTopic(e.target.value)} 
            placeholder="E.g., Arrays and Strings, Graphs..."
            className="flex-1 bg-slate-800 p-3 rounded border border-slate-700 text-white focus:outline-none focus:border-purple-500" 
          />
          
          <select 
            value={language}
            onChange={e => setLanguage(e.target.value)}
            className="bg-slate-800 p-3 rounded border border-slate-700 text-white focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            {languages.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={() => run(topic, language)} 
            disabled={!topic || loading}
            className="bg-purple-600 px-6 py-3 rounded font-semibold text-white disabled:opacity-50 hover:bg-purple-700 transition w-full sm:w-auto"
          >
            {loading ? 'Generating...' : `Generate ${language} Cheat Sheet`}
          </button>

          {result && (
            <button 
              onClick={downloadDirectPDF} 
              className="bg-green-600 px-6 py-3 rounded font-semibold text-white hover:bg-green-700 transition w-full sm:w-auto flex items-center gap-2"
            >
              ⬇ Download PDF
            </button>
          )}
        </div>

        {error && <div className="text-red-400 p-3 bg-red-900/20 rounded border border-red-900/50">{error}</div>}
      </div>
      
      {/* ── THE CHEAT SHEET (TARGET FOR PDF DOWNLOAD) ── */}
      {result && (
        <div className="bg-white text-black p-8 rounded shadow-lg w-full" ref={sheetRef}>
          
          <div className="border-b-2 border-gray-200 pb-4 mb-6 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{result.title || topic}</h1>
              <p className="text-gray-700">{result.overview}</p>
            </div>
            <span className="bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              {language}
            </span>
          </div>
          
          <div className="space-y-6">
            {result.patterns?.map((p, i) => (
              <div key={i} className="border-l-4 border-purple-500 pl-4">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-bold text-lg text-gray-800">{p.name}</h4>
                  <span className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {p.complexity}
                  </span>
                </div>
                
                <pre className="bg-slate-50 border border-slate-200 p-4 text-sm font-mono rounded overflow-x-auto whitespace-pre-wrap text-slate-800 mt-3">
                  {p.template}
                </pre>
              </div>
            ))}
          </div>

          {result.mustKnowProblems?.length > 0 && (
            <div className="mt-8 pt-6 border-t-2 border-gray-200">
              <h3 className="font-bold text-lg mb-4 text-gray-900">Must-Know Problems</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
                {result.mustKnowProblems.map((prob, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                    {prob}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}