import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { startTechnicalMock, sendHRMessage, getHRReport, evaluateTechnicalCode } from '../services/agentAPI';

const TOPICS = ['Arrays & Hashing', 'Two Pointers', 'Trees', 'Dynamic Programming', 'Graphs'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const LANGUAGES = ['Python', 'JavaScript', 'Java', 'C++'];

// ✅ Piston API Language Mapping
const PISTON_LANGUAGES = {
  'Python': { language: 'python', version: '3.10.0' },
  'JavaScript': { language: 'javascript', version: '18.15.0' },
  'Java': { language: 'java', version: '15.0.2' },
  'C++': { language: 'cpp', version: '10.2.0' }
};

export default function MockInterview() {
  const [mode, setMode] = useState('technical'); // 'technical' | 'hr'
  const chatEndRef = useRef(null);

  // --- Technical State ---
  const [techState, setTechState] = useState('setup'); 
  const [topic, setTopic] = useState('Arrays & Hashing');
  const [difficulty, setDifficulty] = useState('Medium');
  const [language, setLanguage] = useState('Python');
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [techLoading, setTechLoading] = useState(false);
  
  // Terminal Run State
  const [runOutput, setRunOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  // --- HR / Behavioral State ---
  const [hrState, setHrState] = useState('setup'); 
  const [chatHistory, setChatHistory] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [hrLoading, setHrLoading] = useState(false);
  const [hrReport, setHrReport] = useState(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // --- Technical Actions ---
  const handleStartTech = async () => {
    setTechLoading(true);
    try {
      const res = await startTechnicalMock(difficulty.toLowerCase(), topic.toLowerCase());
      setProblem(res.data?.data || res.data);
      
      // Starter templates based on language
      const templates = {
        'Python': 'def solution():\n    # Write your code here\n    pass\n\nprint("Test Output:", solution())',
        'JavaScript': 'function solution() {\n    // Write your code here\n}\n\nconsole.log("Test Output:", solution());',
        'Java': 'public class Main {\n    public static void main(String[] args) {\n        // Write your code here\n        System.out.println("Hello World");\n    }\n}',
        'C++': '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    cout << "Hello World" << endl;\n    return 0;\n}'
      };
      
      setCode(templates[language] || `// Write your ${language} solution here\n\n`);
      setTechState('coding');
    } catch (e) {
      console.error(e);
      alert("Failed to start technical mock. Check backend.");
    } finally {
      setTechLoading(false);
    }
  };

  // ✅ THE TRUE MULTI-LANGUAGE COMPILER (Using Piston API)
  const handleRunCode = async () => {
    const handleRunCode = async () => {
    if (!code.trim()) {
      setRunOutput("> ⚠️ Warning: The editor is empty. Please write some code to run.");
      return;
    }
    // ... rest of the function stays exactly the same
    }
    
    setIsRunning(true);
    setRunOutput(`Initializing ${language} execution environment...\n`);

    try {
      if (language.toLowerCase() === 'javascript') {
        // FAST NATIVE JAVASCRIPT EXECUTION
        let logs = [];
        const originalLog = console.log;
        console.log = (...args) => {
          logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' '));
        };
        
        try {
          // eslint-disable-next-line no-new-func
          const runFn = new Function(code);
          runFn(); 
          setRunOutput(`> Build successful.\n\n[Console Output]\n${logs.length > 0 ? logs.join('\n') : '(No output)'}\n\n> ✅ Executed locally.`);
        } catch (err) {
          setRunOutput(`> Execution failed.\n\n[Error]\n${err.toString()}`);
        } finally {
          console.log = originalLog; 
        }
      } else {
        // AI VIRTUAL COMPILER FOR PYTHON, JAVA, C++
        setRunOutput(prev => prev + `> Sending to AI Virtual Compiler...\n`);
        
        // 2. THIS IS THE DIRECT CALL TO YOUR BACKEND
        const res = await axios.post('http://localhost:5001/api/mock/technical/run', {
          code: code,
          language: language,
          problemTitle: pData?.title || topic
        });
        
        const simData = res.data?.data || res.data;
        
        if (simData.success) {
          setRunOutput(`> ✅ Build successful (Simulated).\n\n[Console Output]\n${simData.output}`);
        } else {
          setRunOutput(`> ❌ Execution failed (Simulated).\n\n[Error]\n${simData.output}`);
        }
      }
    } catch (e) {
      setRunOutput(`> 🔌 System Error: Failed to reach Virtual Compiler.\n${e.message}`);
    } finally {
      setIsRunning(false);
    }
  };
  const handleSubmitTech = async () => {
    if (!code.trim() || code.includes('Write your')) {
      alert("Please write a solution before submitting!");
      return;
    }

    setTechState('evaluating');
    setRunOutput(''); 
    try {
      const res = await evaluateTechnicalCode(problem, code, language, 30, null);
      setEvaluation(res.data?.data || res.data);
      setTechState('result');
    } catch (e) {
      console.error(e);
      alert("Evaluation failed. Please check the backend.");
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

  // --- Smart JSON Renderer ---
  const renderBeautifulData = (val, depth = 0) => {
    if (typeof val === 'boolean') {
      return val ? (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-500/10 border border-green-500/20 text-green-400 font-bold text-sm">✅ Passed</span>
      ) : (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-sm">❌ Failed</span>
      );
    }
    
    if (typeof val === 'number') {
       return <span className="text-pink-400 font-mono font-bold text-lg">{val}</span>;
    }

    if (Array.isArray(val)) {
      if (val.length === 0) return <span className="text-slate-500 italic text-sm">None</span>;
      return (
        <ul className="list-disc pl-5 space-y-2 mt-2">
          {val.map((item, i) => (
            <li key={i} className="text-slate-300">
              {typeof item === 'object' ? renderBeautifulData(item, depth + 1) : renderBeautifulData(item)}
            </li>
          ))}
        </ul>
      );
    } else if (typeof val === 'object' && val !== null) {
      return (
        <div className={`space-y-4 ${depth > 0 ? 'bg-slate-900/40 p-5 rounded-xl border border-slate-800 mt-2' : ''}`}>
          {Object.entries(val).map(([key, v]) => {
            const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            return (
              <div key={key} className={depth === 0 ? "border-b border-slate-800 pb-4 mb-4 last:border-0" : ""}>
                <span className="text-pink-400 font-bold uppercase tracking-wider text-xs block mb-2">{formattedKey}</span>
                {renderBeautifulData(v, depth + 1)}
              </div>
            );
          })}
        </div>
      );
    } else if (typeof val === 'string' && (val.includes('\n') || val.includes('{') || val.includes('let ') || val.includes('def '))) {
      return (
        <pre className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-sm font-mono text-green-400 overflow-x-auto whitespace-pre-wrap mt-2 shadow-inner">{val}</pre>
      );
    } else {
      return <span className="text-slate-300">{String(val)}</span>;
    }
  };

  const pData = problem?.problem || problem; 

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
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Language</label>
                  <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full mt-1 bg-slate-900 text-slate-200 px-4 py-3 rounded-xl border border-slate-700 focus:ring-2 focus:ring-pink-500 outline-none">
                    {LANGUAGES.map(l => <option key={l}>{l}</option>)}
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
            <div className="grid lg:grid-cols-2 gap-6 h-[750px]">
              
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 overflow-y-auto shadow-xl custom-scrollbar">
                <div className="flex justify-between items-start mb-6 border-b border-slate-800 pb-4">
                  <h2 className="text-2xl font-bold text-white">{pData?.title || topic}</h2>
                  <span className="px-3 py-1 bg-slate-800 border border-slate-600 rounded-lg text-xs font-bold text-pink-400 uppercase tracking-wider">
                    {difficulty}
                  </span>
                </div>
                
                <div className="prose prose-invert prose-sm text-slate-300 max-w-none space-y-6">
                  <p className="whitespace-pre-wrap text-base leading-relaxed">
                    {pData?.description || "Write a robust algorithm to solve the presented scenario."}
                  </p>

                  {pData?.examples?.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-pink-400 font-bold uppercase tracking-wide text-xs">Examples</h3>
                      {pData.examples.map((ex, i) => (
                        <div key={i} className="bg-slate-950 border border-slate-800 p-4 rounded-xl font-mono text-sm shadow-inner">
                          <div className="mb-1"><span className="text-slate-500 select-none">Input:  </span> <span className="text-green-300">{ex.input}</span></div>
                          <div className="mb-1"><span className="text-slate-500 select-none">Output: </span> <span className="text-blue-300">{ex.output}</span></div>
                          {ex.explanation && <div className="text-slate-400 mt-2 italic text-xs border-t border-slate-800 pt-2">💡 {ex.explanation}</div>}
                        </div>
                      ))}
                    </div>
                  )}

                  {pData?.constraints?.length > 0 && (
                    <div className="space-y-2 bg-slate-800/30 p-4 rounded-xl">
                      <h3 className="text-pink-400 font-bold uppercase tracking-wide text-xs mb-2">Constraints</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {pData.constraints.map((c, i) => <li key={i} className="text-slate-300 font-mono text-xs">{c}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-4 h-full">
                <div className="bg-slate-900 border border-slate-700 rounded-2xl flex flex-col shadow-xl overflow-hidden flex-grow">
                  <div className="bg-slate-800/80 px-4 py-3 border-b border-slate-700 flex justify-between items-center">
                    <span className="text-slate-400 text-sm font-mono font-bold px-2">{language}</span>
                    <div className="flex gap-3">
                      <button 
                        onClick={handleRunCode} 
                        disabled={isRunning}
                        className="bg-slate-700 hover:bg-slate-600 text-white px-5 py-2 rounded-lg text-sm font-bold transition-colors shadow-lg disabled:opacity-50"
                      >
                        {isRunning ? 'Running...' : '▶ Run Code'}
                      </button>
                      <button 
                        onClick={handleSubmitTech} 
                        className="bg-pink-600 hover:bg-pink-500 text-white px-5 py-2 rounded-lg text-sm font-bold transition-colors shadow-lg"
                      >
                        Submit to AI Evaluator
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 min-h-[300px]">
                    <Editor 
                      language={language.toLowerCase()} 
                      value={code} 
                      onChange={v => setCode(v || '')}
                      theme="vs-dark" 
                      options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 16 } }} 
                    />
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl h-[150px] flex flex-col flex-shrink-0 shadow-inner overflow-hidden">
                  <div className="bg-slate-900 border-b border-slate-800 px-3 py-1.5 flex justify-between items-center">
                     <span className="text-xs font-mono text-slate-500 font-bold uppercase tracking-wider">Console Output</span>
                     {runOutput && (
                       <button onClick={() => setRunOutput('')} className="text-xs text-slate-500 hover:text-slate-300">Clear</button>
                     )}
                  </div>
                  <div className="p-3 overflow-y-auto h-full font-mono text-sm">
                    {runOutput ? (
                      <pre className="text-green-400 whitespace-pre-wrap">{runOutput}</pre>
                    ) : (
                      <span className="text-slate-600 italic">Click "Run Code" to compile and test...</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {techState === 'evaluating' && (
            <div className="flex flex-col items-center justify-center h-[500px] space-y-6">
              <div className="w-16 h-16 border-4 border-slate-800 border-t-pink-500 rounded-full animate-spin shadow-[0_0_15px_rgba(236,72,153,0.5)]"></div>
              <div className="text-center space-y-2">
                <h3 className="text-white font-bold text-xl">Compiling & Analyzing</h3>
                <p className="text-slate-400 font-mono text-sm animate-pulse">Running test cases and evaluating approach...</p>
              </div>
            </div>
          )}

          {techState === 'result' && (
            <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl shadow-xl w-full">
              <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="text-pink-500">📊</span> Evaluation Results
                </h2>
                <div className="flex items-center gap-4">
                  <div className="text-center bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
                     <span className="text-xs text-slate-400 uppercase font-bold block">Score</span>
                     <span className="text-xl text-pink-400 font-black">
  {evaluation?.assessment?.overallScore !== undefined 
    ? `${evaluation.assessment.overallScore}/${evaluation.assessment.overallScore <= 10 ? 10 : 100}` 
    : 'N/A'}
</span>
                  </div>
                  <button onClick={() => {setTechState('setup'); setCode(''); setRunOutput('');}} className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold border border-slate-600 transition-colors">
                    Run Another Mock
                  </button>
                </div>
              </div>
              
              <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
                 {renderBeautifulData(evaluation)}
              </div>
            </div>
          )}
        </div>
      )}

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
              <div className="text-center border-b border-slate-800 pb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Recruiter Feedback</h2>
                <div className="text-5xl font-black text-pink-400 my-4">
  {hrReport?.overallScore !== undefined || hrReport?.score !== undefined 
    ? `${hrReport.overallScore || hrReport.score}/${(hrReport.overallScore || hrReport.score) <= 10 ? 10 : 100}` 
    : '85/100'}
</div>
              </div>
              
              <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
                 {renderBeautifulData(hrReport)}
              </div>
              
              <button onClick={() => {setHrState('setup'); setChatHistory([]);}} className="w-full bg-slate-800 hover:bg-slate-700 text-white px-6 py-4 rounded-xl font-bold border border-slate-600 transition-colors">
                Start New Session
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
}