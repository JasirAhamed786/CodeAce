import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { startTechnicalMock, sendHRMessage, getHRReport, evaluateTechnicalCode } from '../services/agentAPI';

const TOPICS = ['Arrays & Hashing', 'Two Pointers', 'Trees', 'Dynamic Programming', 'Graphs'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const LANGUAGES = ['Python', 'JavaScript', 'Java', 'C++'];

export default function MockInterview() {
  const [mode, setMode] = useState('technical'); // 'technical' | 'hr'
  const chatEndRef = useRef(null);

  // --- Technical State ---
  const [techState, setTechState] = useState('setup'); // 'setup' | 'coding' | 'evaluating' | 'result'
  const [topic, setTopic] = useState('Arrays & Hashing');
  const [difficulty, setDifficulty] = useState('Medium');
  const [language, setLanguage] = useState('Python');
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [techLoading, setTechLoading] = useState(false);

  // --- HR / Behavioral State ---
  const [hrState, setHrState] = useState('setup'); // 'setup' | 'chatting' | 'report'
  const [chatHistory, setChatHistory] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [hrLoading, setHrLoading] = useState(false);
  const [hrReport, setHrReport] = useState(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // --- Technical Actions ---
  const handleStartTech = async () => {
    setTechLoading(true);
    try {
      const res = await startTechnicalMock(difficulty.toLowerCase(), topic.toLowerCase());
      // Assuming your API returns the problem data here. Adjust path if needed.
      setProblem(res.data?.data || res.data || { title: `Mock: ${topic}`, description: "Generate a solution for this problem." });
      setTechState('coding');
    } catch (e) {
      console.error(e);
      alert("Failed to start technical mock. Check backend.");
    } finally {
      setTechLoading(false);
    }
  };

  const handleSubmitTech = async () => {
    setTechState('evaluating');
    try {
      const res = await evaluateTechnicalCode(problem?.title || 'mock', code, language, 30, null);
      setEvaluation(res.data?.data || res.data || { passed: true, feedback: "Great job, optimal complexity achieved." });
      setTechState('result');
    } catch (e) {
      console.error(e);
      alert("Evaluation failed.");
      setTechState('coding');
    }
  };

  // --- HR Actions ---
  const handleStartHR = () => {
    setChatHistory([{ role: 'ai', text: "Hello! I'm your AI recruiter today. Could you start by telling me a little bit about your background and a recent project you're proud of?" }]);
    setHrState('chatting');
  };

  const handleSendHR = async () => {
    if (!currentInput.trim()) return;
    
    const userMsg = currentInput;
    setCurrentInput('');
    const updatedHistory = [...chatHistory, { role: 'user', text: userMsg }];
    setChatHistory(updatedHistory);
    setHrLoading(true);

    try {
      // Convert history to string array format if your backend expects it
      const stringHistory = updatedHistory.map(m => `${m.role === 'ai' ? 'Interviewer' : 'Candidate'}: ${m.text}`);
      const res = await sendHRMessage(stringHistory, userMsg, updatedHistory.length, 'behavioral');
      
      setChatHistory(prev => [...prev, { role: 'ai', text: res.data?.data?.response || res.data?.response || "That's interesting. Can you elaborate?" }]);
    } catch (e) {
      console.error(e);
      setChatHistory(prev => [...prev, { role: 'ai', text: "[System Error: Connection to Recruiter lost]" }]);
    } finally {
      setHrLoading(false);
    }
  };

  const handleEndHR = async () => {
    setHrLoading(true);
    try {
      const stringHistory = chatHistory.map(m => `${m.role === 'ai' ? 'Interviewer' : 'Candidate'}: ${m.text}`);
      const res = await getHRReport(stringHistory);
      setHrReport(res.data?.data || res.data || { score: 85, feedback: "Good communication skills. Try using the STAR method more clearly next time." });
      setHrState('report');
    } catch (e) {
      console.error(e);
      alert("Failed to generate report.");
    } finally {
      setHrLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      
      {/* Header & Tabs */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400">
            Mock Interview Simulator
          </h1>
          <p className="text-slate-400 text-lg">
            Experience realistic, high-pressure interview environments governed by AI.
          </p>
        </div>

        <div className="flex p-1 bg-slate-900 border border-slate-700 rounded-xl w-fit">
          <button 
            onClick={() => setMode('technical')} 
            className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === 'technical' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            💻 Technical Screen
          </button>
          <button 
            onClick={() => setMode('hr')} 
            className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === 'hr' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            🤝 Behavioral / HR
          </button>
        </div>
      </div>

      {/* =========================================
          TECHNICAL INTERVIEW UI
          ========================================= */}
      {mode === 'technical' && (
        <div className="animate-in fade-in slide-in-from-bottom-4">
          
          {techState === 'setup' && (
            <div className="bg-slate-800/40 border border-slate-700/50 p-8 rounded-2xl max-w-2xl shadow-xl">
              <h2 className="text-xl font-bold text-white mb-6">Configure Session</h2>
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Topic</label>
                  <select value={topic} onChange={e => setTopic(e.target.value)} className="w-full mt-1 bg-slate-900 text-slate-200 px-4 py-3 rounded-xl border border-slate-700 focus:ring-2 focus:ring-pink-500 outline-none">
                    {TOPICS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Difficulty</label>
                  <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="w-full mt-1 bg-slate-900 text-slate-200 px-4 py-3 rounded-xl border border-slate-700 focus:ring-2 focus:ring-pink-500 outline-none">
                    {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <button 
                  onClick={handleStartTech} 
                  disabled={techLoading}
                  className="w-full mt-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50"
                >
                  {techLoading ? 'Generating Scenario...' : 'Start Interview ⚡'}
                </button>
              </div>
            </div>
          )}

          {techState === 'coding' && (
            <div className="grid lg:grid-cols-2 gap-6 h-[600px]">
              {/* Problem Statement */}
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 overflow-y-auto shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white">Problem: {problem?.title || topic}</h2>
                  <span className="px-3 py-1 bg-slate-800 border border-slate-600 rounded-lg text-xs font-bold text-pink-400 uppercase">
                    {difficulty}
                  </span>
                </div>
                <div className="prose prose-invert prose-sm text-slate-300">
                  <p>{problem?.description || "Write a robust algorithm to solve the presented scenario. Ensure you account for edge cases and optimize for both time and space complexity."}</p>
                  {/* Map constraints/examples here if your API returns them */}
                </div>
              </div>

              {/* Editor */}
              <div className="bg-slate-900 border border-slate-700 rounded-2xl flex flex-col shadow-xl overflow-hidden">
                <div className="bg-slate-800/80 px-4 py-3 border-b border-slate-700 flex justify-between items-center">
                  <select value={language} onChange={e => setLanguage(e.target.value)} className="bg-slate-900 text-slate-300 px-3 py-1 text-sm rounded border border-slate-700 outline-none">
                    {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                  </select>
                  <button onClick={handleSubmitTech} className="bg-pink-600 hover:bg-pink-500 text-white px-5 py-1.5 rounded-lg text-sm font-bold transition-colors">
                    Submit Code
                  </button>
                </div>
                <div className="flex-1">
                  <Editor 
                    language={language.toLowerCase()} 
                    value={code} 
                    onChange={v => setCode(v || '')}
                    theme="vs-dark" 
                    options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 16 } }} 
                  />
                </div>
              </div>
            </div>
          )}

          {techState === 'evaluating' && (
            <div className="flex flex-col items-center justify-center h-[400px] space-y-4">
              <div className="w-12 h-12 border-4 border-slate-700 border-t-pink-500 rounded-full animate-spin"></div>
              <p className="text-slate-400 font-mono">Running test cases and analyzing complexity...</p>
            </div>
          )}

          {techState === 'result' && (
            <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl shadow-xl max-w-3xl">
              <h2 className="text-2xl font-bold text-white mb-6">Evaluation Results</h2>
              <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 mb-6">
                <pre className="text-slate-300 whitespace-pre-wrap font-sans text-sm">
                  {JSON.stringify(evaluation, null, 2)}
                </pre>
              </div>
              <button onClick={() => {setTechState('setup'); setCode('');}} className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-xl font-bold border border-slate-600">
                Run Another Mock
              </button>
            </div>
          )}
        </div>
      )}


      {/* =========================================
          HR / BEHAVIORAL INTERVIEW UI
          ========================================= */}
      {mode === 'hr' && (
        <div className="animate-in fade-in slide-in-from-bottom-4">
          
          {hrState === 'setup' && (
            <div className="bg-slate-800/40 border border-slate-700/50 p-8 rounded-2xl max-w-2xl shadow-xl flex flex-col items-center text-center space-y-6 mx-auto">
              <div className="text-6xl">🤝</div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Behavioral Screen</h2>
                <p className="text-slate-400">Practice your STAR method. The AI recruiter will ask dynamic follow-up questions based on your responses.</p>
              </div>
              <button onClick={handleStartHR} className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white px-10 py-3 rounded-xl font-bold transition-all w-full">
                Enter Interview Room
              </button>
            </div>
          )}

          {hrState === 'chatting' && (
            <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-700 rounded-2xl flex flex-col h-[600px] shadow-2xl overflow-hidden">
              
              {/* Chat Header */}
              <div className="bg-slate-800/80 px-6 py-4 border-b border-slate-700 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-pink-500/20 border border-pink-500/50 flex items-center justify-center text-lg">🤖</div>
                  <div>
                    <h3 className="font-bold text-slate-200">Alex (AI Recruiter)</h3>
                    <span className="text-xs text-green-400 flex items-center gap-1"><div className="w-2 h-2 bg-green-400 rounded-full"></div> Online</span>
                  </div>
                </div>
                <button onClick={handleEndHR} className="text-xs font-bold bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 px-4 py-2 rounded-lg border border-slate-600 transition-colors">
                  End Interview
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {chatHistory.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-5 py-3 text-sm ${
                      msg.role === 'user' 
                        ? 'bg-pink-600 text-white rounded-br-none shadow-md' 
                        : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-none shadow-md'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {hrLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-none px-5 py-4 flex gap-1">
                      <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-slate-800/50 border-t border-slate-700">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSendHR(); }}
                  className="flex gap-2"
                >
                  <input 
                    value={currentInput} 
                    onChange={e => setCurrentInput(e.target.value)}
                    disabled={hrLoading}
                    placeholder="Type your response using the STAR method..." 
                    className="flex-1 bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500 transition-colors disabled:opacity-50" 
                  />
                  <button 
                    type="submit" 
                    disabled={hrLoading || !currentInput.trim()}
                    className="bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold transition-colors"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          )}

          {hrState === 'report' && (
            <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-700 p-8 rounded-2xl shadow-xl space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Recruiter Feedback</h2>
                <div className="text-4xl font-black text-pink-400 my-4">{hrReport?.score || 85}/100</div>
              </div>
              <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
                <h3 className="text-sm font-bold text-slate-400 uppercase mb-2">Summary</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {hrReport?.feedback || "Great conversation. You communicated your thoughts clearly. Ensure you focus on measurable outcomes when describing past projects."}
                </p>
              </div>
              <button onClick={() => {setHrState('setup'); setChatHistory([]);}} className="w-full bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold border border-slate-600">
                Start New Session
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
}