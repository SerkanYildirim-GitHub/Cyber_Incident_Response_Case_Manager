function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function extractMitreId(value, type) {
  const text = String(value || "");
  const match = type === "tactic"
    ? text.match(/\bTA\d{4}\b/i)
    : text.match(/\bT\d{4}(?:\.\d{3})?\b/i);

  return match ? match[0].toUpperCase() : "";
}

function mitreAttackUrl(id, type) {
  if (!id) {
    return "";
  }

  if (type === "tactic") {
    return `https://attack.mitre.org/tactics/${id}/`;
  }

  const parts = id.split(".");
  return parts.length === 2
    ? `https://attack.mitre.org/techniques/${parts[0]}/${parts[1]}/`
    : `https://attack.mitre.org/techniques/${id}/`;
}

function mitreAttackLink(value, type) {
  const id = extractMitreId(value, type);
  if (!id) {
    return `<span class="not-mapped">Not mapped</span>`;
  }

  const label = documented(value);
  const url = mitreAttackUrl(id, type);
  return `<a class="attack-link" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
}

function attackStatusLabel(mapping) {
  const status = documented(mapping.status);
  if (status === "Analyst Confirmed") {
    return escapeHtml(status);
  }

  return `${escapeHtml(status)} <span class="mapping-note">Demo / educational</span>`;
}

function documented(value) {
  return value && String(value).trim() ? value : "Not documented";
}

function cloneData(data) {
  return JSON.parse(JSON.stringify(data));
}

function nextIncidentId() {
  const year = new Date().getFullYear();
  const highest = incidents.reduce((max, incident) => {
    const match = String(incident.id || "").match(/INC-\d{4}-(\d+)/);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);

  return `INC-${year}-${String(highest + 1).padStart(3, "0")}`;
}

function toDateTimeInputValue(value) {
  if (!value) {
    return "";
  }

  return String(value).trim().replace(" ", "T");
}

function fromDateTimeInputValue(value) {
  if (!value) {
    return "";
  }

  return String(value).trim().replace("T", " ");
}

function currentRoleOption() {
  return roleOptions.find((option) => option.role === viewerSelect.value) || roleOptions[0];
}

function currentRole() {
  return currentRoleOption().role;
}

function currentDemoUserName() {
  const role = currentRole();
  const user = users.find((item) => item.role === role);
  return user ? user.name : currentRoleOption().label;
}

function isReadOnlyRole(role = currentRole()) {
  return ["Viewer", "Auditor", "Connector Service Account"].includes(role);
}

function canViewSection(sectionId, role = currentRole()) {
  const allowed = {
    Admin: ["dashboard", "incidents", "artifacts", "indicators", "assets", "entities", "timeline", "actions", "attack", "reports", "connectors", "users", "audit"],
    "Incident Manager": ["dashboard", "incidents", "artifacts", "indicators", "assets", "entities", "timeline", "actions", "attack", "reports", "connectors", "audit"],
    Analyst: ["dashboard", "incidents", "artifacts", "indicators", "assets", "entities", "timeline", "actions", "attack", "reports"],
    Viewer: ["dashboard", "incidents", "reports"],
    Auditor: ["dashboard", "reports", "audit"],
    "Connector Service Account": ["dashboard", "connectors", "audit"]
  };

  return (allowed[role] || []).includes(sectionId);
}

function incidentHasUser(incident, userName) {
  const haystack = `${incident.owner || ""} ${incident.assignedUsers || ""} ${incident.sharedWithUsers || ""}`;
  return haystack.toLowerCase().includes(String(userName).toLowerCase());
}

function canViewIncident(incident, role = currentRole()) {
  const userName = currentDemoUserName();
  if (role === "Admin" || role === "Incident Manager") return true;
  if (role === "Analyst") return incidentHasUser(incident, userName);
  if (role === "Viewer") return incidentHasUser(incident, userName);
  if (role === "Auditor") return incident.status === "Closed";
  return false;
}

function canCreateIncident(role = currentRole()) {
  return ["Admin", "Incident Manager", "Analyst"].includes(role);
}

function canEditIncident(incident, role = currentRole()) {
  if (!incident || isReadOnlyRole(role)) return false;
  if (role === "Admin" || role === "Incident Manager") return true;
  return role === "Analyst" && canViewIncident(incident, role);
}

function canDeleteIncident(incident, role = currentRole()) {
  return role === "Admin" && !!incident;
}

function canViewDashboardCard(card, role = currentRole()) {
  return card.enabled && card.roles.includes(role);
}

function canUseConnectorConfig(role = currentRole()) {
  return role === "Admin" || role === "Incident Manager";
}

function visibleIncidents() {
  return incidents.filter((incident) => canViewIncident(incident));
}

function visibleIncidentIds() {
  return new Set(visibleIncidents().map((incident) => incident.id));
}

function visibleLinkedRecords(records) {
  const ids = visibleIncidentIds();
  return records.filter((record) => ids.has(record.incidentId));
}

function restrictedMessage(sectionName) {
  return `
    ${sectionHeader(sectionName, "Demo role access")}
    <div class="notice warning">This demo role does not have access to this section. This is frontend-only role simulation, not production security.</div>
  `;
}

function severityClass(value) {
  return `severity-${String(value || "neutral").toLowerCase().replace(/\s+/g, "-")}`;
}

function pill(value) {
  const key = String(value || "").toLowerCase().replace(/\s+/g, "-");
  return `<span class="pill ${escapeHtml(key)} ${escapeHtml(severityClass(value))}">${escapeHtml(value)}</span>`;
}

function sectionHeader(title, text) {
  return `<div class="section-title"><div><h2>${title}</h2><p>${text}</p></div></div>`;
}

function table(headers, rows) {
  return `
    <table>
      <thead><tr>${headers.map((header) => `<th>${header}</th>`).join("")}</tr></thead>
      <tbody>${rows.join("")}</tbody>
    </table>
  `;
}

function row(cells, attrs = "") {
  return `<tr ${attrs}>${cells.map((cell) => `<td>${cell}</td>`).join("")}</tr>`;
}

function getIncidentLinks(incidentId) {
  return {
    artifacts: artifacts.filter((item) => item.incidentId === incidentId),
    actions: actions.filter((item) => item.incidentId === incidentId),
    timeline: timeline.filter((item) => item.incidentId === incidentId),
    indicators: indicators.filter((item) => item.incidentId === incidentId),
    assets: assets.filter((item) => item.incidentId === incidentId),
    entities: entities.filter((item) => item.incidentId === incidentId),
    attackMappings: attackMappings.filter((item) => item.incidentId === incidentId)
  };
}

function linkedRecordCount(incidentId) {
  const links = getIncidentLinks(incidentId);
  return Object.values(links).reduce((count, records) => count + records.length, 0);
}

function detailField(label, value) {
  return `
    <div class="detail-field">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(documented(value))}</strong>
    </div>
  `;
}

function emptyState(message) {
  return `<p class="empty-state">${escapeHtml(message)}</p>`;
}

function smallTable(headers, rows, emptyMessage) {
  if (!rows.length) {
    return emptyState(emptyMessage);
  }

  return table(headers, rows);
}
