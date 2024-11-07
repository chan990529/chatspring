// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './Component/Layout'; // Layout을 import
import HomePage from './Pages/Home';
import ScalpingPage from './Pages/Scalping';
import StatisticsPage from './Pages/Statistics';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<ScalpingPage />} />
          <Route path="Scalping" element={<ScalpingPage />} />
          <Route path="Statistics" element={<StatisticsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
