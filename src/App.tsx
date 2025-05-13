import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import WorkoutPage from "./pages/WorkoutPage";

const App: React.FC = () => {
	return (
		<Routes>
			<Route element={<Home />} path="/" />
			<Route element={<WorkoutPage />} path="/workout/:workoutId" />
		</Routes>
	);
};

export default App; 