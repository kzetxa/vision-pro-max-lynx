import { WorkoutPageStore } from "./WorkoutPageStore";

export class RootStore {
	workoutPageStore: WorkoutPageStore;

	constructor() {
		this.workoutPageStore = new WorkoutPageStore(this);
		// Future stores can be initialized here
		// e.g., this.anotherStore = new AnotherStore(this);
	}
} 