import React from "react";
import { observer } from "mobx-react-lite";
import * as Accordion from "@radix-ui/react-accordion";
import * as Progress from "@radix-ui/react-progress";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import type { SupabasePopulatedBlock, SupabaseBlockExercise } from "../../lib/types";
import type { ExerciseProgress } from "../../lib/localStorage";
import AccordionExerciseRow from "./AccordionExerciseRow";
import styles from "./AccordionBlockItem.module.scss"; // Changed import

interface AccordionBlockItemProps {
	block: SupabasePopulatedBlock;
	blockProgressPercent: number;
	allExerciseProgress: { [blockExerciseId: string]: ExerciseProgress };
	onToggleExerciseComplete: (blockExerciseId: string, exerciseDefinition: SupabaseBlockExercise) => void;
	// Props for store access if specific calculations are better done here, or pass pre-calculated values
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
}> = ({ blockProgressPercent, completedExercisesCount, totalExercisesCount }) => {
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
					{completedExercisesCount}/{totalExercisesCount}
				</span>
			</div>
			<ChevronDownIcon aria-hidden className={styles.accordionChevron} />
		</div>
	);
};

const AccordionBlockItem: React.FC<AccordionBlockItemProps> = observer(({
	block,
	blockProgressPercent,
	allExerciseProgress,
	onToggleExerciseComplete,
}) => {
	const intensityText = block.intensity || "";
	const restText = block.rest_between_sets || "";
	const completedExercisesCount = Math.round(block.block_exercises.filter((be: SupabaseBlockExercise) => allExerciseProgress[be.id]?.isExerciseDone).length);
	const totalExercisesCount = block.block_exercises.length;

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
					<TriggerRightContent 
						blockProgressPercent={blockProgressPercent}
						completedExercisesCount={completedExercisesCount}
						totalExercisesCount={totalExercisesCount}
					/>
				</Accordion.Trigger>
			</Accordion.Header>
			<Accordion.Content className={styles.accordionContent}>
				{block.block_exercises && block.block_exercises.length > 0 ? (
					block.block_exercises.map((be: SupabaseBlockExercise) => {
						if (!be.exercise || !be.exercise.current_name) return null;
						const isExerciseComplete = !!allExerciseProgress[be.id]?.isExerciseDone;
						return (
							<AccordionExerciseRow 
								blockExercise={be}
								isComplete={isExerciseComplete}
								key={be.id}
								onToggleComplete={() => onToggleExerciseComplete(be.id, be)}
							/>
						);
					})
				) : (
					<p className={styles.statusMessage}>No exercises in this block.</p>
				)}
			</Accordion.Content>
		</Accordion.Item>
	);
});

export default AccordionBlockItem; 