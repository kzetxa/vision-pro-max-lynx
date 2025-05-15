import React from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../contexts/StoreContext";
import type { SupabaseExercise } from "../../lib/types";
import { Cross2Icon } from "@radix-ui/react-icons";
import styles from "./ExerciseFeedbackDialog.module.scss";

export interface ExerciseFeedbackDialogProps {
  exercise: SupabaseExercise;
}

const ExerciseFeedbackDialog: React.FC<ExerciseFeedbackDialogProps> = observer(({ exercise }) => {
	const { dialogStore } = useStore();

	return (
		<div className={styles.dialogOverlay} onClick={() => dialogStore.popDialog()}>
			<div className={styles.dialogContent} onClick={(e) => e.stopPropagation()}>
				<button 
					aria-label="Close feedback dialog" 
					className={styles.closeButton}
					onClick={() => dialogStore.popDialog()}
				>
					<Cross2Icon />
				</button>
				<h2 className={styles.title}>Feedback for: {exercise.current_name || "Exercise"}</h2>
				<div className={styles.section}>
					<h3 className={styles.sectionTitle}>Upload Your Video</h3>
					{/* Placeholder for video upload UI */}
					<input
						accept="video/*"
						className={styles.fileInput}
						type="file"
					/>
					<p className={styles.uploadHint}>Share a video of your performance for feedback.</p>
				</div>
				<div className={styles.section}>
					<h3 className={styles.sectionTitle}>Coach&apos;s Feedback</h3>
					{/* Placeholder for coach&apos;s feedback area */}
					<textarea 
						className={styles.feedbackTextarea}
						placeholder="Coach will provide feedback here..."
						readOnly // Or not, depending on who is viewing
					/>
				</div>
				<button 
					className={styles.submitButton} 
					onClick={() => {
						// Placeholder action
						console.log("Submit feedback / video action for", exercise.id);
						dialogStore.popDialog(); // Close dialog after submission for now
					}}
				>
          Submit Video & View Feedback
				</button>
			</div>
		</div>
	);
});

export default ExerciseFeedbackDialog; 