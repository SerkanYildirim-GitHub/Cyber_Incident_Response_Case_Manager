function renderDashboard() {
  const role = currentRole();
  const allowedCards = dashboardCards.filter((card) => canViewDashboardCard(card, role));
  const visibleCardIds = new Set(visibleDashboardCardIds(role));
  const visibleCards = allowedCards.filter((card) => visibleCardIds.has(card.id));
  const customization = allowedCards.map((card) => `
    <label class="dashboard-toggle">
      <input type="checkbox" data-dashboard-card="${escapeHtml(card.id)}" ${visibleCardIds.has(card.id) ? "checked" : ""}>
      <span>${escapeHtml(card.title)}</span>
    </label>
  `).join("");

  document.getElementById("dashboard").innerHTML = `
    ${sectionHeader("Dashboard", `Current fictional incident response activity for ${escapeHtml(role)} demo view.`)}
    ${storageNotice ? `<div class="notice warning">${escapeHtml(storageNotice)}</div>` : ""}
    <div class="toolbar">
      <button class="secondary-button" type="button" id="customizeDashboard">Customize Dashboard</button>
      <button class="secondary-button" type="button" id="resetDashboardLayout">Reset Dashboard Layout</button>
      ${canCreateIncident() ? `<button class="primary-button" type="button" id="createIncident">Create Incident</button>` : ""}
      ${currentRole() === "Admin" ? `<button class="secondary-button" type="button" id="resetDemoData">Reset Demo Data</button>` : ""}
    </div>
    <div class="card dashboard-customizer" id="dashboardCustomizer" hidden>
      <h3>Customize Dashboard</h3>
      <p>Show or hide cards available to the current demo role.</p>
      <div class="dashboard-toggle-grid">${customization || emptyState("No dashboard cards available for this role.")}</div>
    </div>
    <div class="grid metrics">
      ${visibleCards.map((card) => `
        <div class="card metric card-${escapeHtml(card.style)}">
          <div class="label">${escapeHtml(card.title)}</div>
          <div class="value">${escapeHtml(card.value())}</div>
          <p>${escapeHtml(card.description)}</p>
        </div>
      `).join("") || emptyState("No dashboard cards selected. Use Customize Dashboard to enable cards.")}
    </div>
    ${renderIncidentTable()}
  `;
}

function renderIncidentTable(includeActions = false) {
  const visible = visibleIncidents();
  return table(
    includeActions ? ["ID", "Title", "Severity", "Status", "Owner", "Detection Source", "Actions"] : ["ID", "Title", "Severity", "Status", "Owner", "Detection Source"],
    visible.map((incident) => {
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
          ${canEditIncident(incident) ? `<button class="table-action" type="button" data-edit-incident="${escapeHtml(incident.id)}">Edit</button>` : ""}
          ${canDeleteIncident(incident) ? `<button class="table-action danger-button" type="button" data-delete-incident="${escapeHtml(incident.id)}">Delete</button>` : ""}
        `);
      }

      return row(cells, `class="clickable-row ${escapeHtml(severityClass(incident.severity))}" tabindex="0" data-select-incident="${escapeHtml(incident.id)}"`);
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
      ${canCreateIncident() ? `<button class="primary-button" type="button" id="createIncident">Create Incident</button>` : ""}
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
          ${canEditIncident(incident) ? `<button class="table-action" type="button" data-edit-incident="${escapeHtml(incident.id)}">Edit</button>` : ""}
          ${canDeleteIncident(incident) ? `<button class="table-action danger-button" type="button" data-delete-incident="${escapeHtml(incident.id)}">Delete</button>` : ""}
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
          escapeHtml(item.id), mitreAttackLink(item.tactic, "tactic"), mitreAttackLink(item.technique, "technique"), attackStatusLabel(item)
        ])), "No ATT&CK mapping documented.")}
      </div>
    </div>
  `;
}

function renderArtifacts() {
  if (!canViewSection("artifacts")) {
    document.getElementById("artifacts").innerHTML = restrictedMessage("Evidence / Artifacts");
    return;
  }
  const selectedArtifact = artifacts.find((item) => item.id === selectedState.artifactId);
  if (selectedArtifact) {
    document.getElementById("artifacts").innerHTML = renderArtifactDetail(selectedArtifact);
    return;
  }

  document.getElementById("artifacts").innerHTML = `
    ${sectionHeader("Evidence / Artifacts", "Internal incident artifacts such as alerts, tickets, headers, screenshots, and references.")}
    ${table(["ID", "Incident", "Type", "Source Tool", "Description", "Collected By"], visibleLinkedRecords(artifacts).map((item) => row([
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
  if (!canViewSection("indicators")) {
    document.getElementById("indicators").innerHTML = restrictedMessage("Indicators");
    return;
  }
  document.getElementById("indicators").innerHTML = `
    ${sectionHeader("Indicators", "Demo observables and indicators connected to fictional incidents.")}
    ${table(["ID", "Incident", "Type", "Value", "Confidence", "Status"], visibleLinkedRecords(indicators).map((item) => row([
      escapeHtml(item.id), escapeHtml(item.incidentId), escapeHtml(item.type), escapeHtml(item.value), pill(item.confidence), escapeHtml(item.status)
    ])))}
  `;
}

function renderAssets() {
  if (!canViewSection("assets")) {
    document.getElementById("assets").innerHTML = restrictedMessage("Assets");
    return;
  }
  document.getElementById("assets").innerHTML = `
    ${sectionHeader("Assets", "Fictional affected systems, devices, resources, and applications.")}
    ${table(["ID", "Incident", "Hostname", "Type", "Owner", "Criticality", "Status"], visibleLinkedRecords(assets).map((item) => row([
      escapeHtml(item.id), escapeHtml(item.incidentId), escapeHtml(item.hostname), escapeHtml(item.type), escapeHtml(item.owner), pill(item.criticality), escapeHtml(item.status)
    ])))}
  `;
}

function renderEntities() {
  if (!canViewSection("entities")) {
    document.getElementById("entities").innerHTML = restrictedMessage("Entities");
    return;
  }
  document.getElementById("entities").innerHTML = `
    ${sectionHeader("Entities", "Fictional users, senders, service accounts, and related entities.")}
    ${table(["ID", "Incident", "Name / Identifier", "Type", "Role", "Department"], visibleLinkedRecords(entities).map((item) => row([
      escapeHtml(item.id), escapeHtml(item.incidentId), escapeHtml(item.name), escapeHtml(item.type), escapeHtml(item.role), escapeHtml(item.department)
    ])))}
  `;
}

function renderTimeline() {
  if (!canViewSection("timeline")) {
    document.getElementById("timeline").innerHTML = restrictedMessage("Timeline");
    return;
  }
  const selectedEvent = timeline.find((item) => item.id === selectedState.timelineId);
  if (selectedEvent) {
    document.getElementById("timeline").innerHTML = renderTimelineDetail(selectedEvent);
    return;
  }

  document.getElementById("timeline").innerHTML = `
    ${sectionHeader("Timeline", "Chronological incident activity reconstructed from documented fictional data.")}
    ${table(["ID", "Incident", "Timestamp", "Type", "Description", "Source"], visibleLinkedRecords(timeline).map((item) => row([
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
  if (!canViewSection("actions")) {
    document.getElementById("actions").innerHTML = restrictedMessage("Response Actions");
    return;
  }
  const selectedAction = actions.find((item) => item.id === selectedState.actionId);
  if (selectedAction) {
    document.getElementById("actions").innerHTML = renderActionDetail(selectedAction);
    return;
  }

  document.getElementById("actions").innerHTML = `
    ${sectionHeader("Response Actions", "Tracked work items for containment, eradication, recovery, and follow-up.")}
    ${table(["ID", "Incident", "Title", "Owner", "Priority", "Status", "Due"], visibleLinkedRecords(actions).map((item) => row([
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
  if (!canViewSection("attack")) {
    document.getElementById("attack").innerHTML = restrictedMessage("ATT&CK Mapping");
    return;
  }
  document.getElementById("attack").innerHTML = `
    ${sectionHeader("ATT&CK Mapping", "Educational demo mappings. Mappings are documented manually and do not fetch live MITRE data.")}
    ${table(["ID", "Incident", "Tactic", "Technique", "Confidence", "Status", "Related Artifact", "Notes"], visibleLinkedRecords(attackMappings).map((item) => row([
      escapeHtml(item.id), escapeHtml(item.incidentId), mitreAttackLink(item.tactic, "tactic"), mitreAttackLink(item.technique, "technique"), pill(item.confidence), attackStatusLabel(item), escapeHtml(item.relatedArtifact), escapeHtml(item.notes)
    ])))}
  `;
}

function renderConnectors() {
  if (!canViewSection("connectors")) {
    document.getElementById("connectors").innerHTML = restrictedMessage("Connectors");
    return;
  }
  document.getElementById("connectors").innerHTML = `
    ${sectionHeader("Connectors", "Mock connector cards only. No real APIs are called and no credentials are used.")}
    <p class="notice">${canUseConnectorConfig() ? "Real API integrations require a backend service, secure secrets storage, and security review. Do not store API keys in this frontend prototype." : "Connector Service Account is a conceptual demo role. No real connector configuration is available in this frontend prototype."}</p>
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
  if (!canViewSection("users")) {
    document.getElementById("users").innerHTML = restrictedMessage("Users / Roles");
    return;
  }
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
  if (!canViewSection("audit")) {
    document.getElementById("audit").innerHTML = restrictedMessage("Audit Log");
    return;
  }
  document.getElementById("audit").innerHTML = `
    ${sectionHeader("Audit Log", "Mock audit entries showing the intended future audit model.")}
    ${table(["ID", "Timestamp", "User", "Role", "Action", "Object", "Source"], auditLog.map((item) => row([
      escapeHtml(item.id), escapeHtml(item.timestamp), escapeHtml(item.user), escapeHtml(item.role), escapeHtml(item.action), escapeHtml(item.object), escapeHtml(item.source)
    ])))}
  `;
}


function renderReports() {
  const visible = visibleIncidents();
  document.getElementById("reports").innerHTML = `
    ${sectionHeader("Reports", "Basic report preview generated only from documented fictional sample data.")}
    <div class="card report-tools">
      <label for="incidentReportSelect">Incident</label>
      <select id="incidentReportSelect">
        ${visible.map((incident) => `<option value="${escapeHtml(incident.id)}">${escapeHtml(incident.id)} - ${escapeHtml(incident.title)}</option>`).join("")}
      </select>
      <button type="button" id="refreshReport">Refresh Preview</button>
    </div>
    <div class="report-preview" id="reportPreview"></div>
  `;

  const select = document.getElementById("incidentReportSelect");
  const preview = document.getElementById("reportPreview");
  const refresh = document.getElementById("refreshReport");

  function updateReport() {
    preview.innerHTML = select.value ? buildReportHtml(select.value) : escapeHtml("No incidents available for this demo role.");
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
  const renderChild = (child) => canViewSection(child.section) ? `
    <button class="nav-subitem" type="button" data-section="${escapeHtml(child.section)}">${escapeHtml(child.label)}</button>
  ` : "";
  const visibleGroups = navGroups.map((group) => {
    if (group.children) {
      const children = group.children.filter((child) => canViewSection(child.section));
      return children.length ? { ...group, children } : null;
    }
    return canViewSection(group.section) ? group : null;
  }).filter(Boolean);

  nav.innerHTML = `
    <div class="nav-menu">
      <button class="nav-toggle" type="button" id="navToggle" aria-label="Hide navigation panel" aria-expanded="true" title="Hide navigation panel">&lt;</button>
      ${visibleGroups.map((group, index) => {
      const section = group.section || group.children[0].section;
      const hasChildren = Array.isArray(group.children);
      return `
        <div class="nav-group">
          <button class="nav-button ${hasChildren ? "has-children" : ""} ${index === 0 ? "active" : ""}" type="button" data-section="${section}">
            ${escapeHtml(group.label)}
          </button>
          ${hasChildren ? `
            <div class="nav-submenu">
              ${group.children.map(renderChild).join("")}
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
    const targetSection = button.dataset.section;
    if (!canViewSection(targetSection)) {
      showAllowedDefaultSection();
      return;
    }
    document.getElementById(targetSection).classList.add("active");
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
    clearAllSelections();
    renderNav();
    renderDataViews();
    showAllowedDefaultSection();
  });

  applyRoleTheme();
}

