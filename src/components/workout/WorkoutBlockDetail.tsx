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

	const openBlockIds = blocks
		.filter(block => {
			const isComplete = workoutPageStore.isBlockComplete(block);
			return !isComplete; // Keep open if not all sets completed
		})
		.map(block => block.id);

	return (
		<Accordion.Root 
			className={styles.accordionRootContainer} 
			type="multiple"
			value={openBlockIds}
		>
			{blocks.map((block) => {
				return (
					<AccordionBlockItem 
						block={block}
						key={block.id}
						onToggleExerciseComplete={workoutPageStore.handleToggleExerciseCompleteList} // Pass store action
					/>
				);
			})}
		</Accordion.Root>
	);
});

export default WorkoutBlockDetail; 