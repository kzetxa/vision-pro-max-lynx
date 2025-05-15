import React from "react";
import { observer } from "mobx-react-lite";
import { ListBulletIcon, GridIcon } from "@radix-ui/react-icons";
import styles from "../../pages/WorkoutPage.module.scss"; // Use existing styles for now

interface ViewToggleButtonProps {
	isListView: boolean;
	onToggle: () => void;
}

const ViewToggleButton: React.FC<ViewToggleButtonProps> = observer(({ isListView, onToggle }) => {
	return (
		<div style={{ display: "flex", justifyContent: "flex-end", width: "100%", marginBottom: "1rem" }}>
			<button 
				className={styles.toggleViewButton}
				onClick={onToggle} 
				style={{ padding: "0.5rem 1rem", cursor: "pointer", display: "flex", alignItems: "center" }}
			>
				{isListView ? (
					<>
						<GridIcon style={{ marginRight: "0.5rem" }} />
						Grid View
					</>
				) : (
					<>
						<ListBulletIcon style={{ marginRight: "0.5rem" }} />
						List View
					</>
				)}
			</button>
		</div>
	);
});

export default ViewToggleButton; 