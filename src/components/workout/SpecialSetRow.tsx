import React from "react";
import { observer } from "mobx-react-lite";
import { QuestionMarkIcon } from "@radix-ui/react-icons";
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
			<div className={styles.progressCounter}>
				{getProgressText(specialSet)}
			</div>
		</div>
	);
});

export default SpecialSetRow; 