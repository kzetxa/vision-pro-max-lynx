import React from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { Cross2Icon, UploadIcon, HeartIcon } from "@radix-ui/react-icons";
import styles from "./FinishWorkoutDialog.module.scss";

// Placeholder data - we will replace this with real props later
const placeholderData = {
	totalTime: "38:25",
	sets: 15,
	reps: 180,
	skipped: 1,
	exerciseDistribution: [
		{ name: "Calisthenics Push", value: 30 },
		{ name: "Calisthenics Legs", value: 26 },
		{ name: "Flexibility", value: 16 },
		{ name: "Warm-Up / Pre Hab", value: 10 },
		{ name: "Handstands", value: 6 },
	],
	averageDifficulty: "Intermediate",
	hardestExercise: "7 Advanced",
};

// --- Sub-components for the dialog ---

const StatCard: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
	<div className={styles.statCard}>
		<span className={styles.statValue}>{value}</span>
		<span className={styles.statLabel}>{label}</span>
	</div>
);

// A placeholder for the donut chart
const DonutChartPlaceholder: React.FC<{ data: any[] }> = ({ data }) => (
	<div className={styles.donutChartPlaceholder}>
		<div className={styles.chartText}>Donut Chart (WIP)</div>
		<ul className={styles.legend}>
			{data.map((item) => (
				<li key={item.name}>
					{item.name}: {item.value}%
				</li>
			))}
		</ul>
	</div>
);

const InfoCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
	<div className={styles.infoCard}>
		<span className={styles.infoLabel}>{label}</span>
		<span className={styles.infoValue}>{value}</span>
	</div>
);

// --- Main Dialog Component ---

interface FinishWorkoutDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	stats: {
		totalTime: string;
		sets: number;
		reps: number;
		skipped: number;
	} | null;
}

const FinishWorkoutDialog: React.FC<FinishWorkoutDialogProps> = ({ open, onOpenChange, stats }) => {
	const handleReturnHome = (): void => {
		// We can add routing logic here later
		console.log("Returning home...");
	};

	const handleCreateAccount = (): void => {
		console.log("Creating account...");
	};

	if (!stats) {
		// Render nothing or a loading state if stats aren't ready
		return null;
	}

	return (
		<RadixDialog.Root onOpenChange={onOpenChange} open={open}>
			<RadixDialog.Trigger asChild>
				{/* The trigger is now in WorkoutPage.tsx, so we don't need a default one here */}
				{/* <button className={styles.defaultTriggerButton}>Finish Workout</button> */}
			</RadixDialog.Trigger>
			<RadixDialog.Portal>
				<RadixDialog.Overlay className={styles.dialogOverlay} />
				<RadixDialog.Content className={styles.dialogContent}>
					<RadixDialog.Title className={styles.dialogTitle}>You crushed it!</RadixDialog.Title>

					<div className={styles.summaryHeader}>
						{/* Placeholder icons */}
						<div className={styles.headerIcons}>
							<span>🔥 50</span>
							<span>💪 12</span>
							<UploadIcon />
							<HeartIcon />
						</div>
					</div>

					{/* TODO: when we are adding comments/community/discord, add this back */}
					{/* <div className={styles.tabContainer}>
						<button className={`${styles.tabButton} ${styles.active}`}>Stats</button>
						<button className={styles.tabButton}>Community</button>
					</div> */}

					<div className={styles.statsGrid}>
						<StatCard label="Total Time" value={stats.totalTime} />
						<StatCard label="Sets" value={stats.sets} />
						<StatCard label="Reps" value={stats.reps} />
						<StatCard label="Skipped" value={stats.skipped} />
					</div>

					{/* TODO: when we have an idea of how to do this, add it back */}
					{/* <h3 className={styles.sectionTitle}>Exercise Distribution</h3>
					<DonutChartPlaceholder data={placeholderData.exerciseDistribution} /> */}

					<div className={styles.infoGrid}>
						<InfoCard label="Average Difficulty" value={placeholderData.averageDifficulty} />
						<InfoCard label="Hardest Exercise" value={placeholderData.hardestExercise} />
					</div>

					<div className={styles.dialogActions}>
						<button className={styles.primaryButton} onClick={handleCreateAccount}>
							Create free account & track your progress
						</button>
						<button className={styles.secondaryButton} onClick={handleReturnHome}>
							Return Home
						</button>
					</div>

					<RadixDialog.Close asChild>
						<button aria-label="Close" className={styles.dialogCloseButton}>
							<Cross2Icon />
						</button>
					</RadixDialog.Close>
				</RadixDialog.Content>
			</RadixDialog.Portal>
		</RadixDialog.Root>
	);
};

export default FinishWorkoutDialog; 