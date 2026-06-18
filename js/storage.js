const storageKey = "irCaseManagerDemoData.v1";
const sampleData = {
  incidents: JSON.parse(JSON.stringify(incidents)),
  artifacts: JSON.parse(JSON.stringify(artifacts)),
  indicators: JSON.parse(JSON.stringify(indicators)),
  assets: JSON.parse(JSON.stringify(assets)),
  entities: JSON.parse(JSON.stringify(entities)),
  timeline: JSON.parse(JSON.stringify(timeline)),
  actions: JSON.parse(JSON.stringify(actions)),
  attackMappings: JSON.parse(JSON.stringify(attackMappings)),
  connectors: JSON.parse(JSON.stringify(connectors)),
  auditLog: JSON.parse(JSON.stringify(auditLog))
};
let appData = null;
let storageNotice = "";


function validateAppData(data) {
  const requiredArrays = ["incidents", "artifacts", "indicators", "assets", "entities", "timeline", "actions", "attackMappings", "connectors", "auditLog"];
  if (!data || typeof data !== "object") {
    return false;
  }

  return requiredArrays.every((key) => Array.isArray(data[key]));
}

function syncDataRefs(data) {
  incidents = data.incidents;
  artifacts = data.artifacts;
  indicators = data.indicators;
  assets = data.assets;
  entities = data.entities;
  timeline = data.timeline;
  actions = data.actions;
  attackMappings = data.attackMappings;
  connectors = data.connectors;
  auditLog = data.auditLog;
}

function saveAppData() {
  localStorage.setItem(storageKey, JSON.stringify(appData));
}

function loadAppData() {
  const stored = localStorage.getItem(storageKey);
  if (!stored) {
    appData = cloneData(sampleData);
    saveAppData();
    syncDataRefs(appData);
    return;
  }

  try {
    const parsed = JSON.parse(stored);
    if (!validateAppData(parsed)) {
      throw new Error("Stored demo data is missing required collections.");
    }
    appData = parsed;
    syncDataRefs(appData);
  } catch (error) {
    appData = cloneData(sampleData);
    syncDataRefs(appData);
    storageNotice = "Stored local demo data could not be loaded. It may be corrupted. Use Reset Demo Data to restore the fictional sample data.";
  }
}


function selectedRole() {
  const selected = roleOptions.find((option) => option.role === viewerSelect.value) || roleOptions[0];
  return { user: selected.label, role: selected.role };
}

function addAuditEntry(action, objectId, notes) {
  const actor = selectedRole();
  auditLog.unshift({
    id: `AUD-${String(auditLog.length + 1).padStart(3, "0")}`,
    timestamp: new Date().toLocaleString(),
    user: actor.user,
    role: actor.role,
    action,
    object: objectId,
    source: "Manual",
    notes: notes || ""
  });
}

function resetDemoData() {
  if (!confirm("Reset all local demo data to the original fictional sample records?")) {
    return;
  }

  appData = cloneData(sampleData);
  syncDataRefs(appData);
  storageNotice = "";
  if (typeof clearAllSelections === "function") {
    clearAllSelections();
  }
  addAuditEntry("Demo data reset", "Local demo data", "Reset to fictional sample data.");
  saveAppData();
  renderDataViews();
}

