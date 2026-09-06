"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Activity, ArrowDown, ArrowLeft, ArrowRight, BarChart3, Check, CheckCircle2,
  ChevronDown, CircleGauge, FileCheck2, Files, LayoutGrid, ListChecks,
  LockKeyhole, Plus, Settings2, ShieldCheck, Users, X
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useWorkforce } from "./workforce-state";

const workers = [
  { key: "accountant", name: "AI-бухгалтер", role: "Фінанси та бухгалтерія", color: "blue", status: "ПРАЦЮЄ", objective: "Підготувати закриття серпня", progress: 68, action: "Проаналізовано 48 транзакцій", tasks: 7 },
  { key: "tax", name: "Податковий асистент", role: "Податки та комплаєнс", color: "teal", status: "МОНІТОРИТЬ", objective: "Перевірити зобов’язання за вересень", progress: 84, action: "Підтверджено строк сплати ПДВ", tasks: 4 },
  { key: "documents", name: "Фахівець із документів", role: "Документи та перевірка", color: "indigo", status: "ПРАЦЮЄ", objective: "Перевірити відсутні рахунки", progress: 42, action: "Виявлено 3 відсутні документи", tasks: 9 },
  { key: "client", name: "Клієнтська комунікація", role: "Робота з клієнтами", color: "green", status: "ОЧІКУЄ ВАШОГО РІШЕННЯ", objective: "Запит документів підготовлено", progress: 100, action: "Підготовлено запит для Мілоша К.", tasks: 5 },
];

const nav = [
  ["/office", "Огляд", LayoutGrid], ["/workforce", "AI-команда", Users], ["/tasks/monthly-close", "Завдання", ListChecks],
  ["/documents", "Документи", Files], ["/approvals/monthly-close", "Погодження", CheckCircle2], ["/activity", "Активність", Activity],
  ["/analytics", "Аналітика", BarChart3], ["/settings", "Налаштування", Settings2],
] as const;

function Identity({ color = "blue", size = "md" }: { color?: string; size?: "sm" | "md" | "lg" }) {
  return <div className={`identity identity-${color} identity-${size}`} aria-hidden="true"><i /><i /><i /></div>;
}

function Logo({ compact = false }: { compact?: boolean }) {
  return <div className="logo" aria-label="AI-команда"><span className="nova-mark"><i /><i /></span>{compact && null}</div>;
}

function Status({ children, tone = "live" }: { children: React.ReactNode; tone?: "live" | "waiting" | "quiet" }) {
  return <span className={`status status-${tone}`}><i />{children}</span>;
}

function Sidebar({ path }: { path: string }) {
  const router = useRouter();
  const { approved } = useWorkforce();
  return <aside className="sidebar">
    <button className="brand-button" aria-label="Перейти до огляду" onClick={() => router.push("/office")}><Logo compact /></button>
    <nav>{nav.map(([href, label, Icon], index) => <button key={`${label}-${index}`} className={path === href || (href.startsWith("/approvals") && path.startsWith("/approvals")) || (href.startsWith("/tasks") && path.startsWith("/tasks")) ? "active" : ""} onClick={() => router.push(href)}><Icon size={17} /><span>{label}</span>{href.startsWith("/approvals") && !approved && <em>1</em>}</button>)}</nav>
    <div className="profile"><span>К</span><div><b>Користувач</b><small>Адміністратор</small></div></div>
  </aside>;
}

function Shell({ path, children }: { path: string; children: React.ReactNode }) {
  return <div className="app-shell"><Sidebar path={path} /><main className="app-main"><AnimatePresence mode="wait"><motion.div key={path} initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: .24 }}>{children}</motion.div></AnimatePresence></main></div>;
}

function Intro() {
  const router = useRouter();
  return <main className="intro">
    <header><Logo /><span className="intro-note">Новий підхід до роботи</span></header>
    <section className="intro-copy">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6 }}>
        <p className="eyebrow">ОПЕРАЦІЙНА СИСТЕМА ДЛЯ AI-КОМАНДИ</p>
        <h1>Познайомтеся з AI-командою,<br />яка працює для<br />вашого бізнесу.</h1>
        <p className="lede">Спеціалізовані AI-працівники ведуть бухгалтерію, опрацьовують документи, податки й операційні завдання — а важливі рішення залишаються під вашим контролем.</p>
        <button className="primary large" onClick={() => router.push("/office")}>Увійти до AI-офісу <ArrowRight size={18} /></button>
      </motion.div>
    </section>
    <motion.section className="constellation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .25, duration: .7 }}>
      <svg viewBox="0 0 760 370" preserveAspectRatio="none" aria-hidden="true"><path d="M120 175 C250 45 360 88 385 180 S565 325 650 190" /><path d="M120 175 C245 285 350 288 385 180 S545 70 650 190" /></svg>
      {workers.map((w, i) => <motion.div className={`constellation-worker cw-${i + 1}`} key={w.key} initial={{ scale: .9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: .35 + i * .09 }}>
        <Identity color={w.color} /><div><b>{w.name}</b><small>{w.role}</small></div>
      </motion.div>)}
      <div className="constellation-core"><span>ОДНА ЦІЛЬ</span><b>Спільний<br />контекст</b></div>
    </motion.section>
    <footer><span>Чотири фахівці.</span><span>Одна злагоджена команда.</span><span>Ви зберігаєте контроль.</span></footer>
  </main>;
}

function TeamCell({ worker }: { worker: typeof workers[number] }) {
  const showProgress = worker.key !== "client";
  return <motion.article className="team-cell" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .32 }}>
    <div className="team-cell-top"><Identity color={worker.color} /><Status tone={worker.status.includes("ОЧІКУЄ") ? "waiting" : "live"}>{worker.status}</Status></div>
    <h3>{worker.name}</h3>
    <p className="team-objective">{worker.objective}</p>
    {showProgress && <div className="team-progress"><div className="progress"><motion.i initial={{ width: 0 }} animate={{ width: `${worker.progress}%` }} transition={{ duration: .8, ease: "easeOut" }} /></div><b>{worker.progress}%</b></div>}
    <p className="team-action"><span>ОСТАННЯ ДІЯ</span>{worker.action}</p>
  </motion.article>;
}

function CollaborationChain() {
  const collaborators = workers.filter(w => ["accountant", "documents", "client"].includes(w.key));
  return <div className="chain">
    <div className="chain-node chain-node-1"><Identity color={collaborators[0].color} size="sm" /><span>{collaborators[0].name}</span></div><ArrowRight className="chain-arrow chain-arrow-1" size={14} />
    <div className="chain-node chain-node-2"><Identity color={collaborators[1].color} size="sm" /><span>{collaborators[1].name}</span></div><ArrowRight className="chain-arrow chain-arrow-2" size={14} />
    <div className="chain-node chain-node-3"><Identity color={collaborators[2].color} size="sm" /><span>{collaborators[2].name}</span></div><ArrowRight className="chain-arrow chain-arrow-3" size={14} />
    <div className="you-node"><span>ВИ</span></div>
  </div>;
}

function Dashboard() {
  const router = useRouter();
  const { approved } = useWorkforce();
  const officeWorkers = [
    { ...workers[0], status: "ПРАЦЮЄ", objective: "Готує закриття серпня", action: "Проаналізовано 48 транзакцій" },
    { ...workers[1], status: "ПЕРЕВІРЯЄ", objective: "Податкові зобов’язання за вересень", progress: 81, action: "Виявлено 2 найближчі строки" },
    { ...workers[2], status: "ПРАЦЮЄ", objective: "Перевіряє відсутні рахунки", action: "Знайдено 17 документів" },
    approved
      ? { ...workers[3], status: "АКТИВНИЙ", objective: "Запит документів надіслано", action: "Надіслано запит щодо 3 рахунків" }
      : { ...workers[3], status: "ОЧІКУЄ ВАШОГО РІШЕННЯ", objective: "Запит документів підготовлено", action: "Підготовлено запит щодо 3 рахунків" },
  ];
  const activities = [
    { time: "09:42", actor: "AI-бухгалтер", text: "Проаналізував 48 серпневих транзакцій.", kind: "AI ACTION" },
    { time: "09:46", actor: "AI-бухгалтер", text: "Виявив 3 відсутні первинні документи.", kind: "AI ACTION" },
    { time: "09:47", actor: "Передача", text: "Завдання автоматично передано Фахівцю із документів.", kind: "HANDOFF" },
    { time: "09:51", actor: "Фахівець із документів", text: "Перевірив доступні документи та визначив 3 відсутні рахунки.", kind: "AI ACTION" },
    { time: "09:54", actor: "Передача", text: "Завдання автоматично передано Клієнтській комунікації.", kind: "HANDOFF" },
    { time: "10:01", actor: "Клієнтська комунікація", text: "Підготувала запит документів. Очікує рішення Користувача.", kind: "AI ACTION" },
    ...(approved ? [
      { time: "10:04", actor: "Користувач", text: "Погодив запит клієнту.", kind: "HUMAN ACTION" },
      { time: "10:04", actor: "Клієнтська комунікація", text: "Надіслала запит документів Мілошу К.", kind: "AI ACTION" },
    ] : []),
  ];
  const activityKindLabels = { "AI ACTION": "ДІЯ AI", HANDOFF: "ПЕРЕДАЧА", "HUMAN ACTION": "ДІЯ ЛЮДИНИ" } as const;
  return <Shell path="/office"><div className="page office-page">
    <header className="page-head office-head"><div><p className="eyebrow">ЧЕТВЕР, 4 ВЕРЕСНЯ</p><h1>Доброго ранку, Користувачу.</h1><p>Ваша AI-команда працює.</p></div><div className="summary"><span><b>3</b> працівники працюють</span><i /><span><b>12</b> активних завдань</span><i /><span><b>{approved ? 0 : 1}</b> {approved ? "рішень на погодженні" : "рішення очікує на вас"}</span></div></header>
    <section className="team-focus"><div className="office-section-head"><div><p className="eyebrow">ВАША AI-КОМАНДА</p><h2>Ваша цифрова команда зараз.</h2></div><button className="text-button" onClick={() => router.push("/workforce")}>Переглянути команду <ArrowRight size={15} /></button></div><div className="team-composition">{officeWorkers.map(w => <TeamCell key={w.key} worker={w} />)}</div></section>
    {!approved && <motion.section className="attention office-attention" layout><div className="attention-grid"><div className="attention-left"><div className="attention-top"><span className="attention-label"><i /> РІШЕННЯ ЛЮДИНИ</span></div><div className="attention-copy"><h2>Вашій AI-команді потрібне одне рішення.</h2><p>Клієнтська комунікація підготувала запит щодо 3 відсутніх рахунків.</p></div><CollaborationChain /></div><div className="decision"><small>ЗАПРОПОНОВАНА ДІЯ</small><h3>Надіслати запит документів Мілошу К.?</h3><div><button className="secondary" onClick={() => router.push("/approvals/monthly-close")}>Переглянути запит</button><button className="primary" onClick={() => router.push("/approvals/monthly-close")}>Погодити</button></div></div></div></motion.section>}
    {approved && <motion.section className="continuation" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}><CheckCircle2 size={19} /><div><b>Рішення погоджено. Роботу продовжено.</b><span>Клієнтська комунікація надіслала запит о 10:04.</span></div></motion.section>}
    <section className="section activity-section office-activity"><div className="section-title"><div><p className="eyebrow">ЩО СЬОГОДНІ ЗРОБИЛА ВАША AI-КОМАНДА</p><h2>Робота просувалася автономно.</h2></div><button className="task-link" onClick={() => router.push("/tasks/monthly-close")}>Підготувати клієнта до закриття місяця <ArrowRight size={15} /></button></div><div className="timeline">{activities.map((a, i) => <motion.div className={`activity-${a.kind.toLowerCase().replace(" ", "-")}`} key={`${a.time}-${a.actor}`} initial={{ opacity: 0, x: -7 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * .04 }}><time>{a.time}</time><i /><div><span className="activity-kind">{activityKindLabels[a.kind as keyof typeof activityKindLabels]}</span><b>{a.actor}</b><p>{a.text}</p></div></motion.div>)}</div></section>
  </div></Shell>;
}

const baseSteps = [
  ["AI-БУХГАЛТЕР", "Проаналізував бухгалтерські дані", "Перевірено 48 транзакцій", "complete", "blue"],
  ["AI-БУХГАЛТЕР", "Виявив відсутні документи", "Потрібні 3 рахунки", "complete", "blue"],
  ["ФАХІВЕЦЬ ІЗ ДОКУМЕНТІВ", "Перевірив наявні документи", "Виявлено 3 відсутні рахунки", "complete", "indigo"],
  ["КЛІЄНТСЬКА КОМУНІКАЦІЯ", "Підготувала запит документів", "Готовий до надсилання", "complete", "green"],
];

function TaskDetail() {
  const router = useRouter(); const { approved } = useWorkforce();
  const steps = [...baseSteps, ["КОРИСТУВАЧ", approved ? "Погодив запит клієнту" : "Потрібне погодження", approved ? "Погоджено о 10:04" : "Потрібне ваше рішення", approved ? "complete" : "current", "human"], ["AI-БУХГАЛТЕР", approved ? "Очікує запитані документи" : "Продовжити закриття місяця", approved ? "Запит надіслано · відстежує вхідні" : "Продовжить після погодження", "waiting", "blue"]];
  return <Shell path="/tasks/monthly-close"><div className="page task-page"><button className="back" onClick={() => router.push("/office")}><ArrowLeft size={16} /> Назад до огляду</button><header className="task-head"><div><p className="eyebrow">ЗАВДАННЯ  /  ЗАКРИТТЯ МІСЯЦЯ</p><h1>Підготувати клієнта до<br />закриття місяця</h1><div className="task-meta"><Status>AI-КОМАНДА ПРАЦЮЄ</Status><span>Запущено автоматично о 09:32</span></div></div><div className="big-progress"><span>ПРОГРЕС</span><b>{approved ? 82 : 75}%</b><div className="progress"><motion.i animate={{ width: approved ? "82%" : "75%" }} /></div></div></header><div className="workflow-intro"><p>ОДНЕ БІЗНЕС-ЗАВДАННЯ</p><ArrowDown size={16} /><p>ТРИ AI-ПРАЦІВНИКИ</p><ArrowDown size={16} /><p>ОДНЕ РІШЕННЯ ЛЮДИНИ</p></div><section className="workflow">{steps.map((s, i) => <motion.div className={`workflow-step ${s[3]}`} key={`${s[0]}-${i}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .06 }}><div className="step-number">{String(i + 1).padStart(2, "0")}</div><div className="step-line"><i /></div><Identity color={s[4]} /><div className="step-copy"><small>{s[0]}</small><h3>{s[1]}</h3><p>{s[2]}</p></div><span className="step-status">{s[3] === "complete" ? <><Check size={13} /> ЗАВЕРШЕНО</> : s[3] === "current" ? "ПОТОЧНИЙ ЕТАП" : "ОЧІКУЄ"}</span>{s[3] === "current" && <button className="primary" onClick={() => router.push("/approvals/monthly-close")}>Переглянути рішення <ArrowRight size={15} /></button>}</motion.div>)}</section></div></Shell>;
}

function Approval() {
  const router = useRouter(); const { approve, approved } = useWorkforce(); const [phase, setPhase] = useState<"ready" | "sending" | "done">(approved ? "done" : "ready"); const [editing, setEditing] = useState(false); const [message, setMessage] = useState("Вітаю, Мілоше!\n\nМи готуємо закриття серпня та виявили три відсутні рахунки. Будь ласка, завантажте наведені нижче документи, коли матимете змогу.\n\n• INV-2481 — Atlas Office\n• INV-2517 — Petrović Consulting\n• INV-2533 — Northline Systems\n\nДякуємо,\nбухгалтерська команда Користувача");
  const submit = () => { setPhase("sending"); setTimeout(() => { approve(); setPhase("done"); }, 900); };
  if (phase === "sending") return <Shell path="/approvals/monthly-close"><div className="approval-result"><motion.div initial={{ scale: .8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}><span className="sending-mark"><i /><i /></span><p>Підтверджуємо ваше рішення</p></motion.div></div></Shell>;
  if (phase === "done") return <Shell path="/approvals/monthly-close"><div className="approval-result"><motion.div initial={{ scale: .92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}><span className="approved-mark"><Check size={28} /></span><h1>Погоджено.</h1><p>Запит клієнту надіслано.</p><small>Робочий процес відновлено, а дані на дашборді оновлено.</small><div><button className="secondary" onClick={() => router.push("/tasks/monthly-close")}>Переглянути оновлений процес</button><button className="primary" onClick={() => router.push("/office")}>Повернутися до дашборда <ArrowRight size={16} /></button></div></motion.div></div></Shell>;
  return <Shell path="/approvals/monthly-close"><div className="page approval-page"><button className="back" onClick={() => router.push("/tasks/monthly-close")}><ArrowLeft size={16} /> Назад до завдання</button><header><p className="eyebrow">ЗВИЧАЙНА ЧАСТИНА РОБОЧОГО ПРОЦЕСУ</p><h1>Потрібне<br />ваше рішення.</h1><p>Ваша AI-команда зупинилася перед зовнішньою дією.</p></header><div className="approval-layout"><section className="proposal"><div className="proposal-by"><Identity color="green" /><div><small>ЗАПРОПОНОВАНО</small><b>Клієнтська комунікація</b></div><Status tone="waiting">ОЧІКУЄ ВАШОГО РІШЕННЯ</Status></div><div className="proposal-title"><small>ЗАПРОПОНОВАНА ДІЯ</small><h2>Надіслати запит документів Мілошу К.</h2></div>{editing ? <textarea value={message} onChange={e => setMessage(e.target.value)} autoFocus /> : <div className="message-preview">{message.split("\n").map((line, i) => <p key={i}>{line || <br />}</p>)}</div>}<div className="approval-actions"><button className="primary approve" onClick={submit}><Check size={17} /> Погодити та надіслати</button><button className="secondary" onClick={() => setEditing(!editing)}>{editing ? "Зберегти зміни" : "Редагувати"}</button><button className="ghost"><X size={16} /> Відхилити</button></div></section><aside className="decision-context"><div><span>ЧОМУ</span><p>Для закриття серпня бракує 3 рахунків.</p></div><div><span>ВИКОРИСТАНІ ДАНІ</span><p>Перевірка обліку за серпень<br />Перевірка документів</p></div><div><span>ЩО БУДЕ ДАЛІ</span><p>Після погодження запит буде надіслано. Коли документи надійдуть, AI-бухгалтер продовжить закриття місяця.</p></div><div className="guardrail"><ShieldCheck size={18} /><p><b>Ви зберігаєте контроль.</b><br />Зовнішні повідомлення не надсилаються без визначеного вами дозволу.</p></div></aside></div></div></Shell>;
}

function Workforce() { const router = useRouter(); return <Shell path="/workforce"><div className="page workforce-page"><header className="page-head"><div><p className="eyebrow">ЦИФРОВА КОМАНДА</p><h1>Ваша AI-команда</h1><p>Ваша цифрова команда працює в усіх напрямах бізнесу.</p></div><button className="primary" onClick={() => router.push("/workforce/new")}><Plus size={17} /> Додати AI-працівника</button></header><section className="workforce-grid">{workers.map(w => <article key={w.key}><div className="worker-card-top"><Identity color={w.color} size="lg" /><Status tone={w.status.includes("ОЧІКУЄ") ? "waiting" : "live"}>{w.status}</Status></div><h2>{w.name}</h2><p className="role">{w.role}</p><div className="objective"><span>ПОТОЧНА ЦІЛЬ</span><b>{w.objective}</b><div className="progress"><i style={{ width: `${w.progress}%` }} /></div><small>{w.progress}% виконано</small></div><div className="worker-facts"><span><b>{w.tasks}</b> завдань виконано сьогодні</span><span>Останнє · {w.action}</span></div><button className="text-button" onClick={() => router.push(`/workforce/${w.key}`)}>Відкрити робочий простір <ArrowRight size={15} /></button></article>)}</section></div></Shell>; }

function Workspace({ employee = "accountant" }: { employee?: string }) { const router = useRouter(); const w = workers.find(x => x.key === employee) || workers[0]; const [open, setOpen] = useState("work"); return <Shell path="/workforce"><div className="page workspace-page"><button className="back" onClick={() => router.push("/workforce")}><ArrowLeft size={16} /> AI-команда</button><header className="workspace-hero"><Identity color={w.color} size="lg" /><div><p className="eyebrow">РОБОЧИЙ ПРОСТІР AI-ПРАЦІВНИКА</p><h1>{w.name}</h1><p>{w.role}</p></div><Status>ПРАЦЮЄ</Status><div className="workspace-objective"><span>ПОТОЧНА ЦІЛЬ</span><h2>{w.objective}</h2><div className="progress"><i style={{ width: `${w.progress}%` }} /></div><b>{w.progress}%</b><p><i /> Зараз: очікує на перевірку документів.</p></div></header><section className="workspace-sections"><button className={open === "work" ? "open" : ""} onClick={() => setOpen("work")}><span><CircleGauge size={18} /> ПОТОЧНА РОБОТА</span><ChevronDown size={17} /></button>{open === "work" && <motion.div className="disclosure" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}><div><small>АКТИВНЕ ЗАВДАННЯ</small><b>Підготувати клієнта до закриття місяця</b><p>Фахівець із документів перевіряє первинні матеріали.</p></div><button className="secondary" onClick={() => router.push("/tasks/monthly-close")}>Відкрити завдання</button></motion.div>}{[["queue", ListChecks, "ЧЕРГА ЗАВДАНЬ"], ["activity", Activity, "ОСТАННЯ АКТИВНІСТЬ"], ["knowledge", FileCheck2, "ЗНАННЯ"], ["permissions", LockKeyhole, "ДОЗВОЛИ"], ["systems", Settings2, "ПІДКЛЮЧЕНІ СИСТЕМИ"]].map(([key, Icon, label]) => <button key={key as string} onClick={() => setOpen(open === key ? "" : key as string)}><span>{<Icon size={18} />} {label as string}</span><ChevronDown size={17} /></button>)}</section></div></Shell>; }

function CreateEmployee() { const router = useRouter(); const [autonomy, setAutonomy] = useState("approval"); return <Shell path="/workforce"><div className="page create-page"><button className="back" onClick={() => router.push("/workforce")}><ArrowLeft size={16} /> AI-команда</button><header><p className="eyebrow">РОЗШИРТЕ КОМАНДУ</p><h1>Додайте AI-працівника<br />до своєї команди</h1><p>Налаштуйте роль, робочий контекст і чіткі межі відповідальності.</p></header><form onSubmit={e => { e.preventDefault(); router.push("/workforce"); }}><section><h2>Роль і призначення</h2><div className="field-grid"><label><span>Ім’я AI-працівника</span><input placeholder="Наприклад, фахівець із розрахунку зарплат" /></label><label><span>Роль</span><input placeholder="Наприклад, розрахунок заробітної плати" /></label><label className="wide"><span>Основна ціль</span><input placeholder="Який результат має забезпечувати цей працівник?" /></label><label className="wide"><span>Обов’язки</span><textarea placeholder="Опишіть роботу, за яку відповідатиме цей працівник..." /></label></div></section><section><h2>Робочий контекст</h2><div className="field-grid"><label><span>Джерела знань</span><input placeholder="Політики, інструкції та довідкові документи" /></label><label><span>Підключені системи</span><input placeholder="Виберіть бізнес-системи" /></label><label className="wide"><span>Дозволи</span><input placeholder="Визначте, що цей працівник може переглядати й змінювати" /></label></div></section><section><h2>Автономність</h2><p className="section-note">Виберіть, наскільки самостійно може працювати цей AI-працівник.</p><div className="autonomy-options">{[["suggest", "Лише пропонувати", "Готує результат для вашого перегляду"], ["approval", "Працювати з погодженням", "Діє після погодження ключових рішень"], ["lowrisk", "Автономно для дій із низьким ризиком", "Самостійно виконує рутинну роботу"]].map(a => <button type="button" className={autonomy === a[0] ? "selected" : ""} key={a[0]} onClick={() => setAutonomy(a[0])}><i>{autonomy === a[0] && <Check size={12} />}</i><b>{a[1]}</b><span>{a[2]}</span></button>)}</div><div className="always-approve"><div><ShieldCheck size={20} /><span><b>ЗАВЖДИ ПОТРІБНЕ МОЄ ПОГОДЖЕННЯ</b><small>Ці дії залишаються під контролем людини.</small></span></div><ul><li>Надсилання зовнішніх повідомлень</li><li>Фінансові операції</li><li>Подання офіційних документів</li><li>Зміна бізнес-даних</li></ul></div></section><button className="primary form-submit">Додати AI-працівника <ArrowRight size={16} /></button></form></div></Shell>; }

export function NovaApp({ screen }: { screen: string[] }) {
  if (!screen.length) return <Intro />;
  if (screen[0] === "office") return <Dashboard />;
  if (screen[0] === "tasks") return <TaskDetail />;
  if (screen[0] === "approvals") return <Approval />;
  if (screen[0] === "workforce" && screen[1] === "new") return <CreateEmployee />;
  if (screen[0] === "workforce" && screen[1]) return <Workspace employee={screen[1]} />;
  if (screen[0] === "workforce") return <Workforce />;
  return <Dashboard />;
}
