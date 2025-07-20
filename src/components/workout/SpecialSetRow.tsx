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
				const roundIndex = workoutPageStore.specialSetCurrentRoundIndex[specialSetName] || 0;
				
				// Half Split Set: 2 sets total
				if (specialSetName.toLowerCase().includes("half split set")) {
					const currentSet = ((workoutPageStore.specialSetProgress[specialSetName] || 0) % 2) + 1;
					return `Set ${currentSet}/2`;
				}
				
				// X-Y-Z format (e.g., "9-7-5")
				const dashMatches = specialSetName.match(/(\d+)-(\d+)-(\d+)/);
				if (dashMatches) {
					const rounds = dashMatches.slice(1).map(Number);
					if (roundIndex < rounds.length) {
						const targetRounds = rounds[roundIndex];
						return `${targetRounds}/${targetRounds} Rounds`;
					}
					return "Completed";
				}
				
				// More complex X-Y-Z-... format
				const complexDashMatches = specialSetName.match(/(\d+(?:-\d+)+)/);
				if (complexDashMatches) {
					const rounds = complexDashMatches[1].split('-').map(Number);
					if (roundIndex < rounds.length) {
						const targetRounds = rounds[roundIndex];
						return `${targetRounds}/${targetRounds} Rounds`;
					}
					return "Completed";
				}
				
				// Standard Circuit: "X sets" format
				const setsMatch = specialSetName.match(/(\d+)\s+sets?/i);
				if (setsMatch) {
					const totalSets = parseInt(setsMatch[1]);
					const currentSet = (workoutPageStore.specialSetProgress[specialSetName] || 0) + 1;
					return `Set ${currentSet}/${totalSets}`;
				}
			}
		}

		// If not all completed, show normal progress
		const progress = workoutPageStore.specialSetProgress[specialSetName] || 0;
		const roundIndex = workoutPageStore.specialSetCurrentRoundIndex[specialSetName] || 0;
		
		// Half Split Set: 2 sets total
		if (specialSetName.toLowerCase().includes("half split set")) {
			const currentSet = (progress % 2) + 1;
			return `Set ${currentSet}/2`;
		}
		
		// X-Y-Z format (e.g., "9-7-5")
		const dashMatches = specialSetName.match(/(\d+)-(\d+)-(\d+)/);
		if (dashMatches) {
			const rounds = dashMatches.slice(1).map(Number); // [9, 7, 5]
			if (roundIndex < rounds.length) {
				const targetRounds = rounds[roundIndex];
				return `${progress}/${targetRounds} Rounds`;
			}
			return "Completed";
		}
		
		// More complex X-Y-Z-... format
		const complexDashMatches = specialSetName.match(/(\d+(?:-\d+)+)/);
		if (complexDashMatches) {
			const rounds = complexDashMatches[1].split('-').map(Number);
			if (roundIndex < rounds.length) {
				const targetRounds = rounds[roundIndex];
				return `${progress}/${targetRounds} Rounds`;
			}
			return "Completed";
		}
		
		// Standard Circuit: "X sets" format
		const setsMatch = specialSetName.match(/(\d+)\s+sets?/i);
		if (setsMatch) {
			const totalSets = parseInt(setsMatch[1]);
			return `Set ${progress + 1}/${totalSets}`;
		}
		
		// Default fallback
		return `${progress} Rounds`;
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
		const roundIndex = workoutPageStore.specialSetCurrentRoundIndex[specialSetName] || 0;
		
		// Half Split Set: 2 sets total
		if (specialSetName.toLowerCase().includes("half split set")) {
			return (progress / 2) * 100;
		}
		
		// X-Y-Z format (e.g., "9-7-5")
		const dashMatches = specialSetName.match(/(\d+)-(\d+)-(\d+)/);
		if (dashMatches) {
			const rounds = dashMatches.slice(1).map(Number);
			if (roundIndex < rounds.length) {
				const targetRounds = rounds[roundIndex];
				return (progress / targetRounds) * 100;
			}
			return 100;
		}
		
		// More complex X-Y-Z-... format
		const complexDashMatches = specialSetName.match(/(\d+(?:-\d+)+)/);
		if (complexDashMatches) {
			const rounds = complexDashMatches[1].split('-').map(Number);
			if (roundIndex < rounds.length) {
				const targetRounds = rounds[roundIndex];
				return (progress / targetRounds) * 100;
			}
			return 100;
		}
		
		// Standard Circuit: "X sets" format
		const setsMatch = specialSetName.match(/(\d+)\s+sets?/i);
		if (setsMatch) {
			const totalSets = parseInt(setsMatch[1]);
			return ((progress + 1) / totalSets) * 100;
		}
		
		// Default fallback
		return 0;
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