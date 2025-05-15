import React from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../contexts/StoreContext";

const GlobalDialogRenderer: React.FC = observer(() => {
	const { dialogStore } = useStore();
	const activeDialog = dialogStore.activeDialog;

	if (!activeDialog) {
		return null;
	}

	const { component: DialogComponent, props, id } = activeDialog;

	// It's good practice to ensure DialogComponent is a valid React component type
	// For now, we assume it is, as per DialogStore's typings.

	return <DialogComponent {...props} key={id} />;
});

export default GlobalDialogRenderer; 