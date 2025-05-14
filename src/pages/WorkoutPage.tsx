import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import BlockViewer from "../components/BlockViewer";
import { fetchWorkoutDetailsById } from "../lib/api";
import type { SupabasePopulatedWorkout, SupabaseBlockExercise, SupabaseExercise } from "../lib/types";
import styles from "./WorkoutPage.module.scss";
import {
	loadWorkoutProgressFromStorage,
	ExerciseProgress,
	clearWorkoutProgressInStorage,
	saveExerciseProgressToStorage,
} from "../lib/localStorage";
import { extractUrlFromStringArray, parseSetsAndReps } from "../lib/utils";
import FinishWorkoutDialog from "../components/FinishWorkoutDialog";
import Badge from "../components/Badge";
import { ListBulletIcon, GridIcon } from "@radix-ui/react-icons";

const WorkoutPage: React.FC = () => {
	const { workoutId } = useParams<{ workoutId: string }>();
	const clientId = "test";

	const [workoutData, setWorkoutData] = useState<SupabasePopulatedWorkout | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [showChart, setShowChart] = useState(false);
	const [isFinishDialogOpen, setIsFinishDialogOpen] = useState(false);
	const [isListView, setIsListView] = useState(false);
	const [allExerciseProgress, setAllExerciseProgress] = useState<{[blockExerciseId: string]: ExerciseProgress}>({}); 

	useEffect(() => {
		if (!workoutId) {
			setError("Workout ID is missing from URL.");
			setLoading(false);
			return;
		}

		const loadData = async () => {
			setLoading(true);
			setError(null);
			try {
				const data = await fetchWorkoutDetailsById(workoutId);
				if (data) {
					setWorkoutData(data);
					if (clientId) { 
						const progress = loadWorkoutProgressFromStorage(workoutId, clientId);
						setAllExerciseProgress(progress);
					}
				} else {
					setError("Workout not found.");
				}
			} catch (err) {
				console.error("Error fetching workout details:", err);
				setError(err instanceof Error ? err.message : "Failed to load workout details");
			}
			setLoading(false);
		};
		loadData();
	}, [workoutId, clientId]);

	const handleExerciseCompleteInPage = useCallback((blockExerciseId: string) => {
		console.log(`Exercise ${blockExerciseId} completed in WorkoutPage for workout ${workoutId}, client ${clientId}`);
	}, [workoutId, clientId]);

	const handleToggleExerciseCompleteList = useCallback((
		blockExerciseId: string,
		exerciseDefinition: SupabaseBlockExercise, 
	) => {
		const existingProgress = allExerciseProgress[blockExerciseId];
		const isCurrentlyComplete = !!existingProgress?.isExerciseDone;
		const newCompletionState = !isCurrentlyComplete;

		const totalSets = typeof exerciseDefinition.sets === "number" && exerciseDefinition.sets > 0 
			? exerciseDefinition.sets 
			: 1;

		const updatedProgress: ExerciseProgress = {
			currentSet: newCompletionState ? totalSets : 0, 
			isExerciseDone: newCompletionState,
		};

		setAllExerciseProgress((prev) => ({
			...prev,
			[blockExerciseId]: updatedProgress,
		}));

		if (workoutId && clientId) {
			saveExerciseProgressToStorage(workoutId, clientId, blockExerciseId, updatedProgress);
		}
	}, [allExerciseProgress, workoutId, clientId]);

	const handleFinishWorkout = () => {
		console.log(`Finish workout button clicked for: ${workoutId}, client: ${clientId}`);
		if (workoutId && clientId) {
			clearWorkoutProgressInStorage(workoutId, clientId);
			setAllExerciseProgress({}); 
			alert("Workout progress cleared!");
		}
		setIsFinishDialogOpen(false);
	};

	if (loading) {
		return <p className={styles.statusMessage}>Loading workout...</p>;
	}

	if (error) {
		return <p className={styles.errorStatus}>Error: {error}</p>;
	}

	if (!workoutData) {
		return <p className={styles.statusMessage}>Workout data could not be loaded.</p>;
	}

	const workoutTitle = workoutData.public_workout_title || "Workout Plan";
	const headerImageUrl = extractUrlFromStringArray(workoutData.header_image_url);

	return (
		<div className={styles.workoutPageContainer}>
			{headerImageUrl ? (
				<img 
					alt={workoutTitle} 
					className={styles.workoutHeaderImage} 
					src={headerImageUrl} 
				/>
			) : (
				<div className={styles.workoutImagePlaceholder}>
					<span>Image Placeholder</span> 
				</div>
			)}
			<span style={{ display: "flex", gap: "1rem" }}>
				<Badge label="Level:" value={workoutData.level} />
				<Badge label="Duration:" value={workoutData.duration} />
			</span>
			{clientId && <p className={styles.clientId}>Client ID: {clientId}</p>}
			{!showChart && workoutData && (
				<div style={{ display: "flex", justifyContent: "flex-end", width: "100%", marginBottom: "1rem" }}>
					<button 
						className={styles.toggleViewButton} 
						onClick={() => setIsListView((prev) => !prev)} 
						style={{ padding: "0.5rem 1rem", cursor: "pointer", display: "flex", alignItems: "center" }}
					>
						{isListView ? (
							<>
								<GridIcon style={{ marginRight: "0.5rem" }} />
								Grid View
							</>
						) : (
							<>
								<ListBulletIcon style={{ marginRight: "0.5rem" }} />
								List View
							</>
						)}
					</button>
				</div>
			)}
			{!showChart ? (
				<>
					{isListView && workoutData ? (
						<div className={styles.listViewContainer}> 
							{workoutData.blocks && workoutData.blocks.length > 0 ? (
								workoutData.blocks.map((block, index) => (
									<div className={styles.listViewBlock} key={block.id}> 
										<h4 className={styles.listViewBlockTitle}> 
											{block.public_name || `Block ${index + 1}`}
										</h4>
										{block.block_exercises && block.block_exercises.length > 0 ? (
											block.block_exercises.map((be: SupabaseBlockExercise) => { 
												const exercise = be.exercise;
												if (!exercise || !exercise.current_name) {
													console.warn("Skipping exercise due to missing details or name:", be);
													return null; 
												}
												const blockExerciseId = be.id;
												const isExerciseComplete = !!allExerciseProgress[blockExerciseId]?.isExerciseDone;

												const parsedRepsInfo = parseSetsAndReps(be);
												let repsText = "";
												if (parsedRepsInfo.reps > 0 && (!be.unit || be.unit.toLowerCase().includes("rep") || be.unit.trim() === "")) {
													repsText = `${parsedRepsInfo.reps} reps`;
												} else if (be.sets_and_reps_text) {
													repsText = be.sets_and_reps_text;
												}

												return (
													<div className={styles.listViewExercise} key={be.id}> 
														<label 
															className={styles.listViewExerciseLabel} 
															htmlFor={`checkbox-${blockExerciseId}`} 
															style={{ display: "flex", alignItems: "center", cursor: "pointer", width: "100%" }}
														>
															<input
																checked={isExerciseComplete}
																className={styles.listViewCheckbox}
																id={`checkbox-${blockExerciseId}`}
																onChange={() => handleToggleExerciseCompleteList(blockExerciseId, be)}
																style={{ marginRight: "0.5rem" }} 
																type="checkbox"
															/>
															{exercise.current_name}
															{repsText && (
																<span style={{ marginLeft: "auto", paddingLeft: "1em", fontSize: "0.9em", color: "#555", whiteSpace: "nowrap" }}>
																	{repsText}
																</span>
															)}
														</label>
													</div>
												);
											})
										) : (
											<p className={styles.statusMessage}>No exercises in this block.</p>
										)}
									</div>
								))
							) : (
								<p className={styles.statusMessage}>No blocks found for this workout.</p>
							)}
						</div>
					) : workoutData ? (
						<>
							<h3 className={styles.blocksHeader}>{workoutData.public_workout_title}</h3>
							{workoutData.blocks && workoutData.blocks.length > 0 ? (
								workoutData.blocks.map((block, index) => (
									<BlockViewer 
										block={block} 
										blockNumber={index + 1} 
										clientId={clientId} 
										exerciseProgressMap={allExerciseProgress}
										key={block.id} 
										onExerciseComplete={handleExerciseCompleteInPage}
										workoutId={workoutId!}
									/>
								))
							) : (
								<p className={styles.statusMessage}>No blocks found for this workout.</p>
							)}
						</>
					) : null }
					{workoutData && (
						<FinishWorkoutDialog 
							onConfirmFinish={handleFinishWorkout}
							onOpenChange={setIsFinishDialogOpen}
							open={isFinishDialogOpen}
							triggerButtonClassName={`${styles.dialogButton} ${styles.dialogButtonPrimary}`}
							triggerButtonStyle={{ margin: "2rem auto", display: "block" }}
						/>
					)}
				</>
			) : (
				<p className={styles.statusMessage}>Chart will be shown here.</p>
			)}
		</div>
	);
};

export default WorkoutPage; 