"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type AutonomyLevel = "assistant" | "controlled" | "autonomous";
export type EmployeeId = "accountant" | "sales-assistant";

export type CreatedEmployee = {
  id: EmployeeId;
  name: string;
  role: string;
  responsibilities: string[];
  autonomy: AutonomyLevel;
  approvalRules: string[];
  approvalLimit: string;
  createdAt: string;
};

export type IntegrationId = "bank" | "accounting" | "documents" | "email" | "crm";

export type ConnectedIntegration = {
  id: IntegrationId;
  employeeId: EmployeeId;
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

export type CollaborationDecision = "approved" | "deferred";
export type CollaborationStatus = "working" | "approval" | "revision" | "resuming" | "completed";

export type CollaborationActivity = {
  id: string;
  time: string;
  actor: string;
  text: string;
  detail: string;
  kind: "AI ACTION" | "HUMAN ACTION" | "HANDOFF";
};

export type CollaborationState = {
  status: CollaborationStatus;
  approvalStatus: "pending" | CollaborationDecision;
  revisionReason: string | null;
  draftVersion: 1 | 2;
  startedAt: string;
  completedAt: string | null;
  activities: CollaborationActivity[];
};

type WorkforceState = {
  approved: boolean;
  employees: CreatedEmployee[];
  createdEmployee: CreatedEmployee | null;
  integrations: ConnectedIntegration[];
  reconciliation: ReconciliationState | null;
  collaboration: CollaborationState | null;
  approve: () => void;
  connectIntegration: (integration: ConnectedIntegration) => void;
  disconnectIntegration: (employeeId: EmployeeId, id: IntegrationId) => void;
  hireEmployee: (employee: CreatedEmployee) => boolean;
  decideReconciliation: (decision: ReconciliationDecision) => void;
  resetReconciliation: () => void;
  decideCollaboration: (decision: CollaborationDecision) => void;
  requestCollaborationRevision: (reason: string) => void;
  resetDemo: () => void;
  reset: () => void;
};

const legacyEmployeeStorageKey = "ai-workforce-created-accountant-v1";
const employeesStorageKey = "ai-workforce-employees-v2";
const integrationsStorageKey = "ai-workforce-integrations-v1";
const reconciliationStorageKey = "ai-workforce-reconciliation-v1";
const collaborationStorageKey = "ai-workforce-collaboration-v1";

const demoTime = () => new Date().toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" });

const getDiscoveredTasks = (primaryStatus: string): DiscoveredTask[] => [
  { id: "reconciliation", title: "Звірити банківські транзакції", detail: "12 транзакцій потребують звірки", source: "Банківські рахунки + Бухгалтерська система", priority: "Середній", status: primaryStatus },
  { id: "missing-documents", title: "Знайти відсутні підтвердні документи", detail: "3 транзакції не мають підтвердних документів", source: "Банківські рахунки + Документи", priority: "Низький", status: "Виявлено" },
  { id: "monthly-close", title: "Завершити закриття серпня", detail: "Місячне закриття виконано на 72%", source: "Бухгалтерська система + Банківські рахунки + Документи", priority: "Високий", status: "Потребує роботи" },
];

const createReconciliation = (): ReconciliationState => {
  const time = demoTime();
  return {
    status: "working", exceptionStatus: "pending", humanDecision: null, discoveredAt: time, startedAt: time, completedAt: null, discoveredTasks: getDiscoveredTasks("AI виконує"),
    activities: [
      { id: "work-detected", time, text: "AI-бухгалтер виявив 3 завдання у підключених системах", detail: "Автоматично · у межах призначених обов’язків", kind: "AI ACTION" },
      { id: "reconciliation-started", time, text: "AI-бухгалтер почав звірку 12 транзакцій", detail: "Автоматично · відповідно до призначених обов’язків", kind: "AI ACTION" },
    ],
  };
};

const createCollaboration = (): CollaborationState => {
  const time = demoTime();
  return {
    status: "working", approvalStatus: "pending", revisionReason: null, draftVersion: 1, startedAt: time, completedAt: null,
    activities: [
      { id: "overdue-detected", time, actor: "AI-бухгалтер", text: "Виявив прострочену оплату", detail: "ТОВ «Орбіта» · 48 000 ₴ · 12 днів", kind: "AI ACTION" },
      { id: "sales-handoff", time, actor: "AI-бухгалтер → AI-асистент з продажів", text: "Передав контекст клієнта та рахунку", detail: "Подальша дія потребує роботи з клієнтом, а не фінансової обробки", kind: "HANDOFF" },
    ],
  };
};

const WorkforceContext = createContext<WorkforceState | null>(null);

export function WorkforceProvider({ children }: { children: React.ReactNode }) {
  const [approved, setApproved] = useState(false);
  const [employees, setEmployees] = useState<CreatedEmployee[]>([]);
  const [integrations, setIntegrations] = useState<ConnectedIntegration[]>([]);
  const [reconciliation, setReconciliation] = useState<ReconciliationState | null>(null);
  const [collaboration, setCollaboration] = useState<CollaborationState | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const createdEmployee = employees.find((employee) => employee.id === "accountant") || null;
  const salesEmployee = employees.find((employee) => employee.id === "sales-assistant") || null;

  const persistReconciliation = (next: ReconciliationState | null) => {
    setReconciliation(next);
    try { if (next) window.localStorage.setItem(reconciliationStorageKey, JSON.stringify(next)); else window.localStorage.removeItem(reconciliationStorageKey); } catch {}
  };

  const persistCollaboration = (next: CollaborationState | null) => {
    setCollaboration(next);
    try { if (next) window.localStorage.setItem(collaborationStorageKey, JSON.stringify(next)); else window.localStorage.removeItem(collaborationStorageKey); } catch {}
  };

  useEffect(() => {
    try {
      const storedEmployees = window.localStorage.getItem(employeesStorageKey);
      const legacyEmployee = window.localStorage.getItem(legacyEmployeeStorageKey);
      let restoredEmployees: CreatedEmployee[] = storedEmployees ? JSON.parse(storedEmployees) : [];
      if (!restoredEmployees.length && legacyEmployee) {
        const legacy = JSON.parse(legacyEmployee) as Omit<CreatedEmployee, "id">;
        restoredEmployees = [{ ...legacy, id: "accountant" }];
        window.localStorage.setItem(employeesStorageKey, JSON.stringify(restoredEmployees));
      }
      const storedIntegrations = window.localStorage.getItem(integrationsStorageKey);
      const restoredIntegrations: ConnectedIntegration[] = storedIntegrations
        ? (JSON.parse(storedIntegrations) as Array<Omit<ConnectedIntegration, "employeeId"> & { employeeId?: EmployeeId }>).map((item) => ({ ...item, employeeId: item.employeeId || "accountant" }))
        : [];
      if (storedIntegrations) window.localStorage.setItem(integrationsStorageKey, JSON.stringify(restoredIntegrations));
      const storedReconciliation = window.localStorage.getItem(reconciliationStorageKey);
      const storedCollaboration = window.localStorage.getItem(collaborationStorageKey);
      // Browser storage is the external source of truth for this local-only demo.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEmployees(restoredEmployees);
      setIntegrations(restoredIntegrations);
      setReconciliation(storedReconciliation ? JSON.parse(storedReconciliation) : null);
      setCollaboration(storedCollaboration ? JSON.parse(storedCollaboration) : null);
    } catch {
      // The demo remains usable when browser storage is unavailable.
    }
    const timer = window.setTimeout(() => setHydrated(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const accountantIntegrations = integrations.filter((item) => item.employeeId === "accountant");
  const salesIntegrations = integrations.filter((item) => item.employeeId === "sales-assistant");
  const hasReconciliationSources = accountantIntegrations.some((item) => item.id === "bank") && accountantIntegrations.some((item) => item.id === "accounting");
  const hasSalesSources = salesIntegrations.some((item) => item.id === "crm") && salesIntegrations.some((item) => item.id === "email");

  useEffect(() => {
    if (!hydrated || !createdEmployee || !hasReconciliationSources || reconciliation) return;
    const timer = window.setTimeout(() => persistReconciliation(createReconciliation()), 350);
    return () => window.clearTimeout(timer);
  }, [hydrated, createdEmployee, hasReconciliationSources, reconciliation]);

  useEffect(() => {
    if (!reconciliation || reconciliation.status !== "working") return;
    const timer = window.setTimeout(() => {
      const time = demoTime();
      persistReconciliation({ ...reconciliation, status: "exception", exceptionStatus: "pending", discoveredTasks: getDiscoveredTasks("Очікує рішення"), activities: reconciliation.activities.some((item) => item.id === "exception-found") ? reconciliation.activities : [...reconciliation.activities, { id: "exception-found", time, text: "AI-бухгалтер виявив невідповідність у транзакції #TRX-2841", detail: "Різниця 2 000 ₴ · передано людині", kind: "AI ACTION" }] });
    }, 1100);
    return () => window.clearTimeout(timer);
  }, [reconciliation]);

  useEffect(() => {
    if (!reconciliation || reconciliation.status !== "resuming") return;
    const timer = window.setTimeout(() => {
      const time = demoTime();
      persistReconciliation({ ...reconciliation, status: "completed", completedAt: time, discoveredTasks: getDiscoveredTasks("Завершено"), activities: reconciliation.activities.some((item) => item.id === "reconciliation-completed") ? reconciliation.activities : [...reconciliation.activities, { id: "reconciliation-completed", time, text: "AI-бухгалтер завершив звірку транзакцій", detail: "11 автоматично · 1 рішення людини", kind: "AI ACTION" }] });
    }, 800);
    return () => window.clearTimeout(timer);
  }, [reconciliation]);

  useEffect(() => {
    if (!hydrated || !createdEmployee || !salesEmployee || !hasSalesSources || collaboration) return;
    const timer = window.setTimeout(() => persistCollaboration(createCollaboration()), 500);
    return () => window.clearTimeout(timer);
  }, [hydrated, createdEmployee, salesEmployee, hasSalesSources, collaboration]);

  useEffect(() => {
    if (!collaboration || collaboration.status !== "working") return;
    const timer = window.setTimeout(() => {
      const time = demoTime();
      persistCollaboration({ ...collaboration, status: "approval", approvalStatus: "pending", activities: [
        ...collaboration.activities,
        { id: "sales-context-reviewed", time, actor: "AI-асистент з продажів", text: "Перевірив CRM та історію контакту", detail: "Клієнт активний · останній контакт 6 днів тому", kind: "AI ACTION" },
        { id: "sales-approval-request", time, actor: "AI-асистент з продажів → Людина", text: "Передав підготовлене повідомлення на погодження", detail: "Зовнішня комунікація потребує рішення людини", kind: "HANDOFF" },
      ] });
    }, 900);
    return () => window.clearTimeout(timer);
  }, [collaboration]);

  useEffect(() => {
    if (!collaboration || collaboration.status !== "revision") return;
    const timer = window.setTimeout(() => {
      const time = demoTime();
      persistCollaboration({ ...collaboration, status: "approval", approvalStatus: "pending", draftVersion: 2, activities: [...collaboration.activities, { id: `sales-revised-${collaboration.revisionReason}`, time, actor: "AI-асистент з продажів", text: "Оновив повідомлення після зворотного зв’язку", detail: collaboration.revisionReason || "Текст доопрацьовано", kind: "AI ACTION" }] });
    }, 650);
    return () => window.clearTimeout(timer);
  }, [collaboration]);

  useEffect(() => {
    if (!collaboration || collaboration.status !== "resuming") return;
    const timer = window.setTimeout(() => {
      const time = demoTime();
      persistCollaboration({ ...collaboration, status: "completed", completedAt: time, activities: [...collaboration.activities, { id: "sales-follow-up-completed", time, actor: "AI-асистент з продажів", text: "Завершив демо follow-up", detail: "Демо-відправлення зафіксовано без зовнішнього надсилання", kind: "AI ACTION" }] });
    }, 750);
    return () => window.clearTimeout(timer);
  }, [collaboration]);

  const saveEmployees = (next: CreatedEmployee[]) => {
    setEmployees(next);
    try { window.localStorage.setItem(employeesStorageKey, JSON.stringify(next)); } catch {}
  };

  const hireEmployee = (employee: CreatedEmployee) => {
    if (employees.some((item) => item.id === employee.id)) return false;
    saveEmployees([...employees, employee]);
    return true;
  };

  const saveIntegrations = (next: ConnectedIntegration[]) => {
    setIntegrations(next);
    try { window.localStorage.setItem(integrationsStorageKey, JSON.stringify(next)); } catch {}
  };

  const connectIntegration = (integration: ConnectedIntegration) => saveIntegrations([...integrations.filter((item) => item.id !== integration.id || item.employeeId !== integration.employeeId), integration]);
  const disconnectIntegration = (employeeId: EmployeeId, id: IntegrationId) => saveIntegrations(integrations.filter((item) => item.id !== id || item.employeeId !== employeeId));

  const decideReconciliation = (decision: ReconciliationDecision) => {
    if (!reconciliation) return;
    const time = demoTime();
    if (decision === "deferred") { persistReconciliation({ ...reconciliation, exceptionStatus: "deferred", humanDecision: "deferred" }); return; }
    persistReconciliation({ ...reconciliation, status: "resuming", exceptionStatus: decision, humanDecision: decision, discoveredTasks: getDiscoveredTasks("AI завершує"), activities: [
      ...reconciliation.activities.filter((item) => item.id !== "human-decision" && item.id !== "reconciliation-resumed"),
      { id: "human-decision", time, text: decision === "approved" ? "Користувач погодив рекомендацію AI" : "Користувач підтвердив транзакцію як коректну", detail: "Критичне рішення прийнято людиною", kind: "HUMAN ACTION" },
      { id: "reconciliation-resumed", time, text: "Рішення отримано. AI-бухгалтер продовжив звірку.", detail: "Автоматичне виконання відновлено", kind: "AI ACTION" },
    ] });
  };

  const decideCollaboration = (decision: CollaborationDecision) => {
    if (!collaboration) return;
    if (decision === "deferred") { persistCollaboration({ ...collaboration, approvalStatus: "deferred" }); return; }
    const time = demoTime();
    persistCollaboration({ ...collaboration, status: "resuming", approvalStatus: "approved", activities: [...collaboration.activities.filter((item) => item.id !== "sales-human-approved"), { id: "sales-human-approved", time, actor: "Людина", text: "Погодила повідомлення", detail: "Дозвіл стосується лише цього демо follow-up", kind: "HUMAN ACTION" }] });
  };

  const requestCollaborationRevision = (reason: string) => {
    if (!collaboration) return;
    const time = demoTime();
    persistCollaboration({ ...collaboration, status: "revision", approvalStatus: "pending", revisionReason: reason, activities: [...collaboration.activities.filter((item) => !item.id.startsWith("sales-revision-request")), { id: `sales-revision-request-${reason}`, time, actor: "Людина", text: "Повернула повідомлення на доопрацювання", detail: reason, kind: "HUMAN ACTION" }] });
  };

  const resetReconciliation = () => { if (!hasReconciliationSources || !createdEmployee) persistReconciliation(null); else persistReconciliation(createReconciliation()); };

  const resetDemo = () => {
    setApproved(false); setEmployees([]); setIntegrations([]); setReconciliation(null); setCollaboration(null);
    try {
      window.localStorage.removeItem(legacyEmployeeStorageKey);
      window.localStorage.removeItem(employeesStorageKey);
      window.localStorage.removeItem(integrationsStorageKey);
      window.localStorage.removeItem(reconciliationStorageKey);
      window.localStorage.removeItem(collaborationStorageKey);
    } catch {}
  };

  return <WorkforceContext.Provider value={{ approved, employees, createdEmployee, integrations, reconciliation, collaboration, approve: () => setApproved(true), connectIntegration, disconnectIntegration, hireEmployee, decideReconciliation, resetReconciliation, decideCollaboration, requestCollaborationRevision, resetDemo, reset: () => setApproved(false) }}>{children}</WorkforceContext.Provider>;
}

export function useWorkforce() {
  const context = useContext(WorkforceContext);
  if (!context) throw new Error("useWorkforce must be used inside WorkforceProvider");
  return context;
}
