"use client";

import { createContext, useContext, useState } from "react";

type WorkforceState = {
  approved: boolean;
  approve: () => void;
  reset: () => void;
};

const WorkforceContext = createContext<WorkforceState | null>(null);

export function WorkforceProvider({ children }: { children: React.ReactNode }) {
  const [approved, setApproved] = useState(false);

  const approve = () => {
    setApproved(true);
  };

  const reset = () => {
    setApproved(false);
  };

  return <WorkforceContext.Provider value={{ approved, approve, reset }}>{children}</WorkforceContext.Provider>;
}

export function useWorkforce() {
  const context = useContext(WorkforceContext);
  if (!context) throw new Error("useWorkforce must be used inside WorkforceProvider");
  return context;
}
