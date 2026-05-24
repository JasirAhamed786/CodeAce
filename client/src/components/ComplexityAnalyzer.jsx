import React, { useState } from 'react';
import axios from 'axios';
import AiThinking from './AiThinking';
import AgentError from './AgentError';

const ComplexityAnalyzer = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!code.trim()) return setError("Please enter some code.");
    setLoading(true); setError(''); setAnalysis(null);
    
    try {
      const response = await axios.post('/api/analyze', { code, language });
      const data = response.data?.data || response.data;

      if (data?.isValid === false) {
        setError(data.error || "Invalid syntax.");
      } else if (data) {
        setAnalysis(data);
      } else {
        throw new Error("Invalid response format.");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Engine offline.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h2 className="text-2xl font-bold mb-4">Complexity Analyzer</h2>
      {/* UI Controls */}
      <select value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-gray-800 p-2 rounded mb-4">
        <option value="javascript">JavaScript</option>
        <option value="python">Python</option>
        {/* ... add others */}
      </select>
      <textarea className="w-full h-64 bg-black p-4 rounded font-mono mb-4" value={code} onChange={(e) => setCode(e.target.value)} />
      <button onClick={handleAnalyze} disabled={loading} className="bg-blue-600 px-6 py-2 rounded">
        {loading ? "Analyzing..." : "Calculate Big O"}
      </button>
      
      {/* Defensive Rendering */}
      {loading && <AiThinking />}
      {error && <AgentError message={error} />}
      {analysis && !loading && (
        <div className="mt-8 bg-gray-800 p-6 rounded">
          <p><strong>Time:</strong> {analysis.timeComplexity}</p>
          <p><strong>Space:</strong> {analysis.spaceComplexity}</p>
          <p><strong>Bottleneck:</strong> {analysis.bottleneck}</p>
        </div>
      )}
    </div>
  );
};

export default ComplexityAnalyzer;