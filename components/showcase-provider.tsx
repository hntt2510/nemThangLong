"use client";

import React, { createContext, useContext } from "react";

const ShowcaseContext = createContext<boolean>(false);

export function ShowcaseProvider({
  showcaseMode = false,
  children,
}: {
  showcaseMode?: boolean;
  children: React.ReactNode;
}) {
  return (
    <ShowcaseContext.Provider value={showcaseMode}>
      {children}
    </ShowcaseContext.Provider>
  );
}

export function useShowcaseMode(): boolean {
  return useContext(ShowcaseContext);
}
