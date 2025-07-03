import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import FinishWorkoutDialog from "../components/FinishWorkoutDialog/FinishWorkoutDialog";
import ViewToggleButton from "../components/workout/ViewToggleButton";
import WorkoutBlockDetail from "../components/workout/WorkoutBlockDetail";
import WorkoutBlockList from "../components/workout/WorkoutBlockList";
import WorkoutHeader from "../components/workout/WorkoutHeader";
import { useStore } from "../contexts/StoreContext";
import styles from "./WorkoutPage.module.scss";
import { getClientIdFromUrl } from "../lib/utils";

const WorkoutPage: React.FC = observer(() => {
	const { workoutId } = useParams<{ workoutId: string }>();
	const { workoutPageStore } = useStore();

	useEffect(() => {
		if (workoutId) {
			workoutPageStore.initializePage(workoutId);
		} else {
			workoutPageStore._setError("Workout ID is missing from URL.");
		}
	}, [workoutId, workoutPageStore]);

	if (workoutPageStore.loading || workoutPageStore.isSummaryLoading) {
		return <p className={styles.statusMessage}>Loading workout...</p>;
	}

	if (workoutPageStore.error) {
		return <p className={styles.errorStatus}>Error: {workoutPageStore.error}</p>;
	}

	if (!workoutPageStore.workoutData && !workoutPageStore.workoutSummary) {
		return <p className={styles.statusMessage}>Workout data could not be loaded.</p>;
	}

	const clientId = getClientIdFromUrl();

	return (
		<div className={styles.workoutPageContainer}>
			{workoutPageStore.workoutData && <WorkoutHeader workoutData={workoutPageStore.workoutData} />}
			{clientId && <p className={styles.clientId}>Client ID: {clientId}</p>}
			
			{!workoutPageStore.workoutSummary && workoutPageStore.workoutData && (
				<>
					<ViewToggleButton 
						isListView={workoutPageStore.isListView} 
						onToggle={workoutPageStore.toggleListView} 
					/>
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
					<button
						className={styles.finishButton}
						onClick={workoutPageStore.handleFinishWorkout}
					>
						Finish Workout
					</button>
				</>
			)}
			
			<FinishWorkoutDialog 
				onOpenChange={(open) => open ? workoutPageStore.openFinishDialog() : workoutPageStore.closeFinishDialog()}
				open={workoutPageStore.isFinishDialogOpen}
				stats={workoutPageStore.workoutStats}
			/>
		</div>
	);
});

export default WorkoutPage; 