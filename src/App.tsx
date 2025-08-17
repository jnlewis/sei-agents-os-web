import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';
import { CodeGeneratorApp } from './components/CodeGeneratorApp';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<CodeGeneratorApp />} />
      </Routes>
    </Router>
  );
}

export default App;