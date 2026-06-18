const appShell = document.getElementById("appShell");
const appHeader = document.querySelector("header");
const nav = document.getElementById("nav");
const viewerSelect = document.getElementById("viewerSelect");
let openDisclaimer = null;
const closeDisclaimer = document.getElementById("closeDisclaimer");
const disclaimerModal = document.getElementById("disclaimerModal");
const incidentModal = document.getElementById("incidentModal");
const incidentForm = document.getElementById("incidentForm");
const incidentFormError = document.getElementById("incidentFormError");
const incidentModalTitle = document.getElementById("incidentModalTitle");
const closeIncidentModal = document.getElementById("closeIncidentModal");
const cancelIncidentForm = document.getElementById("cancelIncidentForm");
const incidentMode = document.getElementById("incidentMode");
const incidentFields = {
  id: document.getElementById("incidentId"),
  title: document.getElementById("incidentTitle"),
  severity: document.getElementById("incidentSeverity"),
  status: document.getElementById("incidentStatus"),
  type: document.getElementById("incidentType"),
  owner: document.getElementById("incidentOwner"),
  opened: document.getElementById("incidentOpened"),
  closed: document.getElementById("incidentClosed"),
  assignedUsers: document.getElementById("incidentAssignedUsers"),
  assignedTeam: document.getElementById("incidentAssignedTeam"),
  detectionSource: document.getElementById("incidentDetectionSource"),
  visibility: document.getElementById("incidentVisibility"),
  sharedWithUsers: document.getElementById("incidentSharedWithUsers"),
  businessImpact: document.getElementById("incidentBusinessImpact"),
  executiveSummary: document.getElementById("incidentExecutiveSummary"),
  technicalSummary: document.getElementById("incidentTechnicalSummary"),
  suspectedRootCause: document.getElementById("incidentSuspectedRootCause"),
  lessonsLearned: document.getElementById("incidentLessonsLearned")
};

const selectedState = {
  incidentId: "",
  artifactId: "",
  actionId: "",
  timelineId: ""
};

function clearStaleSelections() {
  if (selectedState.incidentId && !incidents.some((item) => item.id === selectedState.incidentId)) {
    selectedState.incidentId = "";
  }
  if (selectedState.artifactId && !artifacts.some((item) => item.id === selectedState.artifactId)) {
    selectedState.artifactId = "";
  }
  if (selectedState.actionId && !actions.some((item) => item.id === selectedState.actionId)) {
    selectedState.actionId = "";
  }
  if (selectedState.timelineId && !timeline.some((item) => item.id === selectedState.timelineId)) {
    selectedState.timelineId = "";
  }
}

function showSection(sectionId) {
  document.querySelectorAll(".section").forEach((item) => item.classList.remove("active"));
  const section = document.getElementById(sectionId);
  if (section) {
    section.classList.add("active");
  }
}

function selectIncident(incidentId) {
  selectedState.incidentId = incidentId;
  renderIncidents();
  showSection("incidents");
}

function selectArtifact(artifactId) {
  selectedState.artifactId = artifactId;
  renderArtifacts();
  showSection("artifacts");
}

function selectAction(actionId) {
  selectedState.actionId = actionId;
  renderActions();
  showSection("actions");
}

function selectTimelineEvent(eventId) {
  selectedState.timelineId = eventId;
  renderTimeline();
  showSection("timeline");
}

function clearSelectionForList(listName) {
  if (listName === "incidents") selectedState.incidentId = "";
  if (listName === "artifacts") selectedState.artifactId = "";
  if (listName === "actions") selectedState.actionId = "";
  if (listName === "timeline") selectedState.timelineId = "";
  renderDataViews();
  showSection(listName);
}

function clearAllSelections() {
  selectedState.incidentId = "";
  selectedState.artifactId = "";
  selectedState.actionId = "";
  selectedState.timelineId = "";
}

function bindSelectionActions() {
  document.addEventListener("click", (event) => {
    const backButton = event.target.closest("[data-back-list]");
    if (backButton) {
      clearSelectionForList(backButton.dataset.backList);
      return;
    }

    if (event.target.closest("button")) {
      return;
    }

    const incidentRow = event.target.closest("[data-select-incident]");
    if (incidentRow) {
      selectIncident(incidentRow.dataset.selectIncident);
      return;
    }

    const artifactRow = event.target.closest("[data-select-artifact]");
    if (artifactRow) {
      selectArtifact(artifactRow.dataset.selectArtifact);
      return;
    }

    const actionRow = event.target.closest("[data-select-action]");
    if (actionRow) {
      selectAction(actionRow.dataset.selectAction);
      return;
    }

    const timelineRow = event.target.closest("[data-select-timeline]");
    if (timelineRow) {
      selectTimelineEvent(timelineRow.dataset.selectTimeline);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    if (target.matches("[data-select-incident]")) {
      event.preventDefault();
      selectIncident(target.dataset.selectIncident);
    } else if (target.matches("[data-select-artifact]")) {
      event.preventDefault();
      selectArtifact(target.dataset.selectArtifact);
    } else if (target.matches("[data-select-action]")) {
      event.preventDefault();
      selectAction(target.dataset.selectAction);
    } else if (target.matches("[data-select-timeline]")) {
      event.preventDefault();
      selectTimelineEvent(target.dataset.selectTimeline);
    }
  });
}


function clearIncidentForm() {
  incidentForm.reset();
  incidentMode.value = "create";
  incidentFields.id.disabled = false;
  incidentFormError.textContent = "";
  incidentFormError.classList.remove("visible");
}

function openIncidentModal(mode, incidentId) {
  clearIncidentForm();
  incidentMode.value = mode;
  incidentModalTitle.textContent = mode === "edit" ? "Edit Incident" : "Create Incident";

  if (mode === "edit") {
    const incident = incidents.find((item) => item.id === incidentId);
    if (!incident) {
      return;
    }

    Object.keys(incidentFields).forEach((key) => {
      incidentFields[key].value = key === "opened" || key === "closed" ? toDateTimeInputValue(incident[key]) : incident[key] || "";
    });
  } else {
    incidentFields.id.value = nextIncidentId();
  }

  incidentModal.classList.add("open");
  incidentModal.setAttribute("aria-hidden", "false");
  incidentFields.id.focus();
}

function closeIncidentFormModal() {
  incidentModal.classList.remove("open");
  incidentModal.setAttribute("aria-hidden", "true");
  clearIncidentForm();
}

function readIncidentForm() {
  const incident = {};
  Object.keys(incidentFields).forEach((key) => {
    const value = incidentFields[key].value.trim();
    incident[key] = key === "opened" || key === "closed" ? fromDateTimeInputValue(value) : value;
  });
  return incident;
}

function validateIncidentForm(incident, mode) {
  const required = [
    ["id", "Incident ID"],
    ["title", "Title"],
    ["severity", "Severity"],
    ["status", "Status"],
    ["type", "Incident type"],
    ["owner", "Owner"],
    ["opened", "Opened date/time"]
  ];
  const missing = required.filter(([key]) => !incident[key]).map(([, label]) => label);

  if (missing.length) {
    return `Missing required fields: ${missing.join(", ")}.`;
  }

  const duplicate = incidents.some((item) => item.id === incident.id);
  if (mode === "create" && duplicate) {
    return "Incident ID already exists. Use a unique fictional incident ID.";
  }

  return "";
}

function showIncidentFormError(message) {
  incidentFormError.textContent = message;
  incidentFormError.classList.add("visible");
}

function saveIncidentFromForm(event) {
  event.preventDefault();
  const mode = incidentMode.value;
  const incident = readIncidentForm();
  const validationMessage = validateIncidentForm(incident, mode);

  if (validationMessage) {
    showIncidentFormError(validationMessage);
    return;
  }

  if (mode === "edit") {
    const index = incidents.findIndex((item) => item.id === incident.id);
    if (index === -1) {
      showIncidentFormError("Incident could not be found.");
      return;
    }
    incidents[index] = { ...incidents[index], ...incident };
    addAuditEntry("Incident edited", incident.id);
  } else {
    incidents.unshift(incident);
    addAuditEntry("Incident created", incident.id);
  }

  saveAppData();
  closeIncidentFormModal();
  renderDataViews();
}

function deleteIncident(incidentId) {
  const incident = incidents.find((item) => item.id === incidentId);
  if (!incident) {
    return;
  }

  const linkCount = linkedRecordCount(incidentId);
  if (linkCount > 0) {
    alert(`Cannot delete ${incident.id} because it has ${linkCount} linked demo record(s). Remove linked records or reset demo data first.`);
    return;
  }

  if (!confirm(`Delete fictional incident ${incident.id}?`)) {
    return;
  }

  appData.incidents = incidents.filter((item) => item.id !== incidentId);
  syncDataRefs(appData);
  selectedState.incidentId = "";
  addAuditEntry("Incident deleted", incidentId);
  saveAppData();
  renderDataViews();
}

function bindIncidentActions() {
  document.addEventListener("click", (event) => {
    const createButton = event.target.closest("#createIncident");
    if (createButton) {
      openIncidentModal("create");
      return;
    }

    const resetButton = event.target.closest("#resetDemoData");
    if (resetButton) {
      resetDemoData();
      return;
    }

    const editButton = event.target.closest("[data-edit-incident]");
    if (editButton) {
      openIncidentModal("edit", editButton.dataset.editIncident);
      return;
    }

    const deleteButton = event.target.closest("[data-delete-incident]");
    if (deleteButton) {
      deleteIncident(deleteButton.dataset.deleteIncident);
    }
  });

  incidentForm.addEventListener("submit", saveIncidentFromForm);
  closeIncidentModal.addEventListener("click", closeIncidentFormModal);
  cancelIncidentForm.addEventListener("click", closeIncidentFormModal);
  [incidentFields.opened, incidentFields.closed].forEach((field) => {
    field.addEventListener("keydown", (event) => event.preventDefault());
    field.addEventListener("paste", (event) => event.preventDefault());
    field.addEventListener("click", () => {
      if (typeof field.showPicker === "function") {
        field.showPicker();
      }
    });
  });
  incidentModal.addEventListener("click", (event) => {
    if (event.target === incidentModal) {
      closeIncidentFormModal();
    }
  });
}


function showDisclaimer() {
  disclaimerModal.classList.add("open");
  disclaimerModal.setAttribute("aria-hidden", "false");
  closeDisclaimer.focus();
}

function hideDisclaimer() {
  disclaimerModal.classList.remove("open");
  disclaimerModal.setAttribute("aria-hidden", "true");
  if (openDisclaimer) {
    openDisclaimer.focus();
  }
}

function bindDisclaimerModal() {
  openDisclaimer = document.getElementById("openDisclaimer");
  openDisclaimer.addEventListener("click", showDisclaimer);
  closeDisclaimer.addEventListener("click", hideDisclaimer);
  disclaimerModal.addEventListener("click", (event) => {
    if (event.target === disclaimerModal) {
      hideDisclaimer();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && disclaimerModal.classList.contains("open")) {
      hideDisclaimer();
    }
    if (event.key === "Escape" && incidentModal.classList.contains("open")) {
      closeIncidentFormModal();
    }
  });
}

function renderAll() {
  renderNav();
  renderViewer();
  bindDisclaimerModal();
  bindIncidentActions();
  bindSelectionActions();
  renderDataViews();
}

loadAppData();
renderAll();
