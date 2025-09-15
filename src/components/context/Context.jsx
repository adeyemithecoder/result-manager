"use client";
import { createContext, useEffect, useReducer, useState } from "react";

const Reducer = (state, action) => {
  switch (action.type) {
    case "TOGGLE_SIDEBAR":
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen,
      };

    default:
      return state;
  }
};

const INITIAL_STATE = {
  sidebarOpen: null,
};

export const Context = createContext(INITIAL_STATE);

export const ContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(Reducer, INITIAL_STATE);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedSidebarOpen = JSON.parse(localStorage.getItem("sidebarOpen"));
      if (storedSidebarOpen !== null) {
        dispatch({ type: "TOGGLE_SIDEBAR" });
      }
      setIsMounted(true);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("sidebarOpen", JSON.stringify(state.sidebarOpen));
    }
  }, [state.sidebarOpen, isMounted]);

  return (
    <Context.Provider
      value={{
        sidebarOpen: state.sidebarOpen,
        dispatch,
      }}
    >
      {children}
    </Context.Provider>
  );
};
