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

function row(cells) {
  return `<tr>${cells.map((cell) => `<td>${cell}</td>`).join("")}</tr>`;
}

