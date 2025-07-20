import React from "react";
import { observer } from "mobx-react-lite";
import * as Accordion from "@radix-ui/react-accordion";
import * as Progress from "@radix-ui/react-progress";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import type { SupabasePopulatedBlock, SupabaseBlockExercise } from "../../lib/types";
import AccordionExerciseRow from "./AccordionExerciseRow";
import SpecialSetRow from "./SpecialSetRow";
import styles from "./AccordionBlockItem.module.scss";
import { useStore } from "../../contexts/StoreContext";

interface AccordionBlockItemProps {
	block: SupabasePopulatedBlock;
	blockProgressPercent: number;
	onToggleExerciseComplete: (blockExerciseId: string, exerciseDefinition: SupabaseBlockExercise) => void;
}

// Sub-component for the left part of the trigger
const TriggerLeftContent: React.FC<{
	publicName?: string | null;
	blockId: string;
	intensityText: string;
	restText: string;
}> = ({ publicName, blockId, intensityText, restText }) => {
	return (
		<div className={styles.triggerLeft}>
			<span className={styles.accordionTitle}>{publicName || `Block ${blockId}`}</span>
			<div className={styles.accordionSubtitleContainer}>
				{intensityText && (
					<span className={styles.intensityText}>{intensityText}</span>
				)}
				{intensityText && restText && <span className={styles.subtitleSeparator}>|</span>}
				{restText && (
					<span className={styles.restText}>{restText}</span>
				)}
			</div>
		</div>
	);
};

// Sub-component for the right part of the trigger
const TriggerRightContent: React.FC<{
	blockProgressPercent: number;
	completedExercisesCount: number;
	totalExercisesCount: number;
	currentSet: number;
	totalSets: number;
}> = ({ blockProgressPercent, completedExercisesCount, totalExercisesCount, currentSet, totalSets }) => {
	return (
		<div className={styles.triggerRight}>
			<div className={styles.accordionProgressContainer}>
				<Progress.Root
					className={styles.progressRoot}
					value={blockProgressPercent}
				>
					<Progress.Indicator 
						className={styles.progressIndicator}
						style={{ width: `${blockProgressPercent}%` }}
					/>
				</Progress.Root>
				<span className={styles.progressText}>
					{`Set ${currentSet}/${totalSets} (${completedExercisesCount}/${totalExercisesCount})`}
				</span>
			</div>
			<ChevronDownIcon aria-hidden className={styles.accordionChevron} />
		</div>
	);
};

const AccordionBlockItem: React.FC<AccordionBlockItemProps> = observer(({
	block,
	// blockProgressPercent,
	onToggleExerciseComplete,
}) => {
	const { workoutPageStore } = useStore();
	const intensityText = block.intensity || "";
	const restText = block.rest_between_sets || "";

	// const { completedSets, exerciseCompletionInCurrentSet } = workoutPageStore;
	// const completedSetsForBlock = completedSets[block.id] || 0;
	// const totalSets = block.block_exercises.reduce((max, ex) => Math.max(max, ex.sets || 1), 1);
	// const currentSetForDisplay = Math.min(completedSetsForBlock + 1, totalSets);
	
	// const completedExercisesCount = block.block_exercises.filter(be => exerciseCompletionInCurrentSet[be.id]).length;
	// const totalExercisesCount = block.block_exercises.length;

	return (
		<Accordion.Item className={styles.accordionItem} value={block.id}>
			<Accordion.Header className={styles.accordionHeader}>
				<Accordion.Trigger className={styles.accordionTrigger}>
					<TriggerLeftContent 
						blockId={block.id}
						intensityText={intensityText}
						publicName={block.public_name}
						restText={restText}
					/>
					{/* <TriggerRightContent 
						blockProgressPercent={blockProgressPercent}
						completedExercisesCount={completedExercisesCount}
						totalExercisesCount={totalExercisesCount}
						currentSet={currentSetForDisplay}
						totalSets={totalSets}
					/> */}
				</Accordion.Trigger>
			</Accordion.Header>
			<Accordion.Content className={styles.accordionContent}>
				{block.block_exercises && block.block_exercises.length > 0 ? (
					(() => {
						const renderedItems: React.ReactNode[] = [];
						let currentSpecialSet: string | null = null;

						block.block_exercises.forEach((be: SupabaseBlockExercise, index: number) => {
							if (!be.exercise || !be.exercise.current_name) return;
							
							// Check if we need to show a special set row
							if (be.special_set && be.special_set !== currentSpecialSet) {
								currentSpecialSet = be.special_set;
								renderedItems.push(
									<SpecialSetRow 
										key={`special-set-${be.special_set}-${index}`}
										specialSet={be.special_set} 
										specialInstructions={be.special_instructions} 
									/>
								);
							}
							
							const isExerciseComplete = !!workoutPageStore.exerciseCompletionInCurrentSet[be.id];
							renderedItems.push(
								<AccordionExerciseRow 
									blockExercise={be}
									isComplete={isExerciseComplete}
									key={be.id}
									onToggleComplete={() => onToggleExerciseComplete(be.id, be)}
								/>
							);
						});
						
						return renderedItems;
					})()
				) : (
					<p className={styles.statusMessage}>No exercises in this block.</p>
				)}
			</Accordion.Content>
		</Accordion.Item>
	);
});

export default AccordionBlockItem; 