"use client";

import { createContext, useContext } from "react";

/**
 * True once the loading screen has finished and the page is visible.
 *
 * Hero entrance animations subscribe to this: without it they would play out
 * behind the loading screen and the user would arrive to a finished, static
 * hero. Everything else animates on scroll, so it doesn't need gating.
 */
export const AppReadyContext = createContext(false);

export function useAppReady() {
  return useContext(AppReadyContext);
}
