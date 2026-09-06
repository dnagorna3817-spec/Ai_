"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type AutonomyLevel = "assistant" | "controlled" | "autonomous";

export type CreatedEmployee = {
  name: "AI-бухгалтер";
  role: "Фінанси та бухгалтерія";
  responsibilities: string[];
  autonomy: AutonomyLevel;
  approvalRules: string[];
  approvalLimit: string;
  createdAt: string;
};

export type IntegrationId = "bank" | "accounting" | "documents" | "email" | "crm";

export type ConnectedIntegration = {
  id: IntegrationId;
  status: "connected";
  provider: string;
  connectedAt: string;
  metadata: string[];
};

type WorkforceState = {
  approved: boolean;
  createdEmployee: CreatedEmployee | null;
  integrations: ConnectedIntegration[];
  approve: () => void;
  connectIntegration: (integration: ConnectedIntegration) => void;
  disconnectIntegration: (id: IntegrationId) => void;
  hireEmployee: (employee: CreatedEmployee) => void;
  reset: () => void;
};

const employeeStorageKey = "ai-workforce-created-accountant-v1";
const integrationsStorageKey = "ai-workforce-integrations-v1";

const WorkforceContext = createContext<WorkforceState | null>(null);

export function WorkforceProvider({ children }: { children: React.ReactNode }) {
  const [approved, setApproved] = useState(false);
  const [createdEmployee, setCreatedEmployee] = useState<CreatedEmployee | null>(null);
  const [integrations, setIntegrations] = useState<ConnectedIntegration[]>([]);

  useEffect(() => {
    try {
      const storedEmployee = window.localStorage.getItem(employeeStorageKey);
      if (!storedEmployee) return;
      const parsedEmployee = JSON.parse(storedEmployee) as CreatedEmployee;
      const restoreTimer = window.setTimeout(() => setCreatedEmployee(parsedEmployee), 0);
      return () => window.clearTimeout(restoreTimer);
    } catch {
      // The demo remains usable when browser storage is unavailable.
    }
  }, []);

  useEffect(() => {
    try {
      const storedIntegrations = window.localStorage.getItem(integrationsStorageKey);
      if (!storedIntegrations) return;
      const parsedIntegrations = JSON.parse(storedIntegrations) as ConnectedIntegration[];
      const restoreTimer = window.setTimeout(() => setIntegrations(parsedIntegrations), 0);
      return () => window.clearTimeout(restoreTimer);
    } catch {
      // The demo remains usable when browser storage is unavailable.
    }
  }, []);

  const approve = () => {
    setApproved(true);
  };

  const reset = () => {
    setApproved(false);
  };

  const hireEmployee = (employee: CreatedEmployee) => {
    setCreatedEmployee(employee);
    try {
      window.localStorage.setItem(employeeStorageKey, JSON.stringify(employee));
    } catch {
      // Keep the current-session state even when persistence is unavailable.
    }
  };

  const saveIntegrations = (nextIntegrations: ConnectedIntegration[]) => {
    setIntegrations(nextIntegrations);
    try {
      window.localStorage.setItem(integrationsStorageKey, JSON.stringify(nextIntegrations));
    } catch {
      // Keep the current-session state even when persistence is unavailable.
    }
  };

  const connectIntegration = (integration: ConnectedIntegration) => {
    saveIntegrations([...integrations.filter(item => item.id !== integration.id), integration]);
  };

  const disconnectIntegration = (id: IntegrationId) => {
    saveIntegrations(integrations.filter(item => item.id !== id));
  };

  return <WorkforceContext.Provider value={{ approved, createdEmployee, integrations, approve, connectIntegration, disconnectIntegration, hireEmployee, reset }}>{children}</WorkforceContext.Provider>;
}

export function useWorkforce() {
  const context = useContext(WorkforceContext);
  if (!context) throw new Error("useWorkforce must be used inside WorkforceProvider");
  return context;
}
