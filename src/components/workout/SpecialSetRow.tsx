import React from "react";
import { observer } from "mobx-react-lite";
import { QuestionMarkIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import * as Progress from "@radix-ui/react-progress";
import styles from "./SpecialSetRow.module.scss";
import { useStore } from "../../contexts/StoreContext";

interface SpecialSetRowProps {
	specialSet: string | null;
	specialInstructions?: string | null;
}

const SpecialSetRow: React.FC<SpecialSetRowProps> = observer(({
	specialSet,
	specialInstructions,
}) => {
	const { workoutPageStore } = useStore();
	
	if (!specialSet) return null;

	// Helper function to parse special set type and determine progress text
	const getProgressText = (specialSetName: string): string => {
		// First check if all exercises in this special set are currently completed
		if (workoutPageStore.workoutData) {
			const allSpecialSetExercises = workoutPageStore.workoutData.blocks
				.flatMap(block => block.block_exercises)
				.filter(ex => ex.special_set === specialSetName);
			
			const allCompleted = allSpecialSetExercises.length > 0 && 
				allSpecialSetExercises.every(ex => workoutPageStore.exerciseCompletionInCurrentSet[ex.id]);

			if (allCompleted) {
				// Show completed state for current round
				const currentSet = workoutPageStore.getCurrentSetForSpecialSet(specialSetName);
				const totalSets = workoutPageStore.getTotalSetsForSpecialSet(specialSetName);
				
				if (specialSetName.toLowerCase().includes("half split set")) {
					return `Set ${currentSet}/2`;
				} else if (specialSetName.match(/(\d+(?:-\d+)+)/)) {
					return `${totalSets}/${totalSets} Rounds`;
				} else {
					return `Set ${currentSet}/${totalSets}`;
				}
			}
		}

		// If not all completed, show normal progress
		const currentSet = workoutPageStore.getCurrentSetForSpecialSet(specialSetName);
		const totalSets = workoutPageStore.getTotalSetsForSpecialSet(specialSetName);
		
		if (specialSetName.toLowerCase().includes("half split set")) {
			return `Set ${currentSet}/2`;
		} else if (specialSetName.match(/(\d+(?:-\d+)+)/)) {
			const progress = workoutPageStore.specialSetProgress[specialSetName] || 0;
			return `${progress}/${totalSets} Rounds`;
		} else {
			return `Set ${currentSet}/${totalSets}`;
		}
	};

	// Helper function to calculate progress percentage for the progress bar
	const getProgressPercentage = (specialSetName: string): number => {
		// First check if all exercises in this special set are currently completed
		if (workoutPageStore.workoutData) {
			const allSpecialSetExercises = workoutPageStore.workoutData.blocks
				.flatMap(block => block.block_exercises)
				.filter(ex => ex.special_set === specialSetName);
			
			const allCompleted = allSpecialSetExercises.length > 0 && 
				allSpecialSetExercises.every(ex => workoutPageStore.exerciseCompletionInCurrentSet[ex.id]);

			if (allCompleted) {
				// Show 100% when current round is completed
				return 100;
			}
		}

		// If not all completed, show normal progress
		const progress = workoutPageStore.specialSetProgress[specialSetName] || 0;
		const totalSets = workoutPageStore.getTotalSetsForSpecialSet(specialSetName);
		
		if (specialSetName.toLowerCase().includes("half split set")) {
			return (progress / 2) * 100;
		} else if (specialSetName.match(/(\d+(?:-\d+)+)/)) {
			return (progress / totalSets) * 100;
		} else {
			// Standard circuit
			return ((progress + 1) / totalSets) * 100;
		}
	};

	return (
		<div className={styles.specialSetRow}>
			<div className={styles.leadingIndicator}>
				<div className={styles.greenBullet} />
			</div>
			<div className={styles.content}>
				<div className={styles.titleContainer}>
					<span className={styles.title}>{specialSet}</span>
					{specialInstructions && (
						<div className={styles.infoIcon}>
							<QuestionMarkIcon />
						</div>
					)}
				</div>
			</div>
			<div className={styles.progressSection}>
				<div className={styles.progressContainer}>
					<Progress.Root
						className={styles.progressRoot}
						value={getProgressPercentage(specialSet)}
					>
						<Progress.Indicator 
							className={styles.progressIndicator}
							style={{ width: `${getProgressPercentage(specialSet)}%` }}
						/>
					</Progress.Root>
					<span className={styles.progressText}>
						{getProgressText(specialSet)}
					</span>
				</div>
				<ChevronDownIcon aria-hidden className={styles.chevronIcon} />
			</div>
		</div>
	);
});

export default SpecialSetRow; 