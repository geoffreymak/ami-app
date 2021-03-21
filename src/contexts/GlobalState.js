import React, { createContext, useReducer, useContext, useEffect } from "react";

import appReducer, { initialState } from "./appReducer";
import useAppCallback from "./hooks/useAppCallback";

import { usePreferences } from "../utils/hooks/usePreferences";

const GlobalStateContext = createContext();
const GlobalCallbackContext = createContext();
const GlobalDispatchContext = createContext();
const GlobalPreferencesContext = createContext();

function GlobalStateProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const appCallback = useAppCallback(state, dispatch);
  const preferencesState = usePreferences();

  const { initializeData } = appCallback;

  useEffect(() => {
    initializeData();
    console.log("initialize app");
  }, []);

  return (
    <GlobalStateContext.Provider value={state}>
      <GlobalCallbackContext.Provider value={appCallback}>
        <GlobalDispatchContext.Provider value={dispatch}>
          <GlobalPreferencesContext.Provider value={preferencesState}>
            {children}
          </GlobalPreferencesContext.Provider>
        </GlobalDispatchContext.Provider>
      </GlobalCallbackContext.Provider>
    </GlobalStateContext.Provider>
  );
}

function useGlobalState() {
  const context = useContext(GlobalStateContext);
  if (context === undefined) {
    throw new Error("useGlobalState must be used within a GlobalStateProvider");
  }
  return context;
}

function useGlobalPrefereces() {
  const context = useContext(GlobalPreferencesContext);
  if (context === undefined) {
    throw new Error(
      "useGlobalPrefereces must be used within a GlobalStateProvider"
    );
  }
  return context;
}

function useGlobalCallback() {
  const context = useContext(GlobalCallbackContext);
  if (context === undefined) {
    throw new Error(
      "useGlobalCallback must be used within a GlobalStateProvider"
    );
  }
  return context;
}

function useGlobalDispatch() {
  const context = useContext(GlobalDispatchContext);
  if (context === undefined) {
    throw new Error(
      "useGlobalDispatch must be used within a GlobalStateProvider"
    );
  }
  return context;
}

export {
  GlobalStateProvider,
  useGlobalState,
  useGlobalCallback,
  useGlobalDispatch,
  useGlobalPrefereces,
};
