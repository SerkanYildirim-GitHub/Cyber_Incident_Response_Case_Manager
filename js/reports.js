function buildReport(incidentId) {
  const incident = incidents.find((item) => item.id === incidentId) || incidents[0];
  const incidentArtifacts = artifacts.filter((item) => item.incidentId === incident.id);
  const incidentIndicators = indicators.filter((item) => item.incidentId === incident.id);
  const incidentAssets = assets.filter((item) => item.incidentId === incident.id);
  const incidentEntities = entities.filter((item) => item.incidentId === incident.id);
  const incidentTimeline = timeline.filter((item) => item.incidentId === incident.id);
  const incidentActions = actions.filter((item) => item.incidentId === incident.id);
  const incidentMappings = attackMappings.filter((item) => item.incidentId === incident.id);

  const lines = [
    `Incident Report: ${documented(incident.title)}`,
    "",
    `Incident ID: ${documented(incident.id)}`,
    `Severity: ${documented(incident.severity)}`,
    `Status: ${documented(incident.status)}`,
    `Incident Type: ${documented(incident.type)}`,
    `Owner: ${documented(incident.owner)}`,
    `Assigned Team: ${documented(incident.assignedTeam)}`,
    `Detection Source: ${documented(incident.detectionSource)}`,
    `Opened: ${documented(incident.opened)}`,
    `Closed: ${documented(incident.closed)}`,
    "",
    "Executive Summary",
    documented(incident.executiveSummary),
    "",
    "Technical Summary",
    documented(incident.technicalSummary),
    "",
    "Business Impact",
    documented(incident.businessImpact),
    "",
    "Affected Assets",
    incidentAssets.length ? incidentAssets.map((item) => `- ${item.id}: ${item.hostname} (${item.type}, ${item.status})`).join("\n") : "Not documented",
    "",
    "Related Entities",
    incidentEntities.length ? incidentEntities.map((item) => `- ${item.id}: ${item.name} (${item.type}, ${item.role})`).join("\n") : "Not documented",
    "",
    "Key Indicators",
    incidentIndicators.length ? incidentIndicators.map((item) => `- ${item.id}: ${item.type} ${item.value} (${item.confidence}, ${item.status})`).join("\n") : "Not documented",
    "",
    "Evidence / Artifacts Summary",
    incidentArtifacts.length ? incidentArtifacts.map((item) => `- ${item.id}: ${item.type} from ${item.source} - ${item.description}`).join("\n") : "Not documented",
    "",
    "Timeline of Events",
    incidentTimeline.length ? incidentTimeline.map((item) => `- ${item.timestamp}: ${item.type} - ${item.description}`).join("\n") : "Not documented",
    "",
    "Response Actions",
    incidentActions.length ? incidentActions.map((item) => `- ${item.id}: ${item.title} (${item.status}, owner: ${item.owner})`).join("\n") : "Not documented",
    "",
    "Suspected Root Cause",
    documented(incident.suspectedRootCause),
    "",
    "Lessons Learned",
    documented(incident.lessonsLearned),
    "",
    "Recommendations",
    documented(incident.recommendations || "No recommendations documented."),
    "",
    "MITRE ATT&CK Mapping",
    incidentMappings.length ? incidentMappings.map((item) => `- ${item.tactic}; ${item.technique}; confidence: ${item.confidence}; status: ${item.status}; evidence: ${item.relatedArtifact}; notes: ${item.notes}`).join("\n") : "No ATT&CK mapping documented.",
    "",
    "Appendix: Evidence / Artifact IDs",
    incidentArtifacts.length ? incidentArtifacts.map((item) => `- ${item.id}`).join("\n") : "Not documented"
  ];

  return lines.join("\n");
}

function reportList(items, formatter) {
  return items.length ? items.map(formatter).join("\n") : "Not documented";
}

function reportMitreMapping(mapping) {
  return `- ${mitreAttackLink(mapping.tactic, "tactic")}; ${mitreAttackLink(mapping.technique, "technique")}; confidence: ${escapeHtml(documented(mapping.confidence))}; status: ${attackStatusLabel(mapping)}; evidence: ${escapeHtml(documented(mapping.relatedArtifact))}; notes: ${escapeHtml(documented(mapping.notes))}`;
}

function buildReportHtml(incidentId) {
  const incident = incidents.find((item) => item.id === incidentId) || incidents[0];
  if (!incident) {
    return escapeHtml("No incidents available for this demo role.");
  }

  const incidentArtifacts = artifacts.filter((item) => item.incidentId === incident.id);
  const incidentIndicators = indicators.filter((item) => item.incidentId === incident.id);
  const incidentAssets = assets.filter((item) => item.incidentId === incident.id);
  const incidentEntities = entities.filter((item) => item.incidentId === incident.id);
  const incidentTimeline = timeline.filter((item) => item.incidentId === incident.id);
  const incidentActions = actions.filter((item) => item.incidentId === incident.id);
  const incidentMappings = attackMappings.filter((item) => item.incidentId === incident.id);

  const lines = [
    `Incident Report: ${escapeHtml(documented(incident.title))}`,
    "",
    `Incident ID: ${escapeHtml(documented(incident.id))}`,
    `Severity: ${escapeHtml(documented(incident.severity))}`,
    `Status: ${escapeHtml(documented(incident.status))}`,
    `Incident Type: ${escapeHtml(documented(incident.type))}`,
    `Owner: ${escapeHtml(documented(incident.owner))}`,
    `Assigned Team: ${escapeHtml(documented(incident.assignedTeam))}`,
    `Detection Source: ${escapeHtml(documented(incident.detectionSource))}`,
    `Opened: ${escapeHtml(documented(incident.opened))}`,
    `Closed: ${escapeHtml(documented(incident.closed))}`,
    "",
    "Executive Summary",
    escapeHtml(documented(incident.executiveSummary)),
    "",
    "Technical Summary",
    escapeHtml(documented(incident.technicalSummary)),
    "",
    "Business Impact",
    escapeHtml(documented(incident.businessImpact)),
    "",
    "Affected Assets",
    reportList(incidentAssets, (item) => `- ${escapeHtml(item.id)}: ${escapeHtml(item.hostname)} (${escapeHtml(item.type)}, ${escapeHtml(item.status)})`),
    "",
    "Related Entities",
    reportList(incidentEntities, (item) => `- ${escapeHtml(item.id)}: ${escapeHtml(item.name)} (${escapeHtml(item.type)}, ${escapeHtml(item.role)})`),
    "",
    "Key Indicators",
    reportList(incidentIndicators, (item) => `- ${escapeHtml(item.id)}: ${escapeHtml(item.type)} ${escapeHtml(item.value)} (${escapeHtml(item.confidence)}, ${escapeHtml(item.status)})`),
    "",
    "Evidence / Artifacts Summary",
    reportList(incidentArtifacts, (item) => `- ${escapeHtml(item.id)}: ${escapeHtml(item.type)} from ${escapeHtml(item.source)} - ${escapeHtml(item.description)}`),
    "",
    "Timeline of Events",
    reportList(incidentTimeline, (item) => `- ${escapeHtml(item.timestamp)}: ${escapeHtml(item.type)} - ${escapeHtml(item.description)}`),
    "",
    "Response Actions",
    reportList(incidentActions, (item) => `- ${escapeHtml(item.id)}: ${escapeHtml(item.title)} (${escapeHtml(item.status)}, owner: ${escapeHtml(item.owner)})`),
    "",
    "Suspected Root Cause",
    escapeHtml(documented(incident.suspectedRootCause)),
    "",
    "Lessons Learned",
    escapeHtml(documented(incident.lessonsLearned)),
    "",
    "Recommendations",
    escapeHtml(documented(incident.recommendations || "No recommendations documented.")),
    "",
    "MITRE ATT&CK Mapping",
    incidentMappings.length ? incidentMappings.map(reportMitreMapping).join("\n") : "No ATT&CK mapping documented.",
    "",
    "Appendix: Evidence / Artifact IDs",
    reportList(incidentArtifacts, (item) => `- ${escapeHtml(item.id)}`)
  ];

  return lines.join("\n");
}
