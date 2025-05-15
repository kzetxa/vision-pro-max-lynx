import React from "react";
import { observer } from "mobx-react-lite";
import * as Accordion from "@radix-ui/react-accordion";
import * as Progress from "@radix-ui/react-progress";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import type { SupabasePopulatedBlock, SupabaseBlockExercise } from "../../lib/types";
import type { ExerciseProgress } from "../../lib/localStorage";
import AccordionExerciseRow from "./AccordionExerciseRow";
import styles from "../../pages/WorkoutPage.module.scss"; // Corrected path for styles

interface AccordionBlockItemProps {
    block: SupabasePopulatedBlock;
    blockProgressPercent: number;
    allExerciseProgress: { [blockExerciseId: string]: ExerciseProgress };
    onToggleExerciseComplete: (blockExerciseId: string, exerciseDefinition: SupabaseBlockExercise) => void;
    // Props for store access if specific calculations are better done here, or pass pre-calculated values
}

const AccordionBlockItem: React.FC<AccordionBlockItemProps> = observer(({
	block,
	blockProgressPercent,
	allExerciseProgress,
	onToggleExerciseComplete,
}) => {
	const intensityText = block.intensity || ""; // Default to empty string if null/undefined
	const restText = block.rest_between_sets || ""; // Default to empty string

	return (
		<Accordion.Item className={styles.accordionItem} value={block.id}>
			<Accordion.Header className={styles.accordionHeader}>
				<Accordion.Trigger className={styles.accordionTrigger}>
					<div className={styles.accordionTitleContainer}>
						<span>{block.public_name || `Block ${block.id}`}</span>
						<div className={styles.accordionSubtitleContainer}>
							{intensityText && (
								<span className={styles.intensityText} style={{ color: "#ffc107", marginRight: "0.5rem" }}>
									{intensityText}
								</span>
							)}
							{intensityText && restText && <span style={{ color: "#aaa", marginRight: "0.5rem" }}>|</span>}
							{restText && (
								<span className={styles.restText} style={{ color: "#aaa" }}>
									{restText}
								</span>
							)}
						</div>
					</div>
					<ChevronDownIcon aria-hidden className={styles.accordionChevron} />
				</Accordion.Trigger>
			</Accordion.Header>
			<div className={styles.accordionProgressContainer} style={{ padding: "0.5rem 1rem" }}>
				<Progress.Root
					className={styles.progressRoot}
					style={{ height: "8px", backgroundColor: "#e0e0e0", borderRadius: "4px", overflow: "hidden" }}
					value={blockProgressPercent}
				>
					<Progress.Indicator 
						className={styles.progressIndicator}
						style={{ width: `${blockProgressPercent}%`, height: "100%", backgroundColor: "#ffc107", transition: "width 660ms cubic-bezier(0.65, 0, 0.35, 1)" }}
					/>
				</Progress.Root>
				<span style={{ fontSize: "0.8em", color: "#aaa", marginLeft: "0.5rem" }}>
					{Math.round(block.block_exercises.filter((be: SupabaseBlockExercise) => allExerciseProgress[be.id]?.isExerciseDone).length)}/{block.block_exercises.length} exercises
				</span>
			</div>
			<Accordion.Content className={styles.accordionContent}>
				{block.block_exercises && block.block_exercises.length > 0 ? (
					block.block_exercises.map((be: SupabaseBlockExercise) => {
						// Filter out exercises with no details, similar to AccordionExerciseRow guard
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
					<p className={styles.statusMessage} style={{ padding: "1rem" }}>No exercises in this block.</p>
				)}
			</Accordion.Content>
		</Accordion.Item>
	);
});

export default AccordionBlockItem; 