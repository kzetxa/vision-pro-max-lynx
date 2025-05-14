import React from "react";
import { observer } from "mobx-react-lite";
import type { SupabasePopulatedBlock } from "../../lib/types"; // Adjust path
import type { ExerciseProgress } from "../../lib/localStorage"; // Adjust path
import BlockViewer from "../BlockViewer"; // Assuming BlockViewer is in src/components/BlockViewer.tsx
import styles from "../../pages/WorkoutPage.module.scss"; // Use existing styles

interface WorkoutBlockDetailProps {
    publicWorkoutTitle?: string | null;
    blocks: SupabasePopulatedBlock[];
    allExerciseProgress: { [blockExerciseId: string]: ExerciseProgress };
    clientId: string;
    workoutId: string;
    // onExerciseComplete is a no-op in the MobX version, passed to satisfy BlockViewer prop reqs
    onExerciseCompleteInPage: (blockExerciseId: string) => void; 
}

const WorkoutBlockDetail: React.FC<WorkoutBlockDetailProps> = observer(({
	publicWorkoutTitle,
	blocks,
	allExerciseProgress,
	clientId,
	workoutId,
	onExerciseCompleteInPage,
}) => {
	if (!blocks || blocks.length === 0) {
		return <p className={styles.statusMessage}>No blocks found for this workout.</p>;
	}

	return (
		<>
			<h3 className={styles.blocksHeader}>{publicWorkoutTitle || "Workout Plan"}</h3>
			{blocks.map((block, index) => (
				<BlockViewer 
					block={block}
					blockNumber={index + 1} 
					clientId={clientId} 
					exerciseProgressMap={allExerciseProgress} 
					key={block.id}
					onExerciseComplete={onExerciseCompleteInPage} // Pass down the handler
					workoutId={workoutId}
				/>
			))}
		</>
	);
});

export default WorkoutBlockDetail; 