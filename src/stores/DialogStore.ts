import { action, makeObservable, observable } from "mobx";
import React from "react"; // Needed for React.FC type
import type { RootStore } from "./RootStore";

// Define a type for items in our dialog stack
export interface DialogStackItem {
	id: string; // Unique ID for key and management
	component: React.FC<any>; // The dialog component itself
	props?: any; // Props to pass to the dialog component
}

export class DialogStore {
	rootStore: RootStore;
	dialogStack: DialogStackItem[] = [];

	constructor(rootStore: RootStore) {
		this.rootStore = rootStore;
		makeObservable(this, {
			dialogStack: observable.shallow, // Use .deep for arrays of objects
			pushDialog: action,
			popDialog: action,
			clearAllDialogs: action,
		});
	}

	pushDialog = (component: React.FC<any>, props?: any, usePreviousProps?: boolean): void => {
		let dialogProps = props;
		if (usePreviousProps && this.dialogStack.length > 0) {
			const previousDialog = this.dialogStack[this.dialogStack.length - 1];
			if (previousDialog && previousDialog.props) {
				dialogProps = { ...previousDialog.props, ...props };
			}
		}

		const newDialog: DialogStackItem = {
			id: `dialog-${Date.now()}`,
			component,
			props: dialogProps,
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
} 