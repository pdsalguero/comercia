"use client";

import { createContext, useContext, useState } from "react";

type View = "grid" | "list";

const ListingsViewContext = createContext<{ view: View; setView: (v: View) => void }>({
  view: "grid",
  setView: () => {},
});

export function ListingsViewProvider({ children }: { children: React.ReactNode }) {
  const [view, setView] = useState<View>("grid");
  return (
    <ListingsViewContext.Provider value={{ view, setView }}>
      {children}
    </ListingsViewContext.Provider>
  );
}

export function useListingsView() {
  return useContext(ListingsViewContext);
}
