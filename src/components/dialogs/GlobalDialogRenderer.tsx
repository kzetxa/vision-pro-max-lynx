import React from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../contexts/StoreContext";

const GlobalDialogRenderer: React.FC = observer(() => {
	const { dialogStore } = useStore();
	const activeDialog = dialogStore.activeDialog;

	console.log("[GlobalDialogRenderer] Rendering. Current activeDialog state:", JSON.stringify(activeDialog));

	if (!activeDialog) {
		console.log("[GlobalDialogRenderer] No active dialog, returning null.");
		return null;
	}

	const { component: DialogComponent, props, id } = activeDialog;

	// It's good practice to ensure DialogComponent is a valid React component type
	// For now, we assume it is, as per DialogStore's typings.
	console.log(`[GlobalDialogRenderer] Preparing to render DialogComponent. Name: ${DialogComponent?.displayName || DialogComponent?.name || "UnknownComponent"}, ID: ${id}, Props:`, JSON.stringify(props));

	return <DialogComponent {...props} key={id} />;
});

export default GlobalDialogRenderer; 