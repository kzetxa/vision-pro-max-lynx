import React from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import styles from "./FinishWorkoutDialog.module.scss"; // We'll create this SCSS file next

interface FinishWorkoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmFinish: () => void;
  triggerButtonClassName?: string;
  triggerButtonStyle?: React.CSSProperties;
}

const FinishWorkoutDialog: React.FC<FinishWorkoutDialogProps> = ({
	open,
	onOpenChange,
	onConfirmFinish,
	triggerButtonClassName,
	triggerButtonStyle,
}) => {
	return (
		<RadixDialog.Root onOpenChange={onOpenChange} open={open}>
			<RadixDialog.Trigger asChild>
				<button 
					className={triggerButtonClassName || styles.defaultTriggerButton} 
					style={triggerButtonStyle}
				>
          Finish Workout (Clear Progress)
				</button>
			</RadixDialog.Trigger>
			<RadixDialog.Portal>
				<RadixDialog.Overlay className={styles.dialogOverlay} />
				<RadixDialog.Content className={styles.dialogContent}>
					<RadixDialog.Title className={styles.dialogTitle}>Confirm Finish & Clear</RadixDialog.Title>
					<RadixDialog.Description className={styles.dialogDescription}>
            Are you sure? This will mark the workout as finished and clear your current progress for it.
					</RadixDialog.Description>
					<div className={styles.dialogActions}>
						<RadixDialog.Close asChild>
							<button className={`${styles.dialogButton} ${styles.dialogButtonSecondary}`}>
                Cancel
							</button>
						</RadixDialog.Close>
						<button 
							className={`${styles.dialogButton} ${styles.dialogButtonPrimary}`} 
							onClick={onConfirmFinish}
						>
              Yes, Finish & Clear
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