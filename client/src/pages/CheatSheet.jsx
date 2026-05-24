import React, { useState, useRef } from 'react';
import useAgent from '../hooks/useAgent';
import { generateCheatSheet } from '../services/agentAPI';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function CheatSheet() {
  const [topic, setTopic] = useState('');
  const sheetRef = useRef(null);
  const { loading, result, error, run } = useAgent(generateCheatSheet);

  const downloadPDF = async () => {
    if (!sheetRef.current) return;

    try {
      // Scale 2 ensures high-resolution output for text
      const canvas = await html2canvas(sheetRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, Math.min(imgHeight, pdfHeight));
      pdf.save(`${topic || 'CheatSheet'}.pdf`);
    } catch (err) {
      console.error("PDF Export failed:", err);
      alert("Failed to export PDF. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl space-y-6 p-6">
      <h1 className="text-2xl font-bold text-white">Cheat Sheet Generator</h1>
      
      <input 
        value={topic} 
        onChange={e => setTopic(e.target.value)} 
        placeholder="E.g., Graph algorithms"
        className="w-full bg-slate-800 p-3 rounded border border-slate-700 text-white" 
      />
      
      <button 
        onClick={() => run(topic, 'Python')} 
        disabled={!topic || loading}
        className="bg-purple-600 px-4 py-2 rounded text-white disabled:opacity-50"
      >
        {loading ? 'Generating...' : 'Generate Cheat Sheet'}
      </button>

      {error && <div className="text-red-400 p-3 bg-red-900/20 rounded">{error}</div>}
      
      {result && (
        <div className="space-y-4">
          <button 
            onClick={downloadPDF} 
            className="bg-green-600 px-4 py-2 rounded text-white hover:bg-green-700 transition"
          >
            Export as PDF
          </button>
          
          {/* Printable Container */}
          <div 
            ref={sheetRef} 
            className="bg-white text-black p-8 rounded shadow-lg w-full"
            style={{ minHeight: '297mm' }} 
          >
            <h1 className="text-3xl font-bold mb-2">{result.title || topic}</h1>
            <p className="mb-6 text-gray-700">{result.overview}</p>
            
            <div className="space-y-6">
              {result.patterns?.map((p, i) => (
                <div key={i} className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-bold text-lg">{p.name}</h4>
                  <p className="text-sm text-gray-600 mb-2 italic">Complexity: {p.complexity}</p>
                  <pre className="bg-gray-100 p-3 text-xs font-mono rounded overflow-x-auto whitespace-pre-wrap">
                    {p.template}
                  </pre>
                </div>
              ))}
            </div>

            {result.mustKnowProblems?.length > 0 && (
              <div className="mt-8 pt-4 border-t">
                <h3 className="font-bold text-md mb-2">Must-Know Problems</h3>
                <ul className="list-disc pl-5 text-sm text-gray-700">
                  {result.mustKnowProblems.map((prob, i) => <li key={i}>{prob}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}