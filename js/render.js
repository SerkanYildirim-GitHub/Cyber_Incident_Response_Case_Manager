function renderDashboard() {
  const openIncidents = incidents.filter((incident) => !["Closed", "False Positive"].includes(incident.status)).length;
  const highCritical = incidents.filter((incident) => ["High", "Critical"].includes(incident.severity)).length;
  const openActions = actions.filter((action) => action.status !== "Done" && action.status !== "Cancelled").length;
  const mappedIncidents = new Set(attackMappings.map((mapping) => mapping.incidentId)).size;

  document.getElementById("dashboard").innerHTML = `
    ${sectionHeader("Dashboard", "Current fictional incident response activity for the local prototype.")}
    ${storageNotice ? `<div class="notice warning">${escapeHtml(storageNotice)}</div>` : ""}
    <div class="toolbar">
      <button class="secondary-button" type="button" id="resetDemoData">Reset Demo Data</button>
      <button class="primary-button" type="button" id="createIncident">Create Incident</button>
    </div>
    <div class="grid metrics">
      <div class="card metric"><div class="label">Total incidents</div><div class="value">${incidents.length}</div></div>
      <div class="card metric"><div class="label">Open incidents</div><div class="value">${openIncidents}</div></div>
      <div class="card metric"><div class="label">High / Critical</div><div class="value">${highCritical}</div></div>
      <div class="card metric"><div class="label">Open actions</div><div class="value">${openActions}</div></div>
    </div>
    <div class="grid two-col">
      <div>
        ${renderIncidentTable()}
      </div>
      <div class="card">
        <h3>Prototype Coverage</h3>
        <p>${mappedIncidents} incidents have documented ATT&amp;CK mappings. ${incidents.length - mappedIncidents} incident has no mapping documented yet.</p>
        <p class="notice">All records on this page are fictional sample data. Role switching is visual demo behavior only and is not authentication.</p>
      </div>
    </div>
  `;
}

function renderIncidentTable(includeActions = false) {
  return table(
    includeActions ? ["ID", "Title", "Severity", "Status", "Owner", "Detection Source", "Actions"] : ["ID", "Title", "Severity", "Status", "Owner", "Detection Source"],
    incidents.map((incident) => {
      const cells = [
        escapeHtml(incident.id),
        escapeHtml(incident.title),
        pill(incident.severity),
        escapeHtml(incident.status),
        escapeHtml(incident.owner),
        escapeHtml(incident.detectionSource)
      ];

      if (includeActions) {
        cells.push(`
          <button class="table-action" type="button" data-edit-incident="${escapeHtml(incident.id)}">Edit</button>
          <button class="table-action danger-button" type="button" data-delete-incident="${escapeHtml(incident.id)}">Delete</button>
        `);
      }

      return row(cells);
    })
  );
}

function renderIncidents() {
  document.getElementById("incidents").innerHTML = `
    ${sectionHeader("Incidents", "Fictional sample incidents with internal response terminology.")}
    ${storageNotice ? `<div class="notice warning">${escapeHtml(storageNotice)}</div>` : ""}
    <div class="toolbar">
      <button class="secondary-button" type="button" id="resetDemoData">Reset Demo Data</button>
      <button class="primary-button" type="button" id="createIncident">Create Incident</button>
    </div>
    ${renderIncidentTable(true)}
  `;
}

function renderArtifacts() {
  document.getElementById("artifacts").innerHTML = `
    ${sectionHeader("Evidence / Artifacts", "Internal incident artifacts such as alerts, tickets, headers, screenshots, and references.")}
    ${table(["ID", "Incident", "Type", "Source Tool", "Description", "Collected By"], artifacts.map((item) => row([
      escapeHtml(item.id), escapeHtml(item.incidentId), escapeHtml(item.type), escapeHtml(item.source), escapeHtml(item.description), escapeHtml(item.collectedBy)
    ])))}
  `;
}

function renderIndicators() {
  document.getElementById("indicators").innerHTML = `
    ${sectionHeader("Indicators", "Demo observables and indicators connected to fictional incidents.")}
    ${table(["ID", "Incident", "Type", "Value", "Confidence", "Status"], indicators.map((item) => row([
      escapeHtml(item.id), escapeHtml(item.incidentId), escapeHtml(item.type), escapeHtml(item.value), pill(item.confidence), escapeHtml(item.status)
    ])))}
  `;
}

function renderAssets() {
  document.getElementById("assets").innerHTML = `
    ${sectionHeader("Assets", "Fictional affected systems, devices, resources, and applications.")}
    ${table(["ID", "Incident", "Hostname", "Type", "Owner", "Criticality", "Status"], assets.map((item) => row([
      escapeHtml(item.id), escapeHtml(item.incidentId), escapeHtml(item.hostname), escapeHtml(item.type), escapeHtml(item.owner), pill(item.criticality), escapeHtml(item.status)
    ])))}
  `;
}

function renderEntities() {
  document.getElementById("entities").innerHTML = `
    ${sectionHeader("Entities", "Fictional users, senders, service accounts, and related entities.")}
    ${table(["ID", "Incident", "Name / Identifier", "Type", "Role", "Department"], entities.map((item) => row([
      escapeHtml(item.id), escapeHtml(item.incidentId), escapeHtml(item.name), escapeHtml(item.type), escapeHtml(item.role), escapeHtml(item.department)
    ])))}
  `;
}

function renderTimeline() {
  document.getElementById("timeline").innerHTML = `
    ${sectionHeader("Timeline", "Chronological incident activity reconstructed from documented fictional data.")}
    ${table(["ID", "Incident", "Timestamp", "Type", "Description", "Source"], timeline.map((item) => row([
      escapeHtml(item.id), escapeHtml(item.incidentId), escapeHtml(item.timestamp), escapeHtml(item.type), escapeHtml(item.description), escapeHtml(item.source)
    ])))}
  `;
}

function renderActions() {
  document.getElementById("actions").innerHTML = `
    ${sectionHeader("Response Actions", "Tracked work items for containment, eradication, recovery, and follow-up.")}
    ${table(["ID", "Incident", "Title", "Owner", "Priority", "Status", "Due"], actions.map((item) => row([
      escapeHtml(item.id), escapeHtml(item.incidentId), escapeHtml(item.title), escapeHtml(item.owner), pill(item.priority), pill(item.status), escapeHtml(item.due)
    ])))}
  `;
}

function renderAttack() {
  document.getElementById("attack").innerHTML = `
    ${sectionHeader("ATT&CK Mapping", "Educational demo mappings. Mappings are documented manually and do not fetch live MITRE data.")}
    ${table(["ID", "Incident", "Tactic", "Technique", "Confidence", "Status", "Related Artifact", "Notes"], attackMappings.map((item) => row([
      escapeHtml(item.id), escapeHtml(item.incidentId), escapeHtml(item.tactic), escapeHtml(item.technique), pill(item.confidence), escapeHtml(item.status), escapeHtml(item.relatedArtifact), escapeHtml(item.notes)
    ])))}
  `;
}

function renderConnectors() {
  document.getElementById("connectors").innerHTML = `
    ${sectionHeader("Connectors", "Mock connector cards only. No real APIs are called and no credentials are used.")}
    <p class="notice">Real API integrations require a backend service, secure secrets storage, and security review. Do not store API keys in this frontend prototype.</p>
    <div class="grid connector-grid">
      ${connectors.map((connector) => `
        <div class="card connector-card">
          <div>
            <h3>${escapeHtml(connector.name)}</h3>
            <p>${escapeHtml(connector.description)}</p>
          </div>
          ${pill(connector.status)}
        </div>
      `).join("")}
    </div>
  `;
}

function renderUsers() {
  document.getElementById("users").innerHTML = `
    ${sectionHeader("Users / Roles", "Simulated demo users only. This is not real authentication or backend-enforced authorization.")}
    ${table(["Demo User", "Role", "Prototype Note"], users.map((user) => row([
      escapeHtml(user.name),
      escapeHtml(user.role),
      "Frontend-only demo role display"
    ])))}
  `;
}

function renderAudit() {
  document.getElementById("audit").innerHTML = `
    ${sectionHeader("Audit Log", "Mock audit entries showing the intended future audit model.")}
    ${table(["ID", "Timestamp", "User", "Role", "Action", "Object", "Source"], auditLog.map((item) => row([
      escapeHtml(item.id), escapeHtml(item.timestamp), escapeHtml(item.user), escapeHtml(item.role), escapeHtml(item.action), escapeHtml(item.object), escapeHtml(item.source)
    ])))}
  `;
}


function renderReports() {
  document.getElementById("reports").innerHTML = `
    ${sectionHeader("Reports", "Basic report preview generated only from documented fictional sample data.")}
    <div class="card report-tools">
      <label for="incidentReportSelect">Incident</label>
      <select id="incidentReportSelect">
        ${incidents.map((incident) => `<option value="${escapeHtml(incident.id)}">${escapeHtml(incident.id)} - ${escapeHtml(incident.title)}</option>`).join("")}
      </select>
      <button type="button" id="refreshReport">Refresh Preview</button>
    </div>
    <div class="report-preview" id="reportPreview"></div>
  `;

  const select = document.getElementById("incidentReportSelect");
  const preview = document.getElementById("reportPreview");
  const refresh = document.getElementById("refreshReport");

  function updateReport() {
    preview.textContent = buildReport(select.value);
  }

  select.addEventListener("change", updateReport);
  refresh.addEventListener("click", updateReport);
  updateReport();
}

function renderDataViews() {
  renderDashboard();
  renderIncidents();
  renderArtifacts();
  renderIndicators();
  renderAssets();
  renderEntities();
  renderTimeline();
  renderActions();
  renderAttack();
  renderReports();
  renderConnectors();
  renderUsers();
  renderAudit();
}


function renderNav() {
  nav.innerHTML = `
    <div class="nav-menu">
      <button class="nav-toggle" type="button" id="navToggle" aria-label="Hide navigation panel" aria-expanded="true" title="Hide navigation panel">&lt;</button>
      ${navGroups.map((group, index) => {
      const section = group.section || group.children[0].section;
      const hasChildren = Array.isArray(group.children);
      return `
        <div class="nav-group">
          <button class="nav-button ${hasChildren ? "has-children" : ""} ${index === 0 ? "active" : ""}" type="button" data-section="${section}">
            ${escapeHtml(group.label)}
          </button>
          ${hasChildren ? `
            <div class="nav-submenu">
              ${group.children.map((child) => `
                <button class="nav-subitem" type="button" data-section="${escapeHtml(child.section)}">${escapeHtml(child.label)}</button>
              `).join("")}
            </div>
          ` : ""}
        </div>
      `;
      }).join("")}
    </div>
    <footer class="app-footer">
      <button class="footer-link" type="button" id="openDisclaimer">Prototype Disclaimer</button>
      <p class="powered-by">Powered by CyberBilly</p>
    </footer>
  `;

  nav.addEventListener("click", (event) => {
    const toggle = event.target.closest("#navToggle");
    if (toggle) {
      const isCollapsed = appShell.classList.toggle("nav-collapsed");
      toggle.setAttribute("aria-expanded", String(!isCollapsed));
      toggle.setAttribute("aria-label", isCollapsed ? "Show navigation panel" : "Hide navigation panel");
      toggle.setAttribute("title", isCollapsed ? "Show navigation panel" : "Hide navigation panel");
      toggle.textContent = isCollapsed ? ">" : "<";
      return;
    }

    const button = event.target.closest(".nav-button, .nav-subitem");
    if (!button) return;

    document.querySelectorAll(".nav-button, .nav-subitem").forEach((item) => item.classList.remove("active"));
    document.querySelectorAll(".section").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    const groupButton = button.closest(".nav-group")?.querySelector(".nav-button");
    if (button.classList.contains("nav-subitem") && groupButton) {
      groupButton.classList.add("active");
    }
    document.getElementById(button.dataset.section).classList.add("active");
  });
}

function renderViewer() {
  viewerSelect.innerHTML = roleOptions.map((option) => `<option value="${escapeHtml(option.role)}">${escapeHtml(option.label)}</option>`).join("");

  function applyRoleTheme() {
    const selected = roleOptions.find((option) => option.role === viewerSelect.value) || roleOptions[0];
    appHeader.classList.remove(...roleOptions.map((option) => option.theme));
    appHeader.classList.add(selected.theme);
    return selected;
  }

  viewerSelect.addEventListener("change", () => {
    const selected = applyRoleTheme();
    auditLog.unshift({
      id: `AUD-${String(auditLog.length + 1).padStart(3, "0")}`,
      timestamp: "Demo session",
      user: selected.label,
      role: selected.role,
      action: "User/role switched in demo mode",
      object: "Prototype view",
      source: "System"
    });
    saveAppData();
    renderAudit();
  });

  applyRoleTheme();
}

