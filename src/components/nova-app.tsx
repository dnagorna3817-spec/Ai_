"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Activity, ArrowDown, ArrowLeft, ArrowRight, Check, CheckCircle2, BookOpen, Building2, ChevronDown, CircleGauge, Database, FileCheck2, Files, Landmark, LayoutGrid, ListChecks, LockKeyhole, Mail, Plus, RefreshCcw, Search, ShieldCheck, Unplug, Users, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { type AutonomyLevel, type CollaborationState, type ConnectedIntegration, type CreatedEmployee, type DemoMode, type EmployeeId, type IntegrationId, type ReconciliationDecision, type ReconciliationState, useWorkforce } from "./workforce-state";

const workers = [
  {
    key: "accountant",
    name: "AI-бухгалтер",
    role: "Фінанси та бухгалтерія",
    color: "blue",
    status: "ПРАЦЮЄ",
    objective: "Підготувати закриття серпня",
    progress: 68,
    action: "Проаналізовано 48 транзакцій",
    tasks: 7,
  },
  {
    key: "sales-assistant",
    name: "AI-асистент з продажів",
    role: "Продажі та клієнтська комунікація",
    color: "green",
    status: "АКТИВНИЙ",
    objective: "Працювати з простроченими оплатами",
    progress: 72,
    action: "Готовий приймати завдання від команди",
    tasks: 4,
  },
  {
    key: "analyst",
    name: "AI-фінансовий аналітик",
    role: "Фінансова аналітика · Скоро",
    color: "teal",
    status: "СКОРО",
    objective: "Аналізувати показники та прогнози",
    progress: 0,
    action: "Роль готується до запуску",
    tasks: 9,
  },
  {
    key: "operations",
    name: "AI-операційний менеджер",
    role: "Операційні процеси · Скоро",
    color: "indigo",
    status: "СКОРО",
    objective: "Контролювати процеси та дедлайни",
    progress: 0,
    action: "Роль готується до запуску",
    tasks: 5,
  },
];

const nav = [
  ["/office", "AI-офіс", LayoutGrid],
  ["/workforce", "Команда", Users],
  ["/tasks/monthly-close", "Завдання", ListChecks],
  ["/approvals/monthly-close", "Погодження", CheckCircle2],
] as const;

type RoleConfig = {
  id: EmployeeId;
  name: string;
  dativeName: string;
  genitiveName: string;
  role: string;
  color: string;
  description: string;
  capabilities: string[];
  responsibilities: string[];
  defaultResponsibilities: number;
  approvalOptions: string[];
  defaultApprovals: number;
  integrationIds: IntegrationId[];
};

const roleConfigs: Record<EmployeeId, RoleConfig> = {
  accountant: {
    id: "accountant", name: "AI-бухгалтер", dativeName: "AI-бухгалтеру", genitiveName: "AI-бухгалтера", role: "Фінанси та бухгалтерія", color: "blue",
    description: "Контролює фінансові операції, звіряє транзакції, готує закриття місяця та передає критичні рішення людині.",
    capabilities: ["Звірка транзакцій", "Закриття місяця", "Контроль рахунків", "Фінансові звіти"],
    responsibilities: ["Звіряти банківські транзакції", "Контролювати рахунки та платежі", "Готувати закриття місяця", "Шукати фінансові невідповідності", "Готувати фінансові звіти", "Контролювати прострочені оплати клієнтів", "Перевіряти наявність необхідних документів"],
    defaultResponsibilities: 5,
    approvalOptions: ["Проведення або ініціювання платежів", "Податкові дії", "Незвичні або підозрілі транзакції", "Надсилання документів клієнтам", "Зміни фінансових даних", "Операції понад встановлений ліміт"],
    defaultApprovals: 4,
    integrationIds: ["bank", "accounting", "documents", "email", "crm"],
  },
  "sales-assistant": {
    id: "sales-assistant", name: "AI-асистент з продажів", dativeName: "AI-асистенту з продажів", genitiveName: "AI-асистента з продажів", role: "Продажі та клієнтська комунікація", color: "green",
    description: "Працює з CRM, простроченими оплатами, follow-up та підготовкою комунікації з клієнтами.",
    capabilities: ["Робота з CRM", "Follow-up клієнтів", "Прострочені оплати", "Підготовка повідомлень"],
    responsibilities: ["Контролювати прострочені оплати", "Аналізувати CRM та історію клієнта", "Готувати follow-up повідомлення", "Нагадувати про неоплачені рахунки", "Готувати короткі підсумки перед контактом із клієнтом", "Оновлювати статус взаємодії", "Перевіряти останні контакти з клієнтом"],
    defaultResponsibilities: 5,
    approvalOptions: ["Надсилання повідомлень клієнтам", "Зміна статусу угоди", "Надсилання комерційних матеріалів", "Знижки або спеціальні умови"],
    defaultApprovals: 4,
    integrationIds: ["crm", "email", "documents"],
  },
};

const autonomyLabels: Record<AutonomyLevel, string> = {
  assistant: "Асистент",
  controlled: "Контрольований",
  autonomous: "Автономний",
};

function ukPlural(count: number, one: string, few: string, many: string) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

type IntegrationDefinition = {
  id: IntegrationId | "tax";
  name: string;
  description: string;
  capabilities: string[];
  access: string;
  providers: string[];
  metadata: string[];
  eventText: string;
  icon: typeof Landmark;
  comingSoon?: boolean;
};

const integrationCatalog: IntegrationDefinition[] = [
  {
    id: "bank",
    name: "Банківські рахунки",
    description: "Доступ до транзакцій для звірки платежів, пошуку невідповідностей та контролю руху коштів.",
    capabilities: ["транзакції", "баланс", "платежі", "звірка"],
    access: "Тільки перегляд + аналіз",
    providers: ["Mono Business", "PrivatBank Business", "Інший банк"],
    metadata: ["2 рахунки", "846 транзакцій доступно", "Остання синхронізація: щойно"],
    eventText: "AI-бухгалтер отримав доступ до банківських даних",
    icon: Landmark,
  },
  {
    id: "accounting",
    name: "Бухгалтерська система",
    description: "Рахунки, проводки, контрагенти та фінансові записи для щоденних бухгалтерських завдань.",
    capabilities: ["рахунки", "проводки", "контрагенти", "закриття місяця"],
    access: "Аналіз + підготовка змін",
    providers: ["BAS Demo", "QuickBooks Demo", "Інша система"],
    metadata: ["1 компанія", "214 рахунків", "38 контрагентів"],
    eventText: "Підключено джерело: Бухгалтерська система",
    icon: BookOpen,
  },
  {
    id: "documents",
    name: "Документи",
    description: "Рахунки, акти, договори та інші фінансові документи, які AI може перевіряти під час роботи.",
    capabilities: ["рахунки", "акти", "договори", "підтвердні документи"],
    access: "Перегляд + аналіз",
    providers: ["Google Drive Demo", "Dropbox Demo", "Локальне сховище"],
    metadata: ["127 документів", "24 рахунки", "18 договорів"],
    eventText: "Підключено джерело: Документи",
    icon: Files,
  },
  {
    id: "email",
    name: "Email",
    description: "Вхідні фінансові повідомлення, рахунки та листування з клієнтами й постачальниками.",
    capabilities: ["вхідні листи", "вкладення", "рахунки", "повідомлення"],
    access: "Перегляд + підготовка відповіді",
    providers: ["Gmail Demo", "Outlook Demo", "Інша пошта"],
    metadata: ["436 повідомлень", "62 фінансові вкладення"],
    eventText: "Підключено джерело: Email",
    icon: Mail,
  },
  {
    id: "crm",
    name: "CRM",
    description: "Дані про клієнтів, угоди та прострочені оплати для фінансового контролю.",
    capabilities: ["клієнти", "угоди", "рахунки", "прострочені оплати"],
    access: "Перегляд + аналіз",
    providers: ["HubSpot Demo", "Pipedrive Demo", "Інша CRM"],
    metadata: ["89 клієнтів", "14 прострочених оплат"],
    eventText: "Підключено джерело: CRM",
    icon: Database,
  },
  {
    id: "tax",
    name: "Податкова звітність",
    description: "Дані, необхідні для підготовки та перевірки податкових завдань.",
    capabilities: ["декларації", "зобов’язання", "строки", "перевірка"],
    access: "Недоступно",
    providers: [],
    metadata: [],
    eventText: "",
    icon: Building2,
    comingSoon: true,
  },
];

function Identity({ color = "blue", size = "md" }: { color?: string; size?: "sm" | "md" | "lg" }) {
  return (
    <div className={`identity identity-${color} identity-${size}`} aria-hidden="true">
      <i />
      <i />
      <i />
    </div>
  );
}

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="logo" aria-label="AI-команда">
      <span className="nova-mark">
        <i />
        <i />
      </span>
      {compact && null}
    </div>
  );
}

function Status({ children, tone = "live" }: { children: React.ReactNode; tone?: "live" | "waiting" | "quiet" }) {
  return (
    <span className={`status status-${tone}`}>
      <i />
      {children}
    </span>
  );
}

function DemoResetDialog({ onClose, onReset }: { onClose: () => void; onReset: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    const focusable = () => Array.from(panel?.querySelectorAll<HTMLElement>("button:not(:disabled)") || []);
    focusable()[0]?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusable();
      if (!items.length) return;
      if (event.shiftKey && document.activeElement === items[0]) {
        event.preventDefault();
        items.at(-1)?.focus();
      } else if (!event.shiftKey && document.activeElement === items.at(-1)) {
        event.preventDefault();
        items[0].focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [onClose]);
  return (
    <div className="integration-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="integration-dialog reset-dialog" ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="reset-dialog-title">
        <button className="dialog-close" onClick={onClose} aria-label="Закрити">
          <X size={18} />
        </button>
        <span className="dialog-icon">
          <RefreshCcw size={19} />
        </span>
        <p className="eyebrow">КЕРУВАННЯ ДЕМО</p>
        <h2 id="reset-dialog-title">Скинути демо-дані?</h2>
        <p className="dialog-lede">AI-працівники, підключення та історія демо-сценарію будуть очищені.</p>
        <footer>
          <button className="secondary" onClick={onClose}>
            Скасувати
          </button>
          <button className="primary disconnect-action" onClick={onReset}>
            Скинути
          </button>
        </footer>
      </div>
    </div>
  );
}

function Sidebar({ path }: { path: string }) {
  const router = useRouter();
  const { approved, createdEmployee, reconciliation, collaboration, resetDemo } = useWorkforce();
  const [resetOpen, setResetOpen] = useState(false);
  const reconciliationWaiting = reconciliation?.status === "exception" ? 1 : 0;
  const approvalCount = createdEmployee ? (approved ? 0 : 1) + reconciliationWaiting + (collaboration?.status === "approval" ? 1 : 0) : 0;
  return (
    <aside className="sidebar">
      <button className="brand-button" aria-label="Перейти до огляду" onClick={() => router.push("/office")}>
        <Logo compact />
      </button>
      <nav>
        {nav.map(([href, label, Icon], index) => (
          <button key={`${label}-${index}`} className={path === href || (href.startsWith("/approvals") && path.startsWith("/approvals")) || (href.startsWith("/tasks") && path.startsWith("/tasks")) ? "active" : ""} onClick={() => router.push(href)}>
            <Icon size={17} />
            <span>{label}</span>
            {href.startsWith("/approvals") && approvalCount > 0 && <em>{approvalCount}</em>}
          </button>
        ))}
      </nav>
      <button className="demo-reset-button" onClick={() => setResetOpen(true)}>
        <RefreshCcw size={14} />
        <span>Скинути демо</span>
      </button>
      <div className="profile">
        <span>К</span>
        <div>
          <b>Користувач</b>
          <small>Адміністратор</small>
        </div>
      </div>
      {resetOpen && (
        <DemoResetDialog
          onClose={() => setResetOpen(false)}
          onReset={() => {
            resetDemo();
            setResetOpen(false);
            router.push("/office");
          }}
        />
      )}
    </aside>
  );
}

function Shell({ path, children }: { path: string; children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <Sidebar path={path} />
      <main className="app-main">
        <AnimatePresence mode="wait">
          <motion.div key={path} initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.24 }}>
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function OfficeGreeting() {
  const [clock, setClock] = useState<{ date: string; greeting: string } | null>(null);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hour = now.getHours();
      const greeting = hour >= 5 && hour < 12 ? "Доброго ранку" : hour < 18 ? "Добрий день" : "Добрий вечір";
      const date = now
        .toLocaleDateString("uk-UA", { weekday: "long", day: "numeric", month: "long" })
        .toLocaleUpperCase("uk-UA");
      setClock({ date, greeting });
    };
    const initialTimer = window.setTimeout(updateClock, 0);
    const refreshTimer = window.setInterval(updateClock, 60_000);
    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(refreshTimer);
    };
  }, []);

  return (
    <>
      <p className="eyebrow">{clock?.date ?? "СЬОГОДНІ"}</p>
      <h1>{clock ? `${clock.greeting}, Користувачу.` : "Вітаємо, Користувачу."}</h1>
    </>
  );
}

function Intro() {
  const router = useRouter();
  return (
    <main className="intro">
      <header>
        <Logo />
        <span className="intro-note">Новий підхід до роботи</span>
      </header>
      <section className="intro-copy">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="eyebrow">AI-ПРАЦІВНИКИ ДЛЯ ОПЕРАЦІЙНОЇ РОБОТИ</p>
          <h1>AI-працівники, які виконують роботу, а не просто відповідають на запитання.</h1>
          <p className="lede">Додавайте AI-працівників до команди, підключайте робочі системи та визначайте, що вони виконують самостійно, а що потребує вашого рішення.</p>
          <button className="primary large" onClick={() => router.push("/office")}>
            Відкрити AI-офіс <ArrowRight size={18} />
          </button>
        </motion.div>
      </section>
      <motion.section className="constellation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25, duration: 0.7 }}>
        <svg viewBox="0 0 760 370" preserveAspectRatio="none" aria-hidden="true">
          <path d="M120 175 C250 45 360 88 385 180 S565 325 650 190" />
          <path d="M120 175 C245 285 350 288 385 180 S545 70 650 190" />
        </svg>
        {workers.map((w, i) => (
          <motion.div className={`constellation-worker cw-${i + 1}`} key={w.key} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.35 + i * 0.09 }}>
            <Identity color={w.color} />
            <div>
              <b>{w.name}</b>
              <small>{w.role}</small>
            </div>
          </motion.div>
        ))}
        <div className="constellation-core">
          <span>ОДНА ЦІЛЬ</span>
          <b>
            Спільний
            <br />
            контекст
          </b>
        </div>
      </motion.section>
      <footer>
        <span>Дві активні ролі.</span>
        <span>Одна злагоджена команда.</span>
        <span>Ви зберігаєте контроль.</span>
      </footer>
    </main>
  );
}

function TeamCell({ worker }: { worker: { key: string; name: string; role: string; color: string; status: string; objective: string; progress: number; action: string; href?: string; cta?: string } }) {
  const router = useRouter();
  const showProgress = worker.key !== "client";
  return (
    <motion.article className="team-cell" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32 }}>
      <div className="team-cell-top">
        <Identity color={worker.color} />
        <Status tone={worker.status.includes("ОЧІКУЄ") ? "waiting" : "live"}>{worker.status}</Status>
      </div>
      <h3>{worker.name}</h3>
      <p className="team-objective">{worker.objective}</p>
      {showProgress && (
        <div className="team-progress">
          <div className="progress">
            <motion.i initial={{ width: 0 }} animate={{ width: `${worker.progress}%` }} transition={{ duration: 0.8, ease: "easeOut" }} />
          </div>
          <b>{worker.progress}%</b>
        </div>
      )}
      <p className="team-action">
        <span>ОСТАННЯ ДІЯ</span>
        {worker.action}
      </p>
      {worker.href && <button className="text-button" onClick={() => router.push(worker.href!)}>{worker.cta || "Переглянути"} <ArrowRight size={14} /></button>}
    </motion.article>
  );
}

function getExecutiveMetrics(employees: CreatedEmployee[], integrations: ConnectedIntegration[], reconciliation: ReconciliationState | null, collaboration: CollaborationState | null, demoMode: DemoMode) {
  const hasDecision = reconciliation?.humanDecision === "approved" || reconciliation?.humanDecision === "accepted";
  const populatedDemo = demoMode === "working";
  return {
    activeEmployees: employees.length,
    completedTasks: (populatedDemo ? 3 : 0) + (reconciliation?.status === "completed" ? 1 : 0) + (collaboration?.status === "completed" ? 1 : 0),
    automatedActions: (populatedDemo ? 4 : 0) + (reconciliation ? 11 : 0) + (collaboration ? 3 : 0) + (collaboration?.status === "completed" ? 1 : 0),
    humanDecisions: (hasDecision ? 1 : 0) + (collaboration?.approvalStatus === "approved" ? 1 : 0),
    pendingDecisions: (reconciliation?.status === "exception" ? 1 : 0) + (collaboration?.status === "approval" ? 1 : 0),
    connectedSystems: integrations.length,
    estimatedMinutesSaved: populatedDemo && reconciliation?.status === "completed" ? 47 : reconciliation?.status === "completed" ? 23 : 0,
  };
}

function ExecutiveOverview() {
  const router = useRouter();
  const { approved, demoMode, employees, createdEmployee, integrations, reconciliation, collaboration } = useWorkforce();
  const metrics = getExecutiveMetrics(employees, integrations, reconciliation, collaboration, demoMode);
  const accountantIntegrations = integrations.filter((item) => item.employeeId === "accountant");
  const salesIntegrations = integrations.filter((item) => item.employeeId === "sales-assistant");
  const hasBank = accountantIntegrations.some((item) => item.id === "bank");
  const hasAccounting = accountantIntegrations.some((item) => item.id === "accounting");
  const hasCrm = integrations.some((item) => item.employeeId === "sales-assistant" && item.id === "crm");
  const hasSales = employees.some((item) => item.id === "sales-assistant");
  const hasSalesSources = salesIntegrations.some((item) => item.id === "crm") && salesIntegrations.some((item) => item.id === "email");
  const hasRequiredSources = createdEmployee ? hasBank && hasAccounting : hasSalesSources;
  const completed = reconciliation?.status === "completed";
  const pendingException = reconciliation?.status === "exception";
  const pendingCollaboration = collaboration?.status === "approval";
  const resolvedDecision = reconciliation?.humanDecision === "approved" || reconciliation?.humanDecision === "accepted";
  const executiveSummary = !employees.length ? "Додайте першого AI-працівника, щоб делегувати регулярну операційну роботу." : demoMode === "working" && collaboration?.status === "approval" ? "AI-бухгалтер і AI-асистент з продажів виконують поточні завдання та передають вам лише дії, що потребують рішення людини." : !createdEmployee ? "AI-асистент з продажів налаштований для роботи з клієнтськими задачами та контрольованою зовнішньою комунікацією." : collaboration?.status === "completed" ? "AI-бухгалтер виявив прострочену оплату та передав роботу AI-асистенту з продажів. AI-асистент перевірив CRM, підготував follow-up і передав людині лише зовнішню комунікацію на погодження." : collaboration ? "AI-бухгалтер передав фінансовий контекст AI-асистенту з продажів. Спеціалізовані працівники разом готують follow-up клієнту." : !hasRequiredSources ? "AI-бухгалтер налаштований, але ще не має всіх робочих джерел даних." : completed ? "AI-бухгалтер самостійно перевірив 12 транзакцій, автоматично звірив 11 і передав одну невідповідність вам на рішення." : "AI-бухгалтер самостійно виконує фінансові завдання та передає вам лише рішення, які потребують людського контролю.";

  if (!employees.length)
    return (
      <section className="executive-overview executive-onboarding" aria-labelledby="executive-title">
        <div>
          <p className="eyebrow">ВАШ AI-ОФІС</p>
          <h2 id="executive-title">У вашій AI-команді ще немає працівників</h2>
          <p>Додайте першого AI-працівника, визначте його обов’язки та межі автономності.</p>
          <div className="onboarding-sequence" aria-label="Налаштування AI-працівника: роль, доступ до систем, автономна робота">
            <span>
              <b>01</b> Роль і обов’язки
            </span>
            <i />
            <span>
              <b>02</b> Робочі системи
            </span>
            <i />
            <span>
              <b>03</b> Автономна робота
            </span>
          </div>
        </div>
        <button className="primary" onClick={() => router.push("/workforce/new")}>
          Найняти AI-працівника <ArrowRight size={15} />
        </button>
      </section>
    );
  const autonomousActions = reconciliation
    ? [
        ["Перевірив 12 банківських транзакцій", "БАНК · АВТОМАТИЧНО"],
        ["Зіставив їх із бухгалтерськими записами", "БУХГАЛТЕРІЯ · АВТОМАТИЧНО"],
        ["Автоматично звірив 11 операцій", "БАНК + БУХГАЛТЕРІЯ"],
        ["Перевірив доступні документи", integrations.some((item) => item.employeeId === "accountant" && item.id === "documents") ? "ДОКУМЕНТИ · АВТОМАТИЧНО" : "ДОСТУПНІ ДАНІ"],
        ["Виявив 1 фінансову невідповідність", "ПЕРЕДАНО ЛЮДИНІ"],
      ]
    : [];
  const totalPending = (createdEmployee && !approved ? 1 : 0) + (pendingException ? 1 : 0) + (pendingCollaboration ? 1 : 0);

  return (
    <section className="executive-overview" aria-labelledby="executive-title">
      <header className="executive-lead">
        <div>
          <p className="eyebrow">ОГЛЯД РОБОТИ</p>
          <h2 id="executive-title">AI-команда сьогодні</h2>
          <p>{executiveSummary}</p>
        </div>
        {collaboration?.status === "approval" ? (
          <button className="primary" onClick={() => router.push("/approvals/payment-follow-up")}>Погодити follow-up <ArrowRight size={15} /></button>
        ) : collaboration ? (
          <button className="secondary" onClick={() => router.push("/tasks/payment-follow-up")}>{collaboration.status === "completed" ? "Переглянути спільний результат" : "Відкрити спільне завдання"} <ArrowRight size={15} /></button>
        ) : !hasRequiredSources ? (
          <button className="primary" onClick={() => router.push(createdEmployee ? "/workforce/accountant#connections" : "/workforce/sales-assistant#connections")}>
            Підключити системи <ArrowRight size={15} />
          </button>
        ) : reconciliation ? (
          <button className="secondary" onClick={() => router.push("/tasks/reconciliation")}>
            {completed ? "Переглянути результат" : "Відкрити поточне завдання"} <ArrowRight size={15} />
          </button>
        ) : null}
      </header>
      <div className="executive-metrics" aria-label="Ключові показники AI-команди">
        <article>
          <span>АКТИВНІ AI-ПРАЦІВНИКИ</span>
          <b>{metrics.activeEmployees}</b>
          <small>{metrics.activeEmployees === 1 ? "працює зараз" : metrics.activeEmployees > 1 ? "працюють зараз" : "ще не додано"}</small>
        </article>
        <article>
          <span>ЗАВЕРШЕНО AI</span>
          <b>{metrics.completedTasks}</b>
          <small>завдання завершено</small>
        </article>
        <article>
          <span>ДІЙ ВИКОНАНО AI</span>
          <b>{metrics.automatedActions}</b>
          <small>без участі людини</small>
        </article>
        <article>
          <span>РІШЕНЬ ЛЮДИНИ</span>
          <b>{metrics.pendingDecisions ? `${metrics.pendingDecisions} очікує` : metrics.humanDecisions}</b>
          <small>{metrics.pendingDecisions ? "потребує контролю" : "критичне рішення"}</small>
        </article>
        <article>
          <span>ПІДКЛЮЧЕНІ СИСТЕМИ</span>
          <b>{metrics.connectedSystems}</b>
          <small>джерела даних</small>
        </article>
        <article className="estimate-metric">
          <span>ОРІЄНТОВНО ЗЕКОНОМЛЕНО</span>
          <b>{metrics.estimatedMinutesSaved ? `~${metrics.estimatedMinutesSaved} хв` : "—"}</b>
          <small>демо-оцінка</small>
          <i title="Оцінка базується на кількості автоматично виконаних кроків і не є фактичним виміром часу." aria-label="Оцінка базується на кількості автоматично виконаних кроків і не є фактичним виміром часу.">
            i
          </i>
        </article>
      </div>
      <div className="executive-main-grid">
        <section className="executive-actions">
          <div className="executive-section-title">
            <p className="eyebrow">ЩО AI ЗРОБИВ САМОСТІЙНО</p>
            <h3>{reconciliation ? "Рутинна робота виконувалася без мікроменеджменту." : "Автономна робота ще не розпочалася."}</h3>
          </div>
          {autonomousActions.length ? (
            <ol>
              {autonomousActions.map(([action, source], index) => (
                <li key={action}>
                  <span>0{index + 1}</span>
                  <div>
                    <b>{action}</b>
                    <small>{source}</small>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <div className="executive-empty">
              <p>{createdEmployee ? "Підключіть банк і бухгалтерську систему, щоб AI міг самостійно знайти роботу." : "Підключіть CRM та Email, щоб AI-асистент міг працювати з клієнтськими задачами."}</p>
            </div>
          )}
          {completed && <button className="text-button" onClick={() => router.push("/tasks/reconciliation")}>Переглянути результат <ArrowRight size={14} /></button>}
        </section>
        <aside className={`human-involvement ${pendingException || pendingCollaboration ? "is-pending" : ""}`}>
          <p className="eyebrow">ДЕ БУЛА ПОТРІБНА ВАША УЧАСТЬ</p>
          {pendingCollaboration ? (
            <><strong>1 рішення очікує</strong><h3>Follow-up щодо простроченої оплати</h3><p>ТОВ «Орбіта» · 48 000 ₴ · зовнішня комунікація</p><button className="primary" onClick={() => router.push("/approvals/payment-follow-up")}>Переглянути рішення <ArrowRight size={15} /></button></>
          ) : pendingException ? (
            <>
              <strong>1 рішення очікує</strong>
              <h3>Невідповідність транзакції</h3>
              <p>24 800 ₴ · різниця 2 000 ₴</p>
              <button className="primary" onClick={() => router.push("/approvals/reconciliation")}>
                Переглянути рішення <ArrowRight size={15} />
              </button>
            </>
          ) : collaboration?.status === "completed" ? (
            <><Status tone="quiet">ВИРІШЕНО</Status><strong>Зовнішню комунікацію погоджено</strong><p>AI-команда виконала операційну роботу, а людина підтвердила лише контрольовану дію.</p></>
          ) : resolvedDecision ? (
            <>
              <Status tone="quiet">ВИРІШЕНО</Status>
              <strong>1 критичне рішення прийнято</strong>
              <p>AI зупинився через недостатню впевненість і передав виняток людині.</p>
            </>
          ) : (
            <>
              <Status tone="quiet">БЕЗ ВТРУЧАННЯ</Status>
              <strong>Сьогодні критичних рішень не потрібно.</strong>
              <p>AI працюватиме самостійно в межах визначених правил.</p>
            </>
          )}
        </aside>
      </div>
      <div className="executive-secondary-grid">
        <section className={`executive-attention ${totalPending > 0 || !hasRequiredSources ? "has-items" : ""}`}>
          <p className="eyebrow">ПОТРЕБУЄ УВАГИ</p>
          {pendingCollaboration ? (
            <div><span>РІШЕННЯ ЛЮДИНИ</span><h3>Повідомлення клієнту щодо простроченої оплати</h3><p>ТОВ «Орбіта» · 48 000 ₴ · 12 днів прострочення</p><ul className="attention-checks"><li>Перевірив CRM</li><li>Переглянув історію комунікації</li><li>Підготував follow-up</li></ul><small className="attention-reason">Зовнішня комунікація потребує погодження людини.</small><button className="text-button" onClick={() => router.push("/approvals/payment-follow-up")}>Переглянути <ArrowRight size={14} /></button></div>
          ) : pendingException ? (
            <div>
              <span>РІШЕННЯ ЛЮДИНИ</span>
              <h3>Невідповідність транзакції · 2 000 ₴</h3>
              <p>AI призупинив звірку до вашого рішення.</p>
              <button className="text-button" onClick={() => router.push("/approvals/reconciliation")}>
                Переглянути <ArrowRight size={14} />
              </button>
            </div>
          ) : !employees.length ? (
            <div>
              <h3>Потрібен перший AI-працівник</h3>
              <p>Налаштуйте роль, обов’язки та межі автономності.</p>
            </div>
          ) : !hasRequiredSources ? (
            <div>
              <span>БЛОКУЄ АВТОМАТИЧНИЙ СТАРТ</span>
              <h3>Підключіть робочі джерела</h3>
              <p>{createdEmployee ? "Для звірки потрібні банк і бухгалтерська система." : "Для роботи з клієнтами потрібні CRM та Email."}</p>
              <button className="text-button" onClick={() => router.push(createdEmployee ? "/workforce/accountant#connections" : "/workforce/sales-assistant#connections")}>
                Підключити системи <ArrowRight size={14} />
              </button>
            </div>
          ) : !approved && createdEmployee ? (
            <div>
              <span>ПОГОДЖЕННЯ</span>
              <h3>Запит документів для закриття місяця</h3>
              <p>AI-бухгалтер очікує дозволу на надсилання.</p>
              <button className="text-button" onClick={() => router.push("/approvals/monthly-close")}>
                Переглянути <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <div className="nothing-critical">
              <CheckCircle2 size={18} />
              <div>
                <h3>Нічого критичного</h3>
                <p>AI-команда продовжує роботу в межах заданих правил.</p>
              </div>
            </div>
          )}
        </section>
        <section className="next-work">
          <p className="eyebrow">ДАЛІ В РОБОТІ</p>
          <div>
            <article>
              <span>НАСТУПНЕ</span>
              <h3>Перевірити відсутні документи</h3>
              <p>3 транзакції без підтвердних документів</p>
            </article>
            <article>
              <span>ЗАПЛАНОВАНО</span>
              <h3>Продовжити закриття місяця</h3>
              <p>Виконано на 72%</p>
            </article>
            <article>
              <span>{hasCrm ? "В ЧЕРЗІ" : "ПОТРЕБУЄ CRM"}</span>
              <h3>Перевірити прострочені оплати</h3>
              <p>{hasCrm ? "14 прострочених оплат" : "Підключіть CRM, щоб додати завдання в чергу."}</p>
              {!hasCrm && createdEmployee && (
                  <button className="text-button" onClick={() => router.push(hasSales ? "/workforce/sales-assistant#connections" : "/workforce/new")}>
                    {hasSales ? "Підключити CRM" : "Найняти AI-асистента з продажів"} <ArrowRight size={14} />
                </button>
              )}
            </article>
          </div>
        </section>
      </div>
      <div className="executive-value-grid">
        <section className="business-value">
          <p className="eyebrow">ЩО ЦЕ ОЗНАЧАЄ ДЛЯ КОМАНДИ</p>
          <h3>AI бере на себе повторювані операційні кроки.</h3>
          <p>Людина підключається лише там, де потрібне рішення, контекст або відповідальність.</p>
          <ul>
            <li>Менше ручної перевірки</li>
            <li>Менше перемикань між системами</li>
            <li>Людина контролює критичні рішення</li>
          </ul>
        </section>
        <section className="work-distribution" aria-label={completed ? "Розподіл роботи: AI виконав 11 операцій, людина прийняла 1 рішення" : "Розподіл роботи буде доступний після завершення демо-сценарію"}>
          <p className="eyebrow">РОЗПОДІЛ РОБОТИ</p>
          {completed ? (
            <>
              <div className="distribution-values">
                <span>
                  <b>11</b> операцій AI
                </span>
                <span>
                  <b>1</b> рішення людини
                </span>
              </div>
              <div className="distribution-bar" role="img" aria-label="AI виконав 92 відсотки операційних кроків, людина виконала 8 відсотків">
                <i />
                <b />
              </div>
              <h3>AI виконав 92% операційних кроків у цьому демо-сценарії.</h3>
              <small>Демо-показник для цього сценарію</small>
            </>
          ) : (
            <div className="executive-empty">
              <p>Після завершення звірки тут буде показано співвідношення роботи AI та людини.</p>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

function CollaborationOverview() {
  const router = useRouter();
  const { employees, integrations, collaboration } = useWorkforce();
  const hasAccountant = employees.some((item) => item.id === "accountant");
  const hasSales = employees.some((item) => item.id === "sales-assistant");
  const hasAccountantSources = integrations.some((item) => item.employeeId === "accountant" && item.id === "bank") && integrations.some((item) => item.employeeId === "accountant" && item.id === "accounting");
  const hasCrm = integrations.some((item) => item.employeeId === "sales-assistant" && item.id === "crm");
  const hasEmail = integrations.some((item) => item.employeeId === "sales-assistant" && item.id === "email");
  if (!hasAccountant || !hasAccountantSources) return null;

  if (!hasSales) return <section className="collaboration-recommendation"><div><p className="eyebrow">МОЖЛИВІСТЬ ДЛЯ КОМАНДИ</p><h2>Знайдено прострочену оплату, але немає AI-працівника для роботи з клієнтом</h2><p>AI-бухгалтер виявив рахунок ТОВ «Орбіта» на 48 000 ₴, прострочений на 12 днів. Наступний крок належить ролі, що працює з клієнтами.</p></div><button className="primary" onClick={() => router.push("/workforce/new")}>Найняти AI-асистента з продажів <ArrowRight size={15} /></button></section>;

  if (!hasCrm || !hasEmail) return <section className="collaboration-recommendation"><div><p className="eyebrow">СПІЛЬНА РОБОТА</p><h2>AI-асистент з продажів готовий прийняти завдання</h2><p>{!hasCrm ? "Для аналізу клієнта підключіть CRM." : "Для демо follow-up підключіть Email."} Фінансовий контекст буде передано AI-бухгалтером без прямого доступу AI-асистента до банку.</p></div><button className="primary" onClick={() => router.push("/workforce/sales-assistant#connections")}>Підключити {!hasCrm ? "CRM" : "Email"} <ArrowRight size={15} /></button></section>;

  if (!collaboration) return null;
  const salesStep = collaboration.status === "completed" ? "ЗАВЕРШЕНО" : collaboration.status === "approval" ? "ОЧІКУЄ РІШЕННЯ" : collaboration.status === "revision" ? "ДООПРАЦЬОВУЄ" : "ПРАЦЮЄ";
  const humanStep = collaboration.status === "completed" || collaboration.status === "resuming" ? "ПОГОДЖЕНО" : collaboration.status === "approval" ? "ОЧІКУЄ" : "НАСТУПНЕ";
  return <section className="collaboration-overview" aria-labelledby="collaboration-overview-title"><header><div><p className="eyebrow">СПІЛЬНА РОБОТА</p><h2 id="collaboration-overview-title">Одна задача рухається між спеціалізованими AI-працівниками</h2></div><button className="text-button" onClick={() => router.push("/tasks/payment-follow-up")}>Відкрити завдання <ArrowRight size={14} /></button></header><div className="collaboration-chain"><article><Identity color="blue" /><div><span>AI-БУХГАЛТЕР · ЗАВЕРШЕНО</span><b>Виявив прострочену оплату</b></div></article><ArrowRight className="chain-direction" size={17} /><article><Identity color="green" /><div><span>AI-АСИСТЕНТ З ПРОДАЖІВ · {salesStep}</span><b>{collaboration.status === "completed" ? "Завершив демо follow-up" : collaboration.status === "approval" ? "Підготував follow-up" : "Перевіряє CRM та готує follow-up"}</b></div></article><ArrowRight className="chain-direction" size={17} /><article className="human-chain-step"><span>ЛЮДИНА · {humanStep}</span><b>Погоджує зовнішнє повідомлення</b></article></div><footer><b>Передач між AI: 1</b><span>Контекст передано, оскільки подальша дія потребує роботи з клієнтом, а не фінансової обробки.</span></footer></section>;
}

function Dashboard() {
  const router = useRouter();
  const { approved, demoMode, employees, createdEmployee, integrations, reconciliation, collaboration } = useWorkforce();
  const salesEmployee = employees.find((item) => item.id === "sales-assistant");
  const accountantState =
    demoMode === "working"
      ? {
          ...workers[0],
          status: "У РОБОТІ",
          objective: "Закриття серпня",
          progress: 72,
          action: "Перевіряє документи та фінансові записи",
          href: "/tasks/monthly-close",
          cta: "Переглянути",
        }
      : reconciliation?.status === "completed"
      ? {
          ...workers[0],
          status: "АКТИВНИЙ",
          objective: "Звірку транзакцій завершено",
          progress: 100,
          action: "11 автоматично · 1 рішення людини",
        }
      : reconciliation?.status === "exception"
        ? {
            ...workers[0],
            status: "ОЧІКУЄ ВАШОГО РІШЕННЯ",
            objective: "Невідповідність транзакції",
            progress: 82,
            action: "Виявлено різницю 2 000 ₴",
          }
        : reconciliation
          ? {
              ...workers[0],
              status: "ПРАЦЮЄ",
              objective: "Звіряє банківські транзакції",
              progress: reconciliation.status === "resuming" ? 92 : 64,
              action: reconciliation.status === "resuming" ? "Продовжив після рішення" : "11 із 12 транзакцій звірено",
            }
          : {
              ...workers[0],
              status: "ПРАЦЮЄ",
              objective: "Готує закриття серпня",
              action: "Проаналізовано 48 транзакцій",
            };
  const salesState = { key: "sales-assistant", name: "AI-асистент з продажів", role: "Продажі та клієнтська комунікація", color: "green", status: collaboration?.status === "approval" ? "ОЧІКУЄ ПОГОДЖЕННЯ" : collaboration?.status === "completed" ? "АКТИВНИЙ" : "ПРАЦЮЄ", objective: collaboration?.status === "completed" ? "Follow-up завершено" : collaboration ? "Follow-up щодо простроченої оплати" : "Очікує робочий контекст", progress: collaboration?.status === "completed" ? 100 : collaboration ? 82 : 0, action: collaboration?.status === "completed" ? "Демо-відправлення зафіксовано" : collaboration ? "ТОВ «Орбіта» · 48 000 ₴ · 12 днів" : "Готовий приймати завдання від команди", tasks: 0, href: collaboration?.status === "approval" ? "/approvals/payment-follow-up" : "/tasks/payment-follow-up", cta: collaboration?.status === "approval" ? "Переглянути рішення" : "Переглянути" };
  const officeWorkers = [...(createdEmployee ? [accountantState] : []), ...(salesEmployee ? [salesState] : [])];
  const workflowActivities = [
    ...([...(collaboration?.activities || [])].reverse().map((event) => ({ time: event.time, actor: event.actor, text: `${event.text} · ${event.detail}`, kind: event.kind }))),
    ...([...(reconciliation?.activities || [])].reverse().map((event) => ({ time: event.time, actor: event.kind === "HUMAN ACTION" ? "Користувач" : "AI-бухгалтер", text: `${event.text} · ${event.detail}`, kind: event.kind }))),
  ];
  const standardActivities = [
    ...(approved && demoMode !== "working"
      ? [
          {
            time: "10:04",
            actor: "Користувач",
            text: "Погодив запит клієнту.",
            kind: "HUMAN ACTION",
          },
          {
            time: "10:04",
            actor: "AI-бухгалтер",
            text: "Продовжив закриття місяця після погодження запиту.",
            kind: "AI ACTION",
          },
        ]
      : []),
    ...(createdEmployee
      ? [
          {
            time: createdEmployee.createdAt,
            actor: createdEmployee.name,
            text: "Приєднався до команди й готовий до роботи.",
            kind: "AI ACTION",
          },
        ]
      : []),
    ...integrations.map((integration) => ({
      time: integration.connectedAt,
      actor: integration.employeeId === "sales-assistant" ? "AI-асистент з продажів" : "AI-бухгалтер",
      text: integrationCatalog.find((item) => item.id === integration.id)?.eventText || "Підключено робоче джерело",
      kind: "DEMO CONNECTION",
    })),
    ...(reconciliation?.activities.map((event) => ({
      time: event.time,
      actor: event.kind === "HUMAN ACTION" ? "Користувач" : "AI-бухгалтер",
      text: `${event.text} · ${event.detail}`,
      kind: event.kind,
    })) || []),
    ...(collaboration?.activities.map((event) => ({ time: event.time, actor: event.actor, text: `${event.text} · ${event.detail}`, kind: event.kind })) || []),
  ];
  const activities = demoMode === "working" ? workflowActivities : standardActivities;
  const activityKindLabels = {
    "AI ACTION": "ДІЯ AI",
    HANDOFF: "ПЕРЕДАЧА",
    "HUMAN ACTION": "ДІЯ ЛЮДИНИ",
    "DEMO CONNECTION": "ДЕМО-ПІДКЛЮЧЕННЯ",
  } as const;
  const activeTasks = !employees.length ? 0 : (demoMode === "working" ? 1 : 0) + (reconciliation && reconciliation.status !== "completed" ? 1 : 0) + (collaboration && collaboration.status !== "completed" ? 1 : 0);
  const pendingDecisions = !employees.length ? 0 : (createdEmployee && !approved ? 1 : 0) + (reconciliation?.status === "exception" ? 1 : 0) + (collaboration?.status === "approval" ? 1 : 0);
  return (
    <Shell path="/office">
      <div className="page office-page">
        <header className="page-head office-head">
          <div>
            <OfficeGreeting />
            <p>{demoMode === "working" ? "AI-команда працює" : employees.length ? "Ваша AI-команда працює." : "Ваш AI-офіс готовий до налаштування."}</p>
          </div>
          <div className="summary">
            <span>
              <b>{employees.length}</b> {ukPlural(employees.length, "працівник працює", "працівники працюють", "працівників працюють")}
            </span>
            <i />
            <span>
              <b>{activeTasks}</b> {ukPlural(activeTasks, "активне завдання", "активні завдання", "активних завдань")}
            </span>
            <i />
            <span>
              <b>{pendingDecisions}</b> {ukPlural(pendingDecisions, "рішення очікує", "рішення очікують", "рішень очікують")} на вас
            </span>
          </div>
        </header>
        <ExecutiveOverview />
        <CollaborationOverview />
        {employees.length > 0 && (
          <section className={`team-focus ${officeWorkers.length === 1 ? "single-worker" : ""}`}>
            <div className="office-section-head">
              <div>
                <p className="eyebrow">ВАША AI-КОМАНДА</p>
                <h2>Хто працює зараз.</h2>
              </div>
              <button className="text-button" onClick={() => router.push("/workforce")}>
                Переглянути команду <ArrowRight size={15} />
              </button>
            </div>
            <div className="team-composition">
              {officeWorkers.map((w) => (
                <TeamCell key={w.key} worker={w} />
              ))}
            </div>
          </section>
        )}
        <section className="section activity-section office-activity">
          <div className="section-title">
            <div>
              <p className="eyebrow">ЩО СЬОГОДНІ ЗРОБИЛА ВАША AI-КОМАНДА</p>
              <h2>{activities.length ? "Робота просувалася автономно." : "Історія роботи з’явиться тут."}</h2>
            </div>
            {createdEmployee && (
              <button className="task-link" onClick={() => router.push("/tasks/monthly-close")}>
                Підготувати клієнта до закриття місяця <ArrowRight size={15} />
              </button>
            )}
          </div>
          {activities.length ? (
            <div className="timeline">
              {activities.map((a, i) => (
                <motion.div className={`activity-${a.kind.toLowerCase().replace(" ", "-")}`} key={`${a.time}-${a.actor}-${i}`} initial={{ opacity: 0, x: -7 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                  <time>{a.time}</time>
                  <i />
                  <div>
                    <span className="activity-kind">{activityKindLabels[a.kind as keyof typeof activityKindLabels]}</span>
                    <b>{a.actor}</b>
                    <p>{a.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="activity-empty">Після найму AI-працівника тут з’являться його дії, передачі та рішення людини.</div>
          )}
        </section>
      </div>
    </Shell>
  );
}

const baseSteps = [
  ["AI-БУХГАЛТЕР", "Проаналізував бухгалтерські дані", "Перевірено 48 транзакцій", "complete", "blue"],
  ["AI-БУХГАЛТЕР", "Виявив відсутні документи", "Потрібні 3 рахунки", "complete", "blue"],
  ["AI-БУХГАЛТЕР", "Перевірив наявні документи", "Виявлено 3 відсутні рахунки", "complete", "blue"],
  ["AI-БУХГАЛТЕР", "Підготував запит документів", "Готовий до надсилання", "complete", "blue"],
];

function MonthlyCloseTask() {
  const router = useRouter();
  const { approved } = useWorkforce();
  const steps = [...baseSteps, ["КОРИСТУВАЧ", approved ? "Погодив запит клієнту" : "Потрібне погодження", approved ? "Погоджено о 10:04" : "Потрібне ваше рішення", approved ? "complete" : "current", "human"], ["AI-БУХГАЛТЕР", approved ? "Очікує запитані документи" : "Продовжити закриття місяця", approved ? "Запит надіслано · відстежує вхідні" : "Продовжить після погодження", "waiting", "blue"]];
  return (
    <Shell path="/tasks/monthly-close">
      <div className="page task-page">
        <button className="back" onClick={() => router.push("/office")}>
          <ArrowLeft size={16} /> Назад до огляду
        </button>
        <header className="task-head">
          <div>
            <p className="eyebrow">ЗАВДАННЯ / ЗАКРИТТЯ МІСЯЦЯ</p>
            <h1>
              Підготувати клієнта до
              <br />
              закриття місяця
            </h1>
            <div className="task-meta">
              <Status>AI-КОМАНДА ПРАЦЮЄ</Status>
              <span>Запущено автоматично о 09:32</span>
            </div>
          </div>
          <div className="big-progress">
            <span>ПРОГРЕС</span>
            <b>{approved ? 82 : 75}%</b>
            <div className="progress">
              <motion.i animate={{ width: approved ? "82%" : "75%" }} />
            </div>
          </div>
        </header>
        <div className="workflow-intro">
          <p>ОДНЕ БІЗНЕС-ЗАВДАННЯ</p>
          <ArrowDown size={16} />
          <p>ТРИ AI-ПРАЦІВНИКИ</p>
          <ArrowDown size={16} />
          <p>ОДНЕ РІШЕННЯ ЛЮДИНИ</p>
        </div>
        <section className="workflow">
          {steps.map((s, i) => (
            <motion.div className={`workflow-step ${s[3]}`} key={`${s[0]}-${i}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <div className="step-number">{String(i + 1).padStart(2, "0")}</div>
              <div className="step-line">
                <i />
              </div>
              <Identity color={s[4]} />
              <div className="step-copy">
                <small>{s[0]}</small>
                <h3>{s[1]}</h3>
                <p>{s[2]}</p>
              </div>
              <span className="step-status">
                {s[3] === "complete" ? (
                  <>
                    <Check size={13} /> ЗАВЕРШЕНО
                  </>
                ) : s[3] === "current" ? (
                  "ПОТОЧНИЙ ЕТАП"
                ) : (
                  "ОЧІКУЄ"
                )}
              </span>
              {s[3] === "current" && (
                <button className="primary" onClick={() => router.push("/approvals/monthly-close")}>
                  Переглянути рішення <ArrowRight size={15} />
                </button>
              )}
            </motion.div>
          ))}
        </section>
      </div>
    </Shell>
  );
}

function MonthlyCloseApproval() {
  const router = useRouter();
  const { approve, approved, reconciliation, collaboration } = useWorkforce();
  const [phase, setPhase] = useState<"ready" | "sending" | "done">(approved ? "done" : "ready");
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("Вітаю, Мілоше!\n\nМи готуємо закриття серпня та виявили три відсутні рахунки. Будь ласка, завантажте наведені нижче документи, коли матимете змогу.\n\n• INV-2481 — Atlas Office\n• INV-2517 — Petrović Consulting\n• INV-2533 — Northline Systems\n\nДякуємо,\nбухгалтерська команда Користувача");
  const submit = () => {
    setPhase("sending");
    setTimeout(() => {
      approve();
      setPhase("done");
    }, 900);
  };
  if (phase === "sending")
    return (
      <Shell path="/approvals/monthly-close">
        <div className="approval-result">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <span className="sending-mark">
              <i />
              <i />
            </span>
            <p>Підтверджуємо ваше рішення</p>
          </motion.div>
        </div>
      </Shell>
    );
  if (phase === "done")
    return (
      <Shell path="/approvals/monthly-close">
        <div className="approval-result">
          <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <span className="approved-mark">
              <Check size={28} />
            </span>
            <h1>Погоджено.</h1>
            <p>Запит клієнту надіслано.</p>
            <small>Робочий процес відновлено, а дані на дашборді оновлено.</small>
            <div>
              <button className="secondary" onClick={() => router.push("/tasks/monthly-close")}>
                Переглянути оновлений процес
              </button>
              <button className="primary" onClick={() => router.push("/office")}>
                Повернутися до дашборда <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        </div>
      </Shell>
    );
  return (
    <Shell path="/approvals/monthly-close">
      <div className="page approval-page">
        <button className="back" onClick={() => router.push("/tasks/monthly-close")}>
          <ArrowLeft size={16} /> Назад до завдання
        </button>
        <header>
          <p className="eyebrow">ЗВИЧАЙНА ЧАСТИНА РОБОЧОГО ПРОЦЕСУ</p>
          <h1>
            Потрібне
            <br />
            ваше рішення.
          </h1>
          <p>Ваша AI-команда зупинилася перед зовнішньою дією.</p>
        </header>
        {reconciliation?.status === "exception" && (
          <button className="pending-approval-card" onClick={() => router.push("/approvals/reconciliation")}>
            <div>
              <small>ЩЕ ОДНЕ ПОГОДЖЕННЯ</small>
              <b>Невідповідність транзакції</b>
              <span>24 800 ₴ · ТОВ «Вектор» · різниця 2 000 ₴</span>
            </div>
            <Status tone="waiting">ОЧІКУЄ РІШЕННЯ</Status>
            <ArrowRight size={17} />
          </button>
        )}
        {collaboration?.status === "approval" && (
          <button className="pending-approval-card" onClick={() => router.push("/approvals/payment-follow-up")}>
            <div>
              <small>ЩЕ ОДНЕ ПОГОДЖЕННЯ</small>
              <b>Follow-up щодо простроченої оплати</b>
              <span>ТОВ «Орбіта» · 48 000 ₴ · підготовлено AI-асистентом</span>
            </div>
            <Status tone="waiting">ОЧІКУЄ РІШЕННЯ</Status>
            <ArrowRight size={17} />
          </button>
        )}
        <div className="approval-layout">
          <section className="proposal">
            <div className="proposal-by">
              <Identity color="blue" />
              <div>
                <small>ЗАПРОПОНОВАНО</small>
                <b>AI-бухгалтер</b>
              </div>
              <Status tone="waiting">ОЧІКУЄ ВАШОГО РІШЕННЯ</Status>
            </div>
            <div className="proposal-title">
              <small>ЗАПРОПОНОВАНА ДІЯ</small>
              <h2>Надіслати запит документів Мілошу К.</h2>
            </div>
            {editing ? (
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} autoFocus />
            ) : (
              <div className="message-preview">
                {message.split("\n").map((line, i) => (
                  <p key={i}>{line || <br />}</p>
                ))}
              </div>
            )}
            <div className="approval-actions">
              <button className="primary approve" onClick={submit}>
                <Check size={17} /> Погодити та надіслати
              </button>
              <button className="secondary" onClick={() => setEditing(!editing)}>
                {editing ? "Зберегти зміни" : "Редагувати"}
              </button>
              <button className="ghost">
                <X size={16} /> Відхилити
              </button>
            </div>
          </section>
          <aside className="decision-context">
            <div>
              <span>ЧОМУ</span>
              <p>Для закриття серпня бракує 3 рахунків.</p>
            </div>
            <div>
              <span>ВИКОРИСТАНІ ДАНІ</span>
              <p>
                Перевірка обліку за серпень
                <br />
                Перевірка документів
              </p>
            </div>
            <div>
              <span>ЩО БУДЕ ДАЛІ</span>
              <p>Після погодження запит буде надіслано. Коли документи надійдуть, AI-бухгалтер продовжить закриття місяця.</p>
            </div>
            <div className="guardrail">
              <ShieldCheck size={18} />
              <p>
                <b>Ви зберігаєте контроль.</b>
                <br />
                Зовнішні повідомлення не надсилаються без визначеного вами дозволу.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </Shell>
  );
}

function DecisionConfirmDialog({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    const focusable = () => Array.from(panel?.querySelectorAll<HTMLElement>("button:not(:disabled)") || []);
    focusable()[0]?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusable();
      if (!items.length) return;
      if (event.shiftKey && document.activeElement === items[0]) {
        event.preventDefault();
        items.at(-1)?.focus();
      } else if (!event.shiftKey && document.activeElement === items.at(-1)) {
        event.preventDefault();
        items[0].focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [onClose]);
  return (
    <div className="integration-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="integration-dialog decision-confirm" ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="decision-confirm-title">
        <button className="dialog-close" onClick={onClose} aria-label="Закрити">
          <X size={18} />
        </button>
        <span className="dialog-icon">
          <ShieldCheck size={20} />
        </span>
        <p className="eyebrow">РІШЕННЯ ЛЮДИНИ</p>
        <h2 id="decision-confirm-title">Підтвердити транзакцію як коректну?</h2>
        <p className="dialog-lede">AI завершить звірку, використовуючи ваше рішення.</p>
        <footer>
          <button className="secondary" onClick={onClose}>
            Скасувати
          </button>
          <button className="primary" onClick={onConfirm}>
            Підтвердити
          </button>
        </footer>
      </div>
    </div>
  );
}

function ReconciliationWorkflow() {
  const { reconciliation } = useWorkforce();
  if (!reconciliation) return null;
  const afterException = reconciliation.status === "resuming" || reconciliation.status === "completed";
  const steps = [
    ["Отримання даних", "12 банківських транзакцій отримано", "complete"],
    ["Пошук відповідних записів", "Знайдено 11 відповідних бухгалтерських записів", "complete"],
    ["Перевірка документів", "Перевірено рахунки та підтвердні документи", "complete"],
    ["Аналіз невідповідностей", afterException ? "Виняток передано людині та зафіксовано" : reconciliation.status === "working" ? "AI аналізує розбіжності у сумах" : "Знайдено виняток", afterException ? "complete" : reconciliation.status === "working" ? "current" : "exception"],
    ["Завершення звірки", reconciliation.status === "completed" ? "Результат підготовлено й зафіксовано" : reconciliation.status === "resuming" ? "AI завершує решту workflow" : "Продовжить після рішення людини", reconciliation.status === "completed" ? "complete" : reconciliation.status === "resuming" ? "current" : "waiting"],
  ];
  return (
    <section className="reconciliation-workflow" aria-label="Етапи звірки">
      {steps.map((step, index) => (
        <motion.article className={`reconciliation-step ${step[2]}`} key={step[0]} initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
          <span className="reconciliation-step-number">0{index + 1}</span>
          <div>
            <small>{step[2] === "complete" ? "ЗАВЕРШЕНО" : step[2] === "current" ? "У РОБОТІ" : step[2] === "exception" ? "ЗНАЙДЕНО ВИНЯТОК" : "ОЧІКУЄ"}</small>
            <h3>{step[0]}</h3>
            <p>{step[1]}</p>
          </div>
          {step[2] === "complete" ? <CheckCircle2 size={18} /> : <i className="step-indicator" />}
        </motion.article>
      ))}
    </section>
  );
}

function ReconciliationException({ compact = false }: { compact?: boolean }) {
  const { reconciliation } = useWorkforce();
  const resolved = reconciliation?.status === "resuming" || reconciliation?.status === "completed";
  const resolvedLabel = reconciliation?.humanDecision === "accepted" ? "ПІДТВЕРДЖЕНО ЛЮДИНОЮ" : "ПОГОДЖЕНО";
  return (
    <section className={`reconciliation-exception ${compact ? "compact" : ""}`}>
      <header>
        <div>
          <p className="eyebrow">{resolved ? "ВИНЯТОК ОПРАЦЬОВАНО" : "ПОТРІБНЕ РІШЕННЯ ЛЮДИНИ"}</p>
          <h2>Транзакція #TRX-2841</h2>
        </div>
        <Status tone={resolved ? "quiet" : "waiting"}>{resolved ? resolvedLabel : "ОЧІКУЄ РІШЕННЯ"}</Status>
      </header>
      <dl className="transaction-facts">
        <div>
          <dt>Сума</dt>
          <dd>24 800 ₴</dd>
        </div>
        <div>
          <dt>Дата</dt>
          <dd>28 серпня</dd>
        </div>
        <div>
          <dt>Контрагент</dt>
          <dd>ТОВ «Вектор»</dd>
        </div>
      </dl>
      <div className="exception-finding">
        <small>AI ЗНАЙШОВ</small>
        <p>Сума банківської транзакції не відповідає сумі рахунку.</p>
      </div>
      <div className="amount-comparison">
        <div>
          <span>БАНК</span>
          <b>24 800 ₴</b>
        </div>
        <div>
          <span>РАХУНОК</span>
          <b>22 800 ₴</b>
        </div>
        <div className="difference">
          <span>РІЗНИЦЯ</span>
          <b>2 000 ₴</b>
        </div>
      </div>
      {!compact && (
        <>
          <div className="confidence">
            <div>
              <span>ВПЕВНЕНІСТЬ AI</span>
              <b>68%</b>
            </div>
            <div className="progress">
              <i style={{ width: "68%" }} />
            </div>
            <p>Сума відхилення перевищує допустимий поріг, а впевненість AI недостатня для автоматичного рішення.</p>
          </div>
          <section className="ai-checked">
            <h3>Що перевірив AI</h3>
            <ul>
              <li>порівняв транзакцію з бухгалтерськими записами;</li>
              <li>знайшов відповідний рахунок;</li>
              <li>перевірив доступні документи;</li>
              <li>перевірив історію платежів контрагента;</li>
              <li>не знайшов документа, який пояснює різницю 2 000 ₴.</li>
            </ul>
            <p>
              <ShieldCheck size={16} /> AI не виконав жодних фінансових змін.
            </p>
          </section>
          <section className="ai-recommendation">
            <small>РЕКОМЕНДАЦІЯ AI</small>
            <h3>Не закривати транзакцію автоматично.</h3>
            <p>Позначити її як виняток та запросити підтвердний документ перед завершенням звірки.</p>
            <span>Історичні дані не дають достатніх підстав вважати різницю 2 000 ₴ коректною.</span>
          </section>
        </>
      )}
    </section>
  );
}

function ReconciliationActions({ onDecision }: { onDecision: (decision: ReconciliationDecision) => void }) {
  const [confirming, setConfirming] = useState(false);
  return (
    <>
      <div className="reconciliation-actions">
        <button className="primary" onClick={() => onDecision("approved")}>
          <Check size={16} /> Погодити рекомендацію AI
        </button>
        <button className="secondary" onClick={() => setConfirming(true)}>
          Позначити як коректну
        </button>
        <button className="ghost" onClick={() => onDecision("deferred")}>
          Відкласти рішення
        </button>
      </div>
      {confirming && (
        <DecisionConfirmDialog
          onClose={() => setConfirming(false)}
          onConfirm={() => {
            setConfirming(false);
            onDecision("accepted");
          }}
        />
      )}
    </>
  );
}

function ReconciliationResult() {
  const router = useRouter();
  return (
    <section className="reconciliation-result">
      <header>
        <span className="approved-mark">
          <Check size={23} />
        </span>
        <div>
          <p className="eyebrow">РОБОТУ ЗАВЕРШЕНО</p>
          <h2>Звірку завершено</h2>
          <p>AI перевірив 12 транзакцій, автоматично звірив 11 і передав вам лише одну невідповідність.</p>
        </div>
      </header>
      <div className="result-summary">
        <span>
          <b>12</b> транзакцій перевірено
        </span>
        <span>
          <b>11</b> звірено автоматично
        </span>
        <span>
          <b>1</b> виняток передано людині
        </span>
        <span>
          <b>1</b> рішення прийнято людиною
        </span>
      </div>
      <div className="audit-columns">
        <div>
          <h3>Виконано AI</h3>
          <ul>
            <li>12 транзакцій проаналізовано</li>
            <li>11 транзакцій звірено</li>
            <li>1 виняток виявлено</li>
            <li>документи перевірено</li>
            <li>результат підготовлено</li>
          </ul>
        </div>
        <div>
          <h3>Виконано людиною</h3>
          <p>
            <b>1</b> критичне рішення
          </p>
        </div>
      </div>
      <aside className="time-saved">
        <b>Орієнтовно зекономлено: 23 хв</b>
        <span>Демо-оцінка на основі кількості автоматично виконаних кроків.</span>
      </aside>
      <div className="result-actions">
        <button className="primary" onClick={() => router.push("/office")}>
          Повернутися до AI-офісу <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
}

function ReconciliationTask() {
  const router = useRouter();
  const { createdEmployee, integrations, reconciliation, decideReconciliation, resetReconciliation } = useWorkforce();
  const [decisionPhase, setDecisionPhase] = useState<"ready" | "resuming">("ready");
  const hasSources = integrations.some((item) => item.id === "bank") && integrations.some((item) => item.id === "accounting");
  const decide = (decision: ReconciliationDecision) => {
    if (decision === "deferred") {
      decideReconciliation(decision);
      return;
    }
    setDecisionPhase("resuming");
    window.setTimeout(() => {
      decideReconciliation(decision);
      setDecisionPhase("ready");
    }, 550);
  };
  if (!createdEmployee || !hasSources)
    return (
      <Shell path="/tasks/reconciliation">
        <div className="page reconciliation-page">
          <button className="back" onClick={() => router.push("/office")}>
            <ArrowLeft size={16} /> Назад до AI-офісу
          </button>
          <section className="task-data-gate">
            <Landmark size={24} />
            <p className="eyebrow">НЕДОСТАТНЬО ДАНИХ</p>
            <h1>Недостатньо даних для автоматичного запуску</h1>
            <p>Для звірки транзакцій підключіть банківські рахунки та бухгалтерську систему.</p>
            <button className="primary" onClick={() => router.push("/workforce/accountant#connections")}>
              Перейти до підключень <ArrowRight size={15} />
            </button>
          </section>
        </div>
      </Shell>
    );
  if (!reconciliation)
    return (
      <Shell path="/tasks/reconciliation">
        <div className="hire-result">
          <div>
            <span className="sending-mark">
              <i />
              <i />
            </span>
            <p>AI-бухгалтер аналізує підключені демо-дані…</p>
          </div>
        </div>
      </Shell>
    );
  const progress = reconciliation.status === "working" ? 64 : reconciliation.status === "exception" ? 82 : reconciliation.status === "resuming" ? 92 : 100;
  const showException = reconciliation.status !== "working";
  return (
    <Shell path="/tasks/reconciliation">
      <div className="page reconciliation-page">
        <div className="task-toolbar">
          <button className="back" onClick={() => router.push("/office")}>
            <ArrowLeft size={16} /> Назад до AI-офісу
          </button>
          <button className="ghost replay-button" onClick={resetReconciliation}>
            <RefreshCcw size={14} /> Перезапустити демо
          </button>
        </div>
        <header className="reconciliation-head">
          <div>
            <p className="eyebrow">ЗАВДАННЯ · АВТОМАТИЧНО ВИЯВЛЕНО</p>
            <h1>
              Звірка банківських
              <br />
              транзакцій
            </h1>
            <p>AI-бухгалтер порівнює банківські операції з бухгалтерськими записами та документами.</p>
            <div className="task-meta">
              <Status tone={reconciliation.status === "exception" ? "waiting" : "live"}>{reconciliation.status === "completed" ? "ЗАВЕРШЕНО" : reconciliation.status === "exception" ? "ОЧІКУЄ РІШЕННЯ" : "AI ВИКОНУЄ"}</Status>
              <span>Запущено автоматично · {reconciliation.startedAt}</span>
            </div>
          </div>
          <div className="big-progress">
            <span>ПРОГРЕС</span>
            <b>{progress}%</b>
            <div className="progress">
              <motion.i animate={{ width: `${progress}%` }} />
            </div>
          </div>
        </header>
        <div className="reconciliation-context">
          <div>
            <span>ОБСЯГ</span>
            <b>12 транзакцій</b>
          </div>
          <div>
            <span>ДЖЕРЕЛА</span>
            <b>
              Банк · Бухгалтерія
              {integrations.some((item) => item.employeeId === "accountant" && item.id === "documents") ? " · Документи" : ""}
            </b>
          </div>
          <div>
            <span>ВИКОНУЄ</span>
            <b>AI-бухгалтер</b>
          </div>
          <div>
            <span>СТАРТ</span>
            <b>Автоматично</b>
          </div>
        </div>
        <aside className="autonomy-context">
          <CircleGauge size={17} />
          <div>
            <b>Рівень автономності: {autonomyLabels[createdEmployee.autonomy]}</b>
            <p>AI виконує стандартні кроки самостійно та передає критичні рішення людині.</p>
          </div>
        </aside>
        <ReconciliationWorkflow />
        {reconciliation.status === "working" && (
          <div className="analysis-progress" aria-live="polite">
            <Search size={17} />
            <div>
              <b>11 із 12 транзакцій звірено автоматично</b>
              <span>AI аналізує останню невідповідність…</span>
            </div>
          </div>
        )}
        {showException && (
          <>
            <p className="reconciled-summary">11 із 12 транзакцій звірено автоматично</p>
            <ReconciliationException />
            {reconciliation.status === "exception" && (
              <section className="human-decision-panel">
                <div>
                  <p className="eyebrow">РІШЕННЯ ЛЮДИНИ</p>
                  <h2>{reconciliation.exceptionStatus === "deferred" ? "Рішення відкладено" : "AI зупинився перед критичним рішенням"}</h2>
                  <p>{reconciliation.exceptionStatus === "deferred" ? "Завдання залишиться відкритим, доки ви не приймете рішення." : "Оберіть, як AI має опрацювати виняток і продовжити звірку."}</p>
                  <button className="text-button" onClick={() => router.push("/approvals/reconciliation")}>
                    Відкрити у Погодженнях <ArrowRight size={15} />
                  </button>
                </div>
                {decisionPhase === "resuming" ? (
                  <div className="decision-resuming" aria-live="polite">
                    <span className="sending-mark">
                      <i />
                      <i />
                    </span>
                    <b>Передаємо рішення AI-бухгалтеру…</b>
                  </div>
                ) : (
                  <ReconciliationActions onDecision={decide} />
                )}
              </section>
            )}
            {reconciliation.status === "resuming" && (
              <motion.div className="continuation" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
                <CheckCircle2 size={19} />
                <div>
                  <b>Рішення отримано. AI-бухгалтер продовжив звірку.</b>
                  <span>Завершуємо решту workflow…</span>
                </div>
              </motion.div>
            )}
            {reconciliation.status === "completed" && <ReconciliationResult />}
          </>
        )}
      </div>
    </Shell>
  );
}

function ReconciliationApproval() {
  const router = useRouter();
  const { reconciliation, collaboration, decideReconciliation } = useWorkforce();
  const [phase, setPhase] = useState<"ready" | "sending">("ready");
  const decide = (decision: ReconciliationDecision) => {
    if (decision === "deferred") {
      decideReconciliation(decision);
      return;
    }
    setPhase("sending");
    window.setTimeout(() => decideReconciliation(decision), 550);
  };
  if (!reconciliation)
    return (
      <Shell path="/approvals/reconciliation">
        <div className="page empty-approval">
          <p className="eyebrow">ПОГОДЖЕННЯ</p>
          <h1>Виняток ще не виявлено</h1>
          <p>Відкрийте завдання зі звірки, щоб переглянути його поточний стан.</p>
          <button className="primary" onClick={() => router.push("/tasks/reconciliation")}>
            Перейти до завдання
          </button>
        </div>
      </Shell>
    );
  if (reconciliation.status === "resuming")
    return (
      <Shell path="/approvals/reconciliation">
        <div className="approval-result">
          <div>
            <span className="sending-mark">
              <i />
              <i />
            </span>
            <p>Рішення отримано</p>
            <small>AI-бухгалтер продовжує звірку…</small>
            <button className="secondary" onClick={() => router.push("/tasks/reconciliation")}>
              Переглянути прогрес
            </button>
          </div>
        </div>
      </Shell>
    );
  if (reconciliation.status === "completed")
    return (
      <Shell path="/approvals/reconciliation">
        <div className="approval-result">
          <div>
            <span className="approved-mark">
              <Check size={28} />
            </span>
            <h1>Рішення виконано.</h1>
            <p>AI-бухгалтер завершив звірку.</p>
            <small>11 транзакцій звірено автоматично · 1 рішення прийнято людиною.</small>
            <div>
              <button className="secondary" onClick={() => router.push("/tasks/reconciliation")}>
                Переглянути результат
              </button>
              <button className="primary" onClick={() => router.push("/office")}>
                Повернутися до AI-офісу <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </Shell>
    );
  return (
    <Shell path="/approvals/reconciliation">
      <div className="page reconciliation-approval-page">
        <button className="back" onClick={() => router.push("/tasks/reconciliation")}>
          <ArrowLeft size={16} /> Назад до завдання
        </button>
        <header>
          <p className="eyebrow">ПОГОДЖЕННЯ · AI-БУХГАЛТЕР</p>
          <h1>
            Невідповідність
            <br />
            транзакції
          </h1>
          <p>24 800 ₴ · ТОВ «Вектор»</p>
        </header>
        <div className="reconciliation-approval-layout">
          <div>
            <ReconciliationException compact />
            <div className="approval-list-meta">
              <div>
                <span>ПРИЧИНА</span>
                <b>Різниця 2 000 ₴</b>
              </div>
              <div>
                <span>ПЕРЕДАВ</span>
                <b>AI-бухгалтер</b>
              </div>
              <div>
                <span>СТАТУС</span>
                <b>Очікує рішення</b>
              </div>
            </div>
          </div>
          <aside className="approval-recommendation">
            <p className="eyebrow">РЕКОМЕНДАЦІЯ AI</p>
            <h2>Позначити як виняток</h2>
            <p>Запросити підтвердний документ перед завершенням звірки. AI не виконав жодних фінансових змін.</p>
            <div className="decision-reason">
              <span>ЧОМУ AI НЕ ВИРІШИВ САМ</span>
              <p>Впевненість AI — 68%. Відхилення перевищує допустимий поріг, тому правило автономності вимагає рішення людини.</p>
            </div>
            {phase === "sending" ? (
              <div className="decision-resuming" aria-live="polite">
                <span className="sending-mark">
                  <i />
                  <i />
                </span>
                <b>Передаємо рішення AI-бухгалтеру…</b>
              </div>
            ) : (
              <ReconciliationActions onDecision={decide} />
            )}
            <div className="other-approval">
              <small>ІНШЕ АКТИВНЕ ПОГОДЖЕННЯ</small>
              {collaboration?.status === "approval" && (
                <button className="text-button" onClick={() => router.push("/approvals/payment-follow-up")}>
                  Follow-up для ТОВ «Орбіта» <ArrowRight size={14} />
                </button>
              )}
              <button className="text-button" onClick={() => router.push("/approvals/monthly-close")}>
                Запит документів для закриття місяця <ArrowRight size={14} />
              </button>
            </div>
          </aside>
        </div>
      </div>
    </Shell>
  );
}

function Workforce() {
  const router = useRouter();
  const { demoMode, employees, integrations, reconciliation, collaboration } = useWorkforce();

  const employeeStatus = (employee: CreatedEmployee) => {
    if (demoMode === "working" && employee.id === "accountant") return { tasks: 1, action: "Закриття серпня · 72%" };
    if (demoMode === "working" && employee.id === "sales-assistant") return { tasks: 1, action: "Повідомлення очікує погодження" };
    if (employee.id === "sales-assistant" && collaboration) return collaboration.status === "completed" ? { tasks: 0, action: "Follow-up завершено" } : { tasks: 1, action: collaboration.status === "approval" ? "Повідомлення очікує погодження" : "Опрацьовує завдання від AI-бухгалтера" };
    if (employee.id === "accountant" && collaboration) return { tasks: reconciliation?.status === "completed" ? 0 : 1, action: "Передав follow-up AI-асистенту з продажів" };
    return { tasks: reconciliation && reconciliation.status !== "completed" ? 1 : 0, action: reconciliation?.status === "completed" ? "Завершив звірку транзакцій" : reconciliation ? "Виконує звірку транзакцій" : `Приєднався до команди о ${employee.createdAt}` };
  };

  return (
    <Shell path="/workforce">
      <div className="page workforce-page">
        <header className="page-head">
          <div>
            <p className="eyebrow">ЦИФРОВА КОМАНДА</p>
            <h1>Ваша AI-команда</h1>
            <p>{employees.length ? "Спеціалізовані AI-працівники виконують роботу та передають контекст один одному." : "Додайте першого AI-працівника та визначте межі його роботи."}</p>
          </div>
          <button className={employees.length ? "secondary" : "primary"} onClick={() => router.push(employees.length ? "/workforce/new" : "/workforce/new")}><Plus size={17} /> Найняти AI-працівника</button>
        </header>
        {!employees.length ? (
          <section className="workforce-empty">
            <Identity color="blue" size="lg" />
            <div>
              <p className="eyebrow">ПЕРШИЙ КРОК</p>
              <h2>У вашій AI-команді ще немає працівників</h2>
              <p>Оберіть роль, обов’язки й рівень автономності. Критичні дії залишаться під вашим контролем.</p>
            </div>
            <button className="primary" onClick={() => router.push("/workforce/new")}>
              Найняти AI-працівника <ArrowRight size={16} />
            </button>
          </section>
        ) : (
          <section className={`workforce-grid ${employees.length === 1 ? "single-workforce-grid" : ""}`}>
            {employees.map((employee, index) => {
              const config = roleConfigs[employee.id];
              const scopedIntegrations = integrations.filter((item) => item.employeeId === employee.id);
              const state = employeeStatus(employee);
              return <motion.article className="created-worker-card" key={employee.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .06 }}>
              <div className="worker-card-top">
                <Identity color={config.color} size="lg" />
                <Status>АКТИВНИЙ</Status>
              </div>
              <h2>{employee.name}</h2>
              <p className="role">{employee.role}</p>
              <div className="objective">
                <span>РІВЕНЬ АВТОНОМНОСТІ</span>
                <b>{autonomyLabels[employee.autonomy]}</b>
                <div className="progress">
                  <i style={{ width: scopedIntegrations.length ? "100%" : "35%" }} />
                </div>
                <small>{scopedIntegrations.length ? `${scopedIntegrations.length} систем підключено` : "Потрібні робочі системи"}</small>
              </div>
              <div className="worker-facts">
                <span><b>{state.tasks}</b> активних завдань</span>
                <span>Останнє · {state.action}</span>
              </div>
              <button className="text-button" onClick={() => router.push(`/workforce/${employee.id}`)}>
                Відкрити робочий простір <ArrowRight size={15} />
              </button>
            </motion.article>})}
          </section>
        )}
      </div>
    </Shell>
  );
}

function IntegrationDialog({ definition, action, connection, onClose, onConnect, onDisconnect }: { definition: IntegrationDefinition; action: "connect" | "disconnect"; connection?: ConnectedIntegration; onClose: () => void; onConnect: (provider: string) => void; onDisconnect: () => void }) {
  const [provider, setProvider] = useState(definition.providers[0] || "");
  const [phase, setPhase] = useState<"select" | "checking" | "configuring" | "connected">("select");
  const panelRef = useRef<HTMLDivElement>(null);
  const firstTimer = useRef<number | null>(null);
  const secondTimer = useRef<number | null>(null);

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    const focusable = () => Array.from(panel?.querySelectorAll<HTMLElement>("button:not(:disabled), input:not(:disabled)") || []);
    focusable()[0]?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusable();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [onClose]);

  useEffect(
    () => () => {
      if (firstTimer.current) window.clearTimeout(firstTimer.current);
      if (secondTimer.current) window.clearTimeout(secondTimer.current);
    },
    [],
  );

  const createDemoConnection = () => {
    setPhase("checking");
    firstTimer.current = window.setTimeout(() => setPhase("configuring"), 450);
    secondTimer.current = window.setTimeout(() => {
      onConnect(provider);
      setPhase("connected");
    }, 950);
  };

  if (action === "disconnect")
    return (
      <div className="integration-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
        <div className="integration-dialog disconnect-dialog" ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="disconnect-title">
          <button className="dialog-close" onClick={onClose} aria-label="Закрити">
            <X size={18} />
          </button>
          <span className="dialog-icon">
            <Unplug size={20} />
          </span>
          <p className="eyebrow">КОНТРОЛЬ ДОСТУПУ</p>
          <h2 id="disconnect-title">Відключити цю систему?</h2>
          <p>AI-бухгалтер більше не використовуватиме це джерело даних у демо.</p>
          <div className="dialog-connection-name">
            <b>{definition.name}</b>
            <span>{connection?.provider}</span>
          </div>
          <footer>
            <button className="secondary" onClick={onClose}>
              Скасувати
            </button>
            <button className="primary disconnect-action" onClick={onDisconnect}>
              Відключити
            </button>
          </footer>
        </div>
      </div>
    );

  const phaseIndex = phase === "select" ? 0 : phase === "checking" ? 1 : phase === "configuring" ? 2 : 3;
  return (
    <div className="integration-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="integration-dialog" ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="connection-title">
        <button className="dialog-close" onClick={onClose} aria-label="Закрити">
          <X size={18} />
        </button>
        <p className="eyebrow">ТЕСТОВЕ ПІДКЛЮЧЕННЯ</p>
        <h2 id="connection-title">Підключити {definition.name.toLowerCase()}</h2>
        <p className="dialog-lede">У демо буде створено тестове підключення без доступу до реальних даних зовнішніх систем.</p>
        {phase === "select" ? (
          <>
            <fieldset className="provider-options">
              <legend>Оберіть демо-провайдера</legend>
              {definition.providers.map((item) => (
                <label key={item}>
                  <input type="radio" name="provider" value={item} checked={provider === item} onChange={() => setProvider(item)} />
                  <span className="radio-control">{provider === item && <i />}</span>
                  <b>{item}</b>
                </label>
              ))}
            </fieldset>
            <div className="demo-boundary">
              <ShieldCheck size={17} />
              <p>
                <b>Лише локальна імітація.</b>
                <br />
                Жодна авторизація, API або реальні бізнес-дані не використовуються.
              </p>
            </div>
            <footer>
              <button className="secondary" onClick={onClose}>
                Скасувати
              </button>
              <button className="primary" onClick={createDemoConnection}>
                Створити демо-підключення
              </button>
            </footer>
          </>
        ) : (
          <div className="connection-progress" aria-live="polite">
            <div className={phaseIndex > 1 ? "done" : phaseIndex === 1 ? "active" : ""}>
              <span>{phaseIndex > 1 ? <Check size={13} /> : "01"}</span>
              <p>Перевіряємо демо-доступ…</p>
            </div>
            <div className={phaseIndex > 2 ? "done" : phaseIndex === 2 ? "active" : ""}>
              <span>{phaseIndex > 2 ? <Check size={13} /> : "02"}</span>
              <p>Налаштовуємо джерело даних…</p>
            </div>
            <div className={phaseIndex === 3 ? "done" : ""}>
              <span>{phaseIndex === 3 ? <Check size={13} /> : "03"}</span>
              <p>Підключено</p>
            </div>
            {phase === "connected" && (
              <motion.div className="connection-complete" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                <b>{provider}</b>
                <span>Підключено · демо</span>
                <button className="primary" onClick={onClose}>
                  Готово
                </button>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function IntegrationsPanel({ employeeId }: { employeeId: EmployeeId }) {
  const { integrations, connectIntegration, disconnectIntegration } = useWorkforce();
  const config = roleConfigs[employeeId];
  const employeeIntegrations = integrations.filter((item) => item.employeeId === employeeId);
  const availableIntegrations = integrationCatalog.filter((definition) => definition.id !== "tax" && config.integrationIds.includes(definition.id));
  const [dialog, setDialog] = useState<{
    definition: IntegrationDefinition;
    action: "connect" | "disconnect";
  } | null>(null);
  const connectedCount = employeeIntegrations.length;

  const connect = (definition: IntegrationDefinition, provider: string) => {
    if (definition.id === "tax") return;
    connectIntegration({
      id: definition.id,
      employeeId,
      status: "connected",
      provider,
      connectedAt: new Date().toLocaleTimeString("uk-UA", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      metadata: definition.metadata,
    });
  };

  return (
    <section className="integrations-panel" id="connections" aria-labelledby={`connections-heading-${employeeId}`}>
      <header>
        <div>
          <p className="eyebrow">ПІДКЛЮЧЕННЯ</p>
          <h2 id={`connections-heading-${employeeId}`}>Робочі системи</h2>
          <p>Підключіть джерела даних, з якими {config.name} працюватиме під час виконання завдань.</p>
        </div>
        <div className="integration-count">
          <b>{connectedCount}</b>
          <span>
            систем
            <br />
            підключено
          </span>
        </div>
      </header>
      <div className="demo-notice">
        <ShieldCheck size={17} />
        <p>У демо підключення імітуються локально. Реальні інтеграції потребуватимуть окремої авторизації та API-доступу.</p>
      </div>
      <div className="integration-grid">
        {availableIntegrations.map((definition) => {
          const connection = employeeIntegrations.find((item) => item.id === definition.id);
          const Icon = definition.icon;
          return (
            <article className={`integration-card ${connection ? "connected" : ""} ${definition.comingSoon ? "unavailable" : ""}`} key={definition.id}>
              <div className="integration-card-top">
                <span className="connector-icon">
                  <Icon size={19} />
                </span>
                <span className={`connector-status ${connection ? "is-connected" : ""}`}>{connection ? "Підключено · демо" : definition.comingSoon ? "Скоро" : "Не підключено"}</span>
              </div>
              <h3>{definition.name}</h3>
              <p>{definition.description}</p>
              <ul className="connector-capabilities">
                {definition.capabilities.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              {connection && (
                <>
                  <div className="connector-data">
                    <b>{connection.provider}</b>
                    {connection.metadata.map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>
                  <div className="access-level">
                    <span>РІВЕНЬ ДОСТУПУ</span>
                    <b>{definition.access}</b>
                    <small>Виконання зовнішніх дій недоступне.</small>
                  </div>
                </>
              )}
              <footer>
                {definition.comingSoon ? (
                  <button className="secondary" disabled>
                    Недоступно в демо
                  </button>
                ) : connection ? (
                  <button className="secondary" onClick={() => setDialog({ definition, action: "disconnect" })}>
                    Відключити
                  </button>
                ) : (
                  <button className="primary" onClick={() => setDialog({ definition, action: "connect" })}>
                    Підключити
                  </button>
                )}
              </footer>
            </article>
          );
        })}
      </div>
      <aside className="access-control">
        <ShieldCheck size={21} />
        <div>
          <h3>Контроль доступу</h3>
          <p>AI використовує лише підключені джерела та працює в межах заданого рівня доступу. Критичні дії залишаються під контролем людини.</p>
        </div>
        <dl>
          <div>
            <dt>{connectedCount}</dt>
            <dd>систем підключено</dd>
          </div>
          <div>
            <dt>0</dt>
            <dd>систем із повним доступом</dd>
          </div>
        </dl>
      </aside>
      {dialog && (
        <IntegrationDialog
          definition={dialog.definition}
          action={dialog.action}
          connection={employeeIntegrations.find((item) => item.id === dialog.definition.id)}
          onClose={() => setDialog(null)}
          onConnect={(provider) => connect(dialog.definition, provider)}
          onDisconnect={() => {
            if (dialog.definition.id !== "tax") disconnectIntegration(employeeId, dialog.definition.id);
            setDialog(null);
          }}
        />
      )}
    </section>
  );
}

function Workspace({ employee = "accountant" }: { employee?: string }) {
  const router = useRouter();
  const { demoMode, employees, integrations, reconciliation, collaboration } = useWorkforce();
  const employeeId: EmployeeId = employee === "sales-assistant" ? "sales-assistant" : "accountant";
  const config = roleConfigs[employeeId];
  const hiredEmployee = employees.find((item) => item.id === employeeId) || null;
  const employeeIntegrations = integrations.filter((item) => item.employeeId === employeeId);
  const w = { ...config, objective: employeeId === "accountant" ? "Підготувати закриття серпня" : "Працювати з простроченими оплатами", progress: 68 };
  const [open, setOpen] = useState("work");
  const detailSections = [
    ["queue", ListChecks, "ЧЕРГА ЗАВДАНЬ"],
    ["activity", Activity, "ОСТАННЯ АКТИВНІСТЬ"],
    ["knowledge", FileCheck2, "ЗНАННЯ"],
    ["permissions", LockKeyhole, "ДОЗВОЛИ"],
  ] as const;
  const hasRequiredSources = employeeId === "accountant" ? employeeIntegrations.some((item) => item.id === "bank") && employeeIntegrations.some((item) => item.id === "accounting") : employeeIntegrations.some((item) => item.id === "crm") && employeeIntegrations.some((item) => item.id === "email");
  const readiness = employeeIntegrations.length === 0 ? "Потрібні підключення" : hasRequiredSources ? "Готовий до роботи" : "Частково готовий";
  const currentWork = demoMode === "working" && employeeId === "accountant" ? "Закриття серпня · 72%" : employeeId === "sales-assistant" && collaboration ? (collaboration.status === "completed" ? "Follow-up щодо простроченої оплати завершено" : "Follow-up для ТОВ «Орбіта»") : employeeId === "accountant" && collaboration ? "Передав прострочену оплату AI-асистенту з продажів" : autonomyLabels[hiredEmployee?.autonomy || "controlled"];
  const demoObjective = employeeId === "accountant" ? { title: "Закриття серпня", progress: 72, detail: "Перевіряє документи та фінансові записи" } : { title: collaboration?.status === "approval" ? "Follow-up очікує погодження" : "Робота з простроченими оплатами", progress: collaboration?.status === "completed" ? 100 : 82, detail: "ТОВ «Орбіта» · 48 000 ₴ · 12 днів" };

  const hiredDetails = (key: string) => {
    if (!hiredEmployee) return null;
    if (key === "queue")
      return (
        <div className="workspace-detail">
          <small>ПРИЗНАЧЕНІ ОБОВ’ЯЗКИ</small>
          <ul>
            {hiredEmployee.responsibilities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      );
    if (key === "activity")
      return (
        <div className="workspace-detail">
          <small>ОСТАННЯ АКТИВНІСТЬ</small>
          {employeeId === "sales-assistant" && collaboration ? (
            <>
              <div className="profile-activity-item"><b>Отримав завдання від AI-бухгалтера</b><p>{collaboration.startedAt} · ТОВ «Орбіта» · INV-1048</p></div>
              <div className="profile-activity-item"><b>Підготував follow-up</b><p>{collaboration.startedAt} · CRM та історію комунікації перевірено</p></div>
              {collaboration.status === "completed" && <div className="profile-activity-item"><b>Follow-up завершено</b><p>{collaboration.completedAt} · Демо-відправлення зафіксовано</p></div>}
            </>
          ) : employeeId === "accountant" && collaboration ? (
            <><b>Передав follow-up AI-асистенту з продажів</b><p>{collaboration.startedAt} · Прострочена оплата ТОВ «Орбіта»</p></>
          ) : (
            <><b>{config.name} приєднався до команди</b><p>Сьогодні о {hiredEmployee.createdAt}</p></>
          )}
        </div>
      );
    if (key === "permissions")
      return (
        <div className="workspace-detail">
          <small>ПРАВИЛА ПОГОДЖЕННЯ</small>
          <ul>
            {hiredEmployee.approvalRules.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>
            Ліміт без погодження: <b>{hiredEmployee.approvalLimit}</b>
          </p>
        </div>
      );
    return (
      <div className="workspace-detail">
        <small>ДЖЕРЕЛА ЗНАНЬ</small>
        <b>Базовий фінансовий контекст</b>
        <p>Демо-джерела готові до підключення.</p>
      </div>
    );
  };

  if (!hiredEmployee)
    return (
      <Shell path="/workforce">
        <div className="page workspace-page">
          <button className="back" onClick={() => router.push("/workforce")}>
            <ArrowLeft size={16} /> Команда
          </button>
          <section className="workforce-empty workspace-empty">
            <Identity color={config.color} size="lg" />
            <div>
              <p className="eyebrow">РОБОЧИЙ ПРОСТІР</p>
              <h1>Спочатку найміть {config.name.toLowerCase()}</h1>
              <p>Після налаштування тут з’являться його обов’язки, рівень автономності, підключення та поточна робота.</p>
            </div>
            <button className="primary" onClick={() => router.push("/workforce/new")}>
              Найняти AI-працівника <ArrowRight size={16} />
            </button>
          </section>
        </div>
      </Shell>
    );

  return (
    <Shell path="/workforce">
      <div className="page workspace-page">
        <button className="back" onClick={() => router.push("/workforce")}>
          <ArrowLeft size={16} /> Команда
        </button>
        <header className="workspace-hero">
          <Identity color={w.color} size="lg" />
          <div>
            <p className="eyebrow">РОБОЧИЙ ПРОСТІР AI-ПРАЦІВНИКА</p>
            <h1>{w.name}</h1>
            <p>{w.role}</p>
          </div>
          <Status>{hiredEmployee ? "АКТИВНИЙ" : "ПРАЦЮЄ"}</Status>
          <div className="workspace-objective">
            <span>{hiredEmployee ? "СТАТУС" : "ПОТОЧНА ЦІЛЬ"}</span>
            <h2>{demoMode === "working" ? demoObjective.title : hiredEmployee ? "Готовий до призначених завдань" : w.objective}</h2>
            <div className="progress">
              <i style={{ width: demoMode === "working" ? `${demoObjective.progress}%` : hiredEmployee ? "100%" : `${w.progress}%` }} />
            </div>
            <b>{demoMode === "working" ? `${demoObjective.progress}%` : hiredEmployee ? "100%" : `${w.progress}%`}</b>
            <p>
              <i /> {demoMode === "working" ? demoObjective.detail : hiredEmployee ? `${autonomyLabels[hiredEmployee.autonomy]} рівень автономності` : "Зараз: очікує на перевірку документів."}
            </p>
          </div>
        </header>
        <div className="workspace-metrics">
          <div>
            <span>ПІДКЛЮЧЕНІ СИСТЕМИ</span>
            <b>{employeeIntegrations.length}</b>
          </div>
          <div>
            <span>ГОТОВНІСТЬ ДО РОБОТИ</span>
            <b>{readiness}</b>
          </div>
          <div>
            <span>ПОВНИЙ ДОСТУП</span>
            <b>0 систем</b>
          </div>
        </div>
        {hiredEmployee && employeeIntegrations.length === 0 && (
          <aside className="first-connection-card">
            <div>
              <p className="eyebrow">НАСТУПНИЙ КРОК</p>
              <h2>Дайте {config.dativeName} робочі дані</h2>
              <p>Підключіть хоча б одну систему, щоб він міг виконувати реальні робочі сценарії в демо.</p>
            </div>
            <button className="primary" onClick={() => document.getElementById("connections")?.scrollIntoView({ behavior: "smooth" })}>
              Підключити першу систему <ArrowDown size={15} />
            </button>
          </aside>
        )}
        {hiredEmployee && hasRequiredSources && (
          <aside className="systems-ready-card">
            <div>
              <p className="eyebrow">ГОТОВИЙ ДО АВТОМАТИЧНОЇ РОБОТИ</p>
              <h2>{config.name} готовий до роботи</h2>
              <p>{employeeId === "sales-assistant" ? "CRM і Email підключено. AI може приймати завдання від інших працівників та готувати комунікацію в межах своїх правил." : "AI автоматично аналізує підключені джерела та знаходить завдання відповідно до своїх обов’язків."}</p>
            </div>
            <button className="primary" onClick={() => router.push("/office")}>
              {employeeId === "accountant" && reconciliation?.status === "completed" ? "Переглянути результат в AI-офісі" : "Перейти до AI-офісу"} <ArrowRight size={15} />
            </button>
          </aside>
        )}
        <section className="workspace-sections">
          <button className={open === "work" ? "open" : ""} onClick={() => setOpen(open === "work" ? "" : "work")} aria-expanded={open === "work"}>
            <span>
              <CircleGauge size={18} /> ПОТОЧНА РОБОТА
            </span>
            <ChevronDown size={17} />
          </button>
          {open === "work" && (
            <motion.div className="disclosure" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}>
              <div>
                <small>{collaboration ? "ПОТОЧНА РОБОТА" : "ГОТОВИЙ ДО РОБОТИ"}</small>
                <b>{currentWork}</b>
                <p>{collaboration && employeeId === "sales-assistant" ? "Отримано від AI-бухгалтера · ТОВ «Орбіта» · 48 000 ₴" : `${hiredEmployee.responsibilities.length} обов’язків · ${hiredEmployee.approvalRules.length} правил погодження`}</p>
              </div>
              {!hiredEmployee && (
                <button className="secondary" onClick={() => router.push("/tasks/monthly-close")}>
                  Відкрити завдання
                </button>
              )}
            </motion.div>
          )}
          {detailSections.map(([key, Icon, label]) => (
            <div className="workspace-section" key={key}>
              <button className={open === key ? "open" : ""} onClick={() => setOpen(open === key ? "" : key)} aria-expanded={open === key}>
                <span>
                  <Icon size={18} /> {label}
                </span>
                <ChevronDown size={17} />
              </button>
              {open === key && hiredEmployee && (
                <motion.div className="disclosure" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}>
                  {hiredDetails(key)}
                </motion.div>
              )}
            </div>
          ))}
        </section>
        <IntegrationsPanel employeeId={employeeId} />
      </div>
    </Shell>
  );
}

function CreateEmployee() {
  const router = useRouter();
  const { employees, hireEmployee } = useWorkforce();
  const initialRole: EmployeeId = employees.some((item) => item.id === "accountant") && !employees.some((item) => item.id === "sales-assistant") ? "sales-assistant" : "accountant";
  const [selectedRole, setSelectedRole] = useState<EmployeeId>(initialRole);
  const selectedConfig = roleConfigs[selectedRole];
  const [step, setStep] = useState(1);
  const [roleNotice, setRoleNotice] = useState("");
  const [responsibilities, setResponsibilities] = useState(selectedConfig.responsibilities.slice(0, selectedConfig.defaultResponsibilities));
  const [autonomy, setAutonomy] = useState<AutonomyLevel>("controlled");
  const [approvalRules, setApprovalRules] = useState(selectedConfig.approvalOptions.slice(0, selectedConfig.defaultApprovals));
  const [approvalLimit, setApprovalLimit] = useState("10 000 ₴");
  const [launchPhase, setLaunchPhase] = useState<"form" | "loading" | "success">("form");
  const roleAlreadyHired = employees.some((item) => item.id === selectedRole);
  const stepLabels = ["Роль", "Обов’язки", "Автономність", "Погодження", "Запуск"];
  const roles = [
    { key: "accountant", ...roleConfigs.accountant, badge: "Доступний", active: true },
    {
      key: "analyst",
      name: "AI-фінансовий аналітик",
      description: "Аналізує фінансові показники, готує прогнози та знаходить відхилення у фінансових даних.",
      badge: "Скоро",
      color: "teal",
      capabilities: [],
    },
    {
      key: "operations",
      name: "AI-операційний менеджер",
      description: "Контролює операційні процеси, дедлайни та виконання регулярних завдань.",
      badge: "Скоро",
      color: "indigo",
      capabilities: [],
    },
    { key: "sales-assistant", ...roleConfigs["sales-assistant"], badge: "Доступний", active: true },
  ];
  const autonomyOptions = [
    {
      key: "assistant" as const,
      name: "Асистент",
      description: "AI аналізує дані та готує рекомендації, але не виконує дії без підтвердження людини.",
      label: "Мінімальна автономність",
    },
    {
      key: "controlled" as const,
      name: "Контрольований",
      description: "AI самостійно виконує звичайні завдання, але запитує погодження для критичних дій.",
      label: "Рекомендовано",
    },
    {
      key: "autonomous" as const,
      name: "Автономний",
      description: "AI самостійно виконує більшість завдань і звертається до людини лише у виняткових ситуаціях.",
      label: "Висока автономність",
    },
  ];

  const toggleOption = (value: string, values: string[], setValues: (items: string[]) => void) => {
    setValues(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
  };
  const moveTo = (nextStep: number) => {
    setStep(nextStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const selectRole = (roleId: EmployeeId) => {
    if (employees.some((item) => item.id === roleId)) {
      setRoleNotice("Цей AI-працівник уже є у вашій команді.");
      return;
    }
    const config = roleConfigs[roleId];
    setSelectedRole(roleId);
    setResponsibilities(config.responsibilities.slice(0, config.defaultResponsibilities));
    setApprovalRules(config.approvalOptions.slice(0, config.defaultApprovals));
    setApprovalLimit(roleId === "accountant" ? "10 000 ₴" : "Не застосовується");
    setRoleNotice("");
  };
  const launchEmployee = () => {
    setLaunchPhase("loading");
    window.setTimeout(() => {
      const createdAt = new Date().toLocaleTimeString("uk-UA", {
        hour: "2-digit",
        minute: "2-digit",
      });
      hireEmployee({
        id: selectedRole,
        name: selectedConfig.name,
        role: selectedConfig.role,
        responsibilities,
        autonomy,
        approvalRules,
        approvalLimit,
        createdAt,
      });
      setLaunchPhase("success");
    }, 900);
  };

  if (launchPhase === "loading")
    return (
      <Shell path="/workforce">
        <div className="hire-result">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <span className="sending-mark">
              <i />
              <i />
            </span>
            <p>Налаштовуємо робоче середовище…</p>
            <small>Застосовуємо обов’язки, автономність і правила погодження.</small>
          </motion.div>
        </div>
      </Shell>
    );

  if (launchPhase === "success")
    return (
      <Shell path="/workforce">
        <div className="page hire-success">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <span className="approved-mark">
              <Check size={28} />
            </span>
            <p className="eyebrow">AI-ПРАЦІВНИК ГОТОВИЙ</p>
            <h1>
              {selectedConfig.name} приєднався
              <br />
              до вашої команди
            </h1>
            <p className="hire-success-copy">Він уже готовий виконувати призначені завдання та передаватиме вам критичні рішення на погодження.</p>
            <div className="hire-success-summary">
              <span>
                <b>{responsibilities.length}</b> обов’язків
              </span>
              <span>
                <b>{autonomyLabels[autonomy]}</b> рівень автономності
              </span>
              <span>
                <b>{approvalRules.length}</b> правила погодження
              </span>
              <span>
                <b>Активний</b> статус
              </span>
            </div>
            <div className="hire-actions">
              <button className="primary" onClick={() => router.push(`/workforce/${selectedRole}#connections`)}>
                Підключити робочі системи <ArrowRight size={16} />
              </button>
              <button className="secondary" onClick={() => router.push(`/workforce/${selectedRole}`)}>
                Переглянути AI-працівника
              </button>
            </div>
          </motion.div>
        </div>
      </Shell>
    );

  return (
    <Shell path="/workforce">
      <div className="page create-page hire-flow">
        <button className="back" onClick={() => (step === 1 ? router.push("/workforce") : moveTo(step - 1))}>
          <ArrowLeft size={16} /> {step === 1 ? "Команда" : "Назад"}
        </button>
        <nav className="hire-stepper" aria-label="Етапи наймання AI-працівника">
          <ol>
            {stepLabels.map((label, index) => (
              <li key={label} className={step === index + 1 ? "active" : step > index + 1 ? "complete" : ""} aria-current={step === index + 1 ? "step" : undefined}>
                <b>{step > index + 1 ? <Check size={12} /> : index + 1}</b>
                <span>{label}</span>
              </li>
            ))}
          </ol>
        </nav>
        <p className="hire-step-caption">
          Крок {step} з 5 · {stepLabels[step - 1]}
        </p>
        <AnimatePresence mode="wait">
          <motion.section className="hire-stage" key={step} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.2 }}>
            {step === 1 && (
              <>
                <header className="hire-heading">
                  <p className="eyebrow">КРОК 01 · РОЛЬ</p>
                  <h1>Кого ви хочете додати до команди?</h1>
                  <p>Оберіть роль AI-працівника. Налаштування та рівень автономності можна буде змінити пізніше.</p>
                </header>
                <div className="role-options">
                  {roles.map((role) => {
                    const activeRole = role.key === "accountant" || role.key === "sales-assistant";
                    const isSelected = activeRole && selectedRole === role.key;
                    return <button type="button" key={role.key} className={`role-option ${isSelected ? "selected" : activeRole ? "" : "coming"}`} aria-pressed={isSelected} onClick={() => activeRole ? selectRole(role.key as EmployeeId) : setRoleNotice("Ця роль поки недоступна в демо. Оберіть одну з доступних ролей.")}>
                      <div className="role-option-top">
                        <Identity color={role.color} />
                        <span className={activeRole ? "available" : "soon"}>{role.badge}</span>
                      </div>
                      <h2>{role.name}</h2>
                      <p>{role.description}</p>
                      {role.capabilities && (
                        <ul>
                          {role.capabilities.map((item) => (
                            <li key={item}>
                              <Check size={12} /> {item}
                            </li>
                          ))}
                        </ul>
                      )}
                    </button>;
                  })}
                </div>
                <p className={`role-notice ${roleNotice ? "visible" : ""}`} role="status" aria-live="polite">
                  {roleNotice || (roleAlreadyHired ? "Цей AI-працівник уже є у вашій команді." : `${selectedConfig.name} обраний і готовий до налаштування.`)}
                </p>
              </>
            )}

            {step === 2 && (
              <>
                <header className="hire-heading">
                  <p className="eyebrow">КРОК 02 · ОБОВ’ЯЗКИ</p>
                  <h1>Що має робити {selectedConfig.name}?</h1>
                  <p>Оберіть завдання, за які AI-працівник відповідатиме у вашій команді.</p>
                </header>
                <div className="choice-layout">
                  <fieldset className="check-list">
                    <legend className="sr-only">Обов’язки {selectedConfig.name}</legend>
                    {selectedConfig.responsibilities.map((item) => (
                      <label key={item}>
                        <input type="checkbox" checked={responsibilities.includes(item)} onChange={() => toggleOption(item, responsibilities, setResponsibilities)} />
                        <span className="check-control">
                          <Check size={13} />
                        </span>
                        <b>{item}</b>
                      </label>
                    ))}
                  </fieldset>
                  <aside className="choice-summary">
                    <span>ОБРАНО</span>
                    <b>
                      {responsibilities.length} {responsibilities.length === 1 ? "обов’язок" : "обов’язків"}
                    </b>
                    <p>Обрані завдання сформують робочу зону відповідальності {selectedConfig.genitiveName}.</p>
                  </aside>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <header className="hire-heading">
                  <p className="eyebrow">КРОК 03 · АВТОНОМНІСТЬ</p>
                  <h1>Як самостійно може працювати AI-працівник?</h1>
                  <p>Ви контролюєте, які рішення AI може приймати самостійно.</p>
                </header>
                <div className="hire-autonomy-options">
                  {autonomyOptions.map((option) => (
                    <button type="button" key={option.key} className={autonomy === option.key ? "selected" : ""} aria-pressed={autonomy === option.key} onClick={() => setAutonomy(option.key)}>
                      <span className="radio-control">{autonomy === option.key && <i />}</span>
                      <small>{option.label}</small>
                      <h2>{option.name}</h2>
                      <p>{option.description}</p>
                    </button>
                  ))}
                </div>
                <p className="hire-note">
                  <ShieldCheck size={17} /> Рівень автономності можна змінити у налаштуваннях AI-працівника у будь-який момент.
                </p>
              </>
            )}

            {step === 4 && (
              <>
                <header className="hire-heading">
                  <p className="eyebrow">КРОК 04 · ПОГОДЖЕННЯ</p>
                  <h1>Які дії потребують вашого погодження?</h1>
                  <p>AI зупинить виконання та передасть рішення вам перед критичною дією.</p>
                </header>
                <div className="choice-layout approval-choice-layout">
                  <fieldset className="check-list">
                    <legend className="sr-only">Дії, що потребують погодження</legend>
                    {selectedConfig.approvalOptions.map((item) => (
                      <label key={item}>
                        <input type="checkbox" checked={approvalRules.includes(item)} onChange={() => toggleOption(item, approvalRules, setApprovalRules)} />
                        <span className="check-control">
                          <Check size={13} />
                        </span>
                        <b>{item}</b>
                      </label>
                    ))}
                  </fieldset>
                  {selectedRole === "accountant" && <aside className="limit-panel">
                    <label htmlFor="approval-limit">Ліміт операції без погодження</label>
                    <input id="approval-limit" value={approvalLimit} onChange={(event) => setApprovalLimit(event.target.value)} inputMode="numeric" />
                    <p>Операції вище цього ліміту автоматично передаватимуться вам на погодження.</p>
                  </aside>}
                </div>
              </>
            )}

            {step === 5 && (
              <>
                <header className="hire-heading">
                  <p className="eyebrow">КРОК 05 · ПЕРЕВІРКА І ЗАПУСК</p>
                  <h1>{selectedConfig.name} готовий до роботи</h1>
                  <p>Перевірте налаштування перед запуском.</p>
                </header>
                <div className="review-card">
                  <div className="review-identity">
                    <Identity color={selectedConfig.color} size="lg" />
                    <div>
                      <span>РОЛЬ</span>
                      <h2>{selectedConfig.name}</h2>
                      <p>{selectedConfig.role}</p>
                    </div>
                    <Status>ГОТОВИЙ ДО ЗАПУСКУ</Status>
                  </div>
                  <dl>
                    <div>
                      <dt>Обов’язки</dt>
                      <dd>
                        <b>{responsibilities.length} обов’язків</b>
                        <ul>
                          {responsibilities.slice(0, 5).map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                    <div>
                      <dt>Рівень автономності</dt>
                      <dd>
                        <b>{autonomyLabels[autonomy]}</b>
                      </dd>
                    </div>
                    <div>
                      <dt>Погодження</dt>
                      <dd>
                        <b>
                          {approvalRules.length} {approvalRules.length === 1 ? "тип критичних дій" : "типи критичних дій"}
                        </b>
                      </dd>
                    </div>
                    {selectedRole === "accountant" && <div>
                      <dt>Ліміт</dt>
                      <dd>
                        <b>{approvalLimit}</b>
                      </dd>
                    </div>}
                  </dl>
                  <div className="ready-block">
                    <CheckCircle2 size={18} />
                    <div>
                      <b>Готовий до запуску</b>
                      <span>Усі необхідні межі роботи визначено.</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            <footer className="hire-footer">
              <button className="secondary" type="button" onClick={() => (step === 1 ? router.push("/workforce") : moveTo(step - 1))}>
                Назад
              </button>
              {step < 5 ? (
                <button className="primary" type="button" disabled={(step === 1 && roleAlreadyHired) || (step === 2 && responsibilities.length === 0)} onClick={() => moveTo(step + 1)}>
                  Продовжити <ArrowRight size={16} />
                </button>
              ) : (
                <button className="primary" type="button" onClick={launchEmployee}>
                  Запустити AI-працівника <ArrowRight size={16} />
                </button>
              )}
            </footer>
          </motion.section>
        </AnimatePresence>
      </div>
    </Shell>
  );
}

const salesDraft = (version: 1 | 2, reason?: string | null) => version === 2
  ? reason === "Не згадувати суму"
    ? "Добрий день! Нагадуємо про рахунок INV-1048, термін оплати якого минув 12 днів тому. Підкажіть, будь ласка, чи потрібні додаткові документи або уточнення для проведення оплати?"
    : reason === "Додати конкретний термін"
      ? "Добрий день! Нагадуємо про рахунок INV-1048 на суму 48 000 ₴. Будемо вдячні, якщо ви повідомите очікувану дату оплати до кінця цього тижня або підкажете, які уточнення потрібні."
      : "Добрий день! Хотіли делікатно уточнити статус рахунку INV-1048 на суму 48 000 ₴. Якщо для оплати потрібні додаткові документи чи пояснення, будь ласка, повідомте — ми оперативно допоможемо."
  : "Добрий день! Нагадуємо про рахунок INV-1048 на суму 48 000 ₴, термін оплати якого минув 12 днів тому. Підкажіть, будь ласка, чи можемо ми допомогти з уточненням деталей або документів для проведення оплати?";

function SalesTask() {
  const router = useRouter();
  const { employees, integrations, collaboration } = useWorkforce();
  const hasSales = employees.some((item) => item.id === "sales-assistant");
  const salesIntegrations = integrations.filter((item) => item.employeeId === "sales-assistant");
  const hasCrm = salesIntegrations.some((item) => item.id === "crm");
  const hasEmail = salesIntegrations.some((item) => item.id === "email");
  if (!hasSales) return <Shell path="/tasks/payment-follow-up"><div className="page task-data-gate"><Users size={27} /><p className="eyebrow">ПОТРІБЕН AI-ПРАЦІВНИК</p><h1>Немає AI-працівника для роботи з клієнтом</h1><p>Найміть AI-асистента з продажів, щоб отримувати завдання від AI-бухгалтера.</p><button className="primary" onClick={() => router.push("/workforce/new")}>Найняти AI-асистента з продажів</button></div></Shell>;
  if (!hasCrm || !hasEmail) return <Shell path="/tasks/payment-follow-up"><div className="page task-data-gate"><Database size={27} /><p className="eyebrow">НЕДОСТАТНЬО ДАНИХ</p><h1>{!hasCrm ? "Підключіть CRM" : "Підключіть Email"}</h1><p>{!hasCrm ? "Для цього завдання AI-асистенту з продажів потрібен доступ до CRM." : "Для демо follow-up підключіть Email."}</p><button className="primary" onClick={() => router.push("/workforce/sales-assistant#connections")}>Перейти до підключень</button></div></Shell>;
  if (!collaboration) return <Shell path="/tasks/payment-follow-up"><div className="hire-result"><div><span className="sending-mark"><i /><i /></span><p>AI-команда готує передачу контексту…</p></div></div></Shell>;

  const completed = collaboration.status === "completed";
  const approval = collaboration.status === "approval";
  const workflow = [
    ["Отримання контексту", "AI-бухгалтер передав дані про прострочений рахунок", "ЗАВЕРШЕНО"],
    ["Перевірка CRM", "Клієнт активний · 3 роки співпраці", "ЗАВЕРШЕНО"],
    ["Перевірка історії комунікації", "Останній контакт — 6 днів тому", "ЗАВЕРШЕНО"],
    ["Підготовка follow-up", collaboration.draftVersion === 2 ? "Повідомлення оновлено після зворотного зв’язку" : "Повідомлення підготовлено", "ЗАВЕРШЕНО"],
    ["Погодження людини", completed ? "Погоджено людиною" : approval ? "Очікує вашого рішення" : "У роботі", completed ? "ЗАВЕРШЕНО" : approval ? "ОЧІКУЄ" : "У РОБОТІ"],
    ["Завершення", completed ? "Демо-відправлення зафіксовано" : "Продовжить після рішення людини", completed ? "ЗАВЕРШЕНО" : "ОЧІКУЄ"],
  ];
  return <Shell path="/tasks/payment-follow-up"><div className="page sales-task-page"><div className="task-toolbar"><button className="back" onClick={() => router.push("/office")}><ArrowLeft size={16} /> Назад до AI-офісу</button></div><header className="sales-task-head"><div><p className="eyebrow">СПІЛЬНЕ ЗАВДАННЯ · ПЕРЕДАЧА МІЖ AI</p><h1>Follow-up щодо<br />простроченої оплати</h1><p>AI-асистент з продажів отримав завдання від AI-бухгалтера та готує комунікацію з клієнтом.</p></div><Status tone={approval ? "waiting" : "live"}>{completed ? "ЗАВЕРШЕНО" : approval ? "ОЧІКУЄ РІШЕННЯ" : "AI-КОМАНДА ПРАЦЮЄ"}</Status></header>
    <section className="handoff-context"><Identity color="blue" /><div><span>ПЕРЕДАНО ВІД AI-БУХГАЛТЕРА</span><h2>ТОВ «Орбіта» · INV-1048</h2><p>48 000 ₴ · 12 днів прострочення · не оплачено</p></div><ArrowRight size={18} /><Identity color="green" /><div><span>ОТРИМАВ</span><h2>AI-асистент з продажів</h2><p>CRM + Email</p></div></section>
    <aside className="access-boundary"><ShieldCheck size={18} /><div><b>Доступ до фінансових даних</b><p>AI-асистент з продажів не має прямого доступу до банківської системи. Він отримав лише контекст цього завдання від AI-бухгалтера.</p></div></aside>
    <div className="sales-task-layout"><section className="sales-workflow"><p className="eyebrow">ХІД РОБОТИ</p>{workflow.map((step, index) => <article className={step[2] === "ОЧІКУЄ" ? "waiting" : step[2] === "У РОБОТІ" ? "current" : "complete"} key={step[0]}><span>{String(index + 1).padStart(2,"0")}</span><div><small>{step[2]}</small><h3>{step[0]}</h3><p>{step[1]}</p></div>{step[2] === "ЗАВЕРШЕНО" ? <CheckCircle2 size={17} /> : <i />}</article>)}</section><aside className="client-context"><p className="eyebrow">КОНТЕКСТ КЛІЄНТА · ДЕМО-ДАНІ</p><h2>ТОВ «Орбіта»</h2><dl><div><dt>Співпраця</dt><dd>3 роки</dd></div><div><dt>Попередні рахунки</dt><dd>17 оплачено</dd></div><div><dt>Попередні затримки</dt><dd>2</dd></div><div><dt>Останній контакт</dt><dd>6 днів тому</dd></div><div><dt>Активна угода</dt><dd>Так</dd></div></dl></aside></div>
    <section className="sales-message"><header><div><p className="eyebrow">ПІДГОТОВЛЕНЕ ПОВІДОМЛЕННЯ</p><h2>Follow-up для ТОВ «Орбіта»</h2></div><Status tone={completed ? "quiet" : "waiting"}>{completed ? "ЗАФІКСОВАНО В ДЕМО" : "НЕ НАДІСЛАНО"}</Status></header><p>{salesDraft(collaboration.draftVersion, collaboration.revisionReason)}</p><footer><span>Підготовлено AI на основі CRM, історії комунікації та контексту від AI-бухгалтера.</span>{approval && <button className="primary" onClick={() => router.push("/approvals/payment-follow-up")}>Переглянути рішення <ArrowRight size={15} /></button>}</footer></section>
    <section className="handoff-history"><p className="eyebrow">ІСТОРІЯ ПЕРЕДАЧІ РОБОТИ</p>{collaboration.activities.map((item) => <article key={item.id}><time>{item.time}</time><i /><div><b>{item.actor}</b><p>{item.text}</p><small>{item.detail}</small></div></article>)}</section>
    {completed && <section className="sales-result"><CheckCircle2 size={23} /><div><p className="eyebrow">FOLLOW-UP ЗАВЕРШЕНО</p><h2>Спільну роботу завершено</h2><ul><li>Контекст передано AI-бухгалтером</li><li>CRM перевірено AI-асистентом з продажів</li><li>Повідомлення підготовлено AI</li><li>1 рішення прийнято людиною</li><li>Демо-відправлення зафіксовано</li></ul><p>Жодне реальне повідомлення не надсилалося.</p></div><button className="primary" onClick={() => router.push("/office")}>Повернутися до AI-офісу <ArrowRight size={15} /></button></section>}
  </div></Shell>;
}

function SalesApproval() {
  const router = useRouter();
  const { collaboration, decideCollaboration, requestCollaborationRevision } = useWorkforce();
  const [phase, setPhase] = useState<"ready" | "sending">("ready");
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [revisionReason, setRevisionReason] = useState("Зробити тон м’якшим");
  useEffect(() => {
    if (collaboration?.status !== "approval") return;
    const timer = window.setTimeout(() => setRevisionOpen(false), 0);
    return () => window.clearTimeout(timer);
  }, [collaboration?.draftVersion, collaboration?.status]);
  if (!collaboration) return <Shell path="/approvals/payment-follow-up"><div className="page empty-approval"><p className="eyebrow">ПОГОДЖЕННЯ</p><h1>Follow-up ще не підготовлено</h1><p>Спочатку AI-команда має отримати необхідні робочі системи.</p><button className="primary" onClick={() => router.push("/office")}>Повернутися до AI-офісу</button></div></Shell>;
  if (collaboration.status === "revision") return <Shell path="/approvals/payment-follow-up"><div className="approval-result"><div><span className="sending-mark"><i /><i /></span><p>AI-асистент з продажів оновлює повідомлення…</p><small>{collaboration.revisionReason}</small></div></div></Shell>;
  if (collaboration.status === "resuming") return <Shell path="/approvals/payment-follow-up"><div className="approval-result"><div><span className="sending-mark"><i /><i /></span><p>Фіксуємо демо-відправлення…</p><small>Жодне повідомлення не надсилається у зовнішню систему.</small></div></div></Shell>;
  if (collaboration.status === "completed") return <Shell path="/approvals/payment-follow-up"><div className="approval-result"><div><span className="approved-mark"><Check size={28} /></span><h1>Follow-up завершено</h1><p>Демо-відправлення зафіксовано.</p><small>Реальний email не надсилався.</small><div><button className="secondary" onClick={() => router.push("/tasks/payment-follow-up")}>Переглянути результат</button><button className="primary" onClick={() => router.push("/office")}>Повернутися до AI-офісу <ArrowRight size={15} /></button></div></div></div></Shell>;
  const approve = () => { setPhase("sending"); window.setTimeout(() => decideCollaboration("approved"), 500); };
  const reasons = ["Зробити тон м’якшим", "Додати конкретний термін", "Не згадувати суму", "Інше"];
  return (
    <Shell path="/approvals/payment-follow-up">
      <div className="page sales-approval-page">
        <button className="back" onClick={() => router.push("/tasks/payment-follow-up")}><ArrowLeft size={16} /> Назад до завдання</button>
        <header>
          <p className="eyebrow">ПОГОДЖЕННЯ · AI-АСИСТЕНТ З ПРОДАЖІВ</p>
          <h1>Повідомлення клієнту<br />щодо простроченої оплати</h1>
          <p>ТОВ «Орбіта» · 48 000 ₴</p>
        </header>
        <div className="sales-approval-layout">
          <section className="sales-message approval-draft">
            <header>
              <div><p className="eyebrow">ПІДГОТОВЛЕНО AI</p><h2>Follow-up щодо INV-1048</h2></div>
              <Status tone="waiting">НЕ НАДІСЛАНО</Status>
            </header>
            <p>{salesDraft(collaboration.draftVersion, collaboration.revisionReason)}</p>
            <footer><span>Автор: AI-асистент з продажів · Джерело фінансового контексту: AI-бухгалтер</span></footer>
          </section>
          <aside className="sales-decision">
            <p className="eyebrow">ЧОМУ ПОТРІБНЕ ВАШЕ РІШЕННЯ</p>
            <h2>Це зовнішня комунікація з клієнтом</h2>
            <p>Для AI-асистента з продажів налаштовано правило погодження перед надсиланням повідомлень.</p>
            <div className="demo-boundary"><ShieldCheck size={17} /><p><b>Демо: повідомлення не надсилається у зовнішню систему.</b><br />Після погодження буде зафіксовано лише результат сценарію.</p></div>
            {phase === "sending" ? (
              <div className="decision-resuming"><span className="sending-mark"><i /><i /></span><b>Передаємо рішення AI-асистенту з продажів…</b></div>
            ) : revisionOpen ? (
              <fieldset className="revision-options">
                <legend>Що потрібно змінити?</legend>
                {reasons.map((reason) => <label key={reason}><input type="radio" name="revision-reason" checked={revisionReason === reason} onChange={() => setRevisionReason(reason)} /><span className="radio-control">{revisionReason === reason && <i />}</span><b>{reason}</b></label>)}
                <div><button className="secondary" onClick={() => setRevisionOpen(false)}>Скасувати</button><button className="primary" onClick={() => requestCollaborationRevision(revisionReason)}>Передати на доопрацювання</button></div>
              </fieldset>
            ) : (
              <div className="sales-approval-actions">
                {collaboration.approvalStatus === "deferred" && <p role="status">Рішення відкладено. Завдання залишається відкритим.</p>}
                <button className="primary" onClick={approve}>Погодити та надіслати в демо</button>
                <button className="secondary" onClick={() => setRevisionOpen(true)}>Повернути на доопрацювання</button>
                <button className="ghost" onClick={() => decideCollaboration("deferred")}>Відкласти</button>
              </div>
            )}
          </aside>
        </div>
      </div>
    </Shell>
  );
}

export function NovaApp({ screen }: { screen: string[] }) {
  if (!screen.length) return <Intro />;
  if (screen[0] === "office") return <Dashboard />;
  if (screen[0] === "tasks" && screen[1] === "reconciliation") return <ReconciliationTask />;
  if (screen[0] === "tasks" && screen[1] === "payment-follow-up") return <SalesTask />;
  if (screen[0] === "tasks") return <MonthlyCloseTask />;
  if (screen[0] === "approvals" && screen[1] === "reconciliation") return <ReconciliationApproval />;
  if (screen[0] === "approvals" && screen[1] === "payment-follow-up") return <SalesApproval />;
  if (screen[0] === "approvals") return <MonthlyCloseApproval />;
  if (screen[0] === "workforce" && screen[1] === "new") return <CreateEmployee />;
  if (screen[0] === "workforce" && screen[1]) return <Workspace employee={screen[1]} />;
  if (screen[0] === "workforce") return <Workforce />;
  return <Dashboard />;
}
