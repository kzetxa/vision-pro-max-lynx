import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { useStore } from "../contexts/StoreContext";
import styles from "./WorkoutPage.module.scss";

// Import newly created sub-components
import WorkoutHeader from "../components/workout/WorkoutHeader";
import ViewToggleButton from "../components/workout/ViewToggleButton";
import WorkoutBlockList from "../components/workout/WorkoutBlockList";
import WorkoutBlockDetail from "../components/workout/WorkoutBlockDetail";

// Other necessary imports
import FinishWorkoutDialog from "../components/FinishWorkoutDialog";
// Badge is used in WorkoutHeader, no need to import here directly if not used elsewhere
// Icons are used in ViewToggleButton and ExerciseListItem, not directly here
// Checkbox is used in ExerciseListItem, not directly here
// Utils like parseSetsAndReps used in subcomponents

const WorkoutPage: React.FC = observer(() => {
	const { workoutId } = useParams<{ workoutId: string }>();
	const clientId = "test"; 

	const { workoutPageStore } = useStore();

	useEffect(() => {
		if (workoutId) {
			workoutPageStore.initializePage(workoutId, clientId);
		} else {
			workoutPageStore._setError("Workout ID is missing from URL.");
			workoutPageStore._setLoading(false);
		}
	}, [workoutId, clientId, workoutPageStore]);

	if (workoutPageStore.loading) {
		return <p className={styles.statusMessage}>Loading workout...</p>;
	}

	if (workoutPageStore.error) {
		return <p className={styles.errorStatus}>Error: {workoutPageStore.error}</p>;
	}

	if (!workoutPageStore.workoutData) {
		return <p className={styles.statusMessage}>Workout data could not be loaded.</p>;
	}

	// The onExerciseCompleteInPage for WorkoutBlockDetail is the no-op passed to BlockViewer.
	// This was originally for logging in WorkoutPage before MobX.
	// If specific actions are needed when an exercise in BlockViewer is completed, 
	// the store should handle that, possibly by BlockViewer calling a store action directly (if refactored for MobX)
	// or via a more specific callback.
	// const handleExerciseCompleteInBlockViewer = (blockExerciseId: string) => {
	// console.log(`Exercise ${blockExerciseId} completed in BlockViewer (Detail View) for workout ${workoutId}, client ${clientId}`);
	// This could call a store action if needed, e.g., workoutPageStore.logExerciseCompletion(blockExerciseId);
	// };

	return (
		<div className={styles.workoutPageContainer}>
			<WorkoutHeader workoutData={workoutPageStore.workoutData} />
			{/* Client ID display, if it was intended to be separate from header */}
			{clientId && <p className={styles.clientId}>Client ID: {clientId}</p>}
			<ViewToggleButton 
				isListView={workoutPageStore.isListView} 
				onToggle={workoutPageStore.toggleListView} 
			/>
			<>
				{workoutPageStore.isListView ? (
					<WorkoutBlockList 
						allExerciseProgress={workoutPageStore.allExerciseProgress}
						blocks={workoutPageStore.workoutData.blocks}
						onToggleExerciseComplete={workoutPageStore.handleToggleExerciseCompleteList}
					/>
				) : (
					<WorkoutBlockDetail 
						blocks={workoutPageStore.workoutData.blocks}
					/>
				)}
				<FinishWorkoutDialog 
					onConfirmFinish={workoutPageStore.handleFinishWorkout}
					onOpenChange={(open) => open ? workoutPageStore.openFinishDialog() : workoutPageStore.closeFinishDialog()}
					open={workoutPageStore.isFinishDialogOpen} 
					triggerButtonClassName={`${styles.dialogButton} ${styles.dialogButtonPrimary}`}
					triggerButtonStyle={{ margin: "2rem auto", display: "block" }}
				/>
			</>
		</div>
	);
});

export default WorkoutPage; 