import { useState } from 'react';

const useAgent = (agentFn) => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [result, setResult]   = useState(null);

  const run = async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const res = await agentFn(...args);
      setResult(res.data.data);
    } catch (e) {
      setError(e.response?.data?.error || 'AI agent failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setResult(null); setError(null); };

  return { loading, error, result, run, reset };
};

export default useAgent;
