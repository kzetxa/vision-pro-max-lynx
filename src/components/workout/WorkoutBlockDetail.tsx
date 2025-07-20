import React from "react";
import { observer } from "mobx-react-lite";
import * as Accordion from "@radix-ui/react-accordion";
import type { SupabasePopulatedBlock } from "../../lib/types"; // Adjust path
import AccordionBlockItem from "./AccordionBlockItem"; // Import the new AccordionBlockItem
import styles from "../../pages/WorkoutPage.module.scss"; // Use existing styles
import { useStore } from "../../contexts/StoreContext"; // Corrected path

interface WorkoutBlockDetailProps {
    // No longer needs publicWorkoutTitle, clientId, workoutId, onExerciseCompleteInPage directly
    // as these are either part of the block or handled by the store / AccordionBlockItem
    blocks: SupabasePopulatedBlock[];
    // allExerciseProgress and onToggleExerciseComplete will be passed to AccordionBlockItem
    // and are sourced from the store in WorkoutPage.tsx
}

const WorkoutBlockDetail: React.FC<WorkoutBlockDetailProps> = observer(({
	blocks,
}) => {
	const { workoutPageStore } = useStore();

	if (!blocks || blocks.length === 0) {
		return <p className={styles.statusMessage}>No blocks found for this workout.</p>;
	}

	// Calculate which blocks should be open (not completed)
	const openBlockIds = blocks
		.filter(block => {
			const totalSets = block.block_exercises.reduce((max, ex) => Math.max(max, ex.sets || 1), 1);
			const completedSetsForBlock = workoutPageStore.completedSets[block.id] || 0;
			// return completedSetsForBlock < totalSets; // Keep open if not all sets completed
			return true; // TODO: Remove this (keep all blocks open for now)
		})
		.map(block => block.id);

	return (
		// Default type "single" allows one item open at a time. "multiple" allows several.
		// collapsible allows all items to be closed.
		<Accordion.Root 
			className={styles.accordionRootContainer} 
			type="multiple"
			value={openBlockIds}
		>
			{blocks.map((block) => {
				const blockProgressPercent = workoutPageStore.calculateBlockProgress(block);
				return (
					<AccordionBlockItem 
						block={block}
						blockProgressPercent={blockProgressPercent}
						key={block.id}
						onToggleExerciseComplete={workoutPageStore.handleToggleExerciseCompleteList} // Pass store action
					/>
				);
			})}
		</Accordion.Root>
	);
});

export default WorkoutBlockDetail; 