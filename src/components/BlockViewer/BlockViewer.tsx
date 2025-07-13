import React from "react";
import { observer } from "mobx-react-lite";
import type { SupabaseBlockExercise, SupabasePopulatedBlock } from "../../lib/types"; // New Supabase Types
import Badge from "../Badge/Badge";
import styles from "./BlockViewer.module.scss";
import ExerciseTile from "../ExerciseTile/ExerciseTile";
import { useStore } from "../../contexts/StoreContext";

interface BlockViewerProps {
  block: SupabasePopulatedBlock;
  blockNumber: number;
  onExerciseComplete: (blockExerciseId: string, exerciseDefinition: SupabaseBlockExercise) => void;
}

const BlockViewer: React.FC<BlockViewerProps> = observer(({
	block,
	blockNumber,
	onExerciseComplete,
}) => {
	const { workoutPageStore } = useStore();
	const blockName = block.public_name || `Block ${blockNumber}`;
	const rest = block.rest_between_sets;
	const intensity = block.intensity;
	const exercises = block.block_exercises;

	return (
		<div className={styles.blockContainer}>
			<h3 className={styles.title}>{blockName}</h3>
			<div className={styles.infoBadgesContainer}>
				{intensity && <Badge label="Intensity:" value={intensity} />}
				{rest && <Badge label="Rest:" value={rest} />}
			</div>
			{exercises && exercises.length > 0 ? (
				exercises.map((blockExercise: SupabaseBlockExercise) => {
					const isComplete = !!workoutPageStore.exerciseCompletionInCurrentSet[blockExercise.id];
					return (
						<ExerciseTile 
							blockExercise={blockExercise} 
							isComplete={isComplete}
							key={blockExercise.id}
							onExerciseComplete={() => onExerciseComplete(blockExercise.id, blockExercise)}
						/>
					);
				})
			) : (
				<p className={styles.statusMessage}>No exercises found in this block.</p>
			)}
		</div>
	);
});

export default BlockViewer; 