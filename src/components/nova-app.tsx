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
  { key: "accountant", name: "AI Accountant", role: "Finance & Accounting", color: "blue", status: "WORKING", objective: "Prepare August monthly close", progress: 68, action: "Analyzed 48 transactions", tasks: 7 },
  { key: "tax", name: "Tax Assistant", role: "Tax & Compliance", color: "teal", status: "MONITORING", objective: "Review September obligations", progress: 84, action: "Confirmed VAT deadline", tasks: 4 },
  { key: "documents", name: "Document Specialist", role: "Documents & Verification", color: "indigo", status: "WORKING", objective: "Check missing invoices", progress: 42, action: "Found 3 missing documents", tasks: 9 },
  { key: "client", name: "Client Communication", role: "Client Operations", color: "green", status: "WAITING FOR YOU", objective: "Document request prepared", progress: 100, action: "Prepared request for Miloš K.", tasks: 5 },
];

const nav = [
  ["/office", "Overview", LayoutGrid], ["/workforce", "AI Workforce", Users], ["/tasks/monthly-close", "Tasks", ListChecks],
  ["/documents", "Documents", Files], ["/approvals/monthly-close", "Approvals", CheckCircle2], ["/activity", "Activity", Activity],
  ["/analytics", "Analytics", BarChart3], ["/settings", "Settings", Settings2],
] as const;

function Identity({ color = "blue", size = "md" }: { color?: string; size?: "sm" | "md" | "lg" }) {
  return <div className={`identity identity-${color} identity-${size}`} aria-hidden="true"><i /><i /><i /></div>;
}

function Logo({ compact = false }: { compact?: boolean }) {
  return <div className="logo" aria-label="AI Workforce"><span className="nova-mark"><i /><i /></span>{compact && null}</div>;
}

function Status({ children, tone = "live" }: { children: React.ReactNode; tone?: "live" | "waiting" | "quiet" }) {
  return <span className={`status status-${tone}`}><i />{children}</span>;
}

function Sidebar({ path }: { path: string }) {
  const router = useRouter();
  const { approved } = useWorkforce();
  return <aside className="sidebar">
    <button className="brand-button" aria-label="Go to overview" onClick={() => router.push("/office")}><Logo compact /></button>
    <nav>{nav.map(([href, label, Icon], index) => <button key={`${label}-${index}`} className={path === href || (label === "Approvals" && path.startsWith("/approvals")) || (label === "Tasks" && path.startsWith("/tasks")) ? "active" : ""} onClick={() => router.push(href)}><Icon size={17} /><span>{label}</span>{label === "Approvals" && !approved && <em>1</em>}</button>)}</nav>
    <div className="profile"><span>D</span><div><b>Diana</b><small>Administrator</small></div></div>
  </aside>;
}

function Shell({ path, children }: { path: string; children: React.ReactNode }) {
  return <div className="app-shell"><Sidebar path={path} /><main className="app-main"><AnimatePresence mode="wait"><motion.div key={path} initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: .24 }}>{children}</motion.div></AnimatePresence></main></div>;
}

function Intro() {
  const router = useRouter();
  return <main className="intro">
    <header><Logo /><span className="intro-note">A new way to operate</span></header>
    <section className="intro-copy">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6 }}>
        <p className="eyebrow">DIGITAL WORKFORCE OPERATING SYSTEM</p>
        <h1>Meet the AI team<br />that works for your<br />business.</h1>
        <p className="lede">Specialized AI employees handle accounting, documents, tax and operations — while you stay in control of important decisions.</p>
        <button className="primary large" onClick={() => router.push("/office")}>Enter your AI office <ArrowRight size={18} /></button>
      </motion.div>
    </section>
    <motion.section className="constellation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .25, duration: .7 }}>
      <svg viewBox="0 0 760 370" preserveAspectRatio="none" aria-hidden="true"><path d="M120 175 C250 45 360 88 385 180 S565 325 650 190" /><path d="M120 175 C245 285 350 288 385 180 S545 70 650 190" /></svg>
      {workers.map((w, i) => <motion.div className={`constellation-worker cw-${i + 1}`} key={w.key} initial={{ scale: .9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: .35 + i * .09 }}>
        <Identity color={w.color} /><div><b>{w.name}</b><small>{w.role}</small></div>
      </motion.div>)}
      <div className="constellation-core"><span>ONE GOAL</span><b>Shared<br />context</b></div>
    </motion.section>
    <footer><span>Four specialists.</span><span>One coordinated workforce.</span><span>You remain in control.</span></footer>
  </main>;
}

function TeamCell({ worker }: { worker: typeof workers[number] }) {
  const showProgress = worker.key !== "client";
  return <motion.article className="team-cell" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .32 }}>
    <div className="team-cell-top"><Identity color={worker.color} /><Status tone={worker.status.includes("WAITING") ? "waiting" : "live"}>{worker.status}</Status></div>
    <h3>{worker.name}</h3>
    <p className="team-objective">{worker.objective}</p>
    {showProgress && <div className="team-progress"><div className="progress"><motion.i initial={{ width: 0 }} animate={{ width: `${worker.progress}%` }} transition={{ duration: .8, ease: "easeOut" }} /></div><b>{worker.progress}%</b></div>}
    <p className="team-action"><span>LATEST</span>{worker.action}</p>
  </motion.article>;
}

function CollaborationChain() {
  const collaborators = workers.filter(w => ["accountant", "documents", "client"].includes(w.key));
  return <div className="chain">
    <div className="chain-node chain-node-1"><Identity color={collaborators[0].color} size="sm" /><span>{collaborators[0].name}</span></div><ArrowRight className="chain-arrow chain-arrow-1" size={14} />
    <div className="chain-node chain-node-2"><Identity color={collaborators[1].color} size="sm" /><span>{collaborators[1].name}</span></div><ArrowRight className="chain-arrow chain-arrow-2" size={14} />
    <div className="chain-node chain-node-3"><Identity color={collaborators[2].color} size="sm" /><span>{collaborators[2].name}</span></div><ArrowRight className="chain-arrow chain-arrow-3" size={14} />
    <div className="you-node"><span>YOU</span></div>
  </div>;
}

function Dashboard() {
  const router = useRouter();
  const { approved } = useWorkforce();
  const officeWorkers = [
    { ...workers[0], status: "WORKING", objective: "Preparing August monthly close", action: "Analyzed 48 transactions" },
    { ...workers[1], status: "REVIEWING", objective: "September tax obligations", progress: 81, action: "Found 2 upcoming deadlines" },
    { ...workers[2], status: "WORKING", objective: "Checking missing invoices", action: "Located 17 documents" },
    approved
      ? { ...workers[3], status: "ACTIVE", objective: "Document request sent", action: "Sent request for 3 missing invoices" }
      : { ...workers[3], status: "WAITING FOR YOU", objective: "Document request prepared", action: "Prepared request for 3 missing invoices" },
  ];
  const activities = [
    { time: "09:42", actor: "AI Accountant", text: "Analyzed 48 August transactions.", kind: "AI ACTION" },
    { time: "09:46", actor: "AI Accountant", text: "Detected 3 missing source documents.", kind: "AI ACTION" },
    { time: "09:47", actor: "Handoff", text: "Task automatically passed to Document Specialist.", kind: "HANDOFF" },
    { time: "09:51", actor: "Document Specialist", text: "Verified available documents and identified 3 missing invoices.", kind: "AI ACTION" },
    { time: "09:54", actor: "Handoff", text: "Task automatically passed to Client Communication.", kind: "HANDOFF" },
    { time: "10:01", actor: "Client Communication", text: "Prepared a document request. Waiting for Diana’s approval.", kind: "AI ACTION" },
    ...(approved ? [
      { time: "10:04", actor: "Diana", text: "Approved the client request.", kind: "HUMAN ACTION" },
      { time: "10:04", actor: "Client Communication", text: "Sent the document request to Miloš K.", kind: "AI ACTION" },
    ] : []),
  ];
  return <Shell path="/office"><div className="page office-page">
    <header className="page-head office-head"><div><p className="eyebrow">THURSDAY, SEPTEMBER 4</p><h1>Good morning, Diana.</h1><p>Your AI team is working.</p></div><div className="summary"><span><b>3</b> agents working</span><i /><span><b>12</b> active tasks</span><i /><span><b>{approved ? 0 : 1}</b> decision{approved ? "s" : ""} waiting for you</span></div></header>
    <section className="team-focus"><div className="office-section-head"><div><p className="eyebrow">YOUR AI TEAM</p><h2>Your digital workforce, right now.</h2></div><button className="text-button" onClick={() => router.push("/workforce")}>View workforce <ArrowRight size={15} /></button></div><div className="team-composition">{officeWorkers.map(w => <TeamCell key={w.key} worker={w} />)}</div></section>
    {!approved && <motion.section className="attention office-attention" layout><div className="attention-grid"><div className="attention-left"><div className="attention-top"><span className="attention-label"><i /> HUMAN DECISION</span></div><div className="attention-copy"><h2>Your AI team needs one decision.</h2><p>Client Communication prepared a request for 3 missing invoices.</p></div><CollaborationChain /></div><div className="decision"><small>PROPOSED ACTION</small><h3>Send document request to Miloš K.?</h3><div><button className="secondary" onClick={() => router.push("/approvals/monthly-close")}>Review request</button><button className="primary" onClick={() => router.push("/approvals/monthly-close")}>Approve</button></div></div></div></motion.section>}
    {approved && <motion.section className="continuation" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}><CheckCircle2 size={19} /><div><b>Decision approved. Work has continued.</b><span>Client Communication sent the request at 10:04.</span></div></motion.section>}
    <section className="section activity-section office-activity"><div className="section-title"><div><p className="eyebrow">WHAT YOUR AI TEAM DID TODAY</p><h2>Work moved forward autonomously.</h2></div><button className="task-link" onClick={() => router.push("/tasks/monthly-close")}>Prepare client for monthly close <ArrowRight size={15} /></button></div><div className="timeline">{activities.map((a, i) => <motion.div className={`activity-${a.kind.toLowerCase().replace(" ", "-")}`} key={`${a.time}-${a.actor}`} initial={{ opacity: 0, x: -7 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * .04 }}><time>{a.time}</time><i /><div><span className="activity-kind">{a.kind}</span><b>{a.actor}</b><p>{a.text}</p></div></motion.div>)}</div></section>
  </div></Shell>;
}

const baseSteps = [
  ["AI ACCOUNTANT", "Analyzed accounting data", "48 transactions reviewed", "complete", "blue"],
  ["AI ACCOUNTANT", "Detected missing documents", "3 invoices required", "complete", "blue"],
  ["DOCUMENT SPECIALIST", "Verified available documents", "Found 3 missing invoices", "complete", "indigo"],
  ["CLIENT COMMUNICATION", "Prepared document request", "Ready to send", "complete", "green"],
];

function TaskDetail() {
  const router = useRouter(); const { approved } = useWorkforce();
  const steps = [...baseSteps, ["DIANA", approved ? "Approved client request" : "Approval required", approved ? "Approved at 10:04" : "Your decision is needed", approved ? "complete" : "current", "human"], ["AI ACCOUNTANT", approved ? "Waiting for requested documents" : "Continue monthly close", approved ? "Request sent · monitoring inbox" : "Resumes after approval", "waiting", "blue"]];
  return <Shell path="/tasks/monthly-close"><div className="page task-page"><button className="back" onClick={() => router.push("/office")}><ArrowLeft size={16} /> Back to overview</button><header className="task-head"><div><p className="eyebrow">TASK  /  MONTHLY CLOSE</p><h1>Prepare client for<br />monthly close</h1><div className="task-meta"><Status>AI TEAM WORKING</Status><span>Started automatically at 09:32</span></div></div><div className="big-progress"><span>PROGRESS</span><b>{approved ? 82 : 75}%</b><div className="progress"><motion.i animate={{ width: approved ? "82%" : "75%" }} /></div></div></header><div className="workflow-intro"><p>ONE BUSINESS TASK</p><ArrowDown size={16} /><p>THREE AI EMPLOYEES</p><ArrowDown size={16} /><p>ONE HUMAN DECISION</p></div><section className="workflow">{steps.map((s, i) => <motion.div className={`workflow-step ${s[3]}`} key={`${s[0]}-${i}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .06 }}><div className="step-number">{String(i + 1).padStart(2, "0")}</div><div className="step-line"><i /></div><Identity color={s[4]} /><div className="step-copy"><small>{s[0]}</small><h3>{s[1]}</h3><p>{s[2]}</p></div><span className="step-status">{s[3] === "complete" ? <><Check size={13} /> COMPLETED</> : s[3] === "current" ? "CURRENT STEP" : "WAITING"}</span>{s[3] === "current" && <button className="primary" onClick={() => router.push("/approvals/monthly-close")}>Review decision <ArrowRight size={15} /></button>}</motion.div>)}</section></div></Shell>;
}

function Approval() {
  const router = useRouter(); const { approve, approved } = useWorkforce(); const [phase, setPhase] = useState<"ready" | "sending" | "done">(approved ? "done" : "ready"); const [editing, setEditing] = useState(false); const [message, setMessage] = useState("Hi Miloš,\n\nWe’re preparing your August monthly close and found three missing invoices. Please upload the documents listed below when convenient.\n\n• INV-2481 — Atlas Office\n• INV-2517 — Petrović Consulting\n• INV-2533 — Northline Systems\n\nThank you,\nDiana’s accounting team");
  const submit = () => { setPhase("sending"); setTimeout(() => { approve(); setPhase("done"); }, 900); };
  if (phase === "sending") return <Shell path="/approvals/monthly-close"><div className="approval-result"><motion.div initial={{ scale: .8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}><span className="sending-mark"><i /><i /></span><p>Confirming your decision</p></motion.div></div></Shell>;
  if (phase === "done") return <Shell path="/approvals/monthly-close"><div className="approval-result"><motion.div initial={{ scale: .92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}><span className="approved-mark"><Check size={28} /></span><h1>Approved.</h1><p>Client request sent.</p><small>The workflow has resumed and the dashboard is up to date.</small><div><button className="secondary" onClick={() => router.push("/tasks/monthly-close")}>View updated workflow</button><button className="primary" onClick={() => router.push("/office")}>Return to dashboard <ArrowRight size={16} /></button></div></motion.div></div></Shell>;
  return <Shell path="/approvals/monthly-close"><div className="page approval-page"><button className="back" onClick={() => router.push("/tasks/monthly-close")}><ArrowLeft size={16} /> Back to task</button><header><p className="eyebrow">A NORMAL PART OF YOUR WORKFLOW</p><h1>Your decision<br />is required.</h1><p>Your AI team paused before taking an external action.</p></header><div className="approval-layout"><section className="proposal"><div className="proposal-by"><Identity color="green" /><div><small>PROPOSED BY</small><b>Client Communication</b></div><Status tone="waiting">AWAITING APPROVAL</Status></div><div className="proposal-title"><small>PROPOSED ACTION</small><h2>Send document request to Miloš K.</h2></div>{editing ? <textarea value={message} onChange={e => setMessage(e.target.value)} autoFocus /> : <div className="message-preview">{message.split("\n").map((line, i) => <p key={i}>{line || <br />}</p>)}</div>}<div className="approval-actions"><button className="primary approve" onClick={submit}><Check size={17} /> Approve & Send</button><button className="secondary" onClick={() => setEditing(!editing)}>{editing ? "Save edit" : "Edit"}</button><button className="ghost"><X size={16} /> Reject</button></div></section><aside className="decision-context"><div><span>WHY</span><p>3 invoices required for August monthly close are missing.</p></div><div><span>DATA USED</span><p>August accounting review<br />Document verification</p></div><div><span>WHAT HAPPENS NEXT</span><p>After approval, the request is sent and AI Accountant continues the monthly close when documents arrive.</p></div><div className="guardrail"><ShieldCheck size={18} /><p><b>You remain in control.</b><br />External communication is never sent without the permission you set.</p></div></aside></div></div></Shell>;
}

function Workforce() { const router = useRouter(); return <Shell path="/workforce"><div className="page workforce-page"><header className="page-head"><div><p className="eyebrow">DIGITAL TEAM</p><h1>Your AI Workforce</h1><p>Your digital team working across the business.</p></div><button className="primary" onClick={() => router.push("/workforce/new")}><Plus size={17} /> Add AI Employee</button></header><section className="workforce-grid">{workers.map(w => <article key={w.key}><div className="worker-card-top"><Identity color={w.color} size="lg" /><Status tone={w.status.includes("WAITING") ? "waiting" : "live"}>{w.status}</Status></div><h2>{w.name}</h2><p className="role">{w.role}</p><div className="objective"><span>CURRENT OBJECTIVE</span><b>{w.objective}</b><div className="progress"><i style={{ width: `${w.progress}%` }} /></div><small>{w.progress}% complete</small></div><div className="worker-facts"><span><b>{w.tasks}</b> tasks completed today</span><span>Recent · {w.action}</span></div><button className="text-button" onClick={() => router.push(`/workforce/${w.key}`)}>Open workspace <ArrowRight size={15} /></button></article>)}</section></div></Shell>; }

function Workspace({ employee = "accountant" }: { employee?: string }) { const router = useRouter(); const w = workers.find(x => x.key === employee) || workers[0]; const [open, setOpen] = useState("work"); return <Shell path="/workforce"><div className="page workspace-page"><button className="back" onClick={() => router.push("/workforce")}><ArrowLeft size={16} /> AI Workforce</button><header className="workspace-hero"><Identity color={w.color} size="lg" /><div><p className="eyebrow">AI EMPLOYEE WORKSPACE</p><h1>{w.name}</h1><p>{w.role}</p></div><Status>WORKING</Status><div className="workspace-objective"><span>CURRENT OBJECTIVE</span><h2>{w.objective}</h2><div className="progress"><i style={{ width: `${w.progress}%` }} /></div><b>{w.progress}%</b><p><i /> Currently: Waiting for document verification.</p></div></header><section className="workspace-sections"><button className={open === "work" ? "open" : ""} onClick={() => setOpen("work")}><span><CircleGauge size={18} /> CURRENT WORK</span><ChevronDown size={17} /></button>{open === "work" && <motion.div className="disclosure" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}><div><small>ACTIVE TASK</small><b>Prepare client for monthly close</b><p>Document Specialist is verifying source records.</p></div><button className="secondary" onClick={() => router.push("/tasks/monthly-close")}>Open task</button></motion.div>}{[["queue", ListChecks, "TASK QUEUE"], ["activity", Activity, "RECENT ACTIVITY"], ["knowledge", FileCheck2, "KNOWLEDGE"], ["permissions", LockKeyhole, "PERMISSIONS"], ["systems", Settings2, "CONNECTED SYSTEMS"]].map(([key, Icon, label]) => <button key={key as string} onClick={() => setOpen(open === key ? "" : key as string)}><span>{<Icon size={18} />} {label as string}</span><ChevronDown size={17} /></button>)}</section></div></Shell>; }

function CreateEmployee() { const router = useRouter(); const [autonomy, setAutonomy] = useState("approval"); return <Shell path="/workforce"><div className="page create-page"><button className="back" onClick={() => router.push("/workforce")}><ArrowLeft size={16} /> AI Workforce</button><header><p className="eyebrow">EXPAND YOUR TEAM</p><h1>Add to your<br />AI Workforce</h1><p>Configure a role, working context and clear boundaries.</p></header><form onSubmit={e => { e.preventDefault(); router.push("/workforce"); }}><section><h2>Role & purpose</h2><div className="field-grid"><label><span>AI employee name</span><input placeholder="e.g. Payroll Specialist" /></label><label><span>Role</span><input placeholder="e.g. Payroll Operations" /></label><label className="wide"><span>Primary objective</span><input placeholder="What outcome should this employee own?" /></label><label className="wide"><span>Responsibilities</span><textarea placeholder="Describe the work this employee is responsible for..." /></label></div></section><section><h2>Working context</h2><div className="field-grid"><label><span>Knowledge sources</span><input placeholder="Policies, playbooks, reference documents" /></label><label><span>Connected systems</span><input placeholder="Select business systems" /></label><label className="wide"><span>Permissions</span><input placeholder="Define what this employee can read and update" /></label></div></section><section><h2>Autonomy</h2><p className="section-note">Choose how independently this AI employee can operate.</p><div className="autonomy-options">{[["suggest", "Suggest only", "Prepares work for your review"], ["approval", "Work with approval", "Acts after key decisions are approved"], ["lowrisk", "Autonomous for low-risk actions", "Completes routine work independently"]].map(a => <button type="button" className={autonomy === a[0] ? "selected" : ""} key={a[0]} onClick={() => setAutonomy(a[0])}><i>{autonomy === a[0] && <Check size={12} />}</i><b>{a[1]}</b><span>{a[2]}</span></button>)}</div><div className="always-approve"><div><ShieldCheck size={20} /><span><b>ALWAYS REQUIRE MY APPROVAL</b><small>These actions remain under human control.</small></span></div><ul><li>Sending external communication</li><li>Financial actions</li><li>Submitting official documents</li><li>Changing business records</li></ul></div></section><button className="primary form-submit">Add AI Employee <ArrowRight size={16} /></button></form></div></Shell>; }

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
