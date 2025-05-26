import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import WorkoutPage from "./pages/WorkoutPage";
import GlobalDialogRenderer from "./components/dialogs/GlobalDialogRenderer";
import { ensureClientIdInUrl } from "./lib/utils";

const App: React.FC = () => {
	// Ensure clientId is present in the URL on app load
	React.useEffect(() => {
		ensureClientIdInUrl();
	}, []);

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