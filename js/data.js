const sections = [
  ["dashboard", "Dashboard"],
  ["incidents", "Incidents"],
  ["artifacts", "Evidence / Artifacts"],
  ["indicators", "Indicators"],
  ["assets", "Assets"],
  ["entities", "Entities"],
  ["timeline", "Timeline"],
  ["actions", "Response Actions"],
  ["attack", "ATT&CK Mapping"],
  ["reports", "Reports"],
  ["connectors", "Connectors"],
  ["users", "Users / Roles"],
  ["audit", "Audit Log"]
];

const navGroups = [
  { label: "Dashboard", section: "dashboard" },
  {
    label: "Cases",
    children: [
      { label: "Incidents", section: "incidents" },
      { label: "Evidence / Artifacts", section: "artifacts" }
    ]
  },
  {
    label: "Observables",
    children: [
      { label: "Indicators", section: "indicators" },
      { label: "Assets", section: "assets" },
      { label: "Entities", section: "entities" }
    ]
  },
  {
    label: "Response",
    children: [
      { label: "Timeline", section: "timeline" },
      { label: "Response Actions", section: "actions" },
      { label: "ATT&CK Mapping", section: "attack" }
    ]
  },
  { label: "Reports", section: "reports" },
  { label: "Connectors", section: "connectors" },
  {
    label: "Admin",
    children: [
      { label: "Users / Roles", section: "users" },
      { label: "Audit Log", section: "audit" }
    ]
  }
];

const roleOptions = [
  { label: "View as Admin", role: "Admin", theme: "role-admin" },
  { label: "View as Incident Manager", role: "Incident Manager", theme: "role-manager" },
  { label: "View as Analyst", role: "Analyst", theme: "role-analyst" },
  { label: "View as Viewer", role: "Viewer", theme: "role-user" },
  { label: "View as Auditor", role: "Auditor", theme: "role-auditor" },
  { label: "View as Connector Service", role: "Connector Service Account", theme: "role-manager" }
];

const dashboardCards = [
  {
    id: "total-incidents",
    title: "Total incidents",
    description: "Incidents visible to the selected demo role.",
    style: "neutral",
    roles: ["Admin", "Incident Manager", "Analyst", "Viewer"],
    enabled: true,
    value: () => visibleIncidents().length
  },
  {
    id: "open-incidents",
    title: "Open incidents",
    description: "Visible incidents that are not closed or false positive.",
    style: "info",
    roles: ["Admin", "Incident Manager", "Analyst", "Viewer"],
    enabled: true,
    value: () => visibleIncidents().filter((incident) => !["Closed", "False Positive"].includes(incident.status)).length
  },
  {
    id: "high-critical",
    title: "High / Critical",
    description: "Visible incidents with High or Critical severity.",
    style: "critical",
    roles: ["Admin", "Incident Manager", "Analyst"],
    enabled: true,
    value: () => visibleIncidents().filter((incident) => ["High", "Critical"].includes(incident.severity)).length
  },
  {
    id: "open-actions",
    title: "Open actions",
    description: "Response actions linked to visible incidents.",
    style: "medium",
    roles: ["Admin", "Incident Manager", "Analyst"],
    enabled: true,
    value: () => {
      const visibleIds = new Set(visibleIncidents().map((incident) => incident.id));
      return actions.filter((action) => visibleIds.has(action.incidentId) && !["Done", "Cancelled"].includes(action.status)).length;
    }
  },
  {
    id: "closed-incidents",
    title: "Closed incidents",
    description: "Closed cases visible to the selected role.",
    style: "low",
    roles: ["Admin", "Incident Manager", "Auditor"],
    enabled: true,
    value: () => visibleIncidents().filter((incident) => incident.status === "Closed").length
  },
  {
    id: "audit-events",
    title: "Audit events",
    description: "Mock audit entries available to privileged demo roles.",
    style: "neutral",
    roles: ["Admin", "Incident Manager", "Auditor", "Connector Service Account"],
    enabled: true,
    value: () => auditLog.length
  },
  {
    id: "reports-ready",
    title: "Reports available",
    description: "Visible incidents available for report preview.",
    style: "info",
    roles: ["Admin", "Incident Manager", "Analyst", "Viewer", "Auditor"],
    enabled: true,
    value: () => visibleIncidents().length
  },
  {
    id: "connector-context",
    title: "Connector context",
    description: "Mock connector cards available in demo mode.",
    style: "neutral",
    roles: ["Admin", "Incident Manager", "Connector Service Account"],
    enabled: true,
    value: () => connectors.length
  }
];

const users = [
  { name: "Alex Admin", role: "Admin" },
  { name: "Morgan Manager", role: "Incident Manager" },
  { name: "Riley Analyst", role: "Analyst" },
  { name: "Jordan Viewer", role: "Viewer" },
  { name: "Casey Auditor", role: "Auditor" },
  { name: "Connector Import Bot", role: "Connector Service Account" }
];

let incidents = [
  {
    id: "INC-2026-001",
    title: "Phishing campaign targeting finance inboxes",
    severity: "High",
    status: "Investigating",
    type: "Phishing",
    owner: "Riley Analyst",
    assignedUsers: "Riley Analyst",
    assignedTeam: "Security Operations",
    detectionSource: "Email security alert",
    opened: "2026-06-14 09:12",
    closed: "",
    businessImpact: "Several users reported credential-harvesting emails. No confirmed account takeover documented.",
    executiveSummary: "A simulated phishing campaign was reported by finance users at Contoso Retail.",
    technicalSummary: "Messages contained a lookalike invoice link and suspicious sender domain.",
    suspectedRootCause: "",
    lessonsLearned: "Not documented",
    recommendations: "Continue user reporting reminders and verify mail filtering rules."
  },
  {
    id: "INC-2026-002",
    title: "Endpoint malware alert on lab workstation",
    severity: "Critical",
    status: "Containment",
    type: "Malware",
    owner: "Morgan Manager",
    assignedUsers: "Morgan Manager",
    assignedTeam: "Endpoint Response",
    detectionSource: "Mock EDR alert",
    opened: "2026-06-15 13:41",
    closed: "",
    businessImpact: "One fictional workstation isolated in the demo environment.",
    executiveSummary: "A mock EDR alert identified suspicious PowerShell execution on a Northstar Labs workstation.",
    technicalSummary: "The alert referenced encoded PowerShell and a staged file hash.",
    suspectedRootCause: "Not documented",
    lessonsLearned: "",
    recommendations: ""
  },
  {
    id: "INC-2026-003",
    title: "PRTG network alert for branch router",
    severity: "Medium",
    status: "Triage",
    type: "Network Alert",
    owner: "Riley Analyst",
    assignedUsers: "Riley Analyst, Jordan Viewer",
    assignedTeam: "Infrastructure",
    detectionSource: "Mock PRTG alert",
    opened: "2026-06-16 08:20",
    closed: "",
    businessImpact: "",
    executiveSummary: "A fictional branch router generated repeated availability alerts.",
    technicalSummary: "",
    suspectedRootCause: "",
    lessonsLearned: "",
    recommendations: ""
  }
];

let artifacts = [
  { id: "ART-001", incidentId: "INC-2026-001", type: "Email Header", source: "Mock email security gateway", description: "Fictional phishing message header summary", collectedBy: "Riley Analyst" },
  { id: "ART-002", incidentId: "INC-2026-002", type: "EDR Alert", source: "Mock EDR", description: "Suspicious encoded PowerShell execution alert", collectedBy: "Morgan Manager" },
  { id: "ART-003", incidentId: "INC-2026-003", type: "PRTG Alert", source: "Mock PRTG", description: "Repeated branch router availability alert", collectedBy: "Riley Analyst" }
];

let indicators = [
  { id: "IOC-001", incidentId: "INC-2026-001", type: "Domain", value: "invoice-demo.example", confidence: "Medium", status: "Investigating" },
  { id: "IOC-002", incidentId: "INC-2026-001", type: "URL", value: "https://portal.example.invalid/invoice", confidence: "High", status: "Blocked" },
  { id: "IOC-003", incidentId: "INC-2026-002", type: "File Hash", value: "demo-hash-7a8b9c", confidence: "High", status: "Malicious" }
];

let assets = [
  { id: "AST-001", incidentId: "INC-2026-001", hostname: "FIN-LAPTOP-07", type: "Workstation", owner: "Fictional Finance User", criticality: "Medium", status: "Under review" },
  { id: "AST-002", incidentId: "INC-2026-002", hostname: "LAB-WS-14", type: "Workstation", owner: "Northstar Labs Demo User", criticality: "High", status: "Isolated" },
  { id: "AST-003", incidentId: "INC-2026-003", hostname: "BRANCH-RTR-02", type: "Network Device", owner: "Infrastructure Team", criticality: "Medium", status: "Monitoring" }
];

let entities = [
  { id: "ENT-001", incidentId: "INC-2026-001", name: "finance.reporter@example.invalid", type: "User", role: "Reporter", department: "Finance" },
  { id: "ENT-002", incidentId: "INC-2026-001", name: "billing-alert@example.invalid", type: "External Sender", role: "Sender", department: "External" },
  { id: "ENT-003", incidentId: "INC-2026-002", name: "Northstar Labs Demo User", type: "User", role: "Affected user", department: "Research" }
];

let timeline = [
  { id: "EVT-001", incidentId: "INC-2026-001", timestamp: "2026-06-14 09:12", type: "Detection", description: "Finance user reported suspicious invoice email.", source: "User Report" },
  { id: "EVT-002", incidentId: "INC-2026-001", timestamp: "2026-06-14 09:36", type: "Containment", description: "Demo URL indicator marked blocked.", source: "Manual" },
  { id: "EVT-003", incidentId: "INC-2026-002", timestamp: "2026-06-15 13:41", type: "Detection", description: "Mock EDR alert received for encoded PowerShell.", source: "Mock Connector" },
  { id: "EVT-004", incidentId: "INC-2026-003", timestamp: "2026-06-16 08:20", type: "Connector Import", description: "Mock PRTG alert imported.", source: "Mock Connector" }
];

let actions = [
  { id: "ACT-001", incidentId: "INC-2026-001", title: "Review reported messages", owner: "Riley Analyst", priority: "High", status: "In Progress", due: "2026-06-18" },
  { id: "ACT-002", incidentId: "INC-2026-002", title: "Isolate affected workstation", owner: "Morgan Manager", priority: "Critical", status: "Done", due: "2026-06-15" },
  { id: "ACT-003", incidentId: "INC-2026-003", title: "Validate branch router telemetry", owner: "Riley Analyst", priority: "Medium", status: "Open", due: "2026-06-19" }
];

let attackMappings = [
  { id: "MAP-001", incidentId: "INC-2026-001", tactic: "TA0001 - Initial Access", technique: "T1566.002 - Spearphishing Link", confidence: "Medium", status: "Analyst Confirmed", relatedArtifact: "ART-001", notes: "Documented from reported mock email content." },
  { id: "MAP-002", incidentId: "INC-2026-002", tactic: "TA0002 - Execution", technique: "T1059.001 - PowerShell", confidence: "High", status: "Suggested", relatedArtifact: "ART-002", notes: "Based on mock EDR alert text." }
];

let connectors = [
  { name: "Zendesk / Freshservice Ticket", status: "Mock mode", description: "Demo ticket import would create artifacts, timeline events, and reporter entities." },
  { name: "EDR / XDR Alert", status: "Mock mode", description: "Demo alert import would create artifacts, indicators, affected assets, and response actions." },
  { name: "Email Security Alert", status: "Mock mode", description: "Demo email import would create sender entities, URL/domain indicators, and timeline entries." },
  { name: "PRTG Network Alert", status: "Mock mode", description: "Demo alert import would create network artifacts, affected assets, and timeline events." },
  { name: "Active Directory Lookup", status: "Future", description: "Future backend-only enrichment for users, departments, and groups." },
  { name: "Microsoft 365 Logs", status: "Future", description: "Future backend-only connector for approved lab or production architecture." }
];

let auditLog = [
  { id: "AUD-001", timestamp: "2026-06-14 09:12", user: "Riley Analyst", role: "Analyst", action: "Incident created", object: "INC-2026-001", source: "Manual" },
  { id: "AUD-002", timestamp: "2026-06-15 13:41", user: "Connector Import Bot", role: "Connector Service Account", action: "Mock connector import performed", object: "INC-2026-002", source: "Mock Connector" },
  { id: "AUD-003", timestamp: "2026-06-16 08:20", user: "Connector Import Bot", role: "Connector Service Account", action: "Mock connector import performed", object: "INC-2026-003", source: "Mock Connector" }
];

