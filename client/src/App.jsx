import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ProblemSolver from './pages/ProblemSolver';
import ComplexityAnalyzer from './pages/ComplexityAnalyzer';
import PatternRecognizer from './pages/PatternRecognizer';
import CodeReview from './pages/CodeReview';
import CheatSheet from './pages/CheatSheet';
import MockInterview from './pages/MockInterview';
import SessionHistory from './pages/SessionHistory';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="solver"   element={<ProblemSolver />} />
          <Route path="analyzer" element={<ComplexityAnalyzer />} />
          <Route path="patterns" element={<PatternRecognizer />} />
          <Route path="review"   element={<CodeReview />} />
          <Route path="cheatsheet" element={<CheatSheet />} />
          <Route path="mock"     element={<MockInterview />} />
          <Route path="history"  element={<SessionHistory />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
