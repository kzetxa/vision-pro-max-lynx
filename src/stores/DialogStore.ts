import { makeObservable, observable, action, computed } from "mobx";
import type { SupabaseBlockExercise } from "../lib/types"; // Adjust path as needed
import type { RootStore } from "./RootStore";
import React from "react"; // Needed for React.FC type

// Define a type for items in our dialog stack
export interface DialogStackItem {
	id: string; // Unique ID for key and management
	component: React.FC<any>; // The dialog component itself
	props?: any; // Props to pass to the dialog component
}

export class DialogStore {
	rootStore: RootStore;

	dialogStack: DialogStackItem[] = [];

	// Exercise Detail Dialog State
	isExerciseDetailOpen: boolean = false;
	currentExerciseForDetail: SupabaseBlockExercise | null = null;

	// Potentially more dialog states here in the future
	// isSomeOtherDialogOpen: boolean = false;
	// dataForOtherDialog: any = null;

	constructor(rootStore: RootStore) {
		this.rootStore = rootStore;
		makeObservable(this, {
			dialogStack: observable.deep, // Use .deep for arrays of objects
			pushDialog: action,
			popDialog: action,
			clearAllDialogs: action,
			activeDialog: computed, // To easily get the top-most dialog
			// Exercise Detail Dialog
			isExerciseDetailOpen: observable,
			currentExerciseForDetail: observable.ref, // .ref for complex objects if mutations aren't tracked internally
			openExerciseDetail: action,
			closeExerciseDetail: action,
            
			// Example for other dialogs
			// isSomeOtherDialogOpen: observable,
			// dataForOtherDialog: observable.ref,
			// openSomeOtherDialog: action,
			// closeSomeOtherDialog: action,
		});
	}

	pushDialog = (component: React.FC<any>, props?: any): void => {
		const newDialog: DialogStackItem = {
			id: `dialog-${Date.now()}-${Math.random().toString(36)
				.substr(2, 9)}`,
			component,
			props,
		};
		this.dialogStack.push(newDialog);
		console.log("Pushed dialog:", newDialog.id, "Component:", component.displayName || component.name);
	};

	popDialog = (): void => {
		if (this.dialogStack.length > 0) {
			const popped = this.dialogStack.pop();
			console.log("Popped dialog:", popped?.id);
		} else {
			console.warn("Attempted to pop from an empty dialog stack.");
		}
	};

	clearAllDialogs = (): void => {
		this.dialogStack = [];
		console.log("Cleared all dialogs.");
	};

	get activeDialog(): DialogStackItem | null {
		if (this.dialogStack.length === 0) {
			return null;
		}
		return this.dialogStack[this.dialogStack.length - 1];
	}

	openExerciseDetail = (exercise: SupabaseBlockExercise): void => {
		this.currentExerciseForDetail = exercise;
		this.isExerciseDetailOpen = true;
		console.log("Opening detail for:", exercise);
	};

	closeExerciseDetail = (): void => {
		this.isExerciseDetailOpen = false;
		this.currentExerciseForDetail = null;
		console.log("Closing exercise detail dialog");
	};

	// Example for other dialog actions
	// openSomeOtherDialog = (data: any): void => {
	//     this.dataForOtherDialog = data;
	//     this.isSomeOtherDialogOpen = true;
	// };

	// closeSomeOtherDialog = (): void => {
	//     this.isSomeOtherDialogOpen = false;
	//     this.dataForOtherDialog = null;
	// };
} 