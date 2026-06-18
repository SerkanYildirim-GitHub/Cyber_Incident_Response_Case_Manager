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

