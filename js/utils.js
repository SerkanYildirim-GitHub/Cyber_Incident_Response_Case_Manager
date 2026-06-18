function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
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

function pill(value) {
  const key = String(value || "").toLowerCase().replace(/\s+/g, "-");
  return `<span class="pill ${escapeHtml(key)}">${escapeHtml(value)}</span>`;
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
