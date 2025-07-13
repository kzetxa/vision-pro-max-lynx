import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import WorkoutPage from "./pages/WorkoutPage";
import GlobalDialogRenderer from "./components/dialogs/GlobalDialogRenderer";

const App: React.FC = () => {
	return (
		<>
			<Routes>
				<Route element={<Home />} path="/" />
				<Route element={<WorkoutPage />} path="/workout/:workoutId" />
			</Routes>
			<GlobalDialogRenderer />
		</>
	);
};

export default App; 