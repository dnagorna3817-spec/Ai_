"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Activity, ArrowDown, ArrowLeft, ArrowRight, Check, CheckCircle2, BookOpen, Building2, ChevronDown, CircleGauge, Database, FileCheck2, Files, Landmark, LayoutGrid, ListChecks, LockKeyhole, Mail, Plus, RefreshCcw, Search, ShieldCheck, Unplug, Users, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { type AutonomyLevel, type ConnectedIntegration, type CreatedEmployee, type IntegrationId, type ReconciliationDecision, type ReconciliationState, useWorkforce } from "./workforce-state";

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
    key: "tax",
    name: "Податковий асистент",
    role: "Податки та комплаєнс",
    color: "teal",
    status: "МОНІТОРИТЬ",
    objective: "Перевірити зобов’язання за вересень",
    progress: 84,
    action: "Підтверджено строк сплати ПДВ",
    tasks: 4,
  },
  {
    key: "documents",
    name: "Фахівець із документів",
    role: "Документи та перевірка",
    color: "indigo",
    status: "ПРАЦЮЄ",
    objective: "Перевірити відсутні рахунки",
    progress: 42,
    action: "Виявлено 3 відсутні документи",
    tasks: 9,
  },
  {
    key: "client",
    name: "Клієнтська комунікація",
    role: "Робота з клієнтами",
    color: "green",
    status: "ОЧІКУЄ ВАШОГО РІШЕННЯ",
    objective: "Запит документів підготовлено",
    progress: 100,
    action: "Підготовлено запит для Мілоша К.",
    tasks: 5,
  },
];

const nav = [
  ["/office", "AI-офіс", LayoutGrid],
  ["/workforce", "Команда", Users],
  ["/tasks/monthly-close", "Завдання", ListChecks],
  ["/approvals/monthly-close", "Погодження", CheckCircle2],
] as const;

const responsibilityOptions = ["Звіряти банківські транзакції", "Контролювати рахунки та платежі", "Готувати закриття місяця", "Шукати фінансові невідповідності", "Готувати фінансові звіти", "Контролювати прострочені оплати клієнтів", "Перевіряти наявність необхідних документів"];

const approvalOptions = ["Проведення або ініціювання платежів", "Податкові дії", "Незвичні або підозрілі транзакції", "Надсилання документів клієнтам", "Зміни фінансових даних", "Операції понад встановлений ліміт"];

const autonomyLabels: Record<AutonomyLevel, string> = {
  assistant: "Асистент",
  controlled: "Контрольований",
  autonomous: "Автономний",
};

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
  const { approved, createdEmployee, reconciliation, resetDemo } = useWorkforce();
  const [resetOpen, setResetOpen] = useState(false);
  const reconciliationWaiting = reconciliation?.status === "exception" ? 1 : 0;
  const approvalCount = createdEmployee ? (approved ? 0 : 1) + reconciliationWaiting : 0;
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
          <h1>AI-працівники, які виконують роботу — не лише відповідають на запитання.</h1>
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
        <span>Чотири фахівці.</span>
        <span>Одна злагоджена команда.</span>
        <span>Ви зберігаєте контроль.</span>
      </footer>
    </main>
  );
}

function TeamCell({ worker }: { worker: (typeof workers)[number] }) {
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
    </motion.article>
  );
}

function getExecutiveMetrics(createdEmployee: CreatedEmployee | null, integrations: ConnectedIntegration[], reconciliation: ReconciliationState | null) {
  const hasDecision = reconciliation?.humanDecision === "approved" || reconciliation?.humanDecision === "accepted";
  return {
    activeEmployees: createdEmployee ? 1 : 0,
    completedTasks: reconciliation?.status === "completed" ? 1 : 0,
    automatedActions: reconciliation ? 11 : 0,
    humanDecisions: hasDecision ? 1 : 0,
    pendingDecisions: reconciliation?.status === "exception" ? 1 : 0,
    connectedSystems: integrations.length,
    estimatedMinutesSaved: reconciliation?.status === "completed" ? 23 : 0,
  };
}

function ExecutiveOverview() {
  const router = useRouter();
  const { approved, createdEmployee, integrations, reconciliation } = useWorkforce();
  const metrics = getExecutiveMetrics(createdEmployee, integrations, reconciliation);
  const hasBank = integrations.some((item) => item.id === "bank");
  const hasAccounting = integrations.some((item) => item.id === "accounting");
  const hasCrm = integrations.some((item) => item.id === "crm");
  const hasRequiredSources = hasBank && hasAccounting;
  const completed = reconciliation?.status === "completed";
  const pendingException = reconciliation?.status === "exception";
  const resolvedDecision = reconciliation?.humanDecision === "approved" || reconciliation?.humanDecision === "accepted";
  const executiveSummary = !createdEmployee ? "Додайте першого AI-працівника, щоб делегувати регулярну операційну роботу." : !hasRequiredSources ? "AI-бухгалтер налаштований, але ще не має всіх робочих джерел даних." : completed ? "AI-бухгалтер самостійно перевірив 12 транзакцій, автоматично звірив 11 і передав одну невідповідність вам на рішення." : "AI-бухгалтер самостійно виконує фінансові завдання та передає вам лише рішення, які потребують людського контролю.";

  if (!createdEmployee)
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
        ["Перевірив доступні документи", integrations.some((item) => item.id === "documents") ? "ДОКУМЕНТИ · АВТОМАТИЧНО" : "ДОСТУПНІ ДАНІ"],
        ["Виявив 1 фінансову невідповідність", "ПЕРЕДАНО ЛЮДИНІ"],
      ]
    : [];
  const totalPending = (approved ? 0 : 1) + (pendingException ? 1 : 0);

  return (
    <section className="executive-overview" aria-labelledby="executive-title">
      <header className="executive-lead">
        <div>
          <p className="eyebrow">ОГЛЯД РОБОТИ</p>
          <h2 id="executive-title">AI-команда сьогодні</h2>
          <p>{executiveSummary}</p>
        </div>
        {!hasRequiredSources ? (
          <button className="primary" onClick={() => router.push("/workforce/accountant#connections")}>
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
          <small>{metrics.activeEmployees ? "працює зараз" : "ще не додано"}</small>
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
              <p>{createdEmployee ? "Підключіть банк і бухгалтерську систему, щоб AI міг самостійно знайти роботу." : "Після найму тут з’явиться стислий підсумок виконаних AI дій."}</p>
            </div>
          )}
        </section>
        <aside className={`human-involvement ${pendingException ? "is-pending" : ""}`}>
          <p className="eyebrow">ДЕ БУЛА ПОТРІБНА ВАША УЧАСТЬ</p>
          {pendingException ? (
            <>
              <strong>1 рішення очікує</strong>
              <h3>Невідповідність транзакції</h3>
              <p>24 800 ₴ · різниця 2 000 ₴</p>
              <button className="primary" onClick={() => router.push("/approvals/reconciliation")}>
                Переглянути рішення <ArrowRight size={15} />
              </button>
            </>
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
          {pendingException ? (
            <div>
              <span>РІШЕННЯ ЛЮДИНИ</span>
              <h3>Невідповідність транзакції · 2 000 ₴</h3>
              <p>AI призупинив звірку до вашого рішення.</p>
              <button className="text-button" onClick={() => router.push("/approvals/reconciliation")}>
                Переглянути <ArrowRight size={14} />
              </button>
            </div>
          ) : !createdEmployee ? (
            <div>
              <h3>Потрібен перший AI-працівник</h3>
              <p>Налаштуйте роль, обов’язки та межі автономності.</p>
            </div>
          ) : !hasRequiredSources ? (
            <div>
              <span>БЛОКУЄ АВТОМАТИЧНИЙ СТАРТ</span>
              <h3>Підключіть робочі джерела</h3>
              <p>Для звірки потрібні банк і бухгалтерська система.</p>
              <button className="text-button" onClick={() => router.push("/workforce/accountant#connections")}>
                Підключити системи <ArrowRight size={14} />
              </button>
            </div>
          ) : !approved ? (
            <div>
              <span>ПОГОДЖЕННЯ</span>
              <h3>Запит документів для закриття місяця</h3>
              <p>Клієнтська комунікація очікує дозволу на надсилання.</p>
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
                <button className="text-button" onClick={() => router.push("/workforce/accountant#connections")}>
                  Підключити CRM <ArrowRight size={14} />
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

function Dashboard() {
  const router = useRouter();
  const { approved, createdEmployee, integrations, reconciliation } = useWorkforce();
  const accountantState =
    reconciliation?.status === "completed"
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
  const officeWorkers = [accountantState];
  const activities = [
    ...(createdEmployee
      ? [
          {
            time: "09:42",
            actor: "AI-бухгалтер",
            text: "Проаналізував 48 серпневих транзакцій.",
            kind: "AI ACTION",
          },
          {
            time: "09:46",
            actor: "AI-бухгалтер",
            text: "Виявив 3 відсутні первинні документи.",
            kind: "AI ACTION",
          },
          {
            time: "09:47",
            actor: "Передача",
            text: "Завдання автоматично передано Фахівцю із документів.",
            kind: "HANDOFF",
          },
          {
            time: "09:51",
            actor: "Фахівець із документів",
            text: "Перевірив доступні документи та визначив 3 відсутні рахунки.",
            kind: "AI ACTION",
          },
          {
            time: "09:54",
            actor: "Передача",
            text: "Завдання автоматично передано Клієнтській комунікації.",
            kind: "HANDOFF",
          },
          {
            time: "10:01",
            actor: "Клієнтська комунікація",
            text: "Підготувала запит документів. Очікує рішення Користувача.",
            kind: "AI ACTION",
          },
        ]
      : []),
    ...(approved
      ? [
          {
            time: "10:04",
            actor: "Користувач",
            text: "Погодив запит клієнту.",
            kind: "HUMAN ACTION",
          },
          {
            time: "10:04",
            actor: "Клієнтська комунікація",
            text: "Надіслала запит документів Мілошу К.",
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
      actor: "AI-бухгалтер",
      text: integrationCatalog.find((item) => item.id === integration.id)?.eventText || "Підключено робоче джерело",
      kind: "DEMO CONNECTION",
    })),
    ...(reconciliation?.activities.map((event) => ({
      time: event.time,
      actor: event.kind === "HUMAN ACTION" ? "Користувач" : "AI-бухгалтер",
      text: `${event.text} · ${event.detail}`,
      kind: event.kind,
    })) || []),
  ];
  const activityKindLabels = {
    "AI ACTION": "ДІЯ AI",
    HANDOFF: "ПЕРЕДАЧА",
    "HUMAN ACTION": "ДІЯ ЛЮДИНИ",
    "DEMO CONNECTION": "ДЕМО-ПІДКЛЮЧЕННЯ",
  } as const;
  const activeTasks = !createdEmployee ? 0 : reconciliation?.status === "completed" ? 0 : reconciliation ? 1 : 0;
  const pendingDecisions = !createdEmployee ? 0 : (approved ? 0 : 1) + (reconciliation?.status === "exception" ? 1 : 0);
  return (
    <Shell path="/office">
      <div className="page office-page">
        <header className="page-head office-head">
          <div>
            <p className="eyebrow">ЧЕТВЕР, 4 ВЕРЕСНЯ</p>
            <h1>Доброго ранку, Користувачу.</h1>
            <p>{createdEmployee ? "Ваша AI-команда працює." : "Ваш AI-офіс готовий до налаштування."}</p>
          </div>
          <div className="summary">
            <span>
              <b>{createdEmployee ? 1 : 0}</b> працівників працює
            </span>
            <i />
            <span>
              <b>{activeTasks}</b> активних завдань
            </span>
            <i />
            <span>
              <b>{pendingDecisions}</b> рішень очікує на вас
            </span>
          </div>
        </header>
        <ExecutiveOverview />
        {createdEmployee && (
          <section className="team-focus single-worker">
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
  ["ФАХІВЕЦЬ ІЗ ДОКУМЕНТІВ", "Перевірив наявні документи", "Виявлено 3 відсутні рахунки", "complete", "indigo"],
  ["КЛІЄНТСЬКА КОМУНІКАЦІЯ", "Підготувала запит документів", "Готовий до надсилання", "complete", "green"],
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
  const { approve, approved, reconciliation } = useWorkforce();
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
        <div className="approval-layout">
          <section className="proposal">
            <div className="proposal-by">
              <Identity color="green" />
              <div>
                <small>ЗАПРОПОНОВАНО</small>
                <b>Клієнтська комунікація</b>
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
              {integrations.some((item) => item.id === "documents") ? " · Документи" : ""}
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
  const { reconciliation, decideReconciliation } = useWorkforce();
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
  const { createdEmployee, integrations, reconciliation } = useWorkforce();

  const activeTasks = reconciliation?.status === "working" || reconciliation?.status === "exception" || reconciliation?.status === "resuming" ? 1 : 0;
  const lastAction = reconciliation?.status === "completed" ? "Завершив звірку транзакцій" : reconciliation ? "Виконує звірку транзакцій" : `Приєднався до команди о ${createdEmployee?.createdAt ?? "—"}`;

  return (
    <Shell path="/workforce">
      <div className="page workforce-page">
        <header className="page-head">
          <div>
            <p className="eyebrow">ЦИФРОВА КОМАНДА</p>
            <h1>Ваша AI-команда</h1>
            <p>{createdEmployee ? "AI-працівники, яких ви налаштували для операційної роботи." : "Додайте першого AI-працівника та визначте межі його роботи."}</p>
          </div>
          {createdEmployee ? (
            <button className="secondary" onClick={() => router.push("/office")}>
              Відкрити AI-офіс <ArrowRight size={16} />
            </button>
          ) : (
            <button className="primary" onClick={() => router.push("/workforce/new")}>
              <Plus size={17} /> Найняти AI-працівника
            </button>
          )}
        </header>
        {!createdEmployee ? (
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
          <section className="workforce-grid single-workforce-grid">
            <motion.article className="created-worker-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div className="worker-card-top">
                <Identity color="blue" size="lg" />
                <Status>АКТИВНИЙ</Status>
              </div>
              <h2>{createdEmployee.name}</h2>
              <p className="role">{createdEmployee.role}</p>
              <div className="objective">
                <span>РІВЕНЬ АВТОНОМНОСТІ</span>
                <b>{autonomyLabels[createdEmployee.autonomy]}</b>
                <div className="progress">
                  <i style={{ width: integrations.length ? "100%" : "35%" }} />
                </div>
                <small>{integrations.length ? `${integrations.length} систем підключено` : "Потрібні робочі системи"}</small>
              </div>
              <div className="worker-facts">
                <span>
                  <b>{activeTasks}</b> активних завдань
                </span>
                <span>Останнє · {lastAction}</span>
              </div>
              <button className="text-button" onClick={() => router.push("/workforce/accountant")}>
                Відкрити робочий простір <ArrowRight size={15} />
              </button>
            </motion.article>
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

function IntegrationsPanel() {
  const { integrations, connectIntegration, disconnectIntegration } = useWorkforce();
  const [dialog, setDialog] = useState<{
    definition: IntegrationDefinition;
    action: "connect" | "disconnect";
  } | null>(null);
  const connectedCount = integrations.length;

  const connect = (definition: IntegrationDefinition, provider: string) => {
    if (definition.id === "tax") return;
    connectIntegration({
      id: definition.id,
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
    <section className="integrations-panel" id="connections" aria-labelledby="connections-heading">
      <header>
        <div>
          <p className="eyebrow">ПІДКЛЮЧЕННЯ</p>
          <h2 id="connections-heading">Робочі системи</h2>
          <p>Підключіть джерела даних, з якими AI-бухгалтер працюватиме під час виконання завдань.</p>
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
        {integrationCatalog.map((definition) => {
          const connection = definition.id === "tax" ? undefined : integrations.find((item) => item.id === definition.id);
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
          connection={dialog.definition.id === "tax" ? undefined : integrations.find((item) => item.id === dialog.definition.id)}
          onClose={() => setDialog(null)}
          onConnect={(provider) => connect(dialog.definition, provider)}
          onDisconnect={() => {
            if (dialog.definition.id !== "tax") disconnectIntegration(dialog.definition.id);
            setDialog(null);
          }}
        />
      )}
    </section>
  );
}

function Workspace({ employee = "accountant" }: { employee?: string }) {
  const router = useRouter();
  const { createdEmployee, integrations, reconciliation } = useWorkforce();
  const w = workers.find((x) => x.key === employee) || workers[0];
  const hiredEmployee = employee === "accountant" ? createdEmployee : null;
  const [open, setOpen] = useState("work");
  const detailSections = [
    ["queue", ListChecks, "ЧЕРГА ЗАВДАНЬ"],
    ["activity", Activity, "ОСТАННЯ АКТИВНІСТЬ"],
    ["knowledge", FileCheck2, "ЗНАННЯ"],
    ["permissions", LockKeyhole, "ДОЗВОЛИ"],
  ] as const;
  const hasRequiredSources = integrations.some((item) => item.id === "bank") && integrations.some((item) => item.id === "accounting");
  const readiness = integrations.length === 0 ? "Потрібні підключення" : hasRequiredSources ? "Готовий до роботи" : "Частково готовий";

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
          <small>ОСТАННЯ ПОДІЯ</small>
          <b>AI-бухгалтер приєднався до команди</b>
          <p>Сьогодні о {hiredEmployee.createdAt}</p>
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

  if (employee === "accountant" && !createdEmployee)
    return (
      <Shell path="/workforce">
        <div className="page workspace-page">
          <button className="back" onClick={() => router.push("/workforce")}>
            <ArrowLeft size={16} /> Команда
          </button>
          <section className="workforce-empty workspace-empty">
            <Identity color="blue" size="lg" />
            <div>
              <p className="eyebrow">РОБОЧИЙ ПРОСТІР</p>
              <h1>Спочатку найміть AI-бухгалтера</h1>
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
            <h2>{hiredEmployee ? "Готовий до призначених завдань" : w.objective}</h2>
            <div className="progress">
              <i style={{ width: hiredEmployee ? "100%" : `${w.progress}%` }} />
            </div>
            <b>{hiredEmployee ? "100%" : `${w.progress}%`}</b>
            <p>
              <i /> {hiredEmployee ? `${autonomyLabels[hiredEmployee.autonomy]} рівень автономності` : "Зараз: очікує на перевірку документів."}
            </p>
          </div>
        </header>
        <div className="workspace-metrics">
          <div>
            <span>ПІДКЛЮЧЕНІ СИСТЕМИ</span>
            <b>{integrations.length}</b>
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
        {hiredEmployee && integrations.length === 0 && (
          <aside className="first-connection-card">
            <div>
              <p className="eyebrow">НАСТУПНИЙ КРОК</p>
              <h2>Дайте AI-бухгалтеру робочі дані</h2>
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
              <h2>AI-бухгалтер готовий до роботи</h2>
              <p>AI автоматично аналізує підключені джерела та знаходить завдання відповідно до своїх обов’язків.</p>
            </div>
            <button className="primary" onClick={() => router.push("/office")}>
              {reconciliation?.status === "completed" ? "Переглянути результат в AI-офісі" : "Перейти до AI-офісу"} <ArrowRight size={15} />
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
                <small>{hiredEmployee ? "ГОТОВИЙ ДО РОБОТИ" : "АКТИВНЕ ЗАВДАННЯ"}</small>
                <b>{hiredEmployee ? autonomyLabels[hiredEmployee.autonomy] : "Підготувати клієнта до закриття місяця"}</b>
                <p>{hiredEmployee ? `${hiredEmployee.responsibilities.length} обов’язків · ${hiredEmployee.approvalRules.length} правил погодження` : "Фахівець із документів перевіряє первинні матеріали."}</p>
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
        <IntegrationsPanel />
      </div>
    </Shell>
  );
}

function CreateEmployee() {
  const router = useRouter();
  const { hireEmployee } = useWorkforce();
  const [step, setStep] = useState(1);
  const [roleNotice, setRoleNotice] = useState("");
  const [responsibilities, setResponsibilities] = useState(responsibilityOptions.slice(0, 5));
  const [autonomy, setAutonomy] = useState<AutonomyLevel>("controlled");
  const [approvalRules, setApprovalRules] = useState(approvalOptions.slice(0, 4));
  const [approvalLimit, setApprovalLimit] = useState("10 000 ₴");
  const [launchPhase, setLaunchPhase] = useState<"form" | "loading" | "success">("form");
  const stepLabels = ["Роль", "Обов’язки", "Автономність", "Погодження", "Запуск"];
  const roles = [
    {
      key: "accountant",
      name: "AI-бухгалтер",
      description: "Контролює фінансові операції, звіряє транзакції, готує закриття місяця та передає критичні рішення людині.",
      badge: "Доступний",
      color: "blue",
      capabilities: ["Звірка транзакцій", "Закриття місяця", "Контроль рахунків", "Фінансові звіти"],
    },
    {
      key: "analyst",
      name: "AI-фінансовий аналітик",
      description: "Аналізує фінансові показники, готує прогнози та знаходить відхилення у фінансових даних.",
      badge: "Скоро",
      color: "teal",
    },
    {
      key: "operations",
      name: "AI-операційний менеджер",
      description: "Контролює операційні процеси, дедлайни та виконання регулярних завдань.",
      badge: "Скоро",
      color: "indigo",
    },
    {
      key: "sales",
      name: "AI-асистент з продажів",
      description: "Допомагає працювати з лідами, CRM, follow-up та підготовкою комерційних матеріалів.",
      badge: "Скоро",
      color: "green",
    },
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
  const launchEmployee = () => {
    setLaunchPhase("loading");
    window.setTimeout(() => {
      const createdAt = new Date().toLocaleTimeString("uk-UA", {
        hour: "2-digit",
        minute: "2-digit",
      });
      hireEmployee({
        name: "AI-бухгалтер",
        role: "Фінанси та бухгалтерія",
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
            <p className="eyebrow">AI-БУХГАЛТЕР ГОТОВИЙ</p>
            <h1>
              AI-бухгалтер приєднався
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
              <button className="primary" onClick={() => router.push("/workforce/accountant#connections")}>
                Підключити робочі системи <ArrowRight size={16} />
              </button>
              <button className="secondary" onClick={() => router.push("/workforce/accountant")}>
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
                  {roles.map((role) => (
                    <button type="button" key={role.key} className={`role-option ${role.key === "accountant" ? "selected" : "coming"}`} aria-pressed={role.key === "accountant"} onClick={() => (role.key === "accountant" ? setRoleNotice("") : setRoleNotice("Ця роль поки недоступна в демо. Оберіть AI-бухгалтера."))}>
                      <div className="role-option-top">
                        <Identity color={role.color} />
                        <span className={role.key === "accountant" ? "available" : "soon"}>{role.badge}</span>
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
                    </button>
                  ))}
                </div>
                <p className={`role-notice ${roleNotice ? "visible" : ""}`} role="status" aria-live="polite">
                  {roleNotice || "AI-бухгалтер обраний і готовий до налаштування."}
                </p>
              </>
            )}

            {step === 2 && (
              <>
                <header className="hire-heading">
                  <p className="eyebrow">КРОК 02 · ОБОВ’ЯЗКИ</p>
                  <h1>Що має робити AI-бухгалтер?</h1>
                  <p>Оберіть завдання, за які AI-працівник відповідатиме у вашій команді.</p>
                </header>
                <div className="choice-layout">
                  <fieldset className="check-list">
                    <legend className="sr-only">Обов’язки AI-бухгалтера</legend>
                    {responsibilityOptions.map((item) => (
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
                    <p>Обрані завдання сформують робочу зону відповідальності AI-бухгалтера.</p>
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
                    {approvalOptions.map((item) => (
                      <label key={item}>
                        <input type="checkbox" checked={approvalRules.includes(item)} onChange={() => toggleOption(item, approvalRules, setApprovalRules)} />
                        <span className="check-control">
                          <Check size={13} />
                        </span>
                        <b>{item}</b>
                      </label>
                    ))}
                  </fieldset>
                  <aside className="limit-panel">
                    <label htmlFor="approval-limit">Ліміт операції без погодження</label>
                    <input id="approval-limit" value={approvalLimit} onChange={(event) => setApprovalLimit(event.target.value)} inputMode="numeric" />
                    <p>Операції вище цього ліміту автоматично передаватимуться вам на погодження.</p>
                  </aside>
                </div>
              </>
            )}

            {step === 5 && (
              <>
                <header className="hire-heading">
                  <p className="eyebrow">КРОК 05 · ПЕРЕВІРКА І ЗАПУСК</p>
                  <h1>AI-бухгалтер готовий до роботи</h1>
                  <p>Перевірте налаштування перед запуском.</p>
                </header>
                <div className="review-card">
                  <div className="review-identity">
                    <Identity color="blue" size="lg" />
                    <div>
                      <span>РОЛЬ</span>
                      <h2>AI-бухгалтер</h2>
                      <p>Фінанси та бухгалтерія</p>
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
                    <div>
                      <dt>Ліміт</dt>
                      <dd>
                        <b>{approvalLimit}</b>
                      </dd>
                    </div>
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
                <button className="primary" type="button" disabled={step === 2 && responsibilities.length === 0} onClick={() => moveTo(step + 1)}>
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

export function NovaApp({ screen }: { screen: string[] }) {
  if (!screen.length) return <Intro />;
  if (screen[0] === "office") return <Dashboard />;
  if (screen[0] === "tasks" && screen[1] === "reconciliation") return <ReconciliationTask />;
  if (screen[0] === "tasks") return <MonthlyCloseTask />;
  if (screen[0] === "approvals" && screen[1] === "reconciliation") return <ReconciliationApproval />;
  if (screen[0] === "approvals") return <MonthlyCloseApproval />;
  if (screen[0] === "workforce" && screen[1] === "new") return <CreateEmployee />;
  if (screen[0] === "workforce" && screen[1]) return <Workspace employee={screen[1]} />;
  if (screen[0] === "workforce") return <Workforce />;
  return <Dashboard />;
}
