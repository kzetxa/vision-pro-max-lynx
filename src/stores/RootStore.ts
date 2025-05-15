import { WorkoutPageStore } from "./WorkoutPageStore";
import { DialogStore } from "./DialogStore";

export class RootStore {
	workoutPageStore: WorkoutPageStore;
	dialogStore: DialogStore;

	constructor() {
		this.workoutPageStore = new WorkoutPageStore(this);
		this.dialogStore = new DialogStore(this);
		// Future stores can be initialized here
		// e.g., this.anotherStore = new AnotherStore(this);
	}
} 