import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getSessions } from '../services/agentAPI';

export default function SessionHistory() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await getSessions('me');
      setSessions(r.data?.data || []);
    } catch (err) {
      setError("Failed to load session history. Please make sure your backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this session?")) return;

    try {
      await axios.delete(`http://localhost:5001/api/sessions/${id}`);
      setSessions(sessions.filter(s => s._id !== id));
    } catch (err) {
      console.error("Failed to delete session:", err);
      alert("Failed to delete session. Check your backend console.");
    }
  };

  const getSessionMeta = (type) => {
    const t = type?.toLowerCase() || '';
    if (t.includes('solve')) return { icon: '⚡', bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' };
    if (t.includes('pattern')) return { icon: '🧩', bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' };
    if (t.includes('analyz') || t.includes('complex')) return { icon: '⏱️', bg: 'bg-teal-500/10', border: 'border-teal-500/30', text: 'text-teal-400' };
    if (t.includes('review')) return { icon: '🕵️', bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400' };
    if (t.includes('cheat')) return { icon: '📚', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400' };
    if (t.includes('interview')) return { icon: '🎙️', bg: 'bg-pink-500/10', border: 'border-pink-500/30', text: 'text-pink-400' };
    return { icon: '📝', bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-400' };
  };

  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Helper function to render JSON data beautifully
  const renderBeautifulData = (val, depth = 0) => {
    if (Array.isArray(val)) {
      return (
        <ul className="list-disc pl-5 space-y-2 mt-2">
          {val.map((item, i) => (
            <li key={i} className="text-slate-300">
              {typeof item === 'object' ? renderBeautifulData(item, depth + 1) : item}
            </li>
          ))}
        </ul>
      );
    } else if (typeof val === 'object' && val !== null) {
      return (
        <div className={`space-y-4 ${depth > 0 ? 'bg-slate-900/50 p-4 rounded-lg border border-slate-800 mt-2' : ''}`}>
          {Object.entries(val).map(([key, v]) => (
            <div key={key}>
              <span className="text-purple-400 font-bold capitalize block mb-1">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              {renderBeautifulData(v, depth + 1)}
            </div>
          ))}
        </div>
      );
    } else if (typeof val === 'string' && (val.includes('\n') || val.includes('{') || val.includes('let '))) {
      return (
        <pre className="bg-slate-900 p-4 rounded-lg border border-slate-800 text-sm font-mono text-green-400 overflow-x-auto whitespace-pre-wrap mt-2">
          {val}
        </pre>
      );
    } else {
      return <span className="text-slate-300">{String(val)}</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 relative">
      
      {/* Header Section */}
      <div className="flex justify-between items-end border-b border-slate-700/50 pb-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-white">Session History</h1>
          <p className="text-slate-400 text-sm">Review your past AI interactions and track your learning progress.</p>
        </div>
        <button 
          onClick={fetchHistory}
          disabled={loading}
          className="text-sm bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? '↻ Syncing...' : '↻ Refresh'}
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-8 h-8 border-4 border-slate-600 border-t-purple-500 rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm animate-pulse">Retrieving your archives...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl flex items-center gap-3 animate-in fade-in">
          <span className="text-red-400 text-xl">⚠️</span>
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && sessions.length === 0 && (
        <div className="bg-slate-800/30 border-2 border-dashed border-slate-700 rounded-2xl p-12 text-center space-y-3">
          <div className="text-4xl">📭</div>
          <h3 className="text-lg font-bold text-slate-300">No sessions recorded yet</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Your activity history will appear here once you start using the AI agents.
          </p>
        </div>
      )}

      {/* Sessions List */}
      {!loading && sessions.length > 0 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {sessions.map((s, i) => {
            const meta = getSessionMeta(s.type);
            
            return (
              <div 
                key={s._id || i} 
                className={`group relative overflow-hidden bg-slate-900 border ${meta.border} rounded-xl p-5 hover:bg-slate-800/80 transition-all duration-300 shadow-lg`}
              >
                <div className={`absolute top-0 left-0 w-1 h-full ${meta.bg.replace('/10', '')} opacity-50 group-hover:opacity-100 transition-opacity`}></div>
                
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center pl-2">
                  
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg ${meta.bg} border ${meta.border} flex items-center justify-center text-xl shadow-inner flex-shrink-0`}>
                      {meta.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-bold text-sm uppercase tracking-wide ${meta.text}`}>
                          {s.type || 'Unknown Agent'}
                        </h3>
                        <span className="text-[10px] text-slate-500 font-mono bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                          {formatDate(s.createdAt)}
                        </span>
                      </div>
                      <p className="text-slate-300 text-sm line-clamp-2 leading-relaxed">
                        {s.summary || 'No summary available for this session.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 md:mt-0">
                    <button 
                      onClick={() => setSelectedSession(s)}
                      className="text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors whitespace-nowrap border border-slate-700"
                    >
                      View Data →
                    </button>
                    <button 
                      onClick={() => handleDelete(s._id)}
                      className="text-xs font-bold text-red-400 hover:text-white bg-red-900/20 hover:bg-red-900/60 px-4 py-2 rounded-lg transition-colors whitespace-nowrap border border-red-900/40"
                    >
                      Delete
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── THE UPGRADED VIEW MODAL ── */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center p-5 border-b border-slate-800 bg-slate-900/50 flex-shrink-0">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                <span className="text-purple-400">📄</span> 
                {selectedSession.type || 'Session'} Details
              </h2>
              <button 
                onClick={() => setSelectedSession(null)}
                className="text-slate-400 hover:text-white text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 transition"
              >
                &times;
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto bg-slate-950 space-y-6">
              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
                <p className="text-slate-300">{selectedSession.summary || "No summary provided."}</p>
              </div>

              {(() => {
                const payload = selectedSession.data;

                if (!payload || Object.keys(payload).length === 0) {
                  return (
                    <div className="p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-xl text-yellow-400 text-sm">
                      ⚠️ No detailed AI data was found for this session. (Only new sessions generated after the backend update will have full data).
                    </div>
                  );
                }

                return renderBeautifulData(payload);
              })()}
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}