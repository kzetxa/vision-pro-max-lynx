import React from "react";
import { observer } from "mobx-react-lite";
import { QuestionMarkIcon } from "@radix-ui/react-icons";
import styles from "./SpecialSetRow.module.scss";

interface SpecialSetRowProps {
	specialSet: string | null;
	specialInstructions?: string | null;
	roundsCompleted?: number;
	totalRounds?: number;
}

const SpecialSetRow: React.FC<SpecialSetRowProps> = observer(({
	specialSet,
	specialInstructions,
	roundsCompleted = 0,
	totalRounds = 2,
}) => {
	if (!specialSet) return null;

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
			<div className={styles.roundsCounter}>
				{roundsCompleted}/{totalRounds} Rounds
			</div>
		</div>
	);
});

export default SpecialSetRow; 