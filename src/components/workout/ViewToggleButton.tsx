import React from "react";
import { observer } from "mobx-react-lite";
import { ListBulletIcon, GridIcon } from "@radix-ui/react-icons";
import styles from "./ViewToggleButton.module.scss";

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
			>
				{isListView ? (
					<>
						<GridIcon className={styles.icon} />
						Grid View
					</>
				) : (
					<>
						<ListBulletIcon className={styles.icon} />
						List View
					</>
				)}
			</button>
		</div>
	);
});

export default ViewToggleButton; 