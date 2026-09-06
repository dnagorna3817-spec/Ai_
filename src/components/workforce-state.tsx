"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type AutonomyLevel = "assistant" | "controlled" | "autonomous";
export type EmployeeId = "accountant" | "sales-assistant";
export type DemoMode = "working" | "clean" | "manual";

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
  demoMode: DemoMode;
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
const monthlyApprovalStorageKey = "ai-workforce-monthly-approved-v1";
const demoInitializationStorageKey = "ai-workforce-demo-initialized-v1";
const demoVersionStorageKey = "ai-workforce-demo-version";
const currentDemoVersion = 2;

const demoTime = () => new Date().toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" });
const demoTimeAgo = (minutes: number) => new Date(Date.now() - minutes * 60_000).toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" });

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

const createDefaultEmployees = (): CreatedEmployee[] => [
  {
    id: "accountant",
    name: "AI-бухгалтер",
    role: "Фінанси та бухгалтерія",
    responsibilities: ["Звіряти банківські транзакції", "Контролювати рахунки та платежі", "Готувати закриття місяця", "Шукати фінансові невідповідності", "Готувати фінансові звіти"],
    autonomy: "controlled",
    approvalRules: ["Проведення або ініціювання платежів", "Податкові дії", "Незвичні або підозрілі транзакції", "Зміни фінансових даних", "Надсилання документів клієнтам"],
    approvalLimit: "10 000 ₴",
    createdAt: demoTimeAgo(3 * 24 * 60),
  },
  {
    id: "sales-assistant",
    name: "AI-асистент з продажів",
    role: "Продажі та клієнтська комунікація",
    responsibilities: ["Контролювати прострочені оплати", "Аналізувати CRM та історію клієнта", "Готувати follow-up повідомлення", "Перевіряти останні контакти з клієнтом", "Готувати короткі підсумки перед контактом із клієнтом"],
    autonomy: "controlled",
    approvalRules: ["Надсилання повідомлень клієнтам", "Зміна статусу угоди", "Знижки або спеціальні умови", "Надсилання комерційних матеріалів"],
    approvalLimit: "Не застосовується",
    createdAt: demoTimeAgo(2 * 24 * 60),
  },
];

const createDefaultIntegrations = (): ConnectedIntegration[] => {
  const connectedAt = demoTimeAgo(36);
  return [
    { id: "bank", employeeId: "accountant", status: "connected", provider: "Mono Business", connectedAt, metadata: ["2 рахунки", "846 транзакцій доступно", "Остання синхронізація: щойно"] },
    { id: "accounting", employeeId: "accountant", status: "connected", provider: "BAS Demo", connectedAt, metadata: ["1 компанія", "214 рахунків", "38 контрагентів"] },
    { id: "documents", employeeId: "accountant", status: "connected", provider: "Google Drive Demo", connectedAt, metadata: ["127 документів", "24 рахунки", "18 договорів"] },
    { id: "crm", employeeId: "sales-assistant", status: "connected", provider: "HubSpot Demo", connectedAt, metadata: ["89 клієнтів", "14 прострочених оплат"] },
    { id: "email", employeeId: "sales-assistant", status: "connected", provider: "Gmail Demo", connectedAt, metadata: ["436 повідомлень", "62 фінансові вкладення"] },
  ];
};

const createDefaultReconciliation = (): ReconciliationState => ({
  status: "completed",
  exceptionStatus: "approved",
  humanDecision: "approved",
  discoveredAt: demoTimeAgo(38),
  startedAt: demoTimeAgo(35),
  completedAt: demoTimeAgo(15),
  discoveredTasks: getDiscoveredTasks("Завершено"),
  activities: [
    { id: "monthly-close-progress", time: demoTimeAgo(31), text: "AI-бухгалтер продовжив закриття серпня", detail: "Перевіряє документи та фінансові записи", kind: "AI ACTION" },
    { id: "human-decision", time: demoTimeAgo(23), text: "Користувач погодив фінансову невідповідність", detail: "Критичне рішення прийнято людиною", kind: "HUMAN ACTION" },
    { id: "reconciliation-completed", time: demoTimeAgo(15), text: "AI-бухгалтер завершив звірку 12 транзакцій", detail: "11 автоматично · 1 рішення людини", kind: "AI ACTION" },
  ],
});

const createDefaultCollaboration = (): CollaborationState => ({
  status: "approval",
  approvalStatus: "pending",
  revisionReason: null,
  draftVersion: 1,
  startedAt: demoTimeAgo(12),
  completedAt: null,
  activities: [
    { id: "overdue-detected", time: demoTimeAgo(12), actor: "AI-бухгалтер", text: "Виявив прострочену оплату", detail: "ТОВ «Орбіта» · 48 000 ₴ · 12 днів", kind: "AI ACTION" },
    { id: "sales-handoff", time: demoTimeAgo(10), actor: "AI-бухгалтер → AI-асистент з продажів", text: "Передав контекст простроченої оплати", detail: "Подальша дія потребує роботи з клієнтом", kind: "HANDOFF" },
    { id: "sales-context-reviewed", time: demoTimeAgo(6), actor: "AI-асистент з продажів", text: "Перевірив CRM та історію комунікації", detail: "Клієнт активний · останній контакт 6 днів тому", kind: "AI ACTION" },
    { id: "sales-approval-request", time: demoTimeAgo(4), actor: "AI-асистент з продажів → Людина", text: "Підготував follow-up для ТОВ «Орбіта»", detail: "Зовнішня комунікація потребує погодження людини", kind: "HANDOFF" },
  ],
});

const createDefaultWorkspace = () => ({
  approved: true,
  mode: "working" as DemoMode,
  employees: createDefaultEmployees(),
  integrations: createDefaultIntegrations(),
  reconciliation: createDefaultReconciliation(),
  collaboration: createDefaultCollaboration(),
});

const persistDefaultWorkspace = (workspace: ReturnType<typeof createDefaultWorkspace>) => {
  window.localStorage.removeItem(legacyEmployeeStorageKey);
  window.localStorage.setItem(employeesStorageKey, JSON.stringify(workspace.employees));
  window.localStorage.setItem(integrationsStorageKey, JSON.stringify(workspace.integrations));
  window.localStorage.setItem(reconciliationStorageKey, JSON.stringify(workspace.reconciliation));
  window.localStorage.setItem(collaborationStorageKey, JSON.stringify(workspace.collaboration));
  window.localStorage.setItem(monthlyApprovalStorageKey, "true");
  window.localStorage.setItem(demoInitializationStorageKey, workspace.mode);
  window.localStorage.setItem(demoVersionStorageKey, String(currentDemoVersion));
};

const WorkforceContext = createContext<WorkforceState | null>(null);

export function WorkforceProvider({ children }: { children: React.ReactNode }) {
  const [approved, setApproved] = useState(false);
  const [demoMode, setDemoMode] = useState<DemoMode>("manual");
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
    const initialWorkspace = createDefaultWorkspace();
    let nextApproved = initialWorkspace.approved;
    let nextMode: DemoMode = initialWorkspace.mode;
    let nextEmployees = initialWorkspace.employees;
    let nextIntegrations = initialWorkspace.integrations;
    let nextReconciliation: ReconciliationState | null = initialWorkspace.reconciliation;
    let nextCollaboration: CollaborationState | null = initialWorkspace.collaboration;

    try {
      const storedDemoVersion = Number(window.localStorage.getItem(demoVersionStorageKey) || "0");
      const storedEmployees = window.localStorage.getItem(employeesStorageKey);
      const legacyEmployee = window.localStorage.getItem(legacyEmployeeStorageKey);
      const storedDemoMode = window.localStorage.getItem(demoInitializationStorageKey) as DemoMode | null;
      const storedIntegrations = window.localStorage.getItem(integrationsStorageKey);
      const storedReconciliation = window.localStorage.getItem(reconciliationStorageKey);
      const storedCollaboration = window.localStorage.getItem(collaborationStorageKey);
      const storedApproved = window.localStorage.getItem(monthlyApprovalStorageKey);

      if (storedDemoVersion < currentDemoVersion) {
        persistDefaultWorkspace(initialWorkspace);
      } else {
        let restoredEmployees: CreatedEmployee[] = storedEmployees ? JSON.parse(storedEmployees) : [];
        if (!restoredEmployees.length && legacyEmployee) {
          const legacy = JSON.parse(legacyEmployee) as Omit<CreatedEmployee, "id">;
          restoredEmployees = [{ ...legacy, id: "accountant" }];
          window.localStorage.setItem(employeesStorageKey, JSON.stringify(restoredEmployees));
        }
        const restoredIntegrations: ConnectedIntegration[] = storedIntegrations
          ? (JSON.parse(storedIntegrations) as Array<Omit<ConnectedIntegration, "employeeId"> & { employeeId?: EmployeeId }>).map((item) => ({ ...item, employeeId: item.employeeId || "accountant" }))
          : [];
        if (storedIntegrations) window.localStorage.setItem(integrationsStorageKey, JSON.stringify(restoredIntegrations));
        const restoredMode = storedDemoMode || "manual";
        if (!storedDemoMode) window.localStorage.setItem(demoInitializationStorageKey, restoredMode);
        nextApproved = storedApproved === "true";
        nextMode = restoredMode;
        nextEmployees = restoredEmployees;
        nextIntegrations = restoredIntegrations;
        nextReconciliation = storedReconciliation ? JSON.parse(storedReconciliation) : null;
        nextCollaboration = storedCollaboration ? JSON.parse(storedCollaboration) : null;
      }
    } catch {
      // The populated demo remains usable when browser storage is unavailable.
    }
    const timer = window.setTimeout(() => {
      setApproved(nextApproved);
      setDemoMode(nextMode);
      setEmployees(nextEmployees);
      setIntegrations(nextIntegrations);
      setReconciliation(nextReconciliation);
      setCollaboration(nextCollaboration);
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const markManualState = () => {
    if (demoMode !== "clean") return;
    setDemoMode("manual");
    try { window.localStorage.setItem(demoInitializationStorageKey, "manual"); } catch {}
  };

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
    markManualState();
    setEmployees(next);
    try { window.localStorage.setItem(employeesStorageKey, JSON.stringify(next)); } catch {}
  };

  const hireEmployee = (employee: CreatedEmployee) => {
    if (employees.some((item) => item.id === employee.id)) return false;
    saveEmployees([...employees, employee]);
    return true;
  };

  const saveIntegrations = (next: ConnectedIntegration[]) => {
    markManualState();
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
    const workspace = createDefaultWorkspace();
    setApproved(workspace.approved);
    setDemoMode(workspace.mode);
    setEmployees(workspace.employees);
    setIntegrations(workspace.integrations);
    setReconciliation(workspace.reconciliation);
    setCollaboration(workspace.collaboration);
    try {
      persistDefaultWorkspace(workspace);
    } catch {}
  };

  const approveMonthlyClose = () => {
    setApproved(true);
    try { window.localStorage.setItem(monthlyApprovalStorageKey, "true"); } catch {}
  };

  const resetMonthlyClose = () => {
    setApproved(false);
    try { window.localStorage.setItem(monthlyApprovalStorageKey, "false"); } catch {}
  };

  return <WorkforceContext.Provider value={{ approved, demoMode, employees, createdEmployee, integrations, reconciliation, collaboration, approve: approveMonthlyClose, connectIntegration, disconnectIntegration, hireEmployee, decideReconciliation, resetReconciliation, decideCollaboration, requestCollaborationRevision, resetDemo, reset: resetMonthlyClose }}>{children}</WorkforceContext.Provider>;
}

export function useWorkforce() {
  const context = useContext(WorkforceContext);
  if (!context) throw new Error("useWorkforce must be used inside WorkforceProvider");
  return context;
}
