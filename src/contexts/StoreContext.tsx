import React, { createContext, useContext } from "react";
import { RootStore } from "../stores/RootStore";

// Create a new instance of the RootStore
const rootStore = new RootStore();

// Create the context with the RootStore instance
export const StoreContext = createContext<RootStore>(rootStore);

// Custom hook to use the store(s) in components
export const useStore = (): RootStore => {
	return useContext(StoreContext);
};

// Optional: A StoreProvider component if you prefer this pattern,
// though for a single global store instance, directly exporting the context and hook is common.
// export const StoreProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
//     return <StoreContext.Provider value={rootStore}>{children}</StoreContext.Provider>;
// }; 