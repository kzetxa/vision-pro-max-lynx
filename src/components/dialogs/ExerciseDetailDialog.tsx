import React, { useEffect, useRef, useState, useCallback } from "react";
import { observer } from "mobx-react-lite";
import { Cross2Icon } from "@radix-ui/react-icons";
import { useStore } from "../../contexts/StoreContext";
import styles from "./ExerciseDetailDialog.module.scss";
import ExerciseVideoPlayer from "./ExerciseVideoPlayer/ExerciseVideoPlayer";
import ExerciseDetailHeader from "./ExerciseDetailHeader";
import ExerciseInfoBadges from "./ExerciseInfoBadges";

const composeText = (title: string, repsText: string, description: string) => {
	return `${title}, ${repsText}, ${description}`;
};

export interface ExerciseDetailDialogProps { 
  blockExerciseId?: string;
  exerciseId?: string;
  onToggleComplete?: () => void;
}

const ExerciseDetailDialog: React.FC<ExerciseDetailDialogProps> = observer(() => {
	const { dialogStore, workoutPageStore } = useStore();
	
	const activeDialogProps = dialogStore.activeDialog?.props as ExerciseDetailDialogProps;
	const blockExerciseId = activeDialogProps?.blockExerciseId;

	// Create a new onToggleComplete function that works with the current exercise
	const onToggleComplete = useCallback(() => {
		if (blockExerciseId) {
			// Get the current block exercise
			const currentBlockExercise = workoutPageStore.getBlockExerciseById(blockExerciseId);
			if (currentBlockExercise) {
				// Call the workout page store's toggle function directly with the current exercise
				workoutPageStore.handleToggleExerciseCompleteList(blockExerciseId, currentBlockExercise);
			}
		}
	}, [blockExerciseId, workoutPageStore]);

	// Drag state
	const [isDragging, setIsDragging] = useState(false);
	const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
	const dialogRef = useRef<HTMLDivElement>(null);
	const lastTouchTime = useRef<number>(0);
	const lastTouchPosition = useRef<{ x: number, y: number }>({ x: 0, y: 0 });

	// Animation state for slide-up
	const [animateState, setAnimateState] = useState<'pre' | 'in' | 'done'>('pre');
	useEffect(() => {
		// Next tick, trigger animation
		const timeout = setTimeout(() => setAnimateState('in'), 10);
		return () => clearTimeout(timeout);
	}, []);

	// Remove animation classes after animation ends
	const handleAnimationEnd = () => {
		if (animateState === 'in') setAnimateState('done');
	};

	// Call an expensive getter once
	const details = blockExerciseId ? workoutPageStore.getFullExerciseDetailsForDialog(blockExerciseId) : null;

	// Effect to fetch audio
	useEffect(() => {
		if (details && details.exercise && details.exercise.id && details.description) {
			const text = composeText(details.exerciseName, details.repsText || "", details.description);
			workoutPageStore.fetchAndSetExerciseAudio(details.exercise.id, text);
		} else if (blockExerciseId) { // Only warn or clear if blockExerciseId was present but details were not sufficient
			// console.warn("Cannot fetch audio: Missing exercise ID or description in details for blockExerciseId:", blockExerciseId);
			workoutPageStore._setCurrentExerciseAudioUrl(null);
			workoutPageStore._setAudioLoading(false);
		}

		return () => {
			// console.log("Cleaning up audio URL from ExerciseDetailDialog");
			workoutPageStore._setCurrentExerciseAudioUrl(null);
			workoutPageStore._setAudioLoading(false);
		};
	}, []);

	// Handle drag start
	const handleDragStart = useCallback((clientX: number, clientY: number) => {
		setIsDragging(true);
		setDragStart({ x: clientX, y: clientY });
		setDragOffset({ x: 0, y: 0 });
		lastTouchTime.current = Date.now();
		lastTouchPosition.current = { x: clientX, y: clientY };
	}, []);

	// Handle drag move
	const handleDragMove = useCallback((clientX: number, clientY: number) => {
		if (!isDragging) return;
		
		const deltaX = clientX - dragStart.x;
		const deltaY = clientY - dragStart.y;
		setDragOffset({ x: deltaX, y: deltaY });
	}, [isDragging, dragStart]);

	// Handle drag end
	const handleDragEnd = useCallback((_: number, clientY: number) => {
		if (!isDragging) return;

		const currentTime = Date.now();
		const timeDelta = currentTime - lastTouchTime.current;
		const deltaY = clientY - lastTouchPosition.current.y;

		// Calculate velocity (pixels per millisecond)
		const velocityY = timeDelta > 0 ? deltaY / timeDelta : 0;

		// Check if flung upwards with sufficient velocity
		const upwardVelocityThreshold = -0.5; // pixels per millisecond
		if (velocityY < upwardVelocityThreshold && onToggleComplete && blockExerciseId) {
			onToggleComplete();
			
			// Find the next exercise in the same block
			const nextExercise = workoutPageStore.getNextExerciseInBlock(blockExerciseId);
			if (nextExercise && nextExercise.exercise) {
				// Close the current dialog first
				dialogStore.popDialog();
				// Open the next exercise dialog
				dialogStore.pushDialog(ExerciseDetailDialog, {
					blockExerciseId: nextExercise.id,
					exerciseId: nextExercise.exercise.id,
					onToggleComplete: onToggleComplete,
				});
			} else {
				// No next exercise, just close the current dialog
				dialogStore.popDialog();
			}
		}

		// Reset drag state
		setIsDragging(false);
		setDragOffset({ x: 0, y: 0 });
	}, [isDragging, onToggleComplete, dialogStore]);

	// Mouse event handlers
	const handleMouseDown = useCallback((e: React.MouseEvent) => {
		e.preventDefault();
		handleDragStart(e.clientX, e.clientY);
	}, [handleDragStart]);

	const handleMouseMove = useCallback((e: MouseEvent) => {
		handleDragMove(e.clientX, e.clientY);
	}, [handleDragMove]);

	const handleMouseUp = useCallback((e: MouseEvent) => {
		handleDragEnd(0, e.clientY);
	}, [handleDragEnd]);

	// Touch event handlers
	const handleTouchStart = useCallback((e: React.TouchEvent) => {
		const touch = e.touches[0];
		handleDragStart(touch.clientX, touch.clientY);
	}, [handleDragStart]);

	const handleTouchMove = useCallback((e: TouchEvent) => {
		e.preventDefault();
		const touch = e.touches[0];
		handleDragMove(touch.clientX, touch.clientY);
	}, [handleDragMove]);

	const handleTouchEnd = useCallback((e: TouchEvent) => {
		const touch = e.changedTouches[0];
		handleDragEnd(0, touch.clientY);
	}, [handleDragEnd]);

	// Add/remove global event listeners
	useEffect(() => {
		if (isDragging) {
			document.addEventListener('mousemove', handleMouseMove);
			document.addEventListener('mouseup', handleMouseUp);
			document.addEventListener('touchmove', handleTouchMove, { passive: false });
			document.addEventListener('touchend', handleTouchEnd);
		}

		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
			document.removeEventListener('touchmove', handleTouchMove);
			document.removeEventListener('touchend', handleTouchEnd);
		};
	}, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

	if (!blockExerciseId) {
		console.warn("ExerciseDetailDialog: blockExerciseId is missing from dialog props.");
		return <div className={styles.dialogOverlay}><div className={styles.dialogContent}>Loading details...</div></div>; 
	}

	if (!details) {
		console.warn(`ExerciseDetailDialog: Details not found for blockExerciseId: ${blockExerciseId}`);
		return <div className={styles.dialogOverlay}><div className={styles.dialogContent}>Details not available.</div></div>; 
	}

	const { description } = details;
	const { currentExerciseAudioUrl, isAudioLoading } = workoutPageStore;

	// Calculate transform for dragging
	const transform = `translate(${dragOffset.x}px, ${dragOffset.y}px)`;
	const isMovingUp = dragOffset.y < -20; // Show visual feedback when moving up significantly

	return (
		<div className={styles.dialogOverlay} onClick={() => dialogStore.popDialog()}>
			<div 
				ref={dialogRef}
				className={
					[
						styles.dialogContent,
						isDragging ? styles.dragging : '',
						isMovingUp ? styles.movingUp : '',
						animateState === 'pre' ? styles.preAnimate : '',
						animateState === 'in' ? styles.animateIn : '',
					].filter(Boolean).join(' ')
				}
				style={{ transform }}
				onClick={(e) => e.stopPropagation()}
				onMouseDown={handleMouseDown}
				onTouchStart={handleTouchStart}
				onAnimationEnd={handleAnimationEnd}
			>
				<button
					aria-label="Close dialog"
					className={styles.closeButton}
					onClick={() => dialogStore.popDialog()}
				>
					<Cross2Icon />
				</button>
				<ExerciseVideoPlayer />
				<div className={styles.detailsPanel}>
					<ExerciseDetailHeader />
					{description && (
						<p className={styles.description}>{description}</p>
					)}
					<ExerciseInfoBadges />
					{isAudioLoading && <p>Loading audio...</p>}
					{currentExerciseAudioUrl && (
						<div className={styles.audioPlayerWrapper}>
							<audio
								autoPlay
								className={styles.audioPlayer}
								controls
								src={currentExerciseAudioUrl}
							>
								Your browser does not support the audio element.
							</audio>
						</div>
					)}
					{!isAudioLoading && !currentExerciseAudioUrl && details && details.exercise && (
						<p>No audio loaded or available.</p>
					)}
				</div>
			</div>
		</div>
	);
});

export default ExerciseDetailDialog; 