import React from "react";
import { observer } from "mobx-react-lite";
import type { SupabasePopulatedBlock, SupabaseBlockExercise } from "../../lib/types"; // Adjust path
import type { ExerciseProgress } from "../../lib/localStorage"; // Adjust path
import ExerciseListItem from "./ExerciseListItem";
import styles from "../../pages/WorkoutPage.module.scss"; // Use existing styles

interface WorkoutBlockListProps {
    blocks: SupabasePopulatedBlock[];
    allExerciseProgress: { [blockExerciseId: string]: ExerciseProgress };
    onToggleExerciseComplete: (blockExerciseId: string, exerciseDefinition: SupabaseBlockExercise) => void;
}

const WorkoutBlockList: React.FC<WorkoutBlockListProps> = observer(({ 
	blocks,
	allExerciseProgress,
	onToggleExerciseComplete, 
}) => {
	if (!blocks || blocks.length === 0) {
		return <p className={styles.statusMessage}>No blocks found for this workout.</p>;
	}

	return (
		<div className={styles.listViewContainer}> 
			{blocks.map((block, index) => (
				<div 
					className={styles.listViewBlock} 
					key={block.id}
				> 
					<h4 className={styles.listViewBlockTitle}> 
						{block.public_name || `Block ${index + 1}`}
					</h4>
					{block.block_exercises && block.block_exercises.length > 0 ? (
						block.block_exercises.map((be) => {
							const isExerciseComplete = !!allExerciseProgress[be.id]?.isExerciseDone;
							return (
								<ExerciseListItem
									blockExercise={be}
									isComplete={isExerciseComplete}
									key={be.id} // Key for React list rendering
									onToggleComplete={onToggleExerciseComplete}
								/>
							);
						})
					) : (
						<p className={styles.statusMessage}>No exercises in this block.</p>
					)}
				</div>
			))}
		</div>
	);
});

export default WorkoutBlockList; 