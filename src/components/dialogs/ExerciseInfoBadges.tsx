import React from "react";
import Badge from "../Badge"; // Assuming Badge component path
import styles from "./ExerciseDetailDialog.module.scss"; // Assuming styles are shared or specific

interface ExerciseInfoBadgesProps {
	exerciseType?: string | null;
	equipmentNeeded?: string | null;
}

const ExerciseInfoBadges: React.FC<ExerciseInfoBadgesProps> = ({
	exerciseType,
	equipmentNeeded,
}) => {
	if (!exerciseType && !equipmentNeeded) {
		return null; // Don't render the row if there are no badges
	}

	return (
		<div className={styles.badgesRow}>
			{exerciseType && (
				<Badge
					className={styles.badge}
					label="Exercise Type"
					value={exerciseType}
				/>
			)}
			{equipmentNeeded && (
				<Badge
					className={styles.badge}
					label="Equipment"
					value={equipmentNeeded}
				/>
			)}
		</div>
	);
};

export default ExerciseInfoBadges;