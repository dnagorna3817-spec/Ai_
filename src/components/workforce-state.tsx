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

export type ReconciliationDecision = "approved" | "accepted" | "deferred";
export type ReconciliationStatus = "working" | "exception" | "resuming" | "completed";

export type ReconciliationActivity = {
  id: string;
  time: string;
  text: string;
  detail: string;
  kind: "AI ACTION" | "HUMAN ACTION";
};

export type DiscoveredTask = {
  id: "reconciliation" | "missing-documents" | "monthly-close";
  title: string;
  detail: string;
  source: string;
  priority: "Низький" | "Середній" | "Високий";
  status: string;
};

export type ReconciliationState = {
  status: ReconciliationStatus;
  exceptionStatus: "pending" | ReconciliationDecision;
  humanDecision: ReconciliationDecision | null;
  discoveredAt: string;
  startedAt: string;
  completedAt: string | null;
  discoveredTasks: DiscoveredTask[];
  activities: ReconciliationActivity[];
};

type WorkforceState = {
  approved: boolean;
  createdEmployee: CreatedEmployee | null;
  integrations: ConnectedIntegration[];
  reconciliation: ReconciliationState | null;
  approve: () => void;
  connectIntegration: (integration: ConnectedIntegration) => void;
  disconnectIntegration: (id: IntegrationId) => void;
  hireEmployee: (employee: CreatedEmployee) => void;
  decideReconciliation: (decision: ReconciliationDecision) => void;
  resetReconciliation: () => void;
  resetDemo: () => void;
  reset: () => void;
};

const employeeStorageKey = "ai-workforce-created-accountant-v1";
const integrationsStorageKey = "ai-workforce-integrations-v1";
const reconciliationStorageKey = "ai-workforce-reconciliation-v1";

const demoTime = () =>
  new Date().toLocaleTimeString("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
  });

const getDiscoveredTasks = (primaryStatus: string): DiscoveredTask[] => [
  {
    id: "reconciliation",
    title: "Звірити банківські транзакції",
    detail: "12 транзакцій потребують звірки",
    source: "Банківські рахунки + Бухгалтерська система",
    priority: "Середній",
    status: primaryStatus,
  },
  {
    id: "missing-documents",
    title: "Знайти відсутні підтвердні документи",
    detail: "3 транзакції не мають підтвердних документів",
    source: "Банківські рахунки + Документи",
    priority: "Низький",
    status: "Виявлено",
  },
  {
    id: "monthly-close",
    title: "Завершити закриття серпня",
    detail: "Місячне закриття виконано на 72%",
    source: "Бухгалтерська система + Банківські рахунки + Документи",
    priority: "Високий",
    status: "Потребує роботи",
  },
];

const createReconciliation = (): ReconciliationState => {
  const time = demoTime();
  return {
    status: "working",
    exceptionStatus: "pending",
    humanDecision: null,
    discoveredAt: time,
    startedAt: time,
    completedAt: null,
    discoveredTasks: getDiscoveredTasks("AI виконує"),
    activities: [
      {
        id: "work-detected",
        time,
        text: "AI-бухгалтер виявив 3 завдання у підключених системах",
        detail: "Автоматично · у межах призначених обов’язків",
        kind: "AI ACTION",
      },
      {
        id: "reconciliation-started",
        time,
        text: "AI-бухгалтер почав звірку 12 транзакцій",
        detail: "Автоматично · відповідно до призначених обов’язків",
        kind: "AI ACTION",
      },
    ],
  };
};

const WorkforceContext = createContext<WorkforceState | null>(null);

export function WorkforceProvider({ children }: { children: React.ReactNode }) {
  const [approved, setApproved] = useState(false);
  const [createdEmployee, setCreatedEmployee] = useState<CreatedEmployee | null>(null);
  const [integrations, setIntegrations] = useState<ConnectedIntegration[]>([]);
  const [reconciliation, setReconciliation] = useState<ReconciliationState | null>(null);
  const [reconciliationHydrated, setReconciliationHydrated] = useState(false);

  const persistReconciliation = (next: ReconciliationState | null) => {
    setReconciliation(next);
    try {
      if (next) window.localStorage.setItem(reconciliationStorageKey, JSON.stringify(next));
      else window.localStorage.removeItem(reconciliationStorageKey);
    } catch {
      // Keep the current-session state even when persistence is unavailable.
    }
  };

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
      const storedReconciliation = window.localStorage.getItem(reconciliationStorageKey);
      const parsed = storedReconciliation ? (JSON.parse(storedReconciliation) as ReconciliationState) : null;
      const restoreTimer = window.setTimeout(() => {
        setReconciliation(parsed);
        setReconciliationHydrated(true);
      }, 0);
      return () => window.clearTimeout(restoreTimer);
    } catch {
      const restoreTimer = window.setTimeout(() => setReconciliationHydrated(true), 0);
      return () => window.clearTimeout(restoreTimer);
    }
  }, []);

  const hasReconciliationSources = integrations.some((item) => item.id === "bank") && integrations.some((item) => item.id === "accounting");

  useEffect(() => {
    if (!reconciliationHydrated || !createdEmployee || !hasReconciliationSources || reconciliation) return;
    const discoveryTimer = window.setTimeout(() => persistReconciliation(createReconciliation()), 350);
    return () => window.clearTimeout(discoveryTimer);
  }, [createdEmployee, hasReconciliationSources, reconciliation, reconciliationHydrated]);

  useEffect(() => {
    if (!reconciliation || reconciliation.status !== "working") return;
    const exceptionTimer = window.setTimeout(() => {
      const time = demoTime();
      persistReconciliation({
        ...reconciliation,
        status: "exception",
        exceptionStatus: "pending",
        discoveredTasks: getDiscoveredTasks("Очікує рішення"),
        activities: reconciliation.activities.some((item) => item.id === "exception-found")
          ? reconciliation.activities
          : [
              ...reconciliation.activities,
              {
                id: "exception-found",
                time,
                text: "AI-бухгалтер виявив невідповідність у транзакції #TRX-2841",
                detail: "Різниця 2 000 ₴ · передано людині",
                kind: "AI ACTION",
              },
            ],
      });
    }, 1100);
    return () => window.clearTimeout(exceptionTimer);
  }, [reconciliation]);

  useEffect(() => {
    if (!reconciliation || reconciliation.status !== "resuming") return;
    const completionTimer = window.setTimeout(() => {
      const time = demoTime();
      persistReconciliation({
        ...reconciliation,
        status: "completed",
        completedAt: time,
        discoveredTasks: getDiscoveredTasks("Завершено"),
        activities: reconciliation.activities.some((item) => item.id === "reconciliation-completed")
          ? reconciliation.activities
          : [
              ...reconciliation.activities,
              {
                id: "reconciliation-completed",
                time,
                text: "AI-бухгалтер завершив звірку транзакцій",
                detail: "11 автоматично · 1 рішення людини",
                kind: "AI ACTION",
              },
            ],
      });
    }, 800);
    return () => window.clearTimeout(completionTimer);
  }, [reconciliation]);

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
    saveIntegrations([...integrations.filter((item) => item.id !== integration.id), integration]);
  };

  const disconnectIntegration = (id: IntegrationId) => {
    saveIntegrations(integrations.filter((item) => item.id !== id));
  };

  const decideReconciliation = (decision: ReconciliationDecision) => {
    if (!reconciliation) return;
    const time = demoTime();
    if (decision === "deferred") {
      persistReconciliation({
        ...reconciliation,
        exceptionStatus: "deferred",
        humanDecision: "deferred",
      });
      return;
    }
    persistReconciliation({
      ...reconciliation,
      status: "resuming",
      exceptionStatus: decision,
      humanDecision: decision,
      discoveredTasks: getDiscoveredTasks("AI завершує"),
      activities: [
        ...reconciliation.activities.filter((item) => item.id !== "human-decision" && item.id !== "reconciliation-resumed"),
        {
          id: "human-decision",
          time,
          text: decision === "approved" ? "Користувач погодив рекомендацію AI" : "Користувач підтвердив транзакцію як коректну",
          detail: "Критичне рішення прийнято людиною",
          kind: "HUMAN ACTION",
        },
        {
          id: "reconciliation-resumed",
          time,
          text: "Рішення отримано. AI-бухгалтер продовжив звірку.",
          detail: "Автоматичне виконання відновлено",
          kind: "AI ACTION",
        },
      ],
    });
  };

  const resetReconciliation = () => {
    if (!hasReconciliationSources || !createdEmployee) {
      persistReconciliation(null);
      return;
    }
    persistReconciliation(createReconciliation());
  };

  const resetDemo = () => {
    setApproved(false);
    setCreatedEmployee(null);
    setIntegrations([]);
    setReconciliation(null);
    try {
      window.localStorage.removeItem(employeeStorageKey);
      window.localStorage.removeItem(integrationsStorageKey);
      window.localStorage.removeItem(reconciliationStorageKey);
    } catch {
      // The in-memory demo state is still reset when browser storage is unavailable.
    }
  };

  return (
    <WorkforceContext.Provider
      value={{
        approved,
        createdEmployee,
        integrations,
        reconciliation,
        approve,
        connectIntegration,
        disconnectIntegration,
        hireEmployee,
        decideReconciliation,
        resetReconciliation,
        resetDemo,
        reset,
      }}
    >
      {children}
    </WorkforceContext.Provider>
  );
}

export function useWorkforce() {
  const context = useContext(WorkforceContext);
  if (!context) throw new Error("useWorkforce must be used inside WorkforceProvider");
  return context;
}
