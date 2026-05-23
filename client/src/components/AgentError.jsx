import React from 'react';

export default function AgentError({ message }){
  if(!message) return null;
  return (
    <div className="p-3 bg-red-900/20 border border-red-600 text-red-300 rounded">{message}</div>
  );
}
