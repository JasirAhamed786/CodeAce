import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:5001/api' });

export const solveProblem = (problem, language) =>
  api.post('/agent/solve', { problem, language });

export const analyzeCode = (code, language) =>
  api.post('/agent/analyze', { code, language });

export const detectPattern = (problem, language) =>
  api.post('/agent/patterns', { problem, language });

export const reviewCode = (code, problem, language) =>
  api.post('/agent/review', { code, problem, language });

export const generateCheatSheet = (topic, language) =>
  api.post('/agent/cheatsheet', { topic, language });

export const startTechnicalMock = (difficulty, topic) =>
  api.post('/mock/technical/start', { difficulty, topic });

export const evaluateTechnicalCode = (problem, code, language, timeUsed, sessionId) =>
  api.post('/mock/technical/evaluate', { problem, code, language, timeUsed, sessionId });

export const sendHRMessage = (conversationHistory, userAnswer, questionNumber, interviewType) =>
  api.post('/mock/hr/message', { conversationHistory, userAnswer, questionNumber, interviewType });

export const getHRReport = (conversationHistory, allEvaluations, interviewType) =>
  api.post('/mock/hr/report', { conversationHistory, allEvaluations, interviewType });

export const getSessions = (userId) =>
  api.get(`/sessions/${userId}`);

export const getWeakPatterns = (userId) =>
  api.get(`/sessions/${userId}/weakpatterns`);
