import { useState, useCallback } from "react";

export const useLoading = (initialState = false) => {
  const [state, setState] = useState({
    isLoading: initialState,
    showLoadingContent: false,
    isExiting: false,
  });

  const startLoading = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isLoading: true,
    }));

    setTimeout(() => {
      setState((prev) => ({
        ...prev,
        showLoadingContent: true,
      }));
    }, 50);
  }, []);

  const exitLoading = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      isExiting: true,
    }));

    await new Promise((resolve) => setTimeout(resolve, 700));

    setState({
      isLoading: false,
      showLoadingContent: false,
      isExiting: false,
    });
  }, []);

  return {
    ...state,
    startLoading,
    exitLoading,
  };
};
