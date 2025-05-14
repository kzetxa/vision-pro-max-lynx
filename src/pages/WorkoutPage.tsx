import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { useStore } from "../contexts/StoreContext";
import BlockViewer from "../components/BlockViewer";
import styles from "./WorkoutPage.module.scss";
import { extractUrlFromStringArray, parseSetsAndReps } from "../lib/utils";
import FinishWorkoutDialog from "../components/FinishWorkoutDialog";
import Badge from "../components/Badge";
import { ListBulletIcon, GridIcon, CheckIcon } from "@radix-ui/react-icons";
import * as Checkbox from "@radix-ui/react-checkbox";

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

	const workoutData = workoutPageStore.workoutData;
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
			{workoutData && (
				<div style={{ display: "flex", justifyContent: "flex-end", width: "100%", marginBottom: "1rem" }}>
					<button 
						className={styles.toggleViewButton}
						onClick={workoutPageStore.toggleListView} 
						style={{ padding: "0.5rem 1rem", cursor: "pointer", display: "flex", alignItems: "center" }}
					>
						{workoutPageStore.isListView ? (
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
			<>
				{workoutPageStore.isListView && workoutData ? (
					<div className={styles.listViewContainer}> 
						{workoutData.blocks && workoutData.blocks.length > 0 ? (
							workoutData.blocks.map((block, index) => (
								<div 
									className={styles.listViewBlock} 
									key={block.id}
								> 
									<h4 className={styles.listViewBlockTitle}> 
										{block.public_name || `Block ${index + 1}`}
									</h4>
									{block.block_exercises && block.block_exercises.length > 0 ? (
										block.block_exercises.map((be) => { 
											const exercise = be.exercise;
											if (!exercise || !exercise.current_name) {
												console.warn("Skipping exercise due to missing details or name:", be);
												return null; 
											}
											const blockExerciseId = be.id;
											const isExerciseComplete = !!workoutPageStore.allExerciseProgress[blockExerciseId]?.isExerciseDone;

											const parsedRepsInfo = parseSetsAndReps(be);
											let repsText = "";
											if (parsedRepsInfo.reps > 0 && (!be.unit || be.unit.toLowerCase().includes("rep") || be.unit.trim() === "")) {
												repsText = `${parsedRepsInfo.reps} reps`;
											} else if (be.sets_and_reps_text) {
												repsText = be.sets_and_reps_text;
											}

											return (
												<div 
													className={styles.listViewExercise} 
													key={be.id} 
													style={{ display: "flex", alignItems: "center", padding: "0.5rem 0" }}
												>
													<label 
														className={styles.listViewExerciseLabel} 
														htmlFor={`checkbox-${blockExerciseId}`} 
														style={{ flexGrow: 1, cursor: "pointer" }}
													>
														{exercise.current_name}
													</label>
													{repsText && (
														<span 
															className={styles.listViewRepsText} 
															style={{ paddingLeft: "1em", paddingRight: "1em", fontSize: "0.9em", color: "#555", whiteSpace: "nowrap" }}
														>
															{repsText}
														</span>
													)}
													<Checkbox.Root
														checked={isExerciseComplete}
														className={styles.modernCheckboxRoot}
														id={`checkbox-${blockExerciseId}`}
														onCheckedChange={() => workoutPageStore.handleToggleExerciseCompleteList(blockExerciseId, be)} 
														style={{ 
															width: 20, height: 20, borderRadius: 4, border: "1px solid #ccc", 
															display: "flex", alignItems: "center", justifyContent: "center",
															cursor: "pointer",
														}}
													>
														<Checkbox.Indicator className={styles.modernCheckboxIndicator}>
															<CheckIcon />
														</Checkbox.Indicator>
													</Checkbox.Root>
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
									exerciseProgressMap={workoutPageStore.allExerciseProgress}
									key={block.id} 
									onExerciseComplete={() => {}}
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
						onConfirmFinish={workoutPageStore.handleFinishWorkout}
						onOpenChange={(open) => open ? workoutPageStore.openFinishDialog() : workoutPageStore.closeFinishDialog()}
						open={workoutPageStore.isFinishDialogOpen}
						triggerButtonClassName={`${styles.dialogButton} ${styles.dialogButtonPrimary}`}
						triggerButtonStyle={{ margin: "2rem auto", display: "block" }}
					/>
				)}
			</>
		</div>
	);
});

export default WorkoutPage; 