import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import WorkoutPage from './pages/WorkoutPage';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/workout/:workoutId" element={<WorkoutPage />} />
    </Routes>
  );
};

export default App; 