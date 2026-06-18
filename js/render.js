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

      return row(cells, `class="clickable-row" tabindex="0" data-select-incident="${escapeHtml(incident.id)}"`);
    })
  );
}

function renderIncidents() {
  const selectedIncident = incidents.find((incident) => incident.id === selectedState.incidentId);
  if (selectedIncident) {
    document.getElementById("incidents").innerHTML = renderIncidentDetail(selectedIncident);
    return;
  }

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

function renderIncidentDetail(incident) {
  const links = getIncidentLinks(incident.id);
  return `
    ${sectionHeader("Incident Detail", "Linked records are filtered by Incident ID.")}
    <div class="card detail-panel">
      <div class="detail-header">
        <div>
          <h3>${escapeHtml(incident.id)} - ${escapeHtml(incident.title)}</h3>
          <div class="meta">${pill(incident.severity)} ${pill(incident.status)} <span>${escapeHtml(incident.type)}</span></div>
        </div>
        <div>
          <button class="secondary-button" type="button" data-back-list="incidents">Back to Incidents</button>
          <button class="table-action" type="button" data-edit-incident="${escapeHtml(incident.id)}">Edit</button>
          <button class="table-action danger-button" type="button" data-delete-incident="${escapeHtml(incident.id)}">Delete</button>
        </div>
      </div>
      <div class="detail-grid">
        ${detailField("Owner", incident.owner)}
        ${detailField("Opened", incident.opened)}
        ${detailField("Closed", incident.closed)}
        ${detailField("Assigned users", incident.assignedUsers)}
        ${detailField("Assigned team", incident.assignedTeam)}
        ${detailField("Detection source", incident.detectionSource)}
        ${detailField("Visibility", incident.visibility)}
        ${detailField("Shared with users", incident.sharedWithUsers)}
        ${detailField("Business impact", incident.businessImpact)}
        ${detailField("Executive summary", incident.executiveSummary)}
        ${detailField("Technical summary", incident.technicalSummary)}
        ${detailField("Suspected root cause", incident.suspectedRootCause)}
        ${detailField("Lessons learned", incident.lessonsLearned)}
      </div>
      <div class="detail-section">
        <h4>Evidence / Artifacts</h4>
        ${smallTable(["ID", "Type", "Source", "Description"], links.artifacts.map((item) => row([
          escapeHtml(item.id), escapeHtml(item.type), escapeHtml(item.source), escapeHtml(item.description)
        ], `class="clickable-row" tabindex="0" data-select-artifact="${escapeHtml(item.id)}"`)), "No linked artifacts documented.")}
      </div>
      <div class="detail-section">
        <h4>Response Actions</h4>
        ${smallTable(["ID", "Title", "Owner", "Priority", "Status"], links.actions.map((item) => row([
          escapeHtml(item.id), escapeHtml(item.title), escapeHtml(item.owner), pill(item.priority), escapeHtml(item.status)
        ], `class="clickable-row" tabindex="0" data-select-action="${escapeHtml(item.id)}"`)), "No response actions documented.")}
      </div>
      <div class="detail-section">
        <h4>Timeline Events</h4>
        ${smallTable(["ID", "Timestamp", "Type", "Description"], links.timeline.map((item) => row([
          escapeHtml(item.id), escapeHtml(item.timestamp), escapeHtml(item.type), escapeHtml(item.description)
        ], `class="clickable-row" tabindex="0" data-select-timeline="${escapeHtml(item.id)}"`)), "No timeline events documented.")}
      </div>
      <div class="detail-section">
        <h4>Indicators</h4>
        ${smallTable(["ID", "Type", "Value", "Status"], links.indicators.map((item) => row([
          escapeHtml(item.id), escapeHtml(item.type), escapeHtml(item.value), escapeHtml(item.status)
        ])), "No indicators documented.")}
      </div>
      <div class="detail-section">
        <h4>Assets</h4>
        ${smallTable(["ID", "Hostname", "Type", "Status"], links.assets.map((item) => row([
          escapeHtml(item.id), escapeHtml(item.hostname), escapeHtml(item.type), escapeHtml(item.status)
        ])), "No assets documented.")}
      </div>
      <div class="detail-section">
        <h4>Entities</h4>
        ${smallTable(["ID", "Name / Identifier", "Type", "Role"], links.entities.map((item) => row([
          escapeHtml(item.id), escapeHtml(item.name), escapeHtml(item.type), escapeHtml(item.role)
        ])), "No entities documented.")}
      </div>
      <div class="detail-section">
        <h4>ATT&CK Mappings</h4>
        ${smallTable(["ID", "Tactic", "Technique", "Status"], links.attackMappings.map((item) => row([
          escapeHtml(item.id), escapeHtml(item.tactic), escapeHtml(item.technique), escapeHtml(item.status)
        ])), "No ATT&CK mapping documented.")}
      </div>
    </div>
  `;
}

function renderArtifacts() {
  const selectedArtifact = artifacts.find((item) => item.id === selectedState.artifactId);
  if (selectedArtifact) {
    document.getElementById("artifacts").innerHTML = renderArtifactDetail(selectedArtifact);
    return;
  }

  document.getElementById("artifacts").innerHTML = `
    ${sectionHeader("Evidence / Artifacts", "Internal incident artifacts such as alerts, tickets, headers, screenshots, and references.")}
    ${table(["ID", "Incident", "Type", "Source Tool", "Description", "Collected By"], artifacts.map((item) => row([
      escapeHtml(item.id), escapeHtml(item.incidentId), escapeHtml(item.type), escapeHtml(item.source), escapeHtml(item.description), escapeHtml(item.collectedBy)
    ], `class="clickable-row" tabindex="0" data-select-artifact="${escapeHtml(item.id)}"`)))}
  `;
}

function renderArtifactDetail(item) {
  return `
    ${sectionHeader("Artifact Detail", "Artifact details are linked back to the incident by Incident ID.")}
    <div class="card detail-panel">
      <div class="detail-header">
        <div>
          <h3>${escapeHtml(item.id)} - ${escapeHtml(item.type)}</h3>
          <div class="meta"><span>Incident ${escapeHtml(item.incidentId)}</span></div>
        </div>
        <button class="secondary-button" type="button" data-back-list="artifacts">Back to Artifacts</button>
      </div>
      <div class="detail-grid">
        ${detailField("Incident ID", item.incidentId)}
        ${detailField("Type", item.type)}
        ${detailField("Source tool", item.source)}
        ${detailField("Description", item.description)}
        ${detailField("Collected by", item.collectedBy)}
      </div>
    </div>
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
  const selectedEvent = timeline.find((item) => item.id === selectedState.timelineId);
  if (selectedEvent) {
    document.getElementById("timeline").innerHTML = renderTimelineDetail(selectedEvent);
    return;
  }

  document.getElementById("timeline").innerHTML = `
    ${sectionHeader("Timeline", "Chronological incident activity reconstructed from documented fictional data.")}
    ${table(["ID", "Incident", "Timestamp", "Type", "Description", "Source"], timeline.map((item) => row([
      escapeHtml(item.id), escapeHtml(item.incidentId), escapeHtml(item.timestamp), escapeHtml(item.type), escapeHtml(item.description), escapeHtml(item.source)
    ], `class="clickable-row" tabindex="0" data-select-timeline="${escapeHtml(item.id)}"`)))}
  `;
}

function renderTimelineDetail(item) {
  return `
    ${sectionHeader("Timeline Event Detail", "Timeline events are linked back to the incident by Incident ID.")}
    <div class="card detail-panel">
      <div class="detail-header">
        <div>
          <h3>${escapeHtml(item.id)} - ${escapeHtml(item.type)}</h3>
          <div class="meta"><span>${escapeHtml(item.timestamp)}</span><span>Incident ${escapeHtml(item.incidentId)}</span></div>
        </div>
        <button class="secondary-button" type="button" data-back-list="timeline">Back to Timeline</button>
      </div>
      <div class="detail-grid">
        ${detailField("Incident ID", item.incidentId)}
        ${detailField("Timestamp", item.timestamp)}
        ${detailField("Type", item.type)}
        ${detailField("Description", item.description)}
        ${detailField("Source", item.source)}
      </div>
    </div>
  `;
}

function renderActions() {
  const selectedAction = actions.find((item) => item.id === selectedState.actionId);
  if (selectedAction) {
    document.getElementById("actions").innerHTML = renderActionDetail(selectedAction);
    return;
  }

  document.getElementById("actions").innerHTML = `
    ${sectionHeader("Response Actions", "Tracked work items for containment, eradication, recovery, and follow-up.")}
    ${table(["ID", "Incident", "Title", "Owner", "Priority", "Status", "Due"], actions.map((item) => row([
      escapeHtml(item.id), escapeHtml(item.incidentId), escapeHtml(item.title), escapeHtml(item.owner), pill(item.priority), pill(item.status), escapeHtml(item.due)
    ], `class="clickable-row" tabindex="0" data-select-action="${escapeHtml(item.id)}"`)))}
  `;
}

function renderActionDetail(item) {
  return `
    ${sectionHeader("Response Action Detail", "Response actions are linked back to the incident by Incident ID.")}
    <div class="card detail-panel">
      <div class="detail-header">
        <div>
          <h3>${escapeHtml(item.id)} - ${escapeHtml(item.title)}</h3>
          <div class="meta">${pill(item.priority)} ${pill(item.status)} <span>Incident ${escapeHtml(item.incidentId)}</span></div>
        </div>
        <button class="secondary-button" type="button" data-back-list="actions">Back to Response Actions</button>
      </div>
      <div class="detail-grid">
        ${detailField("Incident ID", item.incidentId)}
        ${detailField("Title", item.title)}
        ${detailField("Owner", item.owner)}
        ${detailField("Priority", item.priority)}
        ${detailField("Status", item.status)}
        ${detailField("Due date", item.due)}
        ${detailField("Description", item.description)}
        ${detailField("Completed date", item.completed)}
        ${detailField("Notes", item.notes)}
      </div>
    </div>
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
  clearStaleSelections();
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

